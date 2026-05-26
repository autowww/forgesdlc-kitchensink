#!/usr/bin/env bash
# Run Cursor CLI (`agent`) for Learn 101 meta-analysis (prompt/runner tuning only).
#
# Usage:
#   ./cursor-agent-run-learn-101-meta.sh PATH_TO_agent-meta.prompt.md
#
# Env:
#   FORGE_UX_LEARN101_META_AGENT_LOG  — tee transcript (optional)
#   FORGE_UX_CURSOR_AGENT_MODEL       — passed via cursor-agent-run pattern (default: composer-2.5)
#
# Requires: Cursor CLI `agent` on PATH

set -euo pipefail

PROMPT_ARG="${1:-}"

if [[ -z "${PROMPT_ARG}" ]] || [[ ! -f "${PROMPT_ARG}" ]]; then
  echo "Usage: $0 PATH_TO_agent-meta.prompt.md" >&2
  exit 1
fi

if ! command -v agent >/dev/null 2>&1; then
  echo "cursor-agent-run-learn-101-meta: Cursor CLI (agent) not found." >&2
  exit 1
fi

ABS_PROMPT="$(cd "$(dirname "${PROMPT_ARG}")" && pwd)/$(basename "${PROMPT_ARG}")"

EXTRA_FLAGS=()
if [[ -n "${FORGE_UX_CURSOR_AGENT_EXTRA:-}" ]]; then
  read -r -a EXTRA_FLAGS <<< "${FORGE_UX_CURSOR_AGENT_EXTRA}"
else
  _agent_model="${FORGE_UX_CURSOR_AGENT_MODEL:-composer-2.5}"
  EXTRA_FLAGS=(--model "${_agent_model}")
fi

AGENT_PROMPT="Read and execute the meta-analysis task documented in:

${ABS_PROMPT}

Do NOT edit the Forge Fleet product website. Write the deliverable Markdown file to the path named PROPOSAL_PATH inside that document.
Do not modify other repositories unless the task explicitly lists orchestration files and you are only proposing paths in the written proposal — in this run, write the proposal file only.

Summarize when done."

_run_agent() {
  agent -p --trust "${EXTRA_FLAGS[@]}" "${AGENT_PROMPT}" 2>&1
}

echo "cursor-agent-run-learn-101-meta: prompt=${ABS_PROMPT}" >&2
if [[ -n "${FORGE_UX_CURSOR_AGENT_VERBOSE:-}" ]]; then
  echo "cursor-agent-run-learn-101-meta: FORGE_UX_CURSOR_AGENT_VERBOSE=1 (stream-json summary)" >&2
fi

if [[ -n "${FORGE_UX_LEARN101_META_AGENT_LOG:-}" ]]; then
  : >>"${FORGE_UX_LEARN101_META_AGENT_LOG}" || true
  echo "cursor-agent-run-learn-101-meta: log → ${FORGE_UX_LEARN101_META_AGENT_LOG}" >&2
  set +e
  _run_agent | tee -a "${FORGE_UX_LEARN101_META_AGENT_LOG}"
  rc="${PIPESTATUS[0]}"
  set -e
  exit "${rc}"
fi

exec _run_agent
