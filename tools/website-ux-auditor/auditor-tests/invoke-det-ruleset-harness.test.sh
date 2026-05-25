#!/usr/bin/env bash
# Dry-run + optional single-rule detection smoke for DET ruleset harness.
set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HARNESS="${TESTS_ROOT}/invoke-det-ruleset-harness.sh"
KS_ROOT="$(cd "${TESTS_ROOT}/../../.." && pwd)"

export UX_AUDIT_OUT_DIR="$(mktemp -d "${TESTS_ROOT}/.det-harness-test-XXXXXXXX")"
cleanup() { rm -rf "${UX_AUDIT_OUT_DIR}"; }
trap cleanup EXIT

lines="$(bash "${HARNESS}" --dry-run --only-rule DET.HASH.MARKERS 2>/dev/null | wc -l)"
test "${lines}" -ge 1

if [[ "${DET_HARNESS_SKIP_E2E:-}" == "1" ]]; then
  echo "invoke-det-ruleset-harness.test.sh: dry-run OK (e2e skipped)"
  exit 0
fi

# Build showcase assets if needed
if [[ ! -d "${KS_ROOT}/showcase/assets" ]]; then
  (cd "${KS_ROOT}" && python3 generator/build-showcase.py) >&2 || true
fi

set +e
bash "${HARNESS}" --only-rule DET.HASH.MARKERS --rebuild-fixtures 2>&1 | tee "${UX_AUDIT_OUT_DIR}/test.log"
rc=$?
set -e

merged="$(cat "${UX_AUDIT_OUT_DIR}/test.log" 2>/dev/null || true)"
if [[ "${rc}" -ne 0 ]]; then
  if grep -qiE 'browserType\.launch|Executable doesn'\''t exist|playwright install' <<<"${merged}"; then
    echo "invoke-det-ruleset-harness.test.sh: SKIP — Playwright Chromium not installed"
    exit 0
  fi
  echo "invoke-det-ruleset-harness.test.sh: harness failed rc=${rc}" >&2
  tail -40 "${UX_AUDIT_OUT_DIR}/test.log" >&2 || true
  exit "${rc}"
fi

status="$(jq -s -r '.[] | select(.ruleId == "DET.HASH.MARKERS") | .status' "${UX_AUDIT_OUT_DIR}/state.jsonl" 2>/dev/null || true)"
fc="$(jq -s -r '.[] | select(.ruleId == "DET.HASH.MARKERS") | .findingsCount' "${UX_AUDIT_OUT_DIR}/state.jsonl" 2>/dev/null || echo 0)"
test "${status}" = "detection_ok"
test "${fc}" -ge 1

echo "invoke-det-ruleset-harness.test.sh: OK (${status}, findings=${fc})"
