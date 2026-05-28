#!/usr/bin/env bash
# Patch supplemental DET fixtures, re-audit, expect zero findings per rule.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
TOOL="$(cd "${DIR}/.." && pwd)"
FIXER="${TOOL}/lib/a11y-deterministic-fixers/run-deterministic-fixers.mjs"

RULES=(
  DET.A11Y.GENERIC.GLOSSARY_ABBR
  DET.A11Y.GENERIC.ERROR_PREVENTION
  DET.A11Y.GENERIC.READING_LEVEL_HEURISTIC
  DET.A11Y.GENERIC.DRAGGING_MOVEMENTS
  DET.A11Y.GENERIC.REDUNDANT_ENTRY
  DET.A11Y.GENERIC.ACCESSIBLE_AUTHENTICATION
  DET.A11Y.GENERIC.RE_AUTHENTICATION
  DET.A11Y.GENERIC.CONCURRENT_INPUT
)

for RULE in "${RULES[@]}"; do
  KEBAB="$(echo "${RULE}" | tr '[:upper:]' '[:lower:]' | tr '._' '-')"
  FIXTURE_SRC="${DIR}/fixtures/${KEBAB}-fail.html"
  if [[ ! -f "${FIXTURE_SRC}" ]]; then
    echo "skip ${RULE}: no fixture ${FIXTURE_SRC}" >&2
    continue
  fi
  OUT="${TMPDIR:-/tmp}/a11y-supp-smoke-${KEBAB}-$$"
  REPO="${OUT}/repo"
  mkdir -p "${REPO}"
  cp "${FIXTURE_SRC}" "${REPO}/index.html"

  python3 -m http.server 9877 --directory "${REPO}" >/dev/null 2>&1 &
  HPID=$!
  sleep 0.4
  node "${TOOL}/analyze-website-a11y.mjs" \
    --repo "${REPO}" \
    --site "http://127.0.0.1:9877/index.html" \
    --compliance-profile wcag22aaa \
    --rules-scope generic \
    --lanes det \
    --skip-axe \
    --only-deterministic-rule-ids "${RULE}" \
    --max-pages 1 \
    --out "${OUT}/pre"
  kill "${HPID}" 2>/dev/null || true

  node "${FIXER}" \
    --repo-root "${REPO}" \
    --audit-data "${OUT}/pre/a11y-audit-data.json" \
    --out-dir "${OUT}" \
    --rule-id "${RULE}" \
    --skip-verify

  python3 -m http.server 9878 --directory "${REPO}" >/dev/null 2>&1 &
  HPID2=$!
  sleep 0.4
  node "${TOOL}/analyze-website-a11y.mjs" \
    --repo "${REPO}" \
    --site "http://127.0.0.1:9878/index.html" \
    --compliance-profile wcag22aaa \
    --rules-scope generic \
    --lanes det \
    --skip-axe \
    --only-deterministic-rule-ids "${RULE}" \
    --max-pages 1 \
    --out "${OUT}/post"
  kill "${HPID2}" 2>/dev/null || true

  node -e "
const fs=require('fs');
const d=JSON.parse(fs.readFileSync('${OUT}/post/a11y-audit-data.json','utf8'));
const n=(d.findings||[]).filter(f=>(f.ruleId||f.checkId)==='${RULE}').length;
if(n>0){ console.error('${RULE}: still', n, 'finding(s) after patch'); process.exit(1); }
console.log('ok', '${RULE}');
"
  rm -rf "${OUT}"
done

echo "[a11y-supplemental-fixers] done"
