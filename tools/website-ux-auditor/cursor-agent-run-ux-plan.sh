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

set -euo pipefail

REPO_ROOT="${1:-.}"
PLAN_ARG="${2:-}"
cd "$REPO_ROOT"

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

exec agent -p --trust "Repository root: ${ROOT}

Read and execute the remediation plan at: ${ABS_PLAN}

Follow the YAML todos in order (ux-00 through ux-08). For each todo, open the referenced Markdown files from the same folder as the plan (00-master, 01-08, audit-report as needed). Summarize files changed after each todo. Pause if a step would touch an unexpectedly large set of files."
