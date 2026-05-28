#!/usr/bin/env bash
# Run forge-a11y-remediation.plan.md via Cursor CLI (`agent`).
#
# Usage:
#   ./cursor-agent-run-a11y-plan.sh [REPO_ROOT] [PATH_TO_PLAN.md]
#
# Plan resolution (when PLAN omitted):
#   .cursor/plans/forge-a11y-remediation/forge-a11y-remediation.plan.md
#   OUT_DIR/forge-a11y-remediation.plan.md via FORGE_A11Y_REMEDIATION_PLAN

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUMMARY_TOOL="${SCRIPT_DIR}/../website-ux-auditor/agent-stream-summary.mjs"

REPO_ROOT="${1:-.}"
PLAN_ARG="${2:-${FORGE_A11Y_REMEDIATION_PLAN:-}}"
cd "$REPO_ROOT"

resolve_plan() {
  if [[ -n "$PLAN_ARG" && -f "$PLAN_ARG" ]]; then
    echo "$PLAN_ARG"
    return
  fi
  local nested=".cursor/plans/forge-a11y-remediation/forge-a11y-remediation.plan.md"
  if [[ -f "$nested" ]]; then
    echo "$nested"
    return
  fi
  return 1
}

if ! PLAN_REL="$(resolve_plan)"; then
  echo "Could not find a11y plan. Generate with generate-a11y-remediation-plan.mjs or pass a path." >&2
  exit 1
fi

if ! command -v agent >/dev/null 2>&1; then
  echo "Cursor CLI (agent) not found." >&2
  exit 1
fi

ABS_PLAN="$(cd "$(dirname "$PLAN_REL")" && pwd)/$(basename "$PLAN_REL")"
ROOT="$(pwd)"

AGENT_PROMPT="Repository root: ${ROOT}

Read and execute the accessibility remediation plan at: ${ABS_PLAN}

Follow YAML todos in order (a11y-01, a11y-02, …). Prefer generator and shared layout fixes for repeating DET.A11Y.* or axe findings. Do not claim legal WCAG conformance. After substantive edits, run generator/build-site.py when present and note files changed per todo."

EXTRA_FLAGS=()
if [[ -n "${FORGE_A11Y_CURSOR_AGENT_EXTRA:-}" ]]; then
  read -r -a EXTRA_FLAGS <<< "${FORGE_A11Y_CURSOR_AGENT_EXTRA}"
elif [[ "${FORGE_A11Y_CURSOR_AGENT_VERBOSE:-0}" == "1" ]]; then
  EXTRA_FLAGS=(--output-format stream-json --stream-partial-output)
fi

_agent_has_model_flag=0
for ((i = 0; i < ${#EXTRA_FLAGS[@]}; i++)); do
  if [[ "${EXTRA_FLAGS[i]}" == --model || "${EXTRA_FLAGS[i]}" == --model=* ]]; then
    _agent_has_model_flag=1
    break
  fi
done
if [[ "${_agent_has_model_flag}" -eq 0 ]]; then
  _agent_model="${FORGE_A11Y_CURSOR_AGENT_MODEL:-composer-2.5}"
  EXTRA_FLAGS=(--model "${_agent_model}" "${EXTRA_FLAGS[@]}")
fi

_agent_stream_json=0
for ((i = 0; i < ${#EXTRA_FLAGS[@]}; i++)); do
  if [[ "${EXTRA_FLAGS[i]}" == "--output-format" && "${EXTRA_FLAGS[i + 1]:-}" == "stream-json" ]]; then
    _agent_stream_json=1
    break
  fi
done

AGENT_TEE_TARGETS=()
if [[ -n "${FORGE_A11Y_REMEDIATION_AGENT_LOG:-}" ]]; then
  AGENT_TEE_TARGETS+=("${FORGE_A11Y_REMEDIATION_AGENT_LOG}")
  : >>"${FORGE_A11Y_REMEDIATION_AGENT_LOG}" || true
fi

forge_cursor_agent_pipe() {
  if [[ "${_agent_stream_json}" -eq 1 && "${FORGE_A11Y_AGENT_STREAM_SUMMARY:-1}" == "1" && -f "${SUMMARY_TOOL}" ]]; then
    agent -p --trust "${EXTRA_FLAGS[@]}" "${AGENT_PROMPT}" 2>&1 | node "${SUMMARY_TOOL}"
  else
    agent -p --trust "${EXTRA_FLAGS[@]}" "${AGENT_PROMPT}" 2>&1
  fi
}

if [[ ${#AGENT_TEE_TARGETS[@]} -gt 0 ]]; then
  set +e
  forge_cursor_agent_pipe | tee -a "${AGENT_TEE_TARGETS[@]}"
  agent_rc="${PIPESTATUS[0]}"
  set -e
  exit "${agent_rc}"
fi

set +e
forge_cursor_agent_pipe
agent_rc="${PIPESTATUS[0]}"
set -e
exit "${agent_rc}"
