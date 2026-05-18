#!/usr/bin/env bash
# Build inventory + Playwright UX audit + Cursor Agent remediation (Forge Website UX Auditor).
#
# Usage:
#   ./run-website-ux-remediation-loop.sh <WEBSITE_REPO_ROOT> <STATIC_FIXTURE_DIR | https://URL/>
#
# Examples:
#   ./run-website-ux-remediation-loop.sh ~/Code/forge-fleet-website ~/Code/forge-fleet-website/website
#   ./run-website-ux-remediation-loop.sh ~/Code/forgesdlc https://forgesdlc.com/
#
# Local fixture: serves the directory with python3 -m http.server on an ephemeral port.
# HTTP(S) URL: uses --site only (no local server).
#
# Outputs each run under:
#   <kitchensink>/workbench/ux-audit/<website_slug>/<UTC>_<random>/
#
# Stable campaign folder (reuse one --out directory across remediation loops):
#   UX_AUDIT_OUT_DIR=/abs/path/to/campaign   mkdir -p + realpath; skips ephemeral RUN_TAG.
#   UX_AUDIT_INCREMENTAL=1                   Always pass --incremental to the auditor.
#   UX_AUDIT_FORCE_FULL=1                    With UX_AUDIT_OUT_DIR + audit-data.json present,
#                                           skip auto --incremental (full crawl baseline).
#   UX_AUDIT_VERBOSE=1|2                     Pass --verbose or --verbose=2 (stderr breadcrumbs).
#
# Progress streams:
#   Phase lines (`[ux-audit] phase=…`), inventory sampling, shell handoffs (`_out_echo`), sitewide scorer
#   diagnostics, and crawl rows (`[ux-score]` / `[ux-audit]` columns) go to stderr so they stay visible in the
#   same channel when stdout is piped or block-buffered (auditor summaries still print to stdout at the end).
#
# Env:
#   SKIP_CURSOR_AGENT=1      Audit + plans only (no agent). Skips Cursor CLI auth at start.
#   SKIP_CURSOR_LOGIN=1      After auth banner: do not run `agent login` when unauthenticated.
#   CURSOR_API_KEY           Non-interactive CLI auth (skips login).
#   DESIGN_STANDARD_PATH     Override enterprise standard Markdown (default: KS docs/design/…).
#   TIMEOUT_MS               Auditor navigation timeout (default: 90000).
#   MAX_PAGES                Pass-through --max-pages if set.
#   STOP_AFTER_MAJOR_PLUS    Pass-through if set.
#   UX_AUDIT_SKIP_SCORER=1       Skip score-website-ux.mjs (removes stale ux-quality-score-loop-delta.json).
#   UX_AUDIT_SCORER_MAX_PAGES    Sitewide scorer --max-pages (remediation loop default: 10; override e.g. 120).
#   UX_AUDIT_SCORER_MAX_LINK_DEPTH   Pass-through --max-link-depth for the scorer (default: 2 = root + 2 hops).
#   UX_AUDIT_SCORER_NO_CSV=1     Pass --no-ux-csv to scorer only.
#   UX_AUDIT_FIXTURE_HTTP_VERBOSE=1   Show python http.server access-log lines on stderr (default: stderr quiet).
#   FORGE_UX_PROGRESS_RUN_NO     Progress line [run …]: preset to pin one label for both scorer + auditor.
#                                When unset, this script sets 1=sitewide scorer, 2=auditor (and auditor bumps for --scores-first).
#   FORGE_UX_CRAWL_PROGRESS=1    Force crawl progress when stderr is not a TTY; =0 disables.
#                                 When stderr is not a TTY and this is unset, the script sets it to 1 (log-friendly).
#   FORGE_UX_CRAWL_PROGRESS_HEARTBEAT_SEC  While idle, append the progress row again every N sec (default 15; 0=off).
#   FORGE_UX_LOOP_WATCH=1           Alternate-screen dashboard on stderr TTY; merges crawl state into ux-loop-dashboard-state.json instead of printing rows to stderr.
#                                   Optional FORGE_UX_LOOP_WATCH_REFRESH_MS (poll interval for dashboard UI). FORGE_UX_LOOP_WATCH_LOG is set to OUT_DIR/ux-loop-dashboard.log.
#                                   Equivalent CLI (not passed through to the auditor): --watch  or  --loop-watch
#   RUN_WEBSITE_UX_LOOP_SHOW_RUNNER_PATH=1   Echo absolute KS runner path + KS_ROOT (verify workspace delegates to the expected checkout).
#
# Extra auditor CLI flags after the two positionals:
#   ./run-website-ux-remediation-loop.sh repo ./website --site-kind fleet --no-screenshots
#   ./run-website-ux-remediation-loop.sh repo ./website --watch --site-kind fleet
#
set -euo pipefail

_out_echo() {
  printf '%s\n' "$@" >&2
}

TOOL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KS_ROOT="$(cd "$TOOL_DIR/../.." && pwd)"
if [[ "${RUN_WEBSITE_UX_LOOP_SHOW_RUNNER_PATH:-}" == "1" ]]; then
  echo "run-website-ux-remediation-loop: KS runner=${TOOL_DIR}/run-website-ux-remediation-loop.sh KS_ROOT=${KS_ROOT}" >&2
fi
AUDITOR="$TOOL_DIR/analyze-website-ux.mjs"
RUN_PLAN="$TOOL_DIR/cursor-agent-run-ux-plan.sh"
STANDARD="${DESIGN_STANDARD_PATH:-$KS_ROOT/docs/design/forge-enterprise-ai-website-standard.md}"

usage() {
  cat >&2 <<'EOF'
Forge Website UX Auditor — remediation loop

Usage:
  ./run-website-ux-remediation-loop.sh <WEBSITE_REPO_ROOT> <STATIC_FIXTURE_DIR | https://URL/> [EXTRA_AUDITOR_ARGS...]

Examples:
  ./run-website-ux-remediation-loop.sh ~/Code/forge-fleet-website ~/Code/forge-fleet-website/website
  ./run-website-ux-remediation-loop.sh ~/Code/forgesdlc https://forgesdlc.com/ --site-kind forgesdlc

Outputs: <kitchensink>/workbench/ux-audit/<slug>/<UTC_random>/ unless UX_AUDIT_OUT_DIR is set.

Requires: Node, Python 3 (fixture server only), Playwright/Chromium, Cursor CLI agent for remediation.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then usage; exit 0; fi
if [[ $# -lt 2 ]]; then usage >&2; exit 2; fi

REPO_ROOT="$(realpath "$1")"
SERVE_OR_URL="$2"
shift 2
EXTRA=( "$@" )

_EXTRA_OUT=()
for arg in "${EXTRA[@]}"; do
  if [[ "$arg" == "--watch" || "$arg" == "--loop-watch" ]]; then
    export FORGE_UX_LOOP_WATCH=1
    continue
  fi
  _EXTRA_OUT+=( "$arg" )
done
EXTRA=( "${_EXTRA_OUT[@]}" )
unset _EXTRA_OUT

for arg in "${EXTRA[@]}"; do
  if [[ "$arg" == "--static-only" || "$arg" == "--no-browser" ]]; then
    echo "run-website-ux-remediation-loop: Playwright crawl required; remove $arg." >&2
    exit 2
  fi
done

if [[ ! -d "$REPO_ROOT" ]]; then
  echo "run-website-ux-remediation-loop: repo root is not a directory: $REPO_ROOT" >&2
  exit 2
fi

if [[ ! -f "$AUDITOR" ]]; then
  echo "run-website-ux-remediation-loop: missing $AUDITOR" >&2
  exit 1
fi
SCORER="$TOOL_DIR/score-website-ux.mjs"
if [[ ! -f "$SCORER" ]]; then
  echo "run-website-ux-remediation-loop: missing $SCORER" >&2
  exit 1
fi
if [[ ! -f "$RUN_PLAN" ]]; then
  echo "run-website-ux-remediation-loop: missing $RUN_PLAN" >&2
  exit 1
fi
if [[ ! -f "$STANDARD" ]]; then
  echo "run-website-ux-remediation-loop: missing design standard: $STANDARD" >&2
  exit 1
fi

ensure_cursor_agent_auth() {
  if [[ "${SKIP_CURSOR_AGENT:-}" == "1" ]]; then
    echo 'run-website-ux-remediation-loop: SKIP_CURSOR_AGENT=1 — skipping Cursor CLI auth (audit/plans only, no remediation agent).' >&2
    return 0
  fi

  echo 'run-website-ux-remediation-loop: Cursor CLI — checking authentication (required after the audit for `agent` remediation; runs first so long crawls are not wasted).' >&2

  if [[ "${SKIP_CURSOR_LOGIN:-}" == "1" ]]; then
    echo 'run-website-ux-remediation-loop: SKIP_CURSOR_LOGIN=1 — not running `agent login` (you must already be authenticated for remediation to succeed).' >&2
    return 0
  fi
  if [[ -n "${CURSOR_API_KEY:-}" ]]; then
    echo 'run-website-ux-remediation-loop: CURSOR_API_KEY set — skipping interactive `agent login`.' >&2
    return 0
  fi
  if ! command -v agent >/dev/null 2>&1; then
    echo 'run-website-ux-remediation-loop: `agent` not on PATH — install Cursor CLI, or set SKIP_CURSOR_AGENT=1 for audit-only.' >&2
    exit 1
  fi
  if agent status >/dev/null 2>&1; then
    echo 'run-website-ux-remediation-loop: Cursor CLI OK — authenticated (`agent status`).' >&2
    return 0
  fi

  echo 'run-website-ux-remediation-loop: Cursor CLI not authenticated — running interactive `agent login` (complete in browser when prompted)…' >&2
  agent login
  echo 'run-website-ux-remediation-loop: Cursor CLI — `agent login` finished; continuing with sitewide scorer and audit.' >&2
}

ensure_cursor_agent_auth

slugify() {
  local base
  base="$(basename "$1")"
  echo "${base}" | tr -cd '[:alnum:]._-' || echo "site"
}

SLUG="$(slugify "$REPO_ROOT")"
UX_AUDIT_OUT_DIR="${UX_AUDIT_OUT_DIR:-}"
if [[ -n "$UX_AUDIT_OUT_DIR" ]]; then
  mkdir -p "$UX_AUDIT_OUT_DIR"
  OUT_DIR="$(realpath "$UX_AUDIT_OUT_DIR")"
else
  RUN_TAG="$(date -u +%Y%m%dT%H%M%SZ)_$(python3 -c 'import secrets; print(secrets.token_hex(4))')"
  OUT_DIR="$KS_ROOT/workbench/ux-audit/${SLUG}/${RUN_TAG}"
  mkdir -p "$OUT_DIR"
fi

META_JSON="$OUT_DIR/run-meta.json"
START_ARGS=()

if [[ "$SERVE_OR_URL" =~ ^https?:// ]]; then
  SITE_URL="$SERVE_OR_URL"
else
  FIXTURE="$(realpath "$SERVE_OR_URL")"
  if [[ ! -d "$FIXTURE" ]]; then
    echo "run-website-ux-remediation-loop: fixture path is not a directory: $SERVE_OR_URL → $FIXTURE" >&2
    exit 2
  fi
  PORT="$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()')"
  SITE_URL="http://127.0.0.1:${PORT}/"
  PY_HTTP_REDIRECT=" 2>/dev/null"
  if [[ "${UX_AUDIT_FIXTURE_HTTP_VERBOSE:-}" == "1" ]]; then
    PY_HTTP_REDIRECT=""
  fi
  START_ARGS+=(--start "sh -c 'cd \"$FIXTURE\" && exec python3 -m http.server ${PORT}${PY_HTTP_REDIRECT}'")
fi

REPO_ROOT="$REPO_ROOT" SERVE_OR_URL="$SERVE_OR_URL" SITE_URL="$SITE_URL" KS_ROOT="$KS_ROOT" OUT_DIR="$OUT_DIR" META_JSON="$META_JSON" UX_AUDIT_OUT_DIR="$UX_AUDIT_OUT_DIR" python3 <<'PY'
import json
import os

ux_out = (os.environ.get("UX_AUDIT_OUT_DIR") or "").strip()
meta = {
    "website_repo": os.environ["REPO_ROOT"],
    "serve_target": os.environ["SERVE_OR_URL"],
    "site_url": os.environ["SITE_URL"],
    "kitchensink_root": os.environ["KS_ROOT"],
    "output_directory": os.environ["OUT_DIR"],
    "campaign_out_dir": os.environ["OUT_DIR"],
    "incremental_campaign": bool(ux_out),
}
with open(os.environ["META_JSON"], "w", encoding="utf-8") as f:
    json.dump(meta, f, indent=2)
PY

forge_ux_log_line() {
  [[ "${FORGE_UX_LOOP_WATCH:-}" == "1" ]] || return 0
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >> "${OUT_DIR}/ux-loop-dashboard.log"
}

forge_ux_merge_json() {
  [[ "${FORGE_UX_LOOP_WATCH:-}" == "1" ]] || return 0
  printf '%s\n' "$1" | node "${TOOL_DIR}/merge-ux-dashboard-state.mjs" "${OUT_DIR}"
}

FORGE_UX_LOOP_WATCH_ACTIVE=0
_FORGE_UX_DASH_PID=

if [[ "${FORGE_UX_LOOP_WATCH:-}" == "1" ]]; then
  export FORGE_UX_LOOP_WATCH_OUT_DIR="${OUT_DIR}"
  export FORGE_UX_LOOP_WATCH_LOG="${OUT_DIR}/ux-loop-dashboard.log"
  : >> "${FORGE_UX_LOOP_WATCH_LOG}"

  _forge_ux_watch_cleanup() {
    local ec=$?
    if [[ "${FORGE_UX_LOOP_WATCH_ACTIVE:-0}" == "1" ]] && [[ -n "${_FORGE_UX_DASH_PID:-}" ]]; then
      kill "${_FORGE_UX_DASH_PID}" 2>/dev/null || true
      wait "${_FORGE_UX_DASH_PID}" 2>/dev/null || true
    fi
    printf '\033[?25h\033[?1049l' >&2 || true
    if [[ "${FORGE_UX_LOOP_WATCH:-}" == "1" ]] && [[ -n "${OUT_DIR:-}" ]]; then
      forge_ux_log_line "phase=watch_exit code=${ec}"
      forge_ux_merge_json "{\"phase\":\"watch_exit\",\"exitCode\":${ec}}" || true
    fi
    return "${ec}"
  }
  trap '_forge_ux_watch_cleanup' EXIT INT TERM

  REPO_ROOT="${REPO_ROOT}" SITE_URL="${SITE_URL}" SLUG="${SLUG}" OUT_DIR="${OUT_DIR}" python3 <<'PY' | node "${TOOL_DIR}/merge-ux-dashboard-state.mjs" "${OUT_DIR}"
import json
import os

print(json.dumps({
    "phase": "loop_start",
    "slug": os.environ["SLUG"],
}))
PY
  forge_ux_log_line "phase=loop_start slug=${SLUG}"

  if [[ -t 2 ]]; then
    FORGE_UX_LOOP_WATCH_ACTIVE=1
    node "${TOOL_DIR}/loop-watch-dashboard.mjs" "${OUT_DIR}" &
    _FORGE_UX_DASH_PID=$!
  else
    echo "run-website-ux-remediation-loop: FORGE_UX_LOOP_WATCH=1 but stderr is not a TTY — skipping alternate-screen dashboard (state+log still update)." >&2
  fi
fi

TIMEOUT_MS="${TIMEOUT_MS:-90000}"

SITE_KIND_ARGS=()
i=0
while [[ $i -lt ${#EXTRA[@]} ]]; do
  if [[ "${EXTRA[$i]}" == "--site-kind" ]] && [[ $((i + 1)) -lt ${#EXTRA[@]} ]]; then
    SITE_KIND_ARGS=(--site-kind "${EXTRA[$((i + 1))]}")
    break
  fi
  i=$((i + 1))
done

# Sitewide scorer is a quick rollup before the auditor; cap pages unless overridden.
SCORER_PAGES="${UX_AUDIT_SCORER_MAX_PAGES:-10}"
SCORER_LINK_DEPTH="${UX_AUDIT_SCORER_MAX_LINK_DEPTH:-}"

# Crawl progress [run N]: auto-assign sequential numbers per invocation unless FORGE_UX_PROGRESS_RUN_NO is preset (non-empty).
_UX_PROG_LOCKED=0
if [[ -n "${FORGE_UX_PROGRESS_RUN_NO:-}" ]]; then
  _UX_PROG_LOCKED=1
  export FORGE_UX_PROGRESS_RUN_AUTO=0
else
  export FORGE_UX_PROGRESS_RUN_AUTO=1
  export FORGE_UX_PROGRESS_RUN_NO=1
fi

# Log files and pipes are not TTY — Node disables the crawl line unless forced, which looks "stuck" after the scorer.
if [[ ! -t 2 ]] && [[ -z "${FORGE_UX_CRAWL_PROGRESS+x}" ]]; then
  export FORGE_UX_CRAWL_PROGRESS=1
fi

if [[ "${UX_AUDIT_SKIP_SCORER:-}" == "1" ]]; then
  echo "run-website-ux-remediation-loop: UX_AUDIT_SKIP_SCORER=1 — skipping score-website-ux.mjs (removing stale ux-quality-score-loop-delta.json if present)." >&2
  rm -f "${OUT_DIR}/ux-quality-score-loop-delta.json"
  echo '[ux-audit] phase=shell_handoff · scorer=skipped · next=analyze-website-ux.mjs' >&2
else
  SCORER_CMD=(
    node "$SCORER"
    --repo "$REPO_ROOT"
    "${START_ARGS[@]}"
    --site "$SITE_URL"
    --standard "$STANDARD"
    --out "$OUT_DIR"
    --timeout-ms "$TIMEOUT_MS"
    "${SITE_KIND_ARGS[@]}"
  )
  SCORER_CMD+=(--max-pages "$SCORER_PAGES")
  if [[ -n "$SCORER_LINK_DEPTH" ]]; then
    SCORER_CMD+=(--max-link-depth "$SCORER_LINK_DEPTH")
  fi
  if [[ "${UX_AUDIT_SCORER_NO_CSV:-}" == "1" ]]; then
    SCORER_CMD+=(--no-ux-csv)
  fi
  forge_ux_log_line "phase=scorer_begin"
  forge_ux_merge_json '{"phase":"scorer_crawl"}'
  echo "run-website-ux-remediation-loop: sitewide scorer → score-website-ux.mjs · max-pages=${SCORER_PAGES} (override with UX_AUDIT_SCORER_MAX_PAGES)" >&2
  _out_echo "run-website-ux-remediation-loop: scorer crawl progress log → ${OUT_DIR}/scorer-crawl-progress.log"
  "${SCORER_CMD[@]}"
  _out_echo "run-website-ux-remediation-loop: sitewide scorer finished."
  _out_echo '[ux-audit] phase=shell_handoff · scorer=complete · next=analyze-website-ux.mjs'
  if [[ "$_UX_PROG_LOCKED" == 0 ]]; then
    export FORGE_UX_PROGRESS_RUN_NO=$((FORGE_UX_PROGRESS_RUN_NO + 1))
  fi
fi

AUTO_INCREMENTAL=false
if [[ "${UX_AUDIT_INCREMENTAL:-}" == "1" ]]; then
  AUTO_INCREMENTAL=true
elif [[ -n "${UX_AUDIT_OUT_DIR:-}" ]] && [[ -f "${OUT_DIR}/audit-data.json" ]] && [[ "${UX_AUDIT_FORCE_FULL:-}" != "1" ]]; then
  AUTO_INCREMENTAL=true
fi

AUDITOR_EXTRA_FLAGS=()
if [[ "$AUTO_INCREMENTAL" == true ]]; then
  AUDITOR_EXTRA_FLAGS+=(--incremental)
fi
if [[ "${UX_AUDIT_VERBOSE:-}" == "2" ]]; then
  AUDITOR_EXTRA_FLAGS+=(--verbose=2)
elif [[ "${UX_AUDIT_VERBOSE:-}" == "1" ]]; then
  AUDITOR_EXTRA_FLAGS+=(--verbose)
elif [[ -n "${UX_AUDIT_VERBOSE:-}" ]]; then
  AUDITOR_EXTRA_FLAGS+=(--verbose="${UX_AUDIT_VERBOSE}")
fi

AUDITOR_ARGS=(
  node "$AUDITOR"
  --repo "$REPO_ROOT"
  "${START_ARGS[@]}"
  --site "$SITE_URL"
  --standard "$STANDARD"
  --out "$OUT_DIR"
  --timeout-ms "$TIMEOUT_MS"
  --install-rule
  "${AUDITOR_EXTRA_FLAGS[@]}"
)

if [[ -n "${MAX_PAGES:-}" ]]; then
  AUDITOR_ARGS+=(--max-pages "$MAX_PAGES")
fi
if [[ -n "${STOP_AFTER_MAJOR_PLUS:-}" ]]; then
  AUDITOR_ARGS+=(--stop-after-major-plus "$STOP_AFTER_MAJOR_PLUS")
fi
if [[ "${UX_AUDIT_BREADTH_CRAWL:-}" == "1" ]]; then
  AUDITOR_ARGS+=(--breadth-crawl)
fi

echo "run-website-ux-remediation-loop: kitchensink=${KS_ROOT}" >&2
echo "run-website-ux-remediation-loop: WEBSITE_REPO=${REPO_ROOT}" >&2
echo "run-website-ux-remediation-loop: fixture_or_url=${SERVE_OR_URL}" >&2
echo "run-website-ux-remediation-loop: SITE_URL=${SITE_URL}" >&2
if [[ -n "${UX_AUDIT_OUT_DIR:-}" ]]; then
  echo "run-website-ux-remediation-loop: UX_AUDIT_OUT_DIR campaign (stable)=${OUT_DIR}" >&2
else
  echo "run-website-ux-remediation-loop: ephemeral OUT=${OUT_DIR}" >&2
fi
echo "run-website-ux-remediation-loop: run-meta=${META_JSON}" >&2
echo "run-website-ux-remediation-loop: auditor → incremental=${AUTO_INCREMENTAL} breadth_crawl=${UX_AUDIT_BREADTH_CRAWL:-0} verbose=${UX_AUDIT_VERBOSE:-} scorer_skipped=${UX_AUDIT_SKIP_SCORER:-0}" >&2

export FORGE_UX_PROGRESS_PHASE_BASE="${FORGE_UX_PROGRESS_RUN_NO}"

forge_ux_log_line "phase=auditor_begin"
forge_ux_merge_json '{"phase":"auditor_enter"}'

_out_echo '[ux-audit] phase=shell · action=exec_node · script=analyze-website-ux.mjs'
_out_echo "run-website-ux-remediation-loop: starting auditor → analyze-website-ux.mjs"
_out_echo "run-website-ux-remediation-loop: hint · phase + inventory + crawl progress lines → stderr ([ux-audit] / [ux-score]; piped-safe)."
_out_echo "run-website-ux-remediation-loop: auditor crawl progress log → ${OUT_DIR}/auditor-crawl-progress.log"
"${AUDITOR_ARGS[@]}" "${EXTRA[@]}"

echo "run-website-ux-remediation-loop: artifacts → ux-quality-score.{json,md} ux-quality-score-loop-delta.json audit-report.md audit-data.json …" >&2

if [[ "${SKIP_CURSOR_AGENT:-}" == "1" ]]; then
  forge_ux_log_line "phase=skip_cursor_agent"
  forge_ux_merge_json '{"phase":"audit_only_done"}'
  echo "run-website-ux-remediation-loop: SKIP_CURSOR_AGENT=1 — skipping remediation."
  exit 0
fi

if ! command -v agent >/dev/null 2>&1; then
  echo "run-website-ux-remediation-loop: install Cursor CLI agent or use SKIP_CURSOR_AGENT=1." >&2
  exit 1
fi

PLAN_FILE="$OUT_DIR/forge-ux-remediation.plan.md"
if [[ ! -f "$PLAN_FILE" ]]; then
  echo "run-website-ux-remediation-loop: missing plan $PLAN_FILE" >&2
  exit 1
fi

echo "run-website-ux-remediation-loop: remediation repo=${REPO_ROOT}" >&2
echo "run-website-ux-remediation-loop: remediation plan=$(realpath "$PLAN_FILE")" >&2
echo "run-website-ux-remediation-loop: remediation → $(basename "$RUN_PLAN")" >&2

forge_ux_log_line "phase=remediation_agent_begin"
forge_ux_merge_json '{"phase":"remediation_agent"}'

if [[ "${FORGE_UX_LOOP_WATCH:-}" == "1" ]]; then
  bash "$RUN_PLAN" "$REPO_ROOT" "$PLAN_FILE"
else
  exec bash "$RUN_PLAN" "$REPO_ROOT" "$PLAN_FILE"
fi
