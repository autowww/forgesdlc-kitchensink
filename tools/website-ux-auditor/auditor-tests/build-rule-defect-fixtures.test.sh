#!/usr/bin/env bash
set -euo pipefail
TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KS_ROOT="$(cd "${TESTS_ROOT}/../../.." && pwd)"
BUILD="${KS_ROOT}/generator/build_rule_defect_fixtures.py"
OUT="$(mktemp -d "${TESTS_ROOT}/.fixture-build-test-XXXXXXXX")"
trap 'rm -rf "${OUT}"' EXIT

python3 "${BUILD}" --only-rule DET.HTML.EMPTY_INLINE --out "${OUT}" >/dev/null
test -f "${OUT}/manifest.json"
test -f "${OUT}/website/det-html-empty-inline-fail.html"
jq -e '.rules[] | select(.ruleId == "DET.HTML.EMPTY_INLINE")' "${OUT}/manifest.json" >/dev/null
echo "build-rule-defect-fixtures.test.sh: OK"
