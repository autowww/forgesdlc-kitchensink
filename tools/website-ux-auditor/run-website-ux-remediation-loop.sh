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
# Outputs each run under (unless UX_AUDIT_OUT_DIR is set):
#   <workspace-hub>/workbench/ux-auditor/ux-audit/<website_slug>/<UTC>_<random>/
#   Default hub: walk upward from this script until a directory named "Code" is found, then use that hub's
#   workbench/ux-auditor/. Override the root with FORGE_UX_AUDIT_WORKBENCH_ROOT (parent of ux-audit/).
#
# Stable campaign folder (reuse one --out directory across remediation loops):
#   UX_AUDIT_OUT_DIR=/abs/path/to/campaign   mkdir -p + realpath; skips ephemeral RUN_TAG.
#   UX_AUDIT_INCREMENTAL=1                   Always pass --incremental to the auditor.
#   UX_AUDIT_FORCE_FULL=1                    With UX_AUDIT_OUT_DIR + audit-data.json present,
#                                           skip auto --incremental (full crawl baseline).
#   UX_AUDIT_VERBOSE=1|2|0                   **1** or **2** = auditor `--verbose` on stderr; **0** or unset = quiet auditor (default).
#   FORGE_UX_CURSOR_AGENT_MODEL              Cursor model for remediation/AI audit CLI (default in cursor-agent-run-ux-plan.sh: composer-2.5, not fast).
#   FORGE_UX_CURSOR_AGENT_EXTRA              Optional space-separated extra `agent` flags (see cursor-agent-run-ux-plan.sh). Overrides FORGE_UX_CURSOR_AGENT_VERBOSE defaults.
#   FORGE_UX_CURSOR_AGENT_VERBOSE            **1** = stream-json agent log (compact `[ux-agent]` summary lines by default). **0** or unset = plain `agent -p` text (default).
#   FORGE_UX_REMEDIATION_AGENT_LOG           When unset, defaults to **OUT_DIR/remediation-agent.log** (agent stdout/stderr tee). Set to empty before the loop to disable that file; set to an absolute path to override.
#   FORGE_UX_AGENT_STREAM_SUMMARY            When **`agent`** uses **`stream-json`**: **1** (default) = one **`[ux-agent]`** line per tool/system event (no huge tool payloads in the log). **0** = raw NDJSON to the transcript/terminal.
#   FORGE_UX_AGENT_RAW_JSONL                 Optional path: append every raw NDJSON line from **`agent`** (forensics) while **`FORGE_UX_AGENT_STREAM_SUMMARY=1`** still prints compact lines to the main transcript.
#   FORGE_UX_ENABLE_AI_AUDIT                 Allow post-deterministic AI audit when eligibility passes (default **1**; set **0** to disable).
#   FORGE_UX_FORCE_AI_AUDIT                  **1** = run AI audit even when crawl/rules/quality gate are incomplete (still requires ENABLE unless you only use FORCE).
#                                            CLI: **--force-ai-audit** (same as env). Without force, AI runs only after full crawl, all implemented DET rules on every page, and quality gate pass.
#   FORGE_UX_AI_AUDIT_BATCH_SIZE             AI-assisted audit: max URLs per Cursor agent call (default **1** = page-by-page; homepage still isolated first when present). Set higher to group URLs in one prompt.
#   FORGE_UX_AI_AUDIT_STOP_AFTER_MAJOR_PLUS  Cumulative AI blocker+critical+major across completed batches; skip remaining batches when ≥ this (default **10**; **0** = run all batches). Mirrors deterministic Major+ governor.
#   FORGE_UX_AI_AUDIT_MAX_BATCHES            Optional cap on AI-assisted audit batches per pass (0/unset = all batches).
#   FORGE_UX_AI_AUDIT_LOG                    Override combined transcript path for the AI-assisted audit runner (default: OUT_DIR/ai-audit/ai-audit-agent.log).
#   FORGE_UX_AI_AUDIT_AGENT_EXTRA            Space-separated extra flags for the AI-assisted audit `agent` calls (falls back to FORGE_UX_CURSOR_AGENT_EXTRA when unset).
#   FORGE_UX_QUALITY_GATE                  Comma-separated max counts per severity: blocker,critical,major,warn,minor,trivial,cosmetic
#                                          (default **0,0,0,5,10,15,100**). Overrides defaults when set.
#   FORGE_UX_QUALITY_GATE_JSON             JSON object of thresholds (same keys as severities); wins over FORGE_UX_QUALITY_GATE.
#   FORGE_UX_QUALITY_GATE_LEGACY_MAJOR_ONLY  **1** = legacy loop exit (Blocker/Critical/Major must be 0 only; Warn+ uncapped). Set by **--until-major-clean**.
#   FORGE_UX_AUDITOR_BIN / FORGE_UX_SCORER_BIN / FORGE_UX_RUN_PLAN_BIN / FORGE_UX_RUN_AI_AUDIT_BIN / FORGE_UX_QUALITY_GATE_BIN / FORGE_UX_MAJOR_PLUS_COUNT_BIN
#                                           Internal path overrides used primarily by tooling tests (MAJOR_PLUS_COUNT_BIN is deprecated; use QUALITY_GATE_BIN).
#
# Progress streams:
#   Phase lines (`[ux-audit] phase=…`), inventory sampling, shell handoffs (`_out_echo`), sitewide scorer
#   diagnostics, and crawl rows (`[ux-score]` / `[ux-audit]` columns) go to stderr when **not** in loop-watch.
#   With **`FORGE_UX_LOOP_WATCH=1`**, informational `_out_echo` lines append to **`ux-loop-dashboard.log`** instead
#   of stderr so the alternate-screen UI is not torn (hard errors still use **`echo … >&2`**).
#
# Env:
#   SKIP_CURSOR_AGENT=1      Audit + plans only (no agent). Skips Cursor CLI auth at start.
#                             Also turns off the outer remediation loop (FORGE_UX_LOOP_UNTIL_QUALITY_GATE=0).
#   SKIP_CURSOR_LOGIN=1      After auth banner: do not run `agent login` when unauthenticated.
#   CURSOR_API_KEY           Non-interactive CLI auth (skips login).
#   DESIGN_STANDARD_PATH     Override enterprise standard Markdown (default: KS docs/design/…).
#   TIMEOUT_MS               Auditor navigation timeout (default: 90000).
#   MAX_PAGES                Auditor --max-pages (remediation loop default: **500**; set empty before invocation only if you intentionally omit --max-pages).
#   STOP_AFTER_MAJOR_PLUS    Pass-through if set.
#   FORGE_UX_AUDIT_STOP_AFTER_BACKLOG  Finding backlog governor for crawl (default 10; 0 = disable).
#   FORGE_UX_DETERMINISTIC_RULE_CONCURRENCY  Parallel DET rules per page (default 5, max 5).
#   FORGE_UX_AI_AUDIT_CONCURRENCY  Parallel AI audit batch agents (default 3, max 3).
#   UX_AUDIT_SKIP_SCORER=1       Skip score-website-ux.mjs (removes stale ux-quality-score-loop-delta.json).
#   UX_AUDIT_SCORER_MAX_PAGES    Sitewide scorer --max-pages (remediation loop default: **500**).
#   UX_AUDIT_SCORER_MAX_LINK_DEPTH   Sitewide scorer --max-link-depth (remediation loop default: **50**).
#   UX_AUDIT_BREADTH_CRAWL=1|0   When **1**, pass **`--breadth-crawl`** to the auditor (full breadth within **`--max-pages`**; disable Major+ queue stop). Default **0** keeps governed crawl stop-after-major-plus behavior.
#   UX_AUDIT_SCORER_NO_CSV=1     Pass --no-ux-csv to scorer only.
#   UX_AUDIT_FIXTURE_HTTP_VERBOSE=1   Forward python http.server stdout/stderr as [site] lines (default: discard —
#                                       avoids pipe backpressure deadlocks under `2>&1 | tee`).
#   FORGE_UX_PROGRESS_RUN_NO     Progress line [run …]: preset to pin one label for both scorer + auditor.
#                                When unset, this script sets 1=sitewide scorer, 2=auditor (and auditor bumps for --scores-first).
#   FORGE_UX_CRAWL_PROGRESS=1    Force crawl progress when stderr is not a TTY; =0 disables.
#                                 When stderr is not a TTY and this is unset, the script sets it to 1 (log-friendly).
#   FORGE_UX_CRAWL_PROGRESS_HEARTBEAT_SEC  While idle, append the progress row again every N sec (default 15; 0=off).
#   FORGE_UX_LOOP_WATCH=1           Alternate-screen dashboard on stderr TTY; merges crawl state into ux-loop-dashboard-state.json instead of printing rows to stderr.
#                                   Optional FORGE_UX_LOOP_WATCH_REFRESH_MS (poll interval for dashboard UI; default 350). FORGE_UX_LOOP_WATCH_LOG is set to OUT_DIR/ux-loop-dashboard.log.
#                                   FORGE_UX_LOOP_WATCH_SKIP_IDLE_REDRAW=0 disables skipping redraws when the frame is unchanged (default: on, less idle flicker).
#                                   FORGE_UX_LOOP_WATCH_FULL_REDRAW=1 forces HOME+full clear on every change (legacy; default uses row-level updates for less blink while staying live).
#                                   External watch(1): run  node "<path-to>/tools/website-ux-auditor/write-ux-loop-dashboard-snapshot.mjs" "$OUT_DIR"  in another terminal, then
#                                   watch -n 0.5 cat "$OUT_DIR/ux-loop-dashboard-snapshot.txt"  (see tools/website-ux-auditor/README.md).
#                                   Equivalent CLI (not passed through to the auditor): --watch  or  --loop-watch
#   FORGE_UX_LOOP_UNTIL_QUALITY_GATE     Default **1** — repeat scorer→audit→agent until the quality gate passes (default thresholds 0/0/0/5/10/15/100). Single pass: **0**.
#                                       Legacy alias: **FORGE_UX_LOOP_UNTIL_MAJOR_CLEAN=0** also disables the loop. Forced off when SKIP_CURSOR_AGENT=1.
#                                       CLI: **--until-quality-gate** (default behavior). **--until-major-clean** = Major+ only (legacy thresholds).
#   FORGE_UX_LOOP_MAX_ITERATIONS=20       Safety cap for the outer loop (default 20).
#   FORGE_UX_LOOP_POST_AGENT_BUILD       Default **1** — after each agent run, if generator/build-site.py exists under WEBSITE_REPO,
#                                        run python3 generator/build-site.py so the fixture crawl picks up fresh HTML.
#                                        Disable entirely: FORGE_UX_LOOP_POST_AGENT_BUILD=0.
#   FORGE_UX_FIXERS=1                    Run deterministic fixers after audit, before agent (default **1** when agent enabled).
#   FORGE_UX_SKIP_FIXERS=1               Skip fixer lane (agent-only remediation).
#   FORGE_UX_FIXERS_ONLY=1               Apply fixers + re-audit; no Cursor agent (harness / CI). CLI: **--fixers-only**.
#   FORGE_UX_FIXER_BIN                   Override path to run-deterministic-fixers.mjs.
#   FORGE_UX_SKIP_DONE_CRAWL_MERGE=1     Do not rewrite OUT_DIR/ux-audit-done-crawl-urls.txt after each audit (merge lists only URLs that pass the quality gate on that page).
#   FORGE_UX_LOOP_ALL_BARS=1             Composite stop: runs + pages budget + quality gate + rules coverage (default **1** when FORGE_UX_LOOP_WATCH=1).
#   FORGE_UX_LOOP_TARGET_ITERATIONS      Fixed expected run count for Runs bar (skips dynamic estimate).
#   FORGE_UX_LOOP_RECOMPUTE_ESTIMATE=0   Use max iterations as expected runs (no dynamic estimate).
#   FORGE_UX_WATCH_BAR_WIDTH             Progress bar character width (default min(48, cols-22)).
#   RUN_WEBSITE_UX_LOOP_SHOW_RUNNER_PATH=1   Echo absolute KS runner path + KS_ROOT + FORGE_UX_AUDIT_WORKBENCH_ROOT (verify workspace delegates to the expected checkout).
#   FORGE_UX_AUDIT_WORKBENCH_ROOT   Parent directory for default ephemeral runs (final path adds ux-audit/<slug>/…). When unset, resolved from this script (see header "Outputs each run").
#
# Extra auditor CLI flags after the two positionals:
#   ./run-website-ux-remediation-loop.sh repo ./website --site-kind fleet --no-screenshots
#   ./run-website-ux-remediation-loop.sh repo ./website --watch --site-kind fleet
#
set -euo pipefail

# Legacy env hook (prefer CLI flags after positionals).
if [[ "${FORGE_UX_LOOP_UNTIL_MAJOR_CLEAN:-}" == "0" ]]; then
  _FORGE_UX_LEGACY_SINGLE_PASS=1
else
  _FORGE_UX_LEGACY_SINGLE_PASS=0
fi

TOOL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KS_ROOT="$(cd "$TOOL_DIR/../.." && pwd)"
if [[ -z "${FORGE_UX_AUDIT_WORKBENCH_ROOT:-}" ]]; then
  _forge_ux_wb_probe="$TOOL_DIR"
  while [[ "$_forge_ux_wb_probe" != "/" ]]; do
    if [[ "$(basename "$_forge_ux_wb_probe")" == "Code" ]]; then
      FORGE_UX_AUDIT_WORKBENCH_ROOT="$_forge_ux_wb_probe/workbench/ux-auditor"
      break
    fi
    _forge_ux_wb_probe="$(dirname "$_forge_ux_wb_probe")"
  done
  if [[ -z "${FORGE_UX_AUDIT_WORKBENCH_ROOT:-}" ]]; then
    FORGE_UX_AUDIT_WORKBENCH_ROOT="$(cd "$KS_ROOT/.." && pwd)/workbench/ux-auditor"
  fi
fi
FORGE_UX_AUDIT_WORKBENCH_ROOT="${FORGE_UX_AUDIT_WORKBENCH_ROOT%/}"
if [[ "${RUN_WEBSITE_UX_LOOP_SHOW_RUNNER_PATH:-}" == "1" ]]; then
  echo "run-website-ux-remediation-loop: KS runner=${TOOL_DIR}/run-website-ux-remediation-loop.sh KS_ROOT=${KS_ROOT} FORGE_UX_AUDIT_WORKBENCH_ROOT=${FORGE_UX_AUDIT_WORKBENCH_ROOT}" >&2
fi
AUDITOR="${FORGE_UX_AUDITOR_BIN:-$TOOL_DIR/analyze-website-ux.mjs}"
RUN_PLAN="${FORGE_UX_RUN_PLAN_BIN:-$TOOL_DIR/cursor-agent-run-ux-plan.sh}"
RUN_AI_AUDIT="${FORGE_UX_RUN_AI_AUDIT_BIN:-$TOOL_DIR/cursor-agent-run-ux-audit.sh}"
STANDARD="${DESIGN_STANDARD_PATH:-}"
DESIGN_THEME="${DESIGN_THEME:-default}"

usage() {
  cat >&2 <<'EOF'
Forge Website UX Auditor — remediation loop

Usage:
  ./run-website-ux-remediation-loop.sh <WEBSITE_REPO_ROOT> <STATIC_FIXTURE_DIR | https://URL/> [loop flags...] [auditor flags...]

Loop flags (stripped before analyze-website-ux.mjs):
  --watch                 Alternate-screen dashboard
  --no-scorer             Skip sitewide scorer (default: scorer always runs)
  --ai                    Auditor + forced AI (--no-scorer)
  --enable-ai-audit       Post-audit AI when eligible (keeps scorer)
  --force-ai-audit        Post-audit AI forced (keeps scorer)
  --out PATH              Stable campaign output directory
  --incremental, --force-full, --audit-only, --single-pass|--once
  --until-quality-gate, --until-major-clean
  --max-pages N, --scorer-max-pages N, --scorer-max-link-depth N
  --breadth-crawl, --no-breadth-crawl, --verbose[=N]
  --no-post-agent-build, --no-done-crawl-merge, --all-bars, --no-all-bars
  --fixers-only, --skip-fixers
  --app, --no-scenario, --smoke-plan PATH, --sync-smoke-plan, --sync-smoke-force
  --step-agents, --no-step-agents, --legacy-single-agent, --scorer (app crawl only)
  --external-library-path1=PATH, --external-library-path2=PATH
  --max-iterations N, --target-iterations N, --scorer-no-csv, --show-runner-path

Env: FORGE_UX_APP_MODE=1, FORGE_UX_SYNC_SMOKE_PLAN=1, FORGE_UX_FIX_ROOTS=path1,path2

Examples:
  ./run-website-ux-remediation-loop.sh ~/Code/forge-fleet-website ~/Code/forge-fleet-website/website --watch
  ./run-website-ux-remediation-loop.sh repo ./website --ai --max-pages 1 --watch
  ./run-website-ux-remediation-loop.sh repo ./website --single-pass --site-kind fleet

Outputs: <hub>/workbench/ux-auditor/ux-audit/<slug>/<UTC_random>/ unless --out is set.

Requires: Node, Python 3, Playwright/Chromium, Cursor CLI agent (unless --audit-only).
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then usage; exit 0; fi
if [[ $# -lt 2 ]]; then usage >&2; exit 2; fi

REPO_ROOT="$(realpath "$1")"
SERVE_OR_URL="$2"
shift 2
EXTRA=( "$@" )

# Per-invocation defaults — do not use `${VAR:=…}` here; exported values from a prior run would stick.
_STALE_UX_SKIP_SCORER="${UX_AUDIT_SKIP_SCORER:-}"
_STALE_MAX_PAGES="${MAX_PAGES-}"
FORGE_UX_LOOP_NO_SCORER=0
FORGE_UX_CLI_AI_ONLY=0
FORGE_UX_ENABLE_AI_AUDIT=0
FORGE_UX_FORCE_AI_AUDIT=0
FORGE_UX_LOOP_WATCH=0
FORGE_UX_LOOP_UNTIL_QUALITY_GATE=1
FORGE_UX_LOOP_POST_AGENT_BUILD=1
FORGE_UX_QUALITY_GATE_LEGACY_MAJOR_ONLY=0
FORGE_UX_LOOP_ALL_BARS=
UX_AUDIT_INCREMENTAL=0
UX_AUDIT_FORCE_FULL=0
UX_AUDIT_VERBOSE=
UX_AUDIT_BREADTH_CRAWL=0
UX_AUDIT_SCORER_NO_CSV=0
UX_AUDIT_SCORER_MAX_PAGES=500
UX_AUDIT_SCORER_MAX_LINK_DEPTH=
MAX_PAGES=500
FORGE_UX_SKIP_DONE_CRAWL_MERGE=0
RUN_WEBSITE_UX_LOOP_SHOW_RUNNER_PATH=0
SKIP_CURSOR_AGENT=0
FORGE_UX_SKIP_FIXERS=0
FORGE_UX_FIXERS_ONLY=0
FORGE_UX_FIXERS=1
FORGE_UX_APP_MODE=0
FORGE_UX_NO_SCENARIO=0
FORGE_UX_SYNC_SMOKE_PLAN=0
FORGE_UX_SYNC_SMOKE_FORCE=0
FORGE_UX_SMOKE_PLAN=""
FORGE_UX_STEP_AGENTS=1
FORGE_UX_APP_SKIP_SCORER=1
FORGE_UX_APP_INCLUDE_PRIMITIVES=1
FORGE_UX_APP_SITE_KIND=a11y-studio
FORGE_UX_LEGACY_SINGLE_AGENT=0
FORGE_UX_FIX_ROOTS="${FORGE_UX_FIX_ROOTS:-}"
if [[ "${_FORGE_UX_LEGACY_SINGLE_PASS}" == "1" ]]; then
  FORGE_UX_LOOP_UNTIL_QUALITY_GATE=0
fi
if [[ "${FORGE_UX_APP_MODE:-}" == "1" ]]; then
  FORGE_UX_APP_MODE=1
fi

_EXTRA_OUT=()
_PAIR_NEXT=""
for arg in "${EXTRA[@]}"; do
  if [[ -n "$_PAIR_NEXT" ]]; then
    case "$_PAIR_NEXT" in
      out) UX_AUDIT_OUT_DIR="$arg" ;;
      max-pages) MAX_PAGES="$arg" ;;
      scorer-max-pages) UX_AUDIT_SCORER_MAX_PAGES="$arg" ;;
      scorer-max-link-depth) UX_AUDIT_SCORER_MAX_LINK_DEPTH="$arg" ;;
      max-iterations) FORGE_UX_LOOP_MAX_ITERATIONS="$arg" ;;
      target-iterations) FORGE_UX_LOOP_TARGET_ITERATIONS="$arg" ;;
      verbose) UX_AUDIT_VERBOSE="$arg" ;;
      smoke-plan) FORGE_UX_SMOKE_PLAN="$arg" ;;
      *) echo "run-website-ux-remediation-loop: internal error: unknown pair ${_PAIR_NEXT}" >&2; exit 2 ;;
    esac
    _PAIR_NEXT=""
    continue
  fi
  case "$arg" in
    --watch|--loop-watch) FORGE_UX_LOOP_WATCH=1 ;;
    --no-scorer) FORGE_UX_LOOP_NO_SCORER=1 ;;
    --ai)
      FORGE_UX_ENABLE_AI_AUDIT=1
      FORGE_UX_FORCE_AI_AUDIT=1
      FORGE_UX_LOOP_NO_SCORER=1
      FORGE_UX_CLI_AI_ONLY=1
      ;;
    --force-ai-audit)
      FORGE_UX_ENABLE_AI_AUDIT=1
      FORGE_UX_FORCE_AI_AUDIT=1
      ;;
    --enable-ai-audit) FORGE_UX_ENABLE_AI_AUDIT=1 ;;
    --out) _PAIR_NEXT=out ;;
    --out=*) UX_AUDIT_OUT_DIR="${arg#--out=}" ;;
    --incremental) UX_AUDIT_INCREMENTAL=1 ;;
    --force-full) UX_AUDIT_FORCE_FULL=1 ;;
    --audit-only) SKIP_CURSOR_AGENT=1 ;;
    --fixers-only)
      FORGE_UX_FIXERS_ONLY=1
      FORGE_UX_FIXERS=1
      SKIP_CURSOR_AGENT=1
      ;;
    --skip-fixers) FORGE_UX_SKIP_FIXERS=1; FORGE_UX_FIXERS=0 ;;
    --single-pass|--once) FORGE_UX_LOOP_UNTIL_QUALITY_GATE=0 ;;
    --until-major-clean)
      FORGE_UX_LOOP_UNTIL_QUALITY_GATE=1
      FORGE_UX_QUALITY_GATE_LEGACY_MAJOR_ONLY=1
      ;;
    --until-quality-gate)
      FORGE_UX_LOOP_UNTIL_QUALITY_GATE=1
      FORGE_UX_QUALITY_GATE_LEGACY_MAJOR_ONLY=0
      ;;
    --max-pages) _PAIR_NEXT=max-pages ;;
    --max-pages=*) MAX_PAGES="${arg#--max-pages=}" ;;
    --scorer-max-pages) _PAIR_NEXT=scorer-max-pages ;;
    --scorer-max-pages=*) UX_AUDIT_SCORER_MAX_PAGES="${arg#--scorer-max-pages=}" ;;
    --scorer-max-link-depth) _PAIR_NEXT=scorer-max-link-depth ;;
    --scorer-max-link-depth=*) UX_AUDIT_SCORER_MAX_LINK_DEPTH="${arg#--scorer-max-link-depth=}" ;;
    --breadth-crawl) UX_AUDIT_BREADTH_CRAWL=1 ;;
    --no-breadth-crawl) UX_AUDIT_BREADTH_CRAWL=0 ;;
    --verbose) UX_AUDIT_VERBOSE=1 ;;
    --verbose=*) UX_AUDIT_VERBOSE="${arg#--verbose=}" ;;
    --no-post-agent-build) FORGE_UX_LOOP_POST_AGENT_BUILD=0 ;;
    --no-done-crawl-merge) FORGE_UX_SKIP_DONE_CRAWL_MERGE=1 ;;
    --all-bars) FORGE_UX_LOOP_ALL_BARS=1 ;;
    --no-all-bars) FORGE_UX_LOOP_ALL_BARS=0 ;;
    --max-iterations) _PAIR_NEXT=max-iterations ;;
    --max-iterations=*) FORGE_UX_LOOP_MAX_ITERATIONS="${arg#--max-iterations=}" ;;
    --target-iterations) _PAIR_NEXT=target-iterations ;;
    --target-iterations=*) FORGE_UX_LOOP_TARGET_ITERATIONS="${arg#--target-iterations=}" ;;
    --scorer-no-csv) UX_AUDIT_SCORER_NO_CSV=1 ;;
    --show-runner-path) RUN_WEBSITE_UX_LOOP_SHOW_RUNNER_PATH=1 ;;
    --app) FORGE_UX_APP_MODE=1 ;;
    --no-scenario) FORGE_UX_NO_SCENARIO=1 ;;
    --sync-smoke-plan) FORGE_UX_SYNC_SMOKE_PLAN=1 ;;
    --sync-smoke-force) FORGE_UX_SYNC_SMOKE_FORCE=1 ;;
    --smoke-plan) _PAIR_NEXT=smoke-plan ;;
    --smoke-plan=*) FORGE_UX_SMOKE_PLAN="${arg#--smoke-plan=}" ;;
    --step-agents) FORGE_UX_STEP_AGENTS=1 ;;
    --no-step-agents) FORGE_UX_STEP_AGENTS=0 ;;
    --legacy-single-agent) FORGE_UX_LEGACY_SINGLE_AGENT=1 ;;
    --scorer) FORGE_UX_APP_SKIP_SCORER=0 ;;
    --external-library-path1=*) FORGE_UX_FIX_ROOTS="${FORGE_UX_FIX_ROOTS:+$FORGE_UX_FIX_ROOTS,}${arg#--external-library-path1=}" ;;
    --external-library-path2=*) FORGE_UX_FIX_ROOTS="${FORGE_UX_FIX_ROOTS:+$FORGE_UX_FIX_ROOTS,}${arg#--external-library-path2=}" ;;
    --external-library-path3=*) FORGE_UX_FIX_ROOTS="${FORGE_UX_FIX_ROOTS:+$FORGE_UX_FIX_ROOTS,}${arg#--external-library-path3=}" ;;
    --help|-h) usage; exit 0 ;;
    *) _EXTRA_OUT+=( "$arg" ) ;;
  esac
done
if [[ -n "$_PAIR_NEXT" ]]; then
  echo "run-website-ux-remediation-loop: missing value for --${_PAIR_NEXT}" >&2
  exit 2
fi
EXTRA=( "${_EXTRA_OUT[@]}" )
unset _EXTRA_OUT _PAIR_NEXT

for arg in "${EXTRA[@]}"; do
  if [[ "$arg" == "--static-only" || "$arg" == "--no-browser" ]]; then
    echo "run-website-ux-remediation-loop: Playwright crawl required; remove $arg." >&2
    exit 2
  fi
done

if [[ "${_STALE_UX_SKIP_SCORER}" == "1" ]]; then
  echo "run-website-ux-remediation-loop: warning: ignoring UX_AUDIT_SKIP_SCORER=1 in environment — use --no-scorer or --ai on the command line." >&2
fi
if [[ -n "${_STALE_MAX_PAGES}" && "${_STALE_MAX_PAGES}" != "500" && "${MAX_PAGES}" == "500" ]]; then
  echo "run-website-ux-remediation-loop: warning: ignoring MAX_PAGES=${_STALE_MAX_PAGES} in environment — use --max-pages on the command line." >&2
fi
unset _STALE_UX_SKIP_SCORER _STALE_MAX_PAGES
if [[ "${FORGE_UX_CLI_AI_ONLY}" == "1" ]]; then
  echo "run-website-ux-remediation-loop: --ai — auditor + post-audit AI (--no-scorer)." >&2
elif [[ "${FORGE_UX_LOOP_NO_SCORER}" == "1" ]]; then
  echo "run-website-ux-remediation-loop: --no-scorer — sitewide scorer skipped." >&2
else
  echo "run-website-ux-remediation-loop: sitewide scorer enabled (default; use --no-scorer to skip)." >&2
fi
if [[ "${SKIP_CURSOR_AGENT:-}" == "1" && "${FORGE_UX_FIXERS_ONLY:-}" != "1" ]]; then
  FORGE_UX_LOOP_UNTIL_QUALITY_GATE=0
fi
if [[ "${FORGE_UX_SKIP_FIXERS:-}" == "1" ]]; then
  FORGE_UX_FIXERS=0
fi

if [[ ! -d "$REPO_ROOT" ]]; then
  echo "run-website-ux-remediation-loop: repo root is not a directory: $REPO_ROOT" >&2
  exit 2
fi

if [[ ! -f "$AUDITOR" ]]; then
  echo "run-website-ux-remediation-loop: missing $AUDITOR" >&2
  exit 1
fi
SCORER="${FORGE_UX_SCORER_BIN:-$TOOL_DIR/score-website-ux.mjs}"
if [[ ! -f "$SCORER" ]]; then
  echo "run-website-ux-remediation-loop: missing $SCORER" >&2
  exit 1
fi
if [[ ! -f "$RUN_PLAN" ]]; then
  echo "run-website-ux-remediation-loop: missing $RUN_PLAN" >&2
  exit 1
fi
if [[ -n "$STANDARD" && ! -f "$STANDARD" ]]; then
  echo "run-website-ux-remediation-loop: missing design standard: $STANDARD" >&2
  exit 1
fi
QUALITY_GATE_BIN="${FORGE_UX_QUALITY_GATE_BIN:-$TOOL_DIR/audit-quality-gate.mjs}"
if [[ ! -f "$QUALITY_GATE_BIN" ]]; then
  echo "run-website-ux-remediation-loop: missing $QUALITY_GATE_BIN" >&2
  exit 1
fi
LOOP_COMPLETION_BIN="${FORGE_UX_LOOP_COMPLETION_BIN:-$TOOL_DIR/audit-loop-completion.mjs}"
if [[ ! -f "$LOOP_COMPLETION_BIN" ]]; then
  echo "run-website-ux-remediation-loop: missing $LOOP_COMPLETION_BIN" >&2
  exit 1
fi
AI_ELIGIBILITY_BIN="${FORGE_UX_AI_AUDIT_ELIGIBILITY_BIN:-$TOOL_DIR/audit-ai-audit-eligibility.mjs}"
if [[ ! -f "$AI_ELIGIBILITY_BIN" ]]; then
  echo "run-website-ux-remediation-loop: missing $AI_ELIGIBILITY_BIN" >&2
  exit 1
fi
PATCH_PROGRESS_BIN="${FORGE_UX_PATCH_PROGRESS_BIN:-$TOOL_DIR/patch-loop-dashboard-progress.mjs}"
MAJOR_PLUS_COUNT="${FORGE_UX_MAJOR_PLUS_COUNT_BIN:-$TOOL_DIR/audit-major-plus-count.mjs}"
MERGE_DONE_CRAWL_URLS="$TOOL_DIR/merge-done-crawl-urls-from-audit.mjs"
if [[ ! -f "$MERGE_DONE_CRAWL_URLS" ]]; then
  echo "run-website-ux-remediation-loop: missing $MERGE_DONE_CRAWL_URLS" >&2
  exit 1
fi
FIXER_BIN="${FORGE_UX_FIXER_BIN:-$TOOL_DIR/lib/ux-deterministic-fixers/run-deterministic-fixers.mjs}"
PILOT_REGISTRY="${TOOL_DIR}/lib/ux-deterministic-fixers/pilot-registry.json"

forge_ux_export_pilot_det_rule_scope() {
  if [[ -n "${FORGE_UX_ONLY_DETERMINISTIC_RULE_IDS:-}" ]]; then
    return 0
  fi
  if [[ "${FORGE_UX_APP_MODE:-}" == "1" ]]; then
    return 0
  fi
  if [[ "${FORGE_UX_FIXERS:-}" != "1" && "${FORGE_UX_FIXERS_PILOT_AUDIT_SCOPE:-1}" != "1" ]]; then
    return 0
  fi
  if [[ ! -f "${PILOT_REGISTRY}" ]]; then
    return 0
  fi
  export FORGE_UX_ONLY_DETERMINISTIC_RULE_IDS="$(
    node -e "const j=require(process.argv[1]); process.stdout.write((j.rules||[]).map(r=>r.ruleId).join(','));" "${PILOT_REGISTRY}"
  )"
  _out_echo "run-website-ux-remediation-loop: DET audit scope → pilot fixers (${FORGE_UX_ONLY_DETERMINISTIC_RULE_IDS})"
}

forge_ux_run_deterministic_fixers() {
  if [[ "${FORGE_UX_FIXERS:-}" != "1" ]]; then
    return 0
  fi
  if [[ ! -f "$FIXER_BIN" ]]; then
    echo "run-website-ux-remediation-loop: missing fixer runner $FIXER_BIN" >&2
    return 1
  fi
  if [[ ! -f "${OUT_DIR}/audit-data.json" ]]; then
    echo "run-website-ux-remediation-loop: fixers skipped — no audit-data.json" >&2
    return 1
  fi
  local _plan="${OUT_DIR}/forge-ux-remediation.plan.md"
  _out_echo "run-website-ux-remediation-loop: deterministic fixers → $(realpath "$FIXER_BIN")"
  forge_ux_log_line "phase=deterministic_fixers_begin"
  forge_ux_merge_json '{"phase":"deterministic_fixers"}'
  forge_ux_merge_cycle_phase "fixers"
  local _fixer_args=(
    --repo-root "$REPO_ROOT"
    --audit-data "${OUT_DIR}/audit-data.json"
    --out-dir "$OUT_DIR"
  )
  [[ -f "${_plan}" ]] && _fixer_args+=(--plan "${_plan}")
  [[ -n "${FORGE_UX_FIXER_RULE_ID:-}" ]] && _fixer_args+=(--rule-id "${FORGE_UX_FIXER_RULE_ID}")
  [[ -n "${FORGE_UX_FIXER_HARNESS:-}" ]] && _fixer_args+=(--harness)
  [[ -n "${FORGE_UX_FIXER_FIXTURE_DIR:-}" ]] && _fixer_args+=(--fixture-dir "${FORGE_UX_FIXER_FIXTURE_DIR}")
  [[ -n "${FORGE_UX_FIXER_FIXTURE_MODE:-}" ]] && _fixer_args+=(--fixture-mode "${FORGE_UX_FIXER_FIXTURE_MODE}")
  [[ -n "${FORGE_UX_FIXER_FIXTURE_ROOT:-}" ]] && _fixer_args+=(--fixture-root "${FORGE_UX_FIXER_FIXTURE_ROOT}")
  [[ -n "${FORGE_UX_FIXER_REPO_OVERLAY:-}" ]] && _fixer_args+=(--repo-overlay "${FORGE_UX_FIXER_REPO_OVERLAY}")
  [[ -n "${FORGE_UX_FIXER_SKIP_VERIFY:-}" ]] && _fixer_args+=(--skip-verify)
  set +e
  node "$FIXER_BIN" "${_fixer_args[@]}"
  local _fix_rc=$?
  set -e
  forge_ux_merge_cycle_phase "fixers_done"
  forge_ux_log_line "phase=deterministic_fixers_end exit_code=${_fix_rc}"
  if [[ -f "${OUT_DIR}/deterministic-fixer-report.json" ]]; then
    _out_echo "run-website-ux-remediation-loop: fixer report → ${OUT_DIR}/deterministic-fixer-report.json"
  fi
  return "${_fix_rc}"
}

forge_ux_post_fixer_reaudit() {
  if [[ "${FORGE_UX_FIXERS:-}" != "1" ]]; then
    return 0
  fi
  _out_echo "run-website-ux-remediation-loop: post-fixer re-audit (scorer skipped)"
  local _saved_skip_scorer="${UX_AUDIT_SKIP_SCORER:-}"
  export UX_AUDIT_SKIP_SCORER=1
  forge_ux_run_scorer_and_auditor
  export UX_AUDIT_SKIP_SCORER="${_saved_skip_scorer}"
}

forge_ux_try_fixers_before_agent() {
  if [[ "${FORGE_UX_FIXERS:-}" != "1" ]]; then
    return 1
  fi
  forge_ux_run_deterministic_fixers || true
  forge_ux_post_fixer_reaudit || true
  if forge_ux_check_loop_complete; then
    return 0
  fi
  return 1
}

# Log why the Cursor agent runs after the KS deterministic fixer lane (fixer-first policy).
forge_ux_log_fixer_agent_handoff() {
  local _report="${OUT_DIR}/deterministic-fixer-report.json"
  if [[ ! -f "${_report}" ]]; then
    _out_echo "run-website-ux-remediation-loop: quality gate not met after audit — invoking remediation agent (fixers did not run or left no report)."
    forge_ux_log_line "phase=remediation_agent_handoff reason=quality_gate_no_fixer_report"
    return 0
  fi
  local _line _log
  read -r _line _log < <(node -e "
const fs=require('fs');
const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
const s=j.summary||{};
const a=s.attempted??0, p=s.applied??0, v=s.verifyOk??0, r=s.agentRequired??0;
const line='attempted='+a+' applied='+p+' verifyOk='+v+' agentRequired='+r;
const log='phase=remediation_agent_handoff fixer_attempted='+a+' fixer_applied='+p+' fixer_verify_ok='+v+' fixer_agent_required='+r;
process.stdout.write(line+'\\t'+log);
" "${_report}" 2>/dev/null || echo -e "attempted=0 applied=0 verifyOk=0 agentRequired=0\tphase=remediation_agent_handoff")
  _out_echo "run-website-ux-remediation-loop: quality gate not met — invoking remediation agent (fixer-first: ${_line})."
  forge_ux_log_line "${_log:-phase=remediation_agent_handoff}"
}

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
  OUT_DIR="$FORGE_UX_AUDIT_WORKBENCH_ROOT/ux-audit/${SLUG}/${RUN_TAG}"
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
from datetime import datetime, timezone

ux_out = (os.environ.get("UX_AUDIT_OUT_DIR") or "").strip()
meta = {
    "website_repo": os.environ["REPO_ROOT"],
    "serve_target": os.environ["SERVE_OR_URL"],
    "site_url": os.environ["SITE_URL"],
    "kitchensink_root": os.environ["KS_ROOT"],
    "output_directory": os.environ["OUT_DIR"],
    "campaign_out_dir": os.environ["OUT_DIR"],
    "incremental_campaign": bool(ux_out),
    "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
}
with open(os.environ["META_JSON"], "w", encoding="utf-8") as f:
    json.dump(meta, f, indent=2)
PY

forge_ux_log_line() {
  [[ "${FORGE_UX_LOOP_WATCH:-}" == "1" ]] || return 0
  local _msg
  _msg="$(printf '%s' "$*")"
  [[ -n "${_msg//[[:space:]]/}" ]] || return 0
  printf '%s\n' "${_msg}" >> "${OUT_DIR}/ux-loop-dashboard.log"
}

forge_ux_merge_json() {
  [[ "${FORGE_UX_LOOP_WATCH:-}" == "1" ]] || return 0
  printf '%s\n' "$1" | node "${TOOL_DIR}/merge-ux-dashboard-state.mjs" "${OUT_DIR}"
}

_out_echo() {
  if [[ "${FORGE_UX_LOOP_WATCH:-}" == "1" && -n "${OUT_DIR:-}" ]]; then
    forge_ux_log_line "$@"
  else
    printf '%s\n' "$@" >&2
  fi
}

# shellcheck source=lib/remediation-loop-app-mode.sh
source "${TOOL_DIR}/lib/remediation-loop-app-mode.sh"

if [[ "${FORGE_UX_APP_MODE:-}" == "1" ]]; then
  _out_echo "run-website-ux-remediation-loop: app mode (FORGE_UX_RULESET_DOMAIN=app)"
  forge_ux_sync_smoke_plan_if_requested
  _app_smoke="$(forge_ux_resolve_smoke_plan)"
  if [[ "${FORGE_UX_NO_SCENARIO:-}" != "1" && -n "$_app_smoke" ]]; then
    forge_ux_app_scenario_loop
    exit $?
  fi
  forge_ux_app_crawl_loop
fi

FORGE_UX_LOOP_WATCH_ACTIVE=0
_FORGE_UX_DASH_PID=

if [[ "${FORGE_UX_LOOP_WATCH:-}" == "1" && -z "${FORGE_UX_LOOP_ALL_BARS+x}" ]]; then
  export FORGE_UX_LOOP_ALL_BARS=1
fi
if [[ -z "${FORGE_UX_LOOP_ALL_BARS:-}" ]]; then
  FORGE_UX_LOOP_ALL_BARS=0
fi
if [[ "${FORGE_UX_LOOP_ALL_BARS:-}" == "1" && "${UX_AUDIT_BREADTH_CRAWL:-0}" == "0" ]]; then
  UX_AUDIT_BREADTH_CRAWL=1
fi

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

if [[ "${FORGE_UX_LOOP_UNTIL_QUALITY_GATE:-1}" != "1" ]]; then
  forge_ux_merge_json "{\"loop\":{\"iteration\":1,\"maxIterations\":1}}" || true
fi

TIMEOUT_MS="${TIMEOUT_MS:-90000}"

SITE_KIND_ARGS=()
THEME_ARGS=(--theme "$DESIGN_THEME")
i=0
while [[ $i -lt ${#EXTRA[@]} ]]; do
  if [[ "${EXTRA[$i]}" == "--site-kind" ]] && [[ $((i + 1)) -lt ${#EXTRA[@]} ]]; then
    SITE_KIND_ARGS=(--site-kind "${EXTRA[$((i + 1))]}")
  fi
  if [[ "${EXTRA[$i]}" == "--theme" ]] && [[ $((i + 1)) -lt ${#EXTRA[@]} ]]; then
    THEME_ARGS=(--theme "${EXTRA[$((i + 1))]}")
  elif [[ "${EXTRA[$i]}" == --theme=* ]]; then
    THEME_ARGS=(--theme "${EXTRA[$i]#--theme=}")
  fi
  i=$((i + 1))
done

# Sitewide scorer is a quick rollup before the auditor (defaults set near top of script).
SCORER_PAGES="${UX_AUDIT_SCORER_MAX_PAGES}"
SCORER_LINK_DEPTH="${UX_AUDIT_SCORER_MAX_LINK_DEPTH}"

# Crawl progress [run N]: auto-assign sequential numbers per invocation unless FORGE_UX_PROGRESS_RUN_NO is preset (non-empty).
_UX_PROG_LOCKED=0
if [[ -n "${FORGE_UX_PROGRESS_RUN_NO:-}" ]]; then
  _UX_PROG_LOCKED=1
  export FORGE_UX_PROGRESS_RUN_AUTO=0
else
  export FORGE_UX_PROGRESS_RUN_AUTO=1
  export FORGE_UX_PROGRESS_RUN_NO=1
fi

_FORGE_UX_LOOP_MAX="${FORGE_UX_LOOP_MAX_ITERATIONS:-20}"

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
if [[ "${FORGE_UX_LOOP_UNTIL_QUALITY_GATE:-1}" == "1" ]]; then
  _qg_mode="until_quality_gate"
  if [[ "${FORGE_UX_QUALITY_GATE_LEGACY_MAJOR_ONLY:-}" == "1" ]]; then
    _qg_mode="until_major_clean_legacy"
  elif [[ "${FORGE_UX_LOOP_ALL_BARS:-}" == "1" ]]; then
    _qg_mode="until_all_bars"
  fi
  echo "run-website-ux-remediation-loop: loop_mode=${_qg_mode} max_iterations=${_FORGE_UX_LOOP_MAX} all_bars=${FORGE_UX_LOOP_ALL_BARS:-0} breadth_crawl=${UX_AUDIT_BREADTH_CRAWL:-0} post_agent_build=${FORGE_UX_LOOP_POST_AGENT_BUILD:-1} quality_gate=${FORGE_UX_QUALITY_GATE:-0,0,0,5,10,15,100}" >&2
else
  echo "run-website-ux-remediation-loop: loop_mode=single_pass (set FORGE_UX_LOOP_UNTIL_QUALITY_GATE=1 or --until-quality-gate for outer loop)" >&2
fi

forge_ux_merge_done_crawl_urls_if_enabled() {
  if [[ "${FORGE_UX_SKIP_DONE_CRAWL_MERGE:-}" == "1" ]]; then
    return 0
  fi
  if [[ ! -f "${OUT_DIR}/audit-data.json" ]]; then
    return 0
  fi
  node "$MERGE_DONE_CRAWL_URLS" "${OUT_DIR}/audit-data.json" "${OUT_DIR}/ux-audit-done-crawl-urls.txt" >&2 || true
}

forge_ux_merge_cycle_phase() {
  local phase="$1"
  [[ "${FORGE_UX_LOOP_WATCH:-}" == "1" ]] || return 0
  forge_ux_merge_json "{\"cyclePhase\":\"${phase}\"}"
}

forge_ux_patch_loop_progress() {
  [[ -f "$PATCH_PROGRESS_BIN" ]] || return 0
  node "$PATCH_PROGRESS_BIN" "${OUT_DIR}" >/dev/null 2>&1 || true
}

forge_ux_check_loop_complete() {
  local check_args=(node "$LOOP_COMPLETION_BIN" "${OUT_DIR}/audit-data.json" --check)
  if [[ "${FORGE_UX_LOOP_ALL_BARS:-}" == "1" ]]; then
    check_args+=(--check-all-bars)
  fi
  "${check_args[@]}"
}

forge_ux_post_agent_build() {
  if [[ "${FORGE_UX_LOOP_POST_AGENT_BUILD:-1}" != "1" ]]; then
    return 0
  fi
  local _gen="${REPO_ROOT}/generator/build-site.py"
  if [[ ! -f "$_gen" ]]; then
    return 0
  fi
  forge_ux_merge_cycle_phase "build"
  _out_echo "run-website-ux-remediation-loop: post-agent build → (cd \"${REPO_ROOT}\" && python3 generator/build-site.py)"
  (cd "$REPO_ROOT" && python3 generator/build-site.py) || {
    echo "run-website-ux-remediation-loop: warning: post-agent build-site.py exited non-zero." >&2
    forge_ux_merge_cycle_phase "build_warn"
    return 1
  }
  forge_ux_merge_cycle_phase "build_done"
}

forge_ux_current_registry_fingerprint() {
  local _registry="${TOOL_DIR}/design-rules/registry.generated.json"
  if [[ ! -f "$_registry" ]]; then
    echo ""
    return 0
  fi
  node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(String(j.fingerprint||''));" "$_registry" 2>/dev/null || echo ""
}

forge_ux_done_urls_fingerprint() {
  local _done_file="$1"
  if [[ ! -f "$_done_file" ]]; then
    echo ""
    return 0
  fi
  node -e "const fs=require('fs'); const raw=fs.readFileSync(process.argv[1],'utf8'); const m=raw.match(/^#\\s*design_rules_registry_fingerprint=(.+)$/m); process.stdout.write((m&&m[1]?m[1].trim():''));" "$_done_file" 2>/dev/null || echo ""
}

forge_ux_run_scorer_and_auditor() {
  forge_ux_export_pilot_det_rule_scope
  # Log files and pipes are not TTY — Node disables the crawl line unless forced, which looks "stuck" after the scorer.
  if [[ ! -t 2 ]] && [[ -z "${FORGE_UX_CRAWL_PROGRESS+x}" ]]; then
    export FORGE_UX_CRAWL_PROGRESS=1
  fi

  local _skip_scorer=0
  local _skip_scorer_reason=""
  if [[ "${FORGE_UX_LOOP_NO_SCORER:-}" == "1" ]]; then
    _skip_scorer=1
    if [[ "${FORGE_UX_CLI_AI_ONLY:-}" == "1" ]]; then
      _skip_scorer_reason="--ai (--no-scorer)"
    else
      _skip_scorer_reason="--no-scorer"
    fi
  fi
  if [[ "${_skip_scorer}" -eq 1 ]]; then
    _out_echo "run-website-ux-remediation-loop: skipping score-website-ux.mjs — ${_skip_scorer_reason} (removing stale ux-quality-score-loop-delta.json if present)."
    rm -f "${OUT_DIR}/ux-quality-score-loop-delta.json"
    _out_echo '[ux-audit] phase=shell_handoff · scorer=skipped · next=analyze-website-ux.mjs'
    forge_ux_merge_cycle_phase "scorer"
  else
    SCORER_CMD=(
      node "$SCORER"
      --repo "$REPO_ROOT"
      "${START_ARGS[@]}"
      --site "$SITE_URL"
      "${THEME_ARGS[@]}"
      --out "$OUT_DIR"
      --timeout-ms "$TIMEOUT_MS"
      "${SITE_KIND_ARGS[@]}"
    )
    if [[ -n "$STANDARD" ]]; then
      SCORER_CMD+=(--standard "$STANDARD")
    fi
    SCORER_CMD+=(--max-pages "$SCORER_PAGES")
    if [[ -n "$SCORER_LINK_DEPTH" ]]; then
      SCORER_CMD+=(--max-link-depth "$SCORER_LINK_DEPTH")
    fi
    if [[ "${UX_AUDIT_SCORER_NO_CSV:-}" == "1" ]]; then
      SCORER_CMD+=(--no-ux-csv)
    fi
    forge_ux_log_line "phase=scorer_begin"
    forge_ux_merge_json '{"phase":"scorer_crawl"}'
    forge_ux_merge_cycle_phase "scorer"
    _out_echo "run-website-ux-remediation-loop: sitewide scorer → score-website-ux.mjs · max-pages=${SCORER_PAGES} max-link-depth=${SCORER_LINK_DEPTH} (override UX_AUDIT_SCORER_MAX_PAGES / UX_AUDIT_SCORER_MAX_LINK_DEPTH)"
    _out_echo "run-website-ux-remediation-loop: scorer crawl progress log → ${OUT_DIR}/scorer-crawl-progress.log"
    "${SCORER_CMD[@]}"
    _out_echo "run-website-ux-remediation-loop: sitewide scorer finished."
    _out_echo '[ux-audit] phase=shell_handoff · scorer=complete · next=analyze-website-ux.mjs'
    if [[ "$_UX_PROG_LOCKED" == 0 ]]; then
      export FORGE_UX_PROGRESS_RUN_NO=$((FORGE_UX_PROGRESS_RUN_NO + 1))
    fi
  fi

  local AUTO_INCREMENTAL=false
  if [[ "${UX_AUDIT_INCREMENTAL:-}" == "1" ]]; then
    AUTO_INCREMENTAL=true
  elif [[ "${UX_AUDIT_FORCE_FULL:-}" != "1" ]] && [[ -f "${OUT_DIR}/audit-data.json" ]]; then
    AUTO_INCREMENTAL=true
  fi

  local AUDITOR_EXTRA_FLAGS=()
  if [[ "$AUTO_INCREMENTAL" == true ]]; then
    AUDITOR_EXTRA_FLAGS+=(--incremental)
  fi
  if [[ "${UX_AUDIT_VERBOSE:-}" == "2" ]]; then
    AUDITOR_EXTRA_FLAGS+=(--verbose=2)
  elif [[ "${UX_AUDIT_VERBOSE:-}" == "1" ]]; then
    AUDITOR_EXTRA_FLAGS+=(--verbose)
  elif [[ -n "${UX_AUDIT_VERBOSE:-}" ]] && [[ "${UX_AUDIT_VERBOSE}" != "0" ]]; then
    AUDITOR_EXTRA_FLAGS+=(--verbose="${UX_AUDIT_VERBOSE}")
  fi

  local AUDITOR_ARGS=(
    node "$AUDITOR"
    --repo "$REPO_ROOT"
    "${START_ARGS[@]}"
    --site "$SITE_URL"
    "${THEME_ARGS[@]}"
    --out "$OUT_DIR"
    --timeout-ms "$TIMEOUT_MS"
    --install-rule
    "${AUDITOR_EXTRA_FLAGS[@]}"
  )
  if [[ -n "$STANDARD" ]]; then
    AUDITOR_ARGS+=(--standard "$STANDARD")
  fi

  if [[ -n "${MAX_PAGES:-}" ]]; then
    AUDITOR_ARGS+=(--max-pages "$MAX_PAGES")
  fi
  if [[ -n "${STOP_AFTER_MAJOR_PLUS:-}" ]]; then
    AUDITOR_ARGS+=(--stop-after-major-plus "$STOP_AFTER_MAJOR_PLUS")
  fi
  if [[ -n "${FORGE_UX_AUDIT_STOP_AFTER_BACKLOG:-}" ]]; then
    AUDITOR_ARGS+=(--stop-after-backlog "$FORGE_UX_AUDIT_STOP_AFTER_BACKLOG")
  fi
  if [[ -n "${FORGE_UX_DETERMINISTIC_RULE_CONCURRENCY:-}" ]]; then
    AUDITOR_ARGS+=(--deterministic-rule-concurrency "$FORGE_UX_DETERMINISTIC_RULE_CONCURRENCY")
  fi
  if [[ "${UX_AUDIT_BREADTH_CRAWL:-}" == "1" ]]; then
    AUDITOR_ARGS+=(--breadth-crawl)
  fi

  local DONE_URLS_FILE="${OUT_DIR}/ux-audit-done-crawl-urls.txt"
  if [[ -f "$DONE_URLS_FILE" ]] && grep -qEv '^(#|[[:space:]]*$)' "$DONE_URLS_FILE" 2>/dev/null; then
    local _current_fp _done_fp
    _current_fp="$(forge_ux_current_registry_fingerprint)"
    _done_fp="$(forge_ux_done_urls_fingerprint "$DONE_URLS_FILE")"
    if [[ -n "$_current_fp" && "$_current_fp" == "$_done_fp" ]]; then
      AUDITOR_ARGS+=(--exclude-crawl-urls-file "$DONE_URLS_FILE")
      _out_echo "run-website-ux-remediation-loop: excluding prior clean crawl URLs via --exclude-crawl-urls-file ${DONE_URLS_FILE}"
    else
      _out_echo "run-website-ux-remediation-loop: skipping done-urls exclusion due to rule-fingerprint mismatch (current=${_current_fp:-none} file=${_done_fp:-none})."
    fi
  fi

  _out_echo "run-website-ux-remediation-loop: auditor → incremental=${AUTO_INCREMENTAL} breadth_crawl=${UX_AUDIT_BREADTH_CRAWL:-} max_pages=${MAX_PAGES:-} verbose=${UX_AUDIT_VERBOSE:-} scorer_skipped=${_skip_scorer}${_skip_scorer_reason:+ (${_skip_scorer_reason})}"

  export FORGE_UX_PROGRESS_PHASE_BASE="${FORGE_UX_PROGRESS_RUN_NO}"

  if [[ "${FORGE_UX_SKIP_DETERMINISTIC_PREFLIGHT:-}" != "1" ]]; then
    _out_echo "run-website-ux-remediation-loop: preflight → npm run preflight-deterministic (implemented DET imports)"
    if ! (cd "$TOOL_DIR" && npm run -s preflight-deterministic); then
      _out_echo "run-website-ux-remediation-loop: deterministic preflight failed — fix imports or set FORGE_UX_SKIP_DETERMINISTIC_PREFLIGHT=1" >&2
      return 1
    fi
  fi

  forge_ux_log_line "phase=auditor_begin"
  forge_ux_merge_json '{"phase":"auditor_enter"}'
  forge_ux_merge_cycle_phase "audit"

  _out_echo '[ux-audit] phase=shell · action=exec_node · script=analyze-website-ux.mjs'
  _out_echo "run-website-ux-remediation-loop: starting auditor → analyze-website-ux.mjs"
  _out_echo "run-website-ux-remediation-loop: hint · phase + inventory + crawl progress lines → stderr ([ux-audit] / [ux-score]; piped-safe)."
  _out_echo "run-website-ux-remediation-loop: auditor crawl progress log → ${OUT_DIR}/auditor-crawl-progress.log"
  "${AUDITOR_ARGS[@]}" "${EXTRA[@]}"

  forge_ux_patch_loop_progress

  _out_echo "run-website-ux-remediation-loop: artifacts → ux-quality-score.{json,md} ux-quality-score-loop-delta.json audit-report.md audit-data.json …"

  if [[ "$_UX_PROG_LOCKED" == 0 ]]; then
    export FORGE_UX_PROGRESS_RUN_NO=$((FORGE_UX_PROGRESS_RUN_NO + 1))
  fi
}

forge_ux_run_remediation_agent() {
  local PLAN_FILE="$OUT_DIR/forge-ux-remediation.plan.md"
  if [[ ! -f "$PLAN_FILE" ]]; then
    echo "run-website-ux-remediation-loop: missing plan $PLAN_FILE" >&2
    return 1
  fi

  if [[ -z "${FORGE_UX_REMEDIATION_AGENT_LOG+x}" ]]; then
    export FORGE_UX_REMEDIATION_AGENT_LOG="${OUT_DIR}/remediation-agent.log"
  fi

  _out_echo "run-website-ux-remediation-loop: remediation repo=${REPO_ROOT}"
  _out_echo "run-website-ux-remediation-loop: remediation plan=$(realpath "$PLAN_FILE")"
  _out_echo "run-website-ux-remediation-loop: remediation → $(realpath "$RUN_PLAN")"
  if [[ -n "${FORGE_UX_REMEDIATION_AGENT_LOG:-}" ]]; then
    _out_echo "run-website-ux-remediation-loop: agent transcript (tee) → ${FORGE_UX_REMEDIATION_AGENT_LOG}"
  fi

  forge_ux_log_line "phase=remediation_agent_begin"
  forge_ux_merge_json '{"phase":"remediation_agent"}'
  forge_ux_merge_cycle_phase "remediation"

  bash "$RUN_PLAN" "$REPO_ROOT" "$PLAN_FILE"
  forge_ux_merge_cycle_phase "remediation_done"
}

forge_ux_run_ai_audit_if_enabled() {
  if [[ "${FORGE_UX_ENABLE_AI_AUDIT:-0}" != "1" && "${FORGE_UX_FORCE_AI_AUDIT:-}" != "1" ]]; then
    return 0
  fi
  if [[ "${SKIP_CURSOR_AGENT:-}" == "1" ]]; then
    echo "run-website-ux-remediation-loop: post-clean AI audit is enabled but SKIP_CURSOR_AGENT=1 — skipping AI audit." >&2
    return 0
  fi
  if [[ ! -f "$RUN_AI_AUDIT" ]]; then
    echo "run-website-ux-remediation-loop: missing AI audit runner $RUN_AI_AUDIT" >&2
    return 1
  fi
  if [[ ! -f "${OUT_DIR}/audit-data.json" ]]; then
    echo "run-website-ux-remediation-loop: missing audit-data.json — cannot run AI audit." >&2
    return 1
  fi
  if [[ "${FORGE_UX_FORCE_AI_AUDIT:-}" != "1" ]]; then
    if ! node "$AI_ELIGIBILITY_BIN" "${OUT_DIR}/audit-data.json" --check 2>/dev/null; then
      node "$AI_ELIGIBILITY_BIN" "${OUT_DIR}/audit-data.json" --check >&2 || true
      _out_echo "run-website-ux-remediation-loop: skipping AI audit — full deterministic crawl + quality gate required (--enable-ai-audit + eligible crawl, or --force-ai-audit, or --ai)."
      forge_ux_log_line "phase=ai_audit_skipped reason=not_eligible"
      return 0
    fi
  else
    _out_echo "run-website-ux-remediation-loop: FORGE_UX_FORCE_AI_AUDIT=1 — running AI audit without full deterministic eligibility check."
  fi

  forge_ux_log_line "phase=ai_audit_begin"
  forge_ux_merge_json '{"phase":"ai_audit"}'
  _out_echo "[ux-audit] phase=ai_audit · action=start · mode=post_clean"
  _out_echo "run-website-ux-remediation-loop: AI-assisted audit → ${RUN_AI_AUDIT}"
  set +e
  bash "$RUN_AI_AUDIT" "$REPO_ROOT" "$OUT_DIR" "$STANDARD"
  local _rc=$?
  set -e
  if [[ "$_rc" -ne 0 ]]; then
    echo "run-website-ux-remediation-loop: warning: AI-assisted audit exited non-zero (${_rc}); continuing with deterministic result." >&2
    forge_ux_log_line "phase=ai_audit_warn exit_code=${_rc}"
    return 0
  fi
  if [[ -f "${OUT_DIR}/ai-audit/ai-audit-data.json" ]]; then
    local _ai_total _ai_major
    _ai_total="$(node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(String(j.totalFindings ?? 0));" "${OUT_DIR}/ai-audit/ai-audit-data.json" 2>/dev/null || echo 0)"
    _ai_major="$(node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(String(j.majorPlusFindingCount ?? 0));" "${OUT_DIR}/ai-audit/ai-audit-data.json" 2>/dev/null || echo 0)"
    _out_echo "[ux-audit] phase=ai_audit · action=done · findings=${_ai_total} · majorPlus=${_ai_major}"
  fi
}

if [[ "${SKIP_CURSOR_AGENT:-}" == "1" ]]; then
  forge_ux_run_scorer_and_auditor
  if [[ "${FORGE_UX_FIXERS:-}" == "1" ]]; then
    forge_ux_try_fixers_before_agent || true
  fi
  if forge_ux_check_loop_complete 2>/dev/null; then
    forge_ux_merge_done_crawl_urls_if_enabled
    _out_echo "run-website-ux-remediation-loop: quality gate pass (audit/fixers-only)."
    exit 0
  fi
  if ! node "$QUALITY_GATE_BIN" "${OUT_DIR}/audit-data.json" --check; then
    _out_echo "run-website-ux-remediation-loop: quality gate not met (audit-only mode)."
  fi
  forge_ux_merge_done_crawl_urls_if_enabled
  forge_ux_log_line "phase=skip_cursor_agent"
  forge_ux_merge_json '{"phase":"audit_only_done"}'
  if [[ "${FORGE_UX_FIXERS_ONLY:-}" == "1" ]]; then
    _out_echo "run-website-ux-remediation-loop: FORGE_UX_FIXERS_ONLY=1 — fixers applied; agent skipped."
    exit 0
  fi
  _out_echo "run-website-ux-remediation-loop: SKIP_CURSOR_AGENT=1 — skipping remediation agent."
  exit 0
fi

if ! command -v agent >/dev/null 2>&1; then
  echo "run-website-ux-remediation-loop: install Cursor CLI agent or use SKIP_CURSOR_AGENT=1." >&2
  exit 1
fi

if [[ "${FORGE_UX_LOOP_UNTIL_QUALITY_GATE:-1}" == "1" ]]; then
  _iter=0
  while true; do
    if [[ "${_iter}" -ge "${_FORGE_UX_LOOP_MAX}" ]]; then
      echo "run-website-ux-remediation-loop: until-quality-gate — exceeded FORGE_UX_LOOP_MAX_ITERATIONS=${_FORGE_UX_LOOP_MAX} (gate still failing)." >&2
      node "$QUALITY_GATE_BIN" "${OUT_DIR}/audit-data.json" --check >&2 || true
      exit 1
    fi
    _iter=$((_iter + 1))
    forge_ux_merge_json "{\"loop\":{\"iteration\":${_iter},\"maxIterations\":${_FORGE_UX_LOOP_MAX}}}" || true
    _out_echo "run-website-ux-remediation-loop: until-quality-gate · iteration ${_iter}/${_FORGE_UX_LOOP_MAX}"

    forge_ux_run_scorer_and_auditor

    if [[ ! -f "${OUT_DIR}/audit-data.json" ]]; then
      echo "run-website-ux-remediation-loop: missing audit-data.json after auditor run." >&2
      exit 1
    fi
    if forge_ux_check_loop_complete; then
      forge_ux_merge_done_crawl_urls_if_enabled
      forge_ux_run_ai_audit_if_enabled || true
      if [[ "${FORGE_UX_LOOP_ALL_BARS:-}" == "1" ]]; then
        _out_echo "run-website-ux-remediation-loop: until-all-bars — pass (runs, pages, gate, rules)."
        forge_ux_log_line "phase=until_all_bars_pass iterations=${_iter}"
        forge_ux_merge_json "{\"phase\":\"until_all_bars_pass\",\"iterations\":${_iter}}" || true
      else
        _out_echo "run-website-ux-remediation-loop: until-quality-gate — pass (thresholds met on visited pages)."
        forge_ux_log_line "phase=until_quality_gate_pass iterations=${_iter}"
        forge_ux_merge_json "{\"phase\":\"until_quality_gate_pass\",\"iterations\":${_iter}}" || true
      fi
      exit 0
    fi
    forge_ux_merge_done_crawl_urls_if_enabled

    if forge_ux_try_fixers_before_agent; then
      forge_ux_merge_done_crawl_urls_if_enabled
      forge_ux_run_ai_audit_if_enabled || true
      _out_echo "run-website-ux-remediation-loop: until-quality-gate — pass after deterministic fixers (iteration ${_iter})."
      forge_ux_log_line "phase=until_quality_gate_pass_fixers iterations=${_iter}"
      forge_ux_merge_json "{\"phase\":\"until_quality_gate_pass_fixers\",\"iterations\":${_iter}}" || true
      exit 0
    fi

    forge_ux_log_fixer_agent_handoff
    forge_ux_run_remediation_agent
    _agent_ec=$?
    forge_ux_post_agent_build || true
    if [[ "${_agent_ec}" -ne 0 ]]; then
      exit "${_agent_ec}"
    fi
  done
fi

# Single pass (FORGE_UX_LOOP_UNTIL_QUALITY_GATE=0)
forge_ux_run_scorer_and_auditor

if [[ ! -f "${OUT_DIR}/audit-data.json" ]]; then
  echo "run-website-ux-remediation-loop: missing audit-data.json after auditor run." >&2
  exit 1
fi
if forge_ux_check_loop_complete; then
  forge_ux_merge_done_crawl_urls_if_enabled
  forge_ux_run_ai_audit_if_enabled || true
  _out_echo "run-website-ux-remediation-loop: single-pass — loop complete; no remediation agent needed."
  exit 0
fi
forge_ux_merge_done_crawl_urls_if_enabled

if forge_ux_try_fixers_before_agent; then
  forge_ux_merge_done_crawl_urls_if_enabled
  forge_ux_run_ai_audit_if_enabled || true
  _out_echo "run-website-ux-remediation-loop: single-pass — loop complete after deterministic fixers."
  exit 0
fi

forge_ux_log_fixer_agent_handoff
forge_ux_run_remediation_agent
_agent_ec=$?
forge_ux_post_agent_build || true
exit "${_agent_ec}"
