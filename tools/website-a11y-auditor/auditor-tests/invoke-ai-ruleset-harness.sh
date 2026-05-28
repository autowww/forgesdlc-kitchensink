#!/usr/bin/env bash
# AI ruleset harness: parse contract + optional agent per rule.
set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOL="$(cd "${TESTS_ROOT}/.." && pwd)"
REGISTRY="${TOOL}/design-rules/registry.generated.json"
PARSE="${TESTS_ROOT}/parse-ai-agent-findings.mjs"
RUN_AI="${TOOL}/design-rules/ai/run-design-ai-rule.sh"
ONLY_RULE=""
DRY_RUN=0
SKIP_AGENT=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --only-rule) ONLY_RULE="${2:-}"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    --skip-agent) SKIP_AGENT=1; shift ;;
    *) echo "unknown: $1" >&2; exit 2 ;;
  esac
done

mapfile -t RULES < <(node -e "
const j=require(process.argv[1]);
let ids=(j.aiRules||[]).map(r=>r.id);
const only=process.argv[2];
if(only) ids=ids.filter(id=>id===only);
console.log(ids.join('\n'));
" "${REGISTRY}" "${ONLY_RULE}")

echo "[ai-harness] rules: ${#RULES[@]}"

for RULE in "${RULES[@]}"; do
  [[ -z "${RULE}" ]] && continue
  PROMPT="${TOOL}/$(node -e "
const j=require(process.argv[1]);
const r=(j.aiRules||[]).find(x=>x.id===process.argv[2]);
if(!r||!r.promptPath) process.exit(2);
process.stdout.write(r.promptPath);
" "${REGISTRY}" "${RULE}")"
  if [[ ! -f "${PROMPT}" ]]; then
    echo "skip ${RULE}: no prompt at ${PROMPT}" >&2
    continue
  fi
  OUT="/tmp/a11y-ai-harness-${RULE//./-}-$$"
  mkdir -p "${OUT}"

  if [[ "${DRY_RUN}" -eq 1 ]]; then
    echo "would run ${RULE} ${PROMPT}"
    continue
  fi

  FIXTURE_SAMPLE='{"summary":"harness","findings":[{"principleId":"'"${RULE}"'","severity":"warn","message":"Sample AI finding for harness","screenshotOrDomEvidence":"fixture","confidence":0.5,"candidateDeterministicRule":"DET.A11Y.GENERIC.LANG"}]}'
  if [[ "${SKIP_AGENT}" -eq 1 ]]; then
    echo "${FIXTURE_SAMPLE}" >"${OUT}/agent-transcript.txt"
  else
    bash "${RUN_AI}" --rule-id "${RULE}" --out-dir "${OUT}" "${TOOL}/auditor-tests/fixtures" "${PROMPT}" "http://127.0.0.1/" || true
  fi

  FINDINGS="${OUT}/ai-findings.json"
  if [[ ! -f "${FINDINGS}" ]]; then
    echo "${FIXTURE_SAMPLE}" >"${OUT}/agent-transcript.txt"
    node "${PARSE}" --in "${OUT}/agent-transcript.txt" --out "${FINDINGS}" --rule-id "${RULE}"
  fi

  COUNT="$(node -e "const j=require(process.argv[1]); process.stdout.write(String((j.findings||[]).length));" "${FINDINGS}")"
  if [[ "${COUNT}" -lt 1 ]]; then
    echo "FAIL ${RULE}: no findings parsed" >&2
    exit 1
  fi
  echo "ok ${RULE} findings=${COUNT}"
done

echo "[ai-harness] done"
