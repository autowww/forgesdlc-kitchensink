#!/usr/bin/env bash
# Run Cursor CLI (`agent`) against one generated RCA prompt from analyze-website-ux.mjs
# (`rca-prompts/<finding-id>.md` under `--out`).
#
# Usage:
#   ./cursor-agent-run-finding-rca.sh [REPO_ROOT] [PATH_TO_RCA_PROMPT.md]
#
# If PROMPT is omitted, prints usage (no auto-discovery — pick one file from `rca-prompts/`).
#
# Requires: Cursor CLI `agent` on PATH (https://cursor.com/docs/cli/overview)

set -euo pipefail

REPO_ROOT="${1:-.}"
PROMPT_ARG="${2:-}"
cd "$REPO_ROOT"

if [[ -z "${PROMPT_ARG}" ]] || [[ ! -f "${PROMPT_ARG}" ]]; then
  echo "Usage: $0 REPO_ROOT path/to/rca-prompts/<id>.md" >&2
  echo "Example: $0 . .cursor/plans/forge-ux-remediation/rca-prompts/abcd1234-f00.md" >&2
  exit 1
fi

if ! command -v agent >/dev/null 2>&1; then
  echo "Cursor CLI (agent) not found. Install: https://cursor.com/docs/cli/overview" >&2
  exit 1
fi

ABS_PROMPT="$(cd "$(dirname "${PROMPT_ARG}")" && pwd)/$(basename "${PROMPT_ARG}")"
ROOT="$(pwd)"

_agent_model="${FORGE_UX_CURSOR_AGENT_MODEL:-composer-2.5}"
echo "cursor-agent-run-finding-rca: model=${_agent_model}" >&2

exec agent -p --trust --model "${_agent_model}" "Repository root: ${ROOT}

Read and execute the root-cause remediation task documented in:

${ABS_PROMPT}

Follow the scripted finding, evidence paths, and design-standard pin inside that file.
Propose minimal code changes only where justified by repo content; if the fix belongs in Kitchen Sink shared code, edit there and list tests to run (pytest forge-autodoc/tests from the KS repo root).

Summarize files changed when done."
