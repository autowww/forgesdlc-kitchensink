#!/usr/bin/env bash
# Smoke: handbook_after fixer applies LANG After HTML to a harness fixture directory.
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
TOOL="$(cd "${DIR}/.." && pwd)"
FIXER="${TOOL}/lib/a11y-deterministic-fixers/run-deterministic-fixers.mjs"
OUT="${TMPDIR:-/tmp}/a11y-fixer-smoke-$$"
FIXTURE="${OUT}/fixture-website"
RULE="DET.A11Y.GENERIC.LANG"

mkdir -p "${FIXTURE}"
cp "${TOOL}/auditor-tests/fixtures/det-a11y-generic-lang-fail.html" "${FIXTURE}/index.html"

cat > "${OUT}/a11y-audit-data.json" <<EOF
{
  "findings": [
    {
      "checkId": "${RULE}",
      "severity": "serious",
      "message": "smoke fixture",
      "url": "http://127.0.0.1/fixture/"
    }
  ]
}
EOF

FORGE_A11Y_FIXER_HARNESS=1 \
FORGE_A11Y_FIXER_FIXTURE_DIR="${FIXTURE}" \
node "${FIXER}" \
  --repo-root "${FIXTURE}" \
  --audit-data "${OUT}/a11y-audit-data.json" \
  --out-dir "${OUT}" \
  --harness \
  --rule-id "${RULE}" \
  --skip-verify

if [[ ! -f "${OUT}/deterministic-fixer-report.json" ]]; then
  echo "run-a11y-deterministic-fixers.smoke: FAIL — no report" >&2
  exit 1
fi

applied="$(node -e "
const j=require('${OUT}/deterministic-fixer-report.json');
const r=j.rules['${RULE}'];
process.stdout.write(r&&r.applied?'true':'false');
")"

if [[ "${applied}" != "true" ]]; then
  echo "run-a11y-deterministic-fixers.smoke: FAIL — handbook_after not applied" >&2
  cat "${OUT}/deterministic-fixer-report.json" >&2
  exit 1
fi

if ! grep -q 'lang="en"' "${FIXTURE}/index.html" 2>/dev/null; then
  echo "run-a11y-deterministic-fixers.smoke: WARN — expected lang=en in remediated fixture" >&2
fi

echo "run-a11y-deterministic-fixers.smoke: OK applied=${applied}"
rm -rf "${OUT}"
