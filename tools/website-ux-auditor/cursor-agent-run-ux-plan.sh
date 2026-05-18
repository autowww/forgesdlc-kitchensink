#!/usr/bin/env bash
# Run a generated Forge UX remediation plan via Cursor CLI (`agent`), which is the
# reliable automation path for script-created .plan.md files (the IDE "Build"
# button is tied to Plan Mode's internal session, not arbitrary files on disk).
#
# Usage:
#   ./cursor-agent-run-ux-plan.sh [REPO_ROOT] [PATH_TO_PLAN.md]
#
# If PLAN is omitted, prefers:
#   .cursor/plans/forge-ux-remediation/forge-ux-remediation.plan.md
# then the latest uniquely named mirror:
#   .cursor/plans/forge-ux-remediation__<UTC-stamp>__<audit_run_id>.plan.md
# (legacy: .cursor/plans/YYYY-MM-DD_forge-ux-remediation.plan.md)
#
# Requires: Cursor CLI `agent` on PATH (https://cursor.com/docs/cli/overview)
#
# Agent stdout/stderr can be tee’d to one or more logs (exit status preserved; no `exec` on that path):
#   FORGE_UX_LOOP_WATCH_LOG          — loop-watch dashboard activity log (set by run-website-ux-remediation-loop.sh when FORGE_UX_LOOP_WATCH=1).
#   FORGE_UX_REMEDIATION_AGENT_LOG   — per-run transcript (run-website-ux-remediation-loop.sh sets this to OUT_DIR/remediation-agent.log unless already set, including empty to disable).
#
# Cursor CLI output:
#   Default: plain `agent -p` text (low noise).
#   FORGE_UX_CURSOR_AGENT_VERBOSE=1   — `--output-format stream-json --stream-partial-output` (machine NDJSON).
#   FORGE_UX_AGENT_STREAM_SUMMARY=1  — default when stream-json: one `[ux-agent] …` line per tool/system event (no tool payloads). Set **0** to tee raw NDJSON instead.
#   FORGE_UX_AGENT_RAW_JSONL=/path    — optional: append every raw NDJSON line from the agent (forensics) while the summary still prints compact lines.
#   FORGE_UX_CURSOR_AGENT_EXTRA='…'   — space-separated extra flags (wins over VERBOSE; quoted chunks not supported).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUMMARY_TOOL="${SCRIPT_DIR}/agent-stream-summary.mjs"

REPO_ROOT="${1:-.}"
PLAN_ARG="${2:-}"
cd "$REPO_ROOT"

echo "cursor-agent-run-ux-plan: runner=$(realpath "${BASH_SOURCE[0]}")" >&2

resolve_plan() {
  if [[ -n "$PLAN_ARG" && -f "$PLAN_ARG" ]]; then
    echo "$PLAN_ARG"
    return
  fi
  local nested=".cursor/plans/forge-ux-remediation/forge-ux-remediation.plan.md"
  if [[ -f "$nested" ]]; then
    echo "$nested"
    return
  fi
  local mirror
  mirror=$(ls -t .cursor/plans/forge-ux-remediation__*.plan.md 2>/dev/null | head -1 || true)
  if [[ -n "$mirror" && -f "$mirror" ]]; then
    echo "$mirror"
    return
  fi
  local dated
  dated=$(ls -t .cursor/plans/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]_forge-ux-remediation.plan.md 2>/dev/null | head -1 || true)
  if [[ -n "$dated" && -f "$dated" ]]; then
    echo "$dated"
    return
  fi
  return 1
}

if ! PLAN_REL="$(resolve_plan)"; then
  echo "Could not find a UX plan. Run analyze-website-ux.mjs first, or pass the path:" >&2
  echo "  $0 . .cursor/plans/forge-ux-remediation/forge-ux-remediation.plan.md" >&2
  exit 1
fi

if ! command -v agent >/dev/null 2>&1; then
  echo "Cursor CLI (agent) not found. Install: https://cursor.com/docs/cli/overview" >&2
  exit 1
fi

ABS_PLAN="$(cd "$(dirname "$PLAN_REL")" && pwd)/$(basename "$PLAN_REL")"
ROOT="$(pwd)"

AGENT_PROMPT="Repository root: ${ROOT}

Read and execute the remediation plan at: ${ABS_PLAN}

Follow the YAML todos in numeric order (ux-00, ux-01, ux-02, ...). For each todo, open the referenced Markdown files from the same folder as the plan (00-master, defect plans, audit-report as needed). Prefer root-cause fixes (generators, shared layouts, global nav/theme) when findings repeat; use Plan–Do–Check–Adjust (after Do, Check with build and re-audit; Adjust by iterating the same defect plan if checks fail). Summarize files changed after each todo. Pause if a step would touch an unexpectedly large set of files."

EXTRA_FLAGS=()
if [[ -n "${FORGE_UX_CURSOR_AGENT_EXTRA:-}" ]]; then
  read -r -a EXTRA_FLAGS <<< "${FORGE_UX_CURSOR_AGENT_EXTRA}"
  echo "cursor-agent-run-ux-plan: FORGE_UX_CURSOR_AGENT_EXTRA set (${#EXTRA_FLAGS[@]} tokens)" >&2
elif [[ "${FORGE_UX_CURSOR_AGENT_VERBOSE:-0}" == "1" ]]; then
  EXTRA_FLAGS=(--output-format stream-json --stream-partial-output)
  echo "cursor-agent-run-ux-plan: FORGE_UX_CURSOR_AGENT_VERBOSE=1 → stream-json (summary lines default ON; raw NDJSON: FORGE_UX_AGENT_STREAM_SUMMARY=0 and/or FORGE_UX_AGENT_RAW_JSONL=…)" >&2
fi

_agent_stream_json=0
for ((i = 0; i < ${#EXTRA_FLAGS[@]}; i++)); do
  if [[ "${EXTRA_FLAGS[i]}" == "--output-format" && "${EXTRA_FLAGS[i + 1]:-}" == "stream-json" ]]; then
    _agent_stream_json=1
    break
  fi
  if [[ "${EXTRA_FLAGS[i]}" == --output-format=stream-json ]]; then
    _agent_stream_json=1
    break
  fi
done

if [[ -n "${FORGE_UX_AGENT_RAW_JSONL:-}" ]]; then
  echo "cursor-agent-run-ux-plan: FORGE_UX_AGENT_RAW_JSONL → ${FORGE_UX_AGENT_RAW_JSONL}" >&2
fi

AGENT_TEE_TARGETS=()
if [[ -n "${FORGE_UX_LOOP_WATCH_LOG:-}" ]]; then
  AGENT_TEE_TARGETS+=("${FORGE_UX_LOOP_WATCH_LOG}")
fi
if [[ -n "${FORGE_UX_REMEDIATION_AGENT_LOG:-}" ]]; then
  AGENT_TEE_TARGETS+=("${FORGE_UX_REMEDIATION_AGENT_LOG}")
  : >>"${FORGE_UX_REMEDIATION_AGENT_LOG}" || true
  echo "cursor-agent-run-ux-plan: remediation transcript → ${FORGE_UX_REMEDIATION_AGENT_LOG}" >&2
fi

forge_cursor_agent_pipe() {
  if [[ "${_agent_stream_json}" -eq 1 && "${FORGE_UX_AGENT_STREAM_SUMMARY:-1}" == "1" && -f "${SUMMARY_TOOL}" ]]; then
    agent -p --trust "${EXTRA_FLAGS[@]}" "${AGENT_PROMPT}" 2>&1 | node "${SUMMARY_TOOL}"
  else
    agent -p --trust "${EXTRA_FLAGS[@]}" "${AGENT_PROMPT}" 2>&1
  fi
}

if [[ ${#AGENT_TEE_TARGETS[@]} -gt 0 ]]; then
  if [[ -n "${FORGE_UX_LOOP_WATCH_LOG:-}" ]]; then
    printf '[%s] remediation_agent_spawn plan=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "${ABS_PLAN}" >>"${FORGE_UX_LOOP_WATCH_LOG}" || true
  fi
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
