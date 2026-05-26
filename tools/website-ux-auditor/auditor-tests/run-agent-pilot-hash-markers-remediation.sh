#!/usr/bin/env bash
# Apply DET.HASH.MARKERS handbook After example to an agent-pilot campaign fixture, then
# re-audit for 0 findings on that rule. Default campaign path matches ruleset-agent-pilot-20260525T110025Z.
set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUDITOR_ROOT="$(cd "${TESTS_ROOT}/.." && pwd)"
KS_ROOT="$(cd "${AUDITOR_ROOT}/../.." && pwd)"
APPLY="${TESTS_ROOT}/apply-harness-fixture-remediation.py"
ANALYZE="${AUDITOR_ROOT}/analyze-website-ux.mjs"
EXPECT_CLEAN="${TESTS_ROOT}/expect-rule-clean.sh"

DEFAULT_CAMPAIGN="${FORGE_UX_AGENT_PILOT_CAMPAIGN:-}"
if [[ -z "${DEFAULT_CAMPAIGN}" ]]; then
  IN_REPO_APPLYFIRST="${TESTS_ROOT}/agent-pilot-campaigns/ruleset-agent-pilot-applyfirst-20260525T120000Z/rules/DET.HASH.MARKERS"
  IN_REPO_RETRY="${TESTS_ROOT}/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.HASH.MARKERS"
  IN_REPO="${TESTS_ROOT}/agent-pilot-campaigns/ruleset-agent-pilot-20260525T110025Z/rules/DET.HASH.MARKERS"
  WORKBENCH="${HOME}/Code/workbench/ux-auditor/ux-audit/ruleset-agent-pilot-applyfirst-20260525T120000Z/rules/DET.HASH.MARKERS"
  if [[ ! -d "${WORKBENCH}/fixture-website" ]]; then
    WORKBENCH="${HOME}/Code/workbench/ux-auditor/ux-audit/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.HASH.MARKERS"
  fi
  if [[ ! -d "${WORKBENCH}/fixture-website" ]]; then
    WORKBENCH="${HOME}/Code/workbench/ux-auditor/ux-audit/ruleset-agent-pilot-20260525T110025Z/rules/DET.HASH.MARKERS"
  fi
  if [[ -d "${IN_REPO_APPLYFIRST}/fixture-website" ]]; then
    DEFAULT_CAMPAIGN="${IN_REPO_APPLYFIRST}"
  elif [[ -d "${IN_REPO_RETRY}/fixture-website" ]]; then
    DEFAULT_CAMPAIGN="${IN_REPO_RETRY}"
  elif [[ -d "${IN_REPO}/fixture-website" ]]; then
    DEFAULT_CAMPAIGN="${IN_REPO}"
  else
    DEFAULT_CAMPAIGN="${WORKBENCH}"
  fi
fi
CAMPAIGN="${1:-${DEFAULT_CAMPAIGN}}"
FIXTURE_DIR="${CAMPAIGN}/fixture-website"
RULE_ID="DET.HASH.MARKERS"
PORT="${FORGE_UX_HARNESS_PORT:-60475}"
MINIMAL_ASSETS="${TESTS_ROOT}/harness-minimal-assets"

if [[ ! -d "${FIXTURE_DIR}" ]]; then
  echo "run-agent-pilot-hash-markers-remediation: missing fixture dir: ${FIXTURE_DIR}" >&2
  exit 1
fi

if [[ ! -f "${FIXTURE_DIR}/assets/forge-theme.css" && -d "${MINIMAL_ASSETS}" ]]; then
  mkdir -p "${FIXTURE_DIR}/assets"
  cp -a "${MINIMAL_ASSETS}/." "${FIXTURE_DIR}/assets/"
fi

echo "[1/3] Apply After example from det-hash-markers.md → ${FIXTURE_DIR}/index.html" >&2
python3 "${APPLY}" --rule-id "${RULE_ID}" --fixture-dir "${FIXTURE_DIR}"

echo "[2/3] Serve fixture on :${PORT} (background) and audit" >&2
if command -v ss >/dev/null 2>&1 && ss -lptn "sport = :${PORT}" 2>/dev/null | grep -q LISTEN; then
  echo "  port ${PORT} already in use — reusing existing server" >&2
else
  (cd "${FIXTURE_DIR}" && exec python3 -m http.server "${PORT}") >/dev/null 2>&1 &
  SERVER_PID=$!
  trap 'kill "${SERVER_PID}" 2>/dev/null || true' EXIT
  sleep 0.4
fi

export LOOP_REPO="${FIXTURE_DIR}"
export UX_AUDIT_OUT_DIR="${CAMPAIGN}"
node "${ANALYZE}" \
  --repo "${KS_ROOT}" \
  --site "http://127.0.0.1:${PORT}/" \
  --out "${CAMPAIGN}" \
  --max-pages 1 \
  --breadth-crawl \
  --no-refresh-plan-status

echo "[3/3] expect-rule-clean for ${RULE_ID}" >&2
bash "${EXPECT_CLEAN}" "${CAMPAIGN}/audit-data.json" "${RULE_ID}"
echo "run-agent-pilot-hash-markers-remediation: OK — ${RULE_ID} clean on ${CAMPAIGN}" >&2
