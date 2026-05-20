#!/usr/bin/env bash
# Generate UX audit rule handbook pages (one .md sibling per rule) via Cursor CLI agent (PDCA).
#
# Usage:
#   ./design-rules/blender/cursor-agent-generate-rule-pages.sh --lane both --max-rules 10
#   ./design-rules/blender/cursor-agent-generate-rule-pages.sh --lane both --max-rules 30 --concurrency 3
#   ./design-rules/blender/cursor-agent-generate-rule-pages.sh --only-rule DET.NAV.DEDUP
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOL_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
KS_ROOT="$(cd "${TOOL_ROOT}/../.." && pwd)"
BLENDER_JS="${SCRIPT_DIR}/design-rules-blender.mjs"
VERSION_JS="${SCRIPT_DIR}/rule-page-version.mjs"
REGISTRY_JSON="${TOOL_ROOT}/design-rules/registry.generated.json"
RULE_PAGES_DIR="${KS_ROOT}/docs/design/ux-audit/rule-pages"
TOOL_RULE_PAGES_DIR="${TOOL_ROOT}/docs/design/ux-audit/rule-pages"
SCHEMA_DOC="${RULE_PAGES_DIR}/RULE_PAGE_SCHEMA.md"
LOG_DIR="${SCRIPT_DIR}/rule-page-gen-logs"

sync_rule_page_from_tool_root() {
  local kebab="$1"
  local wrong="${TOOL_RULE_PAGES_DIR}/${kebab}.md"
  local right="${RULE_PAGES_DIR}/${kebab}.md"
  if [[ -f "${wrong}" ]]; then
    mkdir -p "${RULE_PAGES_DIR}"
    cp -f "${wrong}" "${right}"
    echo "[pagegen] synced ${right} from tool-root fallback" >&2
  fi
}

sync_all_rule_pages_from_tool_root() {
  if [[ ! -d "${TOOL_RULE_PAGES_DIR}" ]]; then
    return 0
  fi
  local f kebab
  for f in "${TOOL_RULE_PAGES_DIR}"/*.md; do
    [[ -f "${f}" ]] || continue
    kebab="$(basename "${f}" .md)"
    sync_rule_page_from_tool_root "${kebab}"
  done
}

rule_id_to_kebab() {
  printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | tr '._' '-'
}

parse_target_field() {
  local row="$1"
  local field="$2"
  node -e 'const o=JSON.parse(process.argv[1]);const k=process.argv[2];const v=o[k];process.stdout.write(v==null?"":String(v));' "$row" "$field"
}

run_one_target() {
  local row="$1"
  local seq="$2"
  local slot="$3"
  local batch_stamp="$4"

  local lane rule_id md_rel content_version source_rule impl_path md_abs log_file kebab
  lane="$(parse_target_field "$row" lane)"
  rule_id="$(parse_target_field "$row" id)"
  md_rel="$(parse_target_field "$row" mdPath)"
  content_version="$(parse_target_field "$row" contentVersion)"
  source_rule="$(parse_target_field "$row" sourceRule)"
  impl_path="$(parse_target_field "$row" modulePath)"
  if [[ -z "${impl_path}" ]]; then
    impl_path="$(parse_target_field "$row" promptPath)"
  fi
  md_abs="${KS_ROOT}/${md_rel}"
  log_file="${LOG_DIR}/${batch_stamp}_s${slot}_${seq}_${rule_id//./_}.log"

  local AGENT_PROMPT
  AGENT_PROMPT="Repository root (Kitchen Sink): ${KS_ROOT}
Auditor tool root: ${TOOL_ROOT}

You are writing ONE UX audit rule handbook page in PDCA mode.

Rule id: ${rule_id}
Lane: ${lane}
Target markdown (ONLY file to write): ${md_rel}
Absolute path: ${md_abs}
Source rule anchor: ${source_rule}
Implementation / prompt path: ${impl_path}
Required page_version (set in front matter exactly): ${content_version}
Schema: ${SCHEMA_DOC}

Plan:
1) Read the source rule anchor in docs/design/ux-audit/ and registry metadata.
2) Read ${impl_path} when present (deterministic .check.js or AI prompt .md).
3) Skim generator/pages/ and css/ for real Kitchen Sink class names for before/after examples.

Do:
4) Write or replace ${md_abs} following RULE_PAGE_SCHEMA.md:
   - YAML front matter with rule_id, lane, title, summary, page_version=${content_version}, generated_at (UTC now), agent_model, registry_fingerprint from registry.generated.json, registry_status, source_rule, related_rules.
   - Sections: Purpose, Passing signals, Failing signals, Before example, After example, Evidence and remediation, Related rules.
   - Before/After: each must include a fenced \`\`\`html block with KS markup (before = failing, after = passing).
5) Do NOT edit check modules, rule-mappings.js, or registry unless fixing a broken doc path reference.
6) Do NOT use Mermaid. No Fleet-specific profiles.

Check:
7) Confirm front matter page_version equals ${content_version} (orchestrator updates rule-pages.manifest.json after the batch).
8) Verify before/after examples use real KS class names.

Adjust:
9) Refine until the page is specific, actionable, and uses real KS patterns.

Output: report what you wrote and confirm page_version."

  echo "[pagegen] start (${seq}) slot=${slot} lane=${lane} rule=${rule_id} status=$(parse_target_field "$row" status)" >&2
  set +e
  agent -p --trust --model "${MODEL}" "${EXTRA_FLAGS[@]}" "${AGENT_PROMPT}" 2>&1 | tee "${log_file}"
  local rc="${PIPESTATUS[0]}"
  set -e

  if [[ "${rc}" -ne 0 ]]; then
    echo "[pagegen] fail (${seq}) slot=${slot} rule=${rule_id} rc=${rc} log=${log_file}" >&2
    return "${rc}"
  fi

  kebab="$(rule_id_to_kebab "${rule_id}")"
  sync_rule_page_from_tool_root "${kebab}"
  echo "[pagegen] ok (${seq}) slot=${slot} rule=${rule_id} log=${log_file}" >&2
  return 0
}

run_targets_serial() {
  local batch_stamp="$1"
  local total="${#TARGETS[@]}"
  local run_idx=0
  failures=0

  for row in "${TARGETS[@]}"; do
    run_idx=$((run_idx + 1))
    set +e
    run_one_target "${row}" "${run_idx}" "1" "${batch_stamp}"
    local rc=$?
    set -e
    if [[ "${rc}" -ne 0 ]]; then
      failures=$((failures + 1))
      if [[ "${CONTINUE_ON_ERROR}" == "0" ]]; then
        return "${rc}"
      fi
    fi
  done
  return 0
}

run_targets_parallel() {
  local batch_stamp="$1"
  local total="${#TARGETS[@]}"
  local queue_idx=0
  local active=0
  local completed=0
  local stopped=0
  failures=0

  declare -a POOL_PIDS=()
  declare -A PID_SEQ=()
  declare -A PID_SLOT=()
  declare -A PID_RULE=()

  start_jobs() {
    while [[ "${stopped}" -eq 0 && "${queue_idx}" -lt "${total}" && "${active}" -lt "${CONCURRENCY}" ]]; do
      local row="${TARGETS[$queue_idx]}"
      queue_idx=$((queue_idx + 1))
      local seq="${queue_idx}"
      local slot=$(( (seq - 1) % CONCURRENCY + 1 ))
      local rule_id
      rule_id="$(parse_target_field "$row" id)"

      set +e
      run_one_target "${row}" "${seq}" "${slot}" "${batch_stamp}" &
      local pid=$!
      set -e

      POOL_PIDS+=("${pid}")
      PID_SEQ["${pid}"]="${seq}"
      PID_SLOT["${pid}"]="${slot}"
      PID_RULE["${pid}"]="${rule_id}"
      active=$((active + 1))
    done
  }

  drain_one() {
    local done_pid=""
    local job_rc=0
    set +e
    wait -n -p done_pid
    job_rc=$?
    set -e

    if [[ -z "${done_pid}" ]]; then
      echo "[pagegen] wait -n returned no pid" >&2
      return 1
    fi

    local seq="${PID_SEQ[$done_pid]:-?}"
    local slot="${PID_SLOT[$done_pid]:-?}"
    local rule_id="${PID_RULE[$done_pid]:-?}"

    unset 'PID_SEQ[$done_pid]'
    unset 'PID_SLOT[$done_pid]'
    unset 'PID_RULE[$done_pid]'

    local new_pids=()
    local p
    for p in "${POOL_PIDS[@]}"; do
      [[ "${p}" == "${done_pid}" ]] && continue
      new_pids+=("${p}")
    done
    POOL_PIDS=("${new_pids[@]}")

    active=$((active - 1))
    completed=$((completed + 1))

    if [[ "${job_rc}" -ne 0 ]]; then
      failures=$((failures + 1))
      echo "[pagegen] done ${completed}/${total} fail rule=${rule_id} slot=${slot} rc=${job_rc}" >&2
      if [[ "${CONTINUE_ON_ERROR}" == "0" ]]; then
        stopped=1
      fi
    else
      echo "[pagegen] done ${completed}/${total} ok rule=${rule_id} slot=${slot}" >&2
    fi
  }

  start_jobs
  while [[ "${active}" -gt 0 ]]; do
    drain_one
    start_jobs
  done
}

LANE="both"
MAX_RULES=0
DRY_RUN=0
CONTINUE_ON_ERROR=1
MODEL="${FORGE_UX_PAGE_GEN_MODEL:-composer-2.5-fast}"
CONCURRENCY="${FORGE_UX_PAGE_GEN_CONCURRENCY:-1}"
ONLY_RULES=()
EXTRA_FLAGS=()
OVERRIDE_VERSION=0
failures=0

usage() {
  cat >&2 <<'EOF'
Generate UX audit rule handbook pages via Cursor Agent (PDCA).

Usage:
  cursor-agent-generate-rule-pages.sh [options]

Options:
  --lane deterministic|ai|both   Rule lane (default: both)
  --max-rules N                Limit targets (0 = all stale/missing)
  --concurrency N              Parallel agent jobs (default: 1, max: 4)
  --only-rule RULE_ID          Restrict to one rule (repeatable)
  --model MODEL                Cursor agent model (default: composer-2.5-fast)
  --dry-run                    Print JSON targets only
  --override-version           Regenerate even when page_version is current
  --stop-on-error              Stop dequeuing on failure (drain in-flight jobs)
  --agent-extra "..."          Extra flags for `agent`
  -h, --help                   Show help

Environment:
  FORGE_UX_PAGE_GEN_CONCURRENCY  Default concurrency when --concurrency omitted
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --lane) LANE="${2:-}"; shift 2 ;;
    --max-rules) MAX_RULES="${2:-0}"; shift 2 ;;
    --concurrency) CONCURRENCY="${2:-1}"; shift 2 ;;
    --only-rule) ONLY_RULES+=("${2:-}"); shift 2 ;;
    --model) MODEL="${2:-composer-2.5-fast}"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    --override-version) OVERRIDE_VERSION=1; shift ;;
    --stop-on-error) CONTINUE_ON_ERROR=0; shift ;;
    --agent-extra) read -r -a EXTRA_FLAGS <<< "${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 2
      ;;
  esac
done

if [[ "${LANE}" != "deterministic" && "${LANE}" != "ai" && "${LANE}" != "both" ]]; then
  echo "Invalid --lane: ${LANE}" >&2
  exit 2
fi

if ! [[ "${CONCURRENCY}" =~ ^[1-9][0-9]*$ ]]; then
  echo "Invalid --concurrency: ${CONCURRENCY} (must be a positive integer)" >&2
  exit 2
fi
if [[ "${CONCURRENCY}" -gt 4 ]]; then
  echo "[pagegen] concurrency capped at 4 (requested ${CONCURRENCY})" >&2
  CONCURRENCY=4
fi

if ! command -v agent >/dev/null 2>&1; then
  echo "Cursor CLI agent not found in PATH." >&2
  exit 1
fi

mkdir -p "${LOG_DIR}" "${RULE_PAGES_DIR}"

echo "[pagegen] ks_root=${KS_ROOT}" >&2
echo "[pagegen] lane=${LANE} model=${MODEL} max_rules=${MAX_RULES} concurrency=${CONCURRENCY}" >&2

node "${BLENDER_JS}" >/dev/null

ONLY_ARG="$(printf '%s\n' "${ONLY_RULES[@]:-}" | sed '/^$/d' | paste -sd, -)"

PAGEGEN_ARGS=(--list-targets --lane "${LANE}" --max-rules "${MAX_RULES}")
if [[ "${OVERRIDE_VERSION}" == "1" ]]; then
  PAGEGEN_ARGS+=(--override-version)
fi
if [[ -n "${ONLY_ARG}" ]]; then
  for id in ${ONLY_ARG//,/ }; do
    PAGEGEN_ARGS+=(--only-rule "${id}")
  done
fi

mapfile -t TARGETS < <(node "${VERSION_JS}" "${PAGEGEN_ARGS[@]}")

if [[ ${#TARGETS[@]} -eq 0 ]]; then
  echo "[pagegen] no targets (all pages current)." >&2
  node "${VERSION_JS}" --write-manifest >/dev/null
  exit 0
fi

echo "[pagegen] selected targets=${#TARGETS[@]}" >&2

if [[ "${DRY_RUN}" == "1" ]]; then
  printf '%s\n' "${TARGETS[@]}"
  exit 0
fi

BATCH_STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

if [[ "${CONCURRENCY}" -eq 1 ]]; then
  set +e
  run_targets_serial "${BATCH_STAMP}"
  serial_rc=$?
  set -e
  if [[ "${serial_rc}" -ne 0 && "${CONTINUE_ON_ERROR}" == "0" ]]; then
    sync_all_rule_pages_from_tool_root
    node "${VERSION_JS}" --write-manifest >/dev/null
    exit "${serial_rc}"
  fi
else
  run_targets_parallel "${BATCH_STAMP}"
fi

sync_all_rule_pages_from_tool_root
node "${VERSION_JS}" --write-manifest >/dev/null
echo "[pagegen] manifest updated ${RULE_PAGES_DIR}/rule-pages.manifest.json" >&2
echo "[pagegen] done targets=${#TARGETS[@]} failures=${failures} concurrency=${CONCURRENCY}" >&2
if [[ "${failures}" -gt 0 ]]; then
  exit 1
fi
