#!/usr/bin/env bash
# Invoke Cursor CLI agent with a Studio UX PDCA plan.
set -euo pipefail

REPO_ROOT="${1:-.}"
PLAN_PATH="${2:-}"
CYCLE_DIR="${3:-}"
LOG_PATH="${CYCLE_DIR:+${CYCLE_DIR}/cursor-agent.log}"

cd "$REPO_ROOT"

if [[ -z "$PLAN_PATH" || ! -f "$PLAN_PATH" ]]; then
  echo "usage: $0 <repo_root> <plan.md> [cycle_dir]" >&2
  exit 1
fi

if ! command -v agent >/dev/null 2>&1; then
  echo "SKIP_CURSOR_AGENT=1 or install Cursor CLI (agent)" >&2
  exit 0
fi

ABS_PLAN="$(cd "$(dirname "$PLAN_PATH")" && pwd)/$(basename "$PLAN_PATH")"
MODEL="${FORGE_STUDIO_UX_CURSOR_MODEL:-composer-2.5}"
SUGGESTION_RANK="${STUDIO_UX_SUGGESTION_RANK:-}"
SUGGESTION_TOTAL="${STUDIO_UX_SUGGESTION_TOTAL:-}"
SCOPE_BLOCK=""
if [[ -n "$SUGGESTION_RANK" && -n "$SUGGESTION_TOTAL" ]]; then
  SCOPE_BLOCK="## HARD SCOPE GATE (mandatory)

This run is prioritized suggestion **${SUGGESTION_RANK} of ${SUGGESTION_TOTAL}** for this page cycle.

- Implement **only** the scoped change in the plan file below.
- Do **not** implement, stage, or partially apply other assessment suggestions.
- Do **not** bundle unrelated IA remounts, copy edits, or visual polish from the batch index.
- If the plan references other suggestions, treat them as out of scope for this run."
else
  SCOPE_BLOCK="## HARD SCOPE GATE (mandatory)

- Implement **only** the scoped change in the plan file below.
- If the assessment batch lists multiple suggestions, ignore all except what this plan describes."
fi

PROMPT="Repository root: $(pwd)

${SCOPE_BLOCK}

Execute the Studio UX PDCA plan at:
${ABS_PLAN}

Constraints:
- Prefer KS components in studio-ui/src/ks/ and vendored KS CSS
- New primitives: forgesdlc-kitchensink first, then sync to consumer
- Preserve dual-wiki behavior; no feature regression
- Update visual-registry.yaml when visuals change
- Run tests listed in the plan before finishing"

if [[ -n "${LOG_PATH:-}" ]]; then
  mkdir -p "$(dirname "$LOG_PATH")"
  agent -p --model "$MODEL" "$PROMPT" 2>&1 | tee "$LOG_PATH"
else
  agent -p --model "$MODEL" "$PROMPT"
fi

echo "{\"ok\": true, \"agent_log_path\": \"${LOG_PATH:-}\"}"
