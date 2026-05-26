#!/usr/bin/env bash
# Apply remediated DET.APP.PERSISTENT_CHROME fixture, sync to workbench when needed, re-audit for 0 rule findings.
set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUDITOR_ROOT="$(cd "${TESTS_ROOT}/.." && pwd)"
KS_ROOT="$(cd "${AUDITOR_ROOT}/../.." && pwd)"
ANALYZE="${AUDITOR_ROOT}/analyze-website-ux.mjs"
EXPECT_CLEAN="${TESTS_ROOT}/expect-rule-clean.sh"
SYNC="${TESTS_ROOT}/sync-agent-pilot-persistent-chrome-fixture.sh"

DEFAULT_CAMPAIGN="${TESTS_ROOT}/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.APP.PERSISTENT_CHROME"
CAMPAIGN="${1:-${DEFAULT_CAMPAIGN}}"
FIXTURE_DIR="${CAMPAIGN}/fixture-website"
RULE_ID="DET.APP.PERSISTENT_CHROME"
PORT="${FORGE_UX_HARNESS_PORT:-57987}"

if [[ ! -d "${FIXTURE_DIR}" ]]; then
  echo "run-agent-pilot-persistent-chrome-remediation: missing fixture dir: ${FIXTURE_DIR}" >&2
  exit 1
fi

if [[ -x "${SYNC}" ]] && [[ -d "${HOME}/Code/workbench/ux-auditor/ux-audit/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.APP.PERSISTENT_CHROME" ]]; then
  bash "${SYNC}"
  CAMPAIGN="${FORGE_UX_AGENT_PILOT_CAMPAIGN:-$HOME/Code/workbench/ux-auditor/ux-audit/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.APP.PERSISTENT_CHROME}"
  FIXTURE_DIR="${CAMPAIGN}/fixture-website"
fi

echo "[1/3] Serve fixture on :${PORT} (background) and audit" >&2
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
  --max-pages 2 \
  --breadth-crawl \
  --no-refresh-plan-status

echo "[2/3] expect-rule-clean for ${RULE_ID}" >&2
bash "${EXPECT_CLEAN}" "${CAMPAIGN}/audit-data.json" "${RULE_ID}"

echo "[3/3] Major+ on visited pages (informational)" >&2
node -e "
const d=require('${CAMPAIGN}/audit-data.json');
const pages=d.pages||[];
for (const p of pages) {
  const maj=(p.findings||[]).filter(f=>['blocker','critical','major'].includes(f.severity));
  console.log(p.url, 'major+', maj.length);
}
"
echo "run-agent-pilot-persistent-chrome-remediation: OK — ${RULE_ID} clean on ${CAMPAIGN}" >&2
