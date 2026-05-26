#!/usr/bin/env bash
# Smoke: deterministic fixer CLI loads pilot registry and runs handbook_after on harness fixture.
set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUDITOR_ROOT="$(cd "${TESTS_ROOT}/.." && pwd)"
KS_ROOT="$(cd "${AUDITOR_ROOT}/../.." && pwd)"
FIXER="${AUDITOR_ROOT}/lib/ux-deterministic-fixers/run-deterministic-fixers.mjs"
BUILD="${KS_ROOT}/generator/build_rule_defect_fixtures.py"

OUT="${TMPDIR:-/tmp}/ux-fixer-smoke-$$"
mkdir -p "${OUT}"
trap 'rm -rf "${OUT}"' EXIT

python3 "${BUILD}" --only-rule DET.HASH.MARKERS --out "${OUT}/fixtures" >/dev/null 2>&1 || {
  echo "run-deterministic-fixers.test: skip — fixture build failed (no campaign?)" >&2
  exit 0
}

FIXTURE_ROOT="$(find "${OUT}/fixtures" -maxdepth 1 -type d -name 'ruleset-harness-*' | head -1)"
if [[ -z "${FIXTURE_ROOT}" ]]; then
  echo "run-deterministic-fixers.test: skip — no fixture campaign dir" >&2
  exit 0
fi

RULE_FIXTURE="${OUT}/rule-fixture"
mkdir -p "${RULE_FIXTURE}/assets"
cp "${FIXTURE_ROOT}/website/det-hash-markers-fail.html" "${RULE_FIXTURE}/index.html"
cp -R "${TESTS_ROOT}/harness-minimal-assets/." "${RULE_FIXTURE}/assets/"

echo '{"schemaVersion":2,"pages":[{"url":"http://127.0.0.1/","findings":[{"checkId":"design-rule-runtime","ruleId":"DET.HASH.MARKERS","severity":"minor","message":"test"}]}]}' \
  >"${OUT}/audit-data.json"

set +e
node "${FIXER}" \
  --repo-root "${RULE_FIXTURE}" \
  --audit-data "${OUT}/audit-data.json" \
  --out-dir "${OUT}" \
  --rule-id DET.HASH.MARKERS \
  --harness \
  --fixture-dir "${RULE_FIXTURE}" \
  --skip-verify
rc=$?
set -e

if [[ ! -f "${OUT}/deterministic-fixer-report.json" ]]; then
  echo "run-deterministic-fixers.test: FAIL — no report" >&2
  exit 1
fi

applied="$(jq -r '.rules["DET.HASH.MARKERS"].applied // false' "${OUT}/deterministic-fixer-report.json")"
if [[ "${applied}" != "true" ]]; then
  echo "run-deterministic-fixers.test: FAIL — handbook_after not applied (rc=${rc})" >&2
  jq . "${OUT}/deterministic-fixer-report.json" >&2
  exit 1
fi

echo "run-deterministic-fixers.test: OK applied=${applied}"
