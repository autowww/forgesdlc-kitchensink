#!/usr/bin/env bash
# Run one AI.A11Y rule prompt via Cursor agent (or --llm workcells).
set -euo pipefail

USE_LLM=0
LLM_ENV_FILE=""
RULE_ID=""
CONTEXT_FILE=""
OUT_DIR=""
REPO_ROOT=""
RULE_PROMPT=""
URLS=()

usage() {
  echo "usage: $0 [--llm] [--rule-id AI.A11Y...] [--context FILE] [--out-dir DIR] REPO_ROOT PROMPT_MD URL..." >&2
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --llm) USE_LLM=1 ;;
    --llm-env=*) LLM_ENV_FILE="${1#*=}" ;;
    --llm-env)
      LLM_ENV_FILE="${2:-}"
      shift
      ;;
    --rule-id=*) RULE_ID="${1#*=}" ;;
    --rule-id)
      RULE_ID="${2:-}"
      shift
      ;;
    --context=*) CONTEXT_FILE="${1#*=}" ;;
    --context)
      CONTEXT_FILE="${2:-}"
      shift
      ;;
    --out-dir=*) OUT_DIR="${1#*=}" ;;
    --out-dir)
      OUT_DIR="${2:-}"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --*)
      echo "run-design-ai-rule: unknown option: $1" >&2
      usage
      exit 2
      ;;
    *)
      if [[ -z "${REPO_ROOT}" ]]; then
        REPO_ROOT="$1"
      elif [[ -z "${RULE_PROMPT}" ]]; then
        RULE_PROMPT="$1"
      else
        URLS+=("$1")
      fi
      ;;
  esac
  shift
done

if [[ -z "${REPO_ROOT}" || -z "${RULE_PROMPT}" ]]; then
  usage
  exit 2
fi

TOOL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PARSE="${TOOL_ROOT}/auditor-tests/parse-ai-agent-findings.mjs"
OUT_DIR="${OUT_DIR:-${TMPDIR:-/tmp}/a11y-ai-rule-$$}"
mkdir -p "${OUT_DIR}"
TRANSCRIPT="${OUT_DIR}/agent-transcript.txt"

PROMPT_BODY="$(cat "${RULE_PROMPT}")"
CTX_BLOCK=""
if [[ -n "${CONTEXT_FILE}" && -f "${CONTEXT_FILE}" ]]; then
  CTX_BLOCK=$'\n\n## Page context\n\n```json\n'"$(cat "${CONTEXT_FILE}")"$'\n```\n'
fi
URL_BLOCK=""
if [[ ${#URLS[@]} -gt 0 ]]; then
  URL_BLOCK=$'\n\n## URLs to review\n\n'
  for u in "${URLS[@]}"; do
    URL_BLOCK+="- ${u}"$'\n'
  done
fi

FULL_PROMPT="${PROMPT_BODY}${CTX_BLOCK}${URL_BLOCK}

Return **only** a JSON object with \`summary\` and \`findings\` array per the prompt Output section."

if [[ "${USE_LLM}" -eq 1 ]]; then
  echo "run-design-ai-rule: --llm not wired in v1; use Cursor agent" >&2
  exit 2
fi

if ! command -v agent >/dev/null 2>&1; then
  echo "run-design-ai-rule: Cursor CLI 'agent' not found; set SKIP_AGENT=1 in harness" >&2
  exit 2
fi

set +e
agent -p --force --output-format text "${FULL_PROMPT}" >"${TRANSCRIPT}" 2>&1
AGENT_RC=$?
set -e

FINDINGS_JSON="${OUT_DIR}/ai-findings.json"
node "${PARSE}" --in "${TRANSCRIPT}" --out "${FINDINGS_JSON}" ${RULE_ID:+--rule-id "${RULE_ID}"} >/dev/null

echo "wrote ${FINDINGS_JSON} (agent exit ${AGENT_RC})"
exit 0
