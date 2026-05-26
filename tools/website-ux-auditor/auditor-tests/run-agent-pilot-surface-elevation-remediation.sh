#!/usr/bin/env bash
# Sync remediated DET.SURFACE.ELEVATION_TOKEN agent-pilot fixture and re-audit for 0 rule findings.
set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUDITOR_ROOT="$(cd "${TESTS_ROOT}/.." && pwd)"
KS_ROOT="$(cd "${AUDITOR_ROOT}/../.." && pwd)"
SYNC="${TESTS_ROOT}/sync-agent-pilot-surface-elevation-fixture.sh"
ANALYZE="${AUDITOR_ROOT}/analyze-website-ux.mjs"
EXPECT_CLEAN="${TESTS_ROOT}/expect-rule-clean.sh"

DEFAULT_CAMPAIGN="${FORGE_UX_AGENT_PILOT_CAMPAIGN:-}"
if [[ -z "${DEFAULT_CAMPAIGN}" ]]; then
  IN_REPO="${TESTS_ROOT}/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.SURFACE.ELEVATION_TOKEN"
  WORKBENCH="${HOME}/Code/workbench/ux-auditor/ux-audit/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.SURFACE.ELEVATION_TOKEN"
  if [[ -d "${IN_REPO}/fixture-website" ]]; then
    DEFAULT_CAMPAIGN="${IN_REPO}"
  else
    DEFAULT_CAMPAIGN="${WORKBENCH}"
  fi
fi
CAMPAIGN="${1:-${DEFAULT_CAMPAIGN}}"
FIXTURE_DIR="${CAMPAIGN}/fixture-website"
RULE_ID="DET.SURFACE.ELEVATION_TOKEN"
PORT="${FORGE_UX_HARNESS_PORT:-44467}"

if [[ ! -d "${FIXTURE_DIR}" ]]; then
  echo "run-agent-pilot-surface-elevation-remediation: missing fixture dir: ${FIXTURE_DIR}" >&2
  exit 1
fi

if [[ -x "${SYNC}" ]] && [[ "${CAMPAIGN}" == *"workbench"* ]]; then
  FORGE_UX_AGENT_PILOT_CAMPAIGN="${CAMPAIGN}" bash "${SYNC}"
elif [[ -x "${SYNC}" ]] && [[ -d "${HOME}/Code/workbench/ux-auditor/ux-audit/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.SURFACE.ELEVATION_TOKEN" ]]; then
  FORGE_UX_AGENT_PILOT_CAMPAIGN="${HOME}/Code/workbench/ux-auditor/ux-audit/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.SURFACE.ELEVATION_TOKEN" bash "${SYNC}"
fi

echo "[1/3] Fixture ready at ${FIXTURE_DIR}" >&2

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
echo "run-agent-pilot-surface-elevation-remediation: OK — ${RULE_ID} clean on ${CAMPAIGN}" >&2
