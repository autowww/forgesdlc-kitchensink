#!/usr/bin/env bash
set -euo pipefail

USE_LLM=0
LLM_ENV_FILE=""
RULE_ID=""
CONTEXT_FILE=""
WC_OUT_DIR=""
REPO_ROOT=""
RULE_PROMPT=""
URLS=()

usage() {
  echo "usage: $0 [--llm] [--llm-env FILE] [--rule-id AI.X] [--context FILE] [--out-dir DIR] <REPO_ROOT> <RULE_PROMPT_MD> <URL> [URL...]" >&2
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
    --out-dir=*) WC_OUT_DIR="${1#*=}" ;;
    --out-dir)
      WC_OUT_DIR="${2:-}"
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

if [[ -z "${REPO_ROOT}" || -z "${RULE_PROMPT}" || ${#URLS[@]} -eq 0 ]]; then
  usage
  exit 2
fi

REPO_ROOT="$(cd "${REPO_ROOT}" && pwd)"
KS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
AUDITOR_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ ! -f "${RULE_PROMPT}" ]]; then
  echo "run-design-ai-rule: missing prompt file: ${RULE_PROMPT}" >&2
  exit 1
fi

if [[ "${USE_LLM}" -eq 1 ]]; then
  PACK_DIR="${KS_ROOT}/tools/forge-micro-agent/packs/ux-ai-rule-v1"
  if [[ ! -d "${PACK_DIR}" ]]; then
    echo "run-design-ai-rule: missing pack ${PACK_DIR}" >&2
    exit 1
  fi
  if [[ -z "${CONTEXT_FILE}" || ! -f "${CONTEXT_FILE}" ]]; then
    echo "run-design-ai-rule: --llm requires --context FILE (assembled context.json)" >&2
    exit 1
  fi
  WC_OUT_DIR="${WC_OUT_DIR:-$(dirname "${CONTEXT_FILE}")/workcells-out}"
  mkdir -p "${WC_OUT_DIR}"
  FORGE_WC=""
  if [[ -n "${FORGE_WORKCELLS_BIN:-}" && -x "${FORGE_WORKCELLS_BIN}" ]]; then
    FORGE_WC="${FORGE_WORKCELLS_BIN}"
  elif [[ -x "${KS_ROOT}/forge-workcells/.venv/bin/forge-workcells" ]]; then
    FORGE_WC="${KS_ROOT}/forge-workcells/.venv/bin/forge-workcells"
  elif [[ -x "${KS_ROOT}/../forge-workcells/.venv/bin/forge-workcells" ]]; then
    FORGE_WC="${KS_ROOT}/../forge-workcells/.venv/bin/forge-workcells"
  elif command -v forge-workcells >/dev/null 2>&1; then
    FORGE_WC="$(command -v forge-workcells)"
  fi
  if [[ -z "${FORGE_WC}" ]]; then
    echo "run-design-ai-rule: forge-workcells not found (install or set FORGE_WORKCELLS_BIN)" >&2
    exit 1
  fi
  WC_ARGS=(run --workcell local_llm_worker --pack "${PACK_DIR}" --context "${CONTEXT_FILE}" --out-dir "${WC_OUT_DIR}")
  if [[ -n "${LLM_ENV_FILE}" ]]; then
    WC_ARGS+=(--llm-env "${LLM_ENV_FILE}")
  fi
  echo "run-design-ai-rule: local_llm_worker pack=${PACK_DIR}" >&2
  OUT_FILE="$("${FORGE_WC}" "${WC_ARGS[@]}")"
  cat "${OUT_FILE}"
  exit 0
fi

if ! command -v agent >/dev/null 2>&1; then
  echo "run-design-ai-rule: Cursor CLI agent is required on PATH (or use --llm)." >&2
  exit 1
fi

PROMPT_BODY="$(cat "${RULE_PROMPT}")"
URL_BLOCK="$(printf '%s\n' "${URLS[@]}")"

PROMPT="Repository root: ${REPO_ROOT}

Apply this AI rule with PDCA discipline:
${PROMPT_BODY}

Target URLs:
${URL_BLOCK}

Return one JSON object with:
{
  \"summary\": \"...\",
  \"findings\": [
    {
      \"url\": \"...\",
      \"severity\": \"blocker|critical|major|warn|minor|trivial|cosmetic\",
      \"principleId\": \"AI.*\",
      \"deterministicCoverage\": \"covered|partially-covered|not-covered\",
      \"candidateDeterministicRule\": \"DET.* or AI-only rationale\",
      \"title\": \"...\",
      \"evidence\": \"...\",
      \"screenshotOrDomEvidence\": \"...\",
      \"hashesOrContractsAffected\": [\"...\"],
      \"sourceFiles\": [\"...\"],
      \"confidence\": 0.0,
      \"remediation\": \"...\"
    }
  ]
}"

_agent_model="${FORGE_UX_CURSOR_AGENT_MODEL:-composer-2.5}"
echo "run-design-ai-rule: model=${_agent_model}" >&2
cd "${REPO_ROOT}"
agent -p --trust --model "${_agent_model}" "${PROMPT}"
