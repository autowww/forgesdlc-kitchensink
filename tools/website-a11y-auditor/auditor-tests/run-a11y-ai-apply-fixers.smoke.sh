#!/usr/bin/env bash
# AI DOM-apply pilots: DET pre-audit → AI fixers → DET post-audit (proxy rules).
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
TOOL="$(cd "${DIR}/.." && pwd)"
AI_FIXER="${TOOL}/lib/a11y-ai-fixers/run-ai-fixers.mjs"

# AI rule, fixture basename, DET rule for audit proxy
RULES=(
  "AI.A11Y.GENERIC.TIMING_ADJUSTABLE|ai-a11y-generic-timing-adjustable|DET.A11Y.GENERIC.TIMING"
  "AI.A11Y.GENERIC.READING_LEVEL|ai-a11y-generic-reading-level|DET.A11Y.GENERIC.READING_LEVEL_HEURISTIC"
  "AI.A11Y.GENERIC.ERROR_PREVENTION|ai-a11y-generic-error-prevention|DET.A11Y.GENERIC.ERROR_PREVENTION"
  "AI.A11Y.KS.REGION_LABELING|ai-a11y-ks-region-labeling|DET.A11Y.GENERIC.LANDMARKS"
)

audit_repo() {
  local repo="$1" port="$2" det_rule="$3" out="$4"
  python3 -m http.server "${port}" --directory "${repo}" >/dev/null 2>&1 &
  local hpid=$!
  sleep 0.4
  node "${TOOL}/analyze-website-a11y.mjs" \
    --repo "${repo}" \
    --site "http://127.0.0.1:${port}/index.html" \
    --compliance-profile wcag22aaa \
    --rules-scope generic \
    --lanes det \
    --skip-axe \
    --only-deterministic-rule-ids "${det_rule}" \
    --max-pages 1 \
    --out "${out}"
  kill "${hpid}" 2>/dev/null || true
}

for ENTRY in "${RULES[@]}"; do
  IFS='|' read -r AI_RULE KEBAB DET_RULE <<<"${ENTRY}"
  FIXTURE_SRC="${DIR}/fixtures/${KEBAB}-fail.html"
  if [[ ! -f "${FIXTURE_SRC}" ]]; then
    echo "skip ${AI_RULE}: no fixture ${FIXTURE_SRC}" >&2
    continue
  fi
  OUT="${TMPDIR:-/tmp}/a11y-ai-apply-smoke-${KEBAB}-$$"
  REPO="${OUT}/repo"
  mkdir -p "${REPO}"
  cp "${FIXTURE_SRC}" "${REPO}/index.html"

  if [[ "${AI_RULE}" == "AI.A11Y.KS.REGION_LABELING" ]]; then
    node -e "
const fs=require('fs');
const findings=[{
  ruleId: '${AI_RULE}',
  checkId: '${AI_RULE}',
  severity: 'major',
  message: 'Landmark regions lack accessible names (harness).',
  url: 'http://127.0.0.1/index.html',
}];
fs.writeFileSync('${OUT}/ai-audit.json', JSON.stringify({ findings }, null, 2)+'\n');
"
  else
    audit_repo "${REPO}" 9881 "${DET_RULE}" "${OUT}/pre"
    PRE_COUNT="$(node -e "
const d=JSON.parse(require('fs').readFileSync('${OUT}/pre/a11y-audit-data.json','utf8'));
const n=(d.findings||[]).filter(f=>(f.ruleId||f.checkId)==='${DET_RULE}').length;
process.stdout.write(String(n));
")"
    if [[ "${PRE_COUNT}" -lt 1 ]]; then
      echo "FAIL ${AI_RULE}: DET proxy ${DET_RULE} had 0 findings on fixture" >&2
      exit 1
    fi

    node -e "
const fs=require('fs');
const d=JSON.parse(fs.readFileSync('${OUT}/pre/a11y-audit-data.json','utf8'));
const findings=(d.findings||[])
  .filter(f=>(f.ruleId||f.checkId)==='${DET_RULE}')
  .map(f=>({ ...f, ruleId: '${AI_RULE}', checkId: '${AI_RULE}' }));
fs.writeFileSync('${OUT}/ai-audit.json', JSON.stringify({ findings }, null, 2)+'\n');
"
  fi

  node "${AI_FIXER}" \
    --repo-root "${REPO}" \
    --audit-data "${OUT}/ai-audit.json" \
    --out-dir "${OUT}" \
    --rule-id "${AI_RULE}"

  if [[ "${AI_RULE}" == "AI.A11Y.KS.REGION_LABELING" ]]; then
    grep -q 'aria-label="Main content"' "${REPO}/index.html"
    grep -q 'aria-label="Site navigation"' "${REPO}/index.html"
    echo "ok ${AI_RULE} (region labels applied)"
    rm -rf "${OUT}"
    continue
  fi

  audit_repo "${REPO}" 9882 "${DET_RULE}" "${OUT}/post"
  node -e "
const fs=require('fs');
const d=JSON.parse(fs.readFileSync('${OUT}/post/a11y-audit-data.json','utf8'));
const n=(d.findings||[]).filter(f=>(f.ruleId||f.checkId)==='${DET_RULE}').length;
if(n>0){ console.error('${AI_RULE}: DET proxy still', n, 'finding(s) after patch'); process.exit(1); }
console.log('ok', '${AI_RULE}');
"
  rm -rf "${OUT}"
done

echo "[a11y-ai-apply-fixers] done"
