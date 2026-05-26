#!/usr/bin/env bash
# Agent harness: dry-run + optional apply-then-clean smoke (no Cursor agent when SKIP set).
set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HARNESS="${TESTS_ROOT}/invoke-det-ruleset-harness.sh"
APPLY="${TESTS_ROOT}/apply-harness-fixture-remediation.py"
EXPECT_CLEAN="${TESTS_ROOT}/expect-rule-clean.sh"
FIXTURE="${TESTS_ROOT}/fixtures/det-hash-markers-remediated"
KS_ROOT="$(cd "${TESTS_ROOT}/../../.." && pwd)"

export FORGE_UX_RULESET_FIXTURE_ROOT="${FORGE_UX_RULESET_FIXTURE_ROOT:-${FIXTURE}}"
lines="$(bash "${HARNESS}" --dry-run --only-rule DET.HASH.MARKERS --enable-agents 2>/dev/null | wc -l)"
test "${lines}" -ge 1

if [[ "${DET_AGENT_HARNESS_SKIP_E2E:-1}" == "1" ]]; then
  echo "invoke-det-ruleset-harness-agent.test.sh: dry-run OK (e2e skipped)"
  exit 0
fi

PORT="${FORGE_UX_HARNESS_PORT:-60476}"
python3 "${APPLY}" --rule-id DET.HASH.MARKERS --fixture-dir "${FIXTURE}"
if ! ss -lptn "sport = :${PORT}" 2>/dev/null | grep -q LISTEN; then
  (cd "${FIXTURE}" && python3 -m http.server "${PORT}") >/dev/null 2>&1 &
  sleep 0.4
fi
export LOOP_REPO="${FIXTURE}"
export UX_AUDIT_OUT_DIR="$(mktemp -d "${TESTS_ROOT}/.agent-fixture-test-XXXXXXXX")"
trap 'rm -rf "${UX_AUDIT_OUT_DIR}"' EXIT
node "${TESTS_ROOT}/../analyze-website-ux.mjs" \
  --repo "${KS_ROOT}" \
  --site "http://127.0.0.1:${PORT}/" \
  --out "${UX_AUDIT_OUT_DIR}" \
  --max-pages 1 \
  --breadth-crawl \
  --no-refresh-plan-status
bash "${EXPECT_CLEAN}" "${UX_AUDIT_OUT_DIR}/audit-data.json" DET.HASH.MARKERS
echo "invoke-det-ruleset-harness-agent.test.sh: OK (apply + clean)"
