#!/usr/bin/env bash
# Dry-run + optional single-rule AI detection smoke (requires Cursor CLI agent).
set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HARNESS="${TESTS_ROOT}/invoke-ai-ruleset-harness.sh"
KS_ROOT="$(cd "${TESTS_ROOT}/../../.." && pwd)"
BOOTSTRAP_RULE="${FORGE_UX_AI_HARNESS_BOOTSTRAP_RULE:-AI.CONTEXT.COGNITIVE_CLARITY}"

export UX_AUDIT_OUT_DIR="$(mktemp -d "${TESTS_ROOT}/.ai-harness-test-XXXXXXXX")"
cleanup() { rm -rf "${UX_AUDIT_OUT_DIR}"; }
trap cleanup EXIT

lines="$(bash "${HARNESS}" --dry-run --only-rule "${BOOTSTRAP_RULE}" 2>/dev/null | wc -l)"
test "${lines}" -ge 1

if [[ "${AI_HARNESS_SKIP_E2E:-}" == "1" ]]; then
  echo "invoke-ai-ruleset-harness.test.sh: dry-run OK (e2e skipped)"
  exit 0
fi

if ! command -v agent >/dev/null 2>&1; then
  echo "invoke-ai-ruleset-harness.test.sh: SKIP — Cursor CLI agent not on PATH"
  exit 0
fi

if [[ ! -d "${KS_ROOT}/showcase/assets" ]]; then
  (cd "${KS_ROOT}" && python3 generator/build-showcase.py) >&2 || true
fi

set +e
bash "${HARNESS}" --only-rule "${BOOTSTRAP_RULE}" --rebuild-fixtures 2>&1 | tee "${UX_AUDIT_OUT_DIR}/test.log"
rc=$?
set -e

merged="$(cat "${UX_AUDIT_OUT_DIR}/test.log" 2>/dev/null || true)"
if [[ "${rc}" -ne 0 ]]; then
  if grep -qiE 'usage limit|resource_exhausted|rate limit' <<<"${merged}"; then
    echo "invoke-ai-ruleset-harness.test.sh: SKIP — Cursor agent usage limit"
    exit 0
  fi
  echo "invoke-ai-ruleset-harness.test.sh: harness failed rc=${rc}" >&2
  tail -40 "${UX_AUDIT_OUT_DIR}/test.log" >&2 || true
  exit "${rc}"
fi

status="$(jq -s -r --arg r "${BOOTSTRAP_RULE}" '.[] | select(.ruleId == $r) | .status' "${UX_AUDIT_OUT_DIR}/state.jsonl" 2>/dev/null || true)"
fc="$(jq -s -r --arg r "${BOOTSTRAP_RULE}" '.[] | select(.ruleId == $r) | .findingsCount' "${UX_AUDIT_OUT_DIR}/state.jsonl" 2>/dev/null || echo 0)"
note="$(jq -s -r --arg r "${BOOTSTRAP_RULE}" '.[] | select(.ruleId == $r) | .note // ""' "${UX_AUDIT_OUT_DIR}/state.jsonl" 2>/dev/null || true)"
agent_log="${UX_AUDIT_OUT_DIR}/rules/${BOOTSTRAP_RULE}/ai-agent.log"
if [[ "${status}" == "blocked" ]]; then
  if grep -qiE 'usage limit|resource_exhausted|rate limit' "${UX_AUDIT_OUT_DIR}/test.log" 2>/dev/null \
    || grep -qiE 'usage limit|resource_exhausted|rate limit' "${agent_log}" 2>/dev/null \
    || [[ "${note}" == *usage*limit* ]]; then
    echo "invoke-ai-ruleset-harness.test.sh: SKIP — Cursor agent usage limit (status=${status})"
    exit 0
  fi
fi
test "${status}" = "detection_ok"
test "${fc}" -ge 1

echo "invoke-ai-ruleset-harness.test.sh: OK (${status}, findings=${fc})"
