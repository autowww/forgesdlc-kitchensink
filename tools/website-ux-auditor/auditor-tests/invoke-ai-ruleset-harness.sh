#!/usr/bin/env bash
# AI ruleset harness: defect fixture pages + per-rule Cursor agent + detection gate.
#
# Usage:
#   ./invoke-ai-ruleset-harness.sh [options]
#
# Options:
#   --only-rule AI.X        Single rule (bootstrap)
#   --resume                Skip terminal statuses in state.jsonl
#   --force                 Re-run terminal rules
#   --dry-run               List rules only
#   --rebuild-fixtures      Force fixture rebuild (--lane ai)
#   --verbose, -v
#   --watch                 Campaign watch board (TTY)
#   --no-watch
#   --skip-agent            Mark rules blocked (no Cursor CLI)
#   --llm                   Use forge-workcells local_llm_worker (LCDL) instead of Cursor agent
#   --llm-env=FILE          LLM_* profile file for --llm (gateway_probe_lcdl.py uses same file)
#
# Default: AI agent on per rule (judgment detection). No remediation loop in v1.

set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUDITOR_ROOT="$(cd "${TESTS_ROOT}/.." && pwd)"
KS_ROOT="$(cd "${AUDITOR_ROOT}/../.." && pwd)"
FINALIZE="${TESTS_ROOT}/finalize-ruleset-harness.sh"
EXPECT_AI="${TESTS_ROOT}/expect-ai-rule-detection.sh"
PARSE_AI="${TESTS_ROOT}/parse-ai-agent-findings.mjs"
RUN_AI_RULE="${AUDITOR_ROOT}/design-rules/ai/run-design-ai-rule.sh"
BUILD_FIXTURES="${KS_ROOT}/generator/build_rule_defect_fixtures.py"
REGISTRY="${AUDITOR_ROOT}/design-rules/registry.generated.json"
MERGE_STATE="${AUDITOR_ROOT}/merge-harness-dashboard-state.mjs"
WATCH_DASH="${TESTS_ROOT}/harness-watch-dashboard.mjs"
ANALYZE="${AUDITOR_ROOT}/analyze-website-ux.mjs"
UX_SLICE="${AUDITOR_ROOT}/ux-audit-slice.mjs"
UX_PW="${AUDITOR_ROOT}/ux-playwright-evidence.mjs"
UX_ASSEMBLE="${AUDITOR_ROOT}/ux-assemble-context.mjs"
GATEWAY_PROBE="${KS_ROOT}/../forge-lcdl/scripts/gateway_probe_lcdl.py"

ONLY_RULE=""
RESUME=0
FORCE=0
DRY_RUN=0
REBUILD_FIXTURES=0
VERBOSE=0
HARNESS_WATCH=0
NO_WATCH=0
SKIP_AGENT=0
USE_LLM=0
LLM_ENV_FILE=""

log() {
  local msg="[ai-harness $(date -u +%H:%M:%S)] $*"
  if [[ "${HARNESS_WATCH}" -eq 1 && -n "${HARNESS_LOG:-}" ]]; then
    echo "${msg}" >>"${HARNESS_LOG}"
  fi
  echo "${msg}" >&2
}

harness_merge() {
  local patch="$1"
  node "${MERGE_STATE}" "${OUT_DIR}" "${patch}" 2>/dev/null || true
}

append_state() {
  local line="$1"
  echo "${line}" >>"${STATE_JSONL}"
}

rule_kebab() {
  echo "${1}" | tr '[:upper:]' '[:lower:]' | tr '._' '-'
}

write_detection_failure() {
  local rule_dir="$1"
  local rule_id="$2"
  local fc="$3"
  local findings_json="${rule_dir}/ai-findings.json"
  mkdir -p "${rule_dir}"
  {
    echo "# Harness AI detection failure — ${rule_id}"
    echo ""
    echo "Expected ≥1 finding with \`principleId\` \`${rule_id}\` on the defect fixture; got **${fc}**."
    echo ""
    echo "## Suggested fixes"
    echo ""
    echo "- Rule-page **Before example** in \`docs/design/ux-audit/rule-pages/\`"
    echo "- AI prompt: \`design-rules/ai/prompts/\`"
    echo "- \`generator/build_rule_defect_fixtures.py --lane ai\`"
    echo ""
    if [[ -f "${findings_json}" ]]; then
      echo "## Parsed findings excerpt"
      echo ""
      echo '```json'
      jq -c --arg rid "${rule_id}" '
        (.findings // []) | map(select((.principleId // "") == $rid)) | .[0:3]
      ' "${findings_json}" 2>/dev/null || echo "[]"
      echo '```'
    fi
  } >"${rule_dir}/harness-detection-failure.md"
}

start_fixture_server() {
  local fixture_dir="$1"
  FIXTURE_PORT="$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()')"
  FIXTURE_URL="http://127.0.0.1:${FIXTURE_PORT}/"
  (
    cd "${fixture_dir}"
    exec python3 -m http.server "${FIXTURE_PORT}" >/dev/null 2>&1
  ) &
  FIXTURE_SERVER_PID=$!
  sleep 0.4
}

stop_fixture_server() {
  [[ -n "${FIXTURE_SERVER_PID:-}" ]] && kill "${FIXTURE_SERVER_PID}" 2>/dev/null || true
  wait "${FIXTURE_SERVER_PID:-}" 2>/dev/null || true
  FIXTURE_SERVER_PID=""
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --only-rule) ONLY_RULE="${2:-}"; shift ;;
    --resume) RESUME=1 ;;
    --force) FORCE=1 ;;
    --dry-run) DRY_RUN=1 ;;
    --rebuild-fixtures) REBUILD_FIXTURES=1 ;;
    --verbose|-v) VERBOSE=1 ;;
    --watch) HARNESS_WATCH=1 ;;
    --no-watch) NO_WATCH=1 ;;
    --skip-agent) SKIP_AGENT=1 ;;
    --llm) USE_LLM=1 ;;
    --llm-env=*) LLM_ENV_FILE="${1#*=}" ;;
    --llm-env)
      LLM_ENV_FILE="${2:-}"
      shift
      ;;
    -h|--help)
      sed -n '1,24p' "$0"
      exit 0
      ;;
    *) echo "ai-harness: unknown arg: $1" >&2; exit 2 ;;
  esac
  shift
done

if ! command -v jq >/dev/null 2>&1; then
  echo "ai-harness: jq required" >&2
  exit 2
fi

if [[ ! -f "${RUN_AI_RULE}" ]]; then
  echo "ai-harness: missing ${RUN_AI_RULE}" >&2
  exit 2
fi

_agent_available=1
if [[ "${USE_LLM}" -eq 1 ]]; then
  _agent_available=1
  SKIP_AGENT=0
  if [[ -z "${LLM_ENV_FILE}" ]]; then
    for _cand in \
      "${KS_ROOT}/../forge-certificators/example-banks/forge-certificator-secrets.env" \
      "${HOME}/Code/forge-certificators/example-banks/forge-certificator-secrets.env"; do
      if [[ -f "${_cand}" ]]; then
        LLM_ENV_FILE="${_cand}"
        break
      fi
    done
  fi
  if [[ -n "${FORGE_WORKCELLS_MOCK_FINDINGS_JSON:-}" ]]; then
    log "ai-harness --llm: mock findings ${FORGE_WORKCELLS_MOCK_FINDINGS_JSON}"
  elif [[ -n "${LLM_ENV_FILE}" && -f "${GATEWAY_PROBE}" && -f "${LLM_ENV_FILE}" ]]; then
    if ! python3 "${GATEWAY_PROBE}" --env-file "${LLM_ENV_FILE}" --minimal-only 2>/dev/null; then
      log "LCDL gateway probe failed for ${LLM_ENV_FILE} — rules may be blocked"
      _agent_available=0
    fi
  elif [[ -z "${LLM_ENV_FILE}" ]]; then
    log "ai-harness --llm: no --llm-env= and no default secrets file found"
    _agent_available=0
  fi
  if [[ -x "${KS_ROOT}/../forge-workcells/.venv/bin/forge-workcells" ]]; then
    export FORGE_WORKCELLS_BIN="${KS_ROOT}/../forge-workcells/.venv/bin/forge-workcells"
  fi
elif [[ "${SKIP_AGENT}" -eq 0 ]] && ! command -v agent >/dev/null 2>&1; then
  _agent_available=0
  log "Cursor CLI agent not on PATH — rules will be marked blocked (use --skip-agent or --llm)"
fi

FORGE_UX_AUDIT_WORKBENCH_ROOT="${FORGE_UX_AUDIT_WORKBENCH_ROOT:-}"
if [[ -z "${FORGE_UX_AUDIT_WORKBENCH_ROOT}" ]]; then
  _probe="${AUDITOR_ROOT}"
  while [[ "${_probe}" != "/" ]]; do
    if [[ "$(basename "${_probe}")" == "Code" ]]; then
      FORGE_UX_AUDIT_WORKBENCH_ROOT="${_probe}/workbench/ux-auditor"
      break
    fi
    _probe="$(dirname "${_probe}")"
  done
fi
FORGE_UX_AUDIT_WORKBENCH_ROOT="${FORGE_UX_AUDIT_WORKBENCH_ROOT:-${KS_ROOT}/../workbench/ux-auditor}"

OUT_DIR="${UX_AUDIT_OUT_DIR:-${FORGE_UX_AUDIT_WORKBENCH_ROOT}/ux-audit/ai-ruleset-harness-$(date -u +%Y%m%dT%H%M%SZ)}"
export UX_AUDIT_OUT_DIR="${OUT_DIR}"
mkdir -p "${OUT_DIR}"

STATE_JSONL="${OUT_DIR}/state.jsonl"
touch "${STATE_JSONL}"

CAMPAIGN_ID="$(basename "${OUT_DIR}")"
FIXTURE_ROOT="${FORGE_UX_AUDIT_WORKBENCH_ROOT}/rule-defect-fixtures/${CAMPAIGN_ID}"
HARNESS_LOG="${OUT_DIR}/harness-dashboard.log"
: >>"${HARNESS_LOG}"

if [[ "${NO_WATCH}" -eq 1 ]]; then
  HARNESS_WATCH=0
elif [[ "${HARNESS_WATCH}" -eq 1 || "${FORGE_UX_HARNESS_WATCH:-}" == "1" ]]; then
  HARNESS_WATCH=1
fi

_HARNESS_DASH_PID=""
if [[ "${HARNESS_WATCH}" -eq 1 ]]; then
  export FORGE_UX_HARNESS_WATCH=1
  export FORGE_UX_HARNESS_WATCH_LOG="${HARNESS_LOG}"
  harness_merge "{\"phase\":\"harness_start\",\"mode\":\"ai-agent\",\"fixtureRoot\":\"${FIXTURE_ROOT}\",\"rulesTotal\":0,\"rulesDone\":0}"
  if [[ -t 2 ]]; then
    node "${WATCH_DASH}" "${OUT_DIR}" &
    _HARNESS_DASH_PID=$!
  fi
  _harness_watch_cleanup() {
    local ec=$?
    [[ -n "${_HARNESS_DASH_PID}" ]] && kill "${_HARNESS_DASH_PID}" 2>/dev/null || true
    wait "${_HARNESS_DASH_PID}" 2>/dev/null || true
    printf '\033[?25h\033[?1049l' >&2 || true
    return "${ec}"
  }
  trap '_harness_watch_cleanup' EXIT INT TERM
fi

declare -A SKIP_RULES=()

if [[ "${RESUME}" -eq 1 && "${FORCE}" -eq 0 ]]; then
  while IFS= read -r rid; do
    [[ -n "${rid}" ]] && SKIP_RULES["${rid}"]=1
  done < <(jq -r '
    .[] | select(
      .status == "detection_ok" or .status == "detection_miss"
      or .status == "missing_fixture" or .status == "blocked"
    ) | .ruleId
  ' "${STATE_JSONL}" 2>/dev/null || true)
fi

mapfile -t ALL_RULES < <(jq -r '
  .aiRules
  | map(select(.promptPath))
  | sort_by(.id)
  | .[].id
' "${REGISTRY}")

REMAINING=()
for rule_id in "${ALL_RULES[@]}"; do
  [[ -z "${rule_id}" ]] && continue
  if [[ -n "${ONLY_RULE}" && "${rule_id}" != "${ONLY_RULE}" ]]; then
    continue
  fi
  if [[ "${FORCE}" -eq 0 && -n "${SKIP_RULES[${rule_id}]+x}" ]]; then
    continue
  fi
  REMAINING+=("${rule_id}")
done

log "OUT_DIR=${OUT_DIR}"
log "FIXTURE_ROOT=${FIXTURE_ROOT}"
log "remaining rules: ${#REMAINING[@]}"

if [[ "${DRY_RUN}" -eq 1 ]]; then
  printf '%s\n' "${REMAINING[@]}"
  exit 0
fi

if [[ "${REBUILD_FIXTURES}" -eq 1 || ! -f "${FIXTURE_ROOT}/manifest.json" ]]; then
  log "build AI defect fixtures"
  harness_merge '{"phase":"fixtures"}'
  mkdir -p "${FIXTURE_ROOT}"
  build_args=(--out "${FIXTURE_ROOT}" --lane ai)
  [[ -n "${ONLY_RULE}" ]] && build_args+=(--only-rule "${ONLY_RULE}")
  python3 "${BUILD_FIXTURES}" "${build_args[@]}"
fi

harness_merge "{\"rulesTotal\":${#REMAINING[@]},\"rulesDone\":0,\"outcomes\":{}}"

declare -A RULE_STATUS_SYM=()
outcomes_json='{"detection_ok":0,"detection_miss":0,"missing_fixture":0,"blocked":0,"pending":0}'

update_outcomes() {
  outcomes_json="$(jq -n \
    --argjson rows "$(jq -s '.' "${STATE_JSONL}" 2>/dev/null || echo '[]')" '
    {
      detection_ok: ([$rows[] | select(.status == "detection_ok")] | length),
      detection_miss: ([$rows[] | select(.status == "detection_miss")] | length),
      missing_fixture: ([$rows[] | select(.status == "missing_fixture")] | length),
      blocked: ([$rows[] | select(.status == "blocked")] | length),
      pending: 0
    }')"
}

build_rule_grid() {
  local grid=""
  local i=0
  for rid in "${REMAINING[@]}"; do
    local sym="·"
    case "${RULE_STATUS_SYM[${rid}]:-}" in
      detection_ok) sym="D" ;;
      detection_miss) sym="!" ;;
      missing_fixture) sym="-" ;;
      blocked) sym="B" ;;
    esac
    grid+="${sym}"
    i=$((i + 1))
    [[ "${i}" -ge 48 ]] && break
  done
  printf '%s' "${grid}"
}

idx=0
fin_rc=0
for rule_id in "${REMAINING[@]}"; do
  idx=$((idx + 1))
  slug="$(rule_kebab "${rule_id}")"
  rule_dir="${OUT_DIR}/rules/${rule_id}"
  mkdir -p "${rule_dir}"

  manifest_status="$(jq -r --arg rid "${rule_id}" '
    .rules[]? | select(.ruleId == $rid) | .status // "missing_fixture"
  ' "${FIXTURE_ROOT}/manifest.json" 2>/dev/null || echo "missing_fixture")"

  prompt_rel="$(jq -r --arg rid "${rule_id}" '
    .rules[]? | select(.ruleId == $rid) | .promptPath // ""
  ' "${FIXTURE_ROOT}/manifest.json" 2>/dev/null || echo "")"
  if [[ -z "${prompt_rel}" ]]; then
    prompt_rel="$(jq -r --arg rid "${rule_id}" '
      .aiRules[]? | select(.id == $rid) | .promptPath // ""
    ' "${REGISTRY}")"
  fi

  log "[${idx}/${#REMAINING[@]}] ${rule_id} (fixture ${manifest_status})"
  harness_merge "$(jq -nc \
    --arg rid "${rule_id}" \
    --arg step "start" \
    --argjson idx "${idx}" \
    --argjson total "${#REMAINING[@]}" \
    '{phase:"rule_audit",currentRule:{ruleId:$rid,step:$step,index:$idx,total:$total}}')"

  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  if [[ "${USE_LLM}" -eq 1 ]]; then
    mode_label="local-llm"
  else
    mode_label="ai-agent"
  fi

  if [[ "${manifest_status}" != "ready" ]]; then
    RULE_STATUS_SYM["${rule_id}"]="missing_fixture"
    append_state "$(jq -nc \
      --arg r "${rule_id}" --arg s "missing_fixture" --arg t "${ts}" --arg fr "${FIXTURE_ROOT}" --arg m "${mode_label}" \
      '{ruleId:$r,lane:"ai",status:$s,findingsCount:0,agentAttempts:0,fixtureRoot:$fr,mode:$m,note:"no before fixture",ts:$t}')"
    update_outcomes
    harness_merge "$(jq -nc --argjson o "${outcomes_json}" --argjson done "${idx}" \
      --arg grid "$(build_rule_grid)" \
      '{rulesDone:$done,outcomes:$o,ruleGrid:$grid}')"
    continue
  fi

  if [[ "${SKIP_AGENT}" -eq 1 || "${_agent_available}" -eq 0 ]]; then
    RULE_STATUS_SYM["${rule_id}"]="blocked"
    append_state "$(jq -nc \
      --arg r "${rule_id}" --arg s "blocked" --arg t "${ts}" --arg fr "${FIXTURE_ROOT}" --arg m "${mode_label}" \
      '{ruleId:$r,lane:"ai",status:$s,findingsCount:0,agentAttempts:0,fixtureRoot:$fr,mode:$m,note:"cursor agent unavailable",ts:$t}')"
    update_outcomes
    harness_merge "$(jq -nc --argjson o "${outcomes_json}" --argjson done "${idx}" \
      --arg grid "$(build_rule_grid)" \
      '{rulesDone:$done,outcomes:$o,ruleGrid:$grid}')"
    continue
  fi

  rule_fixture="${rule_dir}/fixture-website"
  rm -rf "${rule_fixture}"
  mkdir -p "${rule_fixture}"
  cp "${FIXTURE_ROOT}/website/${slug}-fail.html" "${rule_fixture}/index.html"
  cp -R "${FIXTURE_ROOT}/website/assets" "${rule_fixture}/assets"

  PROMPT_FILE="${AUDITOR_ROOT}/${prompt_rel}"
  if [[ ! -f "${PROMPT_FILE}" ]]; then
    PROMPT_FILE="${AUDITOR_ROOT}/design-rules/${prompt_rel#design-rules/}"
  fi
  if [[ ! -f "${PROMPT_FILE}" ]]; then
    log "${rule_id}: missing prompt ${prompt_rel}"
    RULE_STATUS_SYM["${rule_id}"]="blocked"
    append_state "$(jq -nc \
      --arg r "${rule_id}" --arg s "blocked" --arg t "${ts}" --arg fr "${FIXTURE_ROOT}" --arg n "missing prompt" \
      '{ruleId:$r,lane:"ai",status:$s,findingsCount:0,agentAttempts:0,fixtureRoot:$fr,mode:"ai-agent",note:$n,ts:$t}')"
    update_outcomes
    harness_merge "$(jq -nc --argjson o "${outcomes_json}" --argjson done "${idx}" \
      --arg grid "$(build_rule_grid)" '{rulesDone:$done,outcomes:$o,ruleGrid:$grid}')"
    continue
  fi

  harness_merge "$(jq -nc --arg rid "${rule_id}" --arg step "$([[ "${USE_LLM}" -eq 1 ]] && echo local-llm || echo ai-agent)" '{phase:"rule_audit",currentRule:{ruleId:$rid,step:$step}}')"

  start_fixture_server "${rule_fixture}"
  agent_log="${rule_dir}/ai-agent.log"
  agent_attempts=1
  set +e
  if [[ "${USE_LLM}" -eq 1 ]]; then
    audit_out="${rule_dir}/audit-out"
    rm -rf "${audit_out}"
    mkdir -p "${audit_out}"
    node "${ANALYZE}" \
      --repo "${KS_ROOT}" \
      --site "${FIXTURE_URL}" \
      --out "${audit_out}" \
      --max-pages 1 \
      --breadth-crawl \
      --no-refresh-plan-status >/dev/null 2>&1 || true
    slice_json="${rule_dir}/audit-slice.json"
    pw_json="${rule_dir}/playwright-evidence.json"
    context_json="${rule_dir}/context.json"
    node "${UX_SLICE}" \
      --audit "${audit_out}/audit-data.json" \
      --rule-id "${rule_id}" \
      --url "${FIXTURE_URL}" \
      --out "${slice_json}" 2>/dev/null || echo '{"findings":[]}' >"${slice_json}"
    node "${UX_PW}" --url "${FIXTURE_URL}" --out "${pw_json}" 2>/dev/null || echo '{}' >"${pw_json}"
    node "${UX_ASSEMBLE}" \
      --rule-id "${rule_id}" \
      --url "${FIXTURE_URL}" \
      --rule-prompt "${PROMPT_FILE}" \
      --audit-slice "${slice_json}" \
      --playwright "${pw_json}" \
      --out "${context_json}"
    RUN_ARGS=(--llm --rule-id "${rule_id}" --context "${context_json}" --out-dir "${rule_dir}/workcells-out")
    if [[ -n "${LLM_ENV_FILE}" ]]; then
      RUN_ARGS+=(--llm-env "${LLM_ENV_FILE}")
    fi
    if [[ "${VERBOSE}" -eq 1 ]]; then
      bash "${RUN_AI_RULE}" "${RUN_ARGS[@]}" "${KS_ROOT}" "${PROMPT_FILE}" "${FIXTURE_URL}" 2>&1 | tee "${agent_log}"
      agent_rc="${PIPESTATUS[0]}"
    else
      bash "${RUN_AI_RULE}" "${RUN_ARGS[@]}" "${KS_ROOT}" "${PROMPT_FILE}" "${FIXTURE_URL}" >"${agent_log}" 2>&1
      agent_rc=$?
    fi
  elif [[ "${VERBOSE}" -eq 1 ]]; then
    bash "${RUN_AI_RULE}" "${KS_ROOT}" "${PROMPT_FILE}" "${FIXTURE_URL}" 2>&1 | tee "${agent_log}"
    agent_rc="${PIPESTATUS[0]}"
  else
    bash "${RUN_AI_RULE}" "${KS_ROOT}" "${PROMPT_FILE}" "${FIXTURE_URL}" >"${agent_log}" 2>&1
    agent_rc=$?
  fi
  set -e
  stop_fixture_server

  findings_json="${rule_dir}/ai-findings.json"
  fc="$(node "${PARSE_AI}" --in "${agent_log}" --out "${findings_json}" --rule-id "${rule_id}" 2>/dev/null || echo 0)"
  fc="${fc:-0}"

  log "${rule_id}: AI findings=${fc} agent_rc=${agent_rc}"

  final_status="detection_ok"
  note=""
  if [[ "${agent_rc}" -ne 0 ]]; then
    final_status="blocked"
    note="agent exit ${agent_rc}"
    if grep -qiE 'usage limit|resource_exhausted|rate limit' "${agent_log}" 2>/dev/null; then
      note="cursor agent usage limit"
    fi
  elif [[ "${fc}" -lt 1 ]]; then
    final_status="detection_miss"
    note="expected findings >= 1 on defect fixture"
    write_detection_failure "${rule_dir}" "${rule_id}" "${fc}"
  fi

  RULE_STATUS_SYM["${rule_id}"]="${final_status}"
  append_state "$(jq -nc \
    --arg r "${rule_id}" \
    --arg s "${final_status}" \
    --argjson fc "${fc}" \
    --argjson aa "${agent_attempts}" \
    --arg t "${ts}" \
    --arg fr "${FIXTURE_ROOT}" \
    --arg m "${mode_label}" \
    --arg n "${note}" \
    '{ruleId:$r,lane:"ai",status:$s,findingsCount:$fc,agentAttempts:$aa,fixtureRoot:$fr,mode:$m,note:$n,ts:$t}')"

  update_outcomes
  harness_merge "$(jq -nc \
    --argjson o "${outcomes_json}" \
    --argjson done "${idx}" \
    --arg grid "$(build_rule_grid)" \
    --arg rid "${rule_id}" \
    --argjson fc "${fc}" \
    '{rulesDone:$done,outcomes:$o,ruleGrid:$grid,currentRule:{ruleId:$rid,step:"done",findingsCount:$fc}}')"

  if [[ "${final_status}" == "detection_miss" ]]; then
    fin_rc=1
  fi
done

harness_merge '{"phase":"finalize"}'
log "finalize"
set +e
bash "${FINALIZE}" "${OUT_DIR}"
finalize_rc=$?
set -e
[[ "${finalize_rc}" -ne 0 ]] && fin_rc="${finalize_rc}"

log "done → ${OUT_DIR}/SUMMARY.md"
exit "${fin_rc}"
