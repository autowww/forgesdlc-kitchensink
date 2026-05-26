#!/usr/bin/env bash
# DET ruleset remediation-verify: After example on fixtures → audit expects 0 findings.
#
# Usage:
#   ./invoke-det-ruleset-remediation-verify.sh [options]
#
# Options:
#   --only-rule DET.X       Single rule (bootstrap)
#   --resume                Skip terminal statuses in state.jsonl
#   --force                 Re-run terminal rules
#   --dry-run               List rules only
#   --rebuild-fixtures      Force fixture rebuild
#   --verbose, -v
#   --watch                 Campaign watch board (TTY)
#   --no-watch
#
# Default: apply After HTML then audit-only (expect 0 findings per rule).

set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUDITOR_ROOT="$(cd "${TESTS_ROOT}/.." && pwd)"
KS_ROOT="$(cd "${AUDITOR_ROOT}/../.." && pwd)"
LOOP="${AUDITOR_ROOT}/run-website-ux-remediation-loop.sh"
FINALIZE="${TESTS_ROOT}/finalize-ruleset-harness.sh"
EXPECT="${TESTS_ROOT}/expect-rule-detection.sh"
EXPECT_CLEAN="${TESTS_ROOT}/expect-rule-clean.sh"
APPLY="${TESTS_ROOT}/apply-harness-fixture-remediation.py"
FIXER_BIN="${AUDITOR_ROOT}/lib/ux-deterministic-fixers/run-deterministic-fixers.mjs"
MINIMAL_ASSETS="${TESTS_ROOT}/harness-minimal-assets"
BUILD_FIXTURES="${KS_ROOT}/generator/build_rule_defect_fixtures.py"
REGISTRY="${AUDITOR_ROOT}/design-rules/registry.generated.json"
MERGE_STATE="${AUDITOR_ROOT}/merge-harness-dashboard-state.mjs"
WATCH_DASH="${TESTS_ROOT}/harness-watch-dashboard.mjs"
STANDARD="${KS_ROOT}/docs/design/forge-enterprise-ai-website-standard.md"

ONLY_RULE=""
RESUME=0
FORCE=0
DRY_RUN=0
REBUILD_FIXTURES=0
VERBOSE=0
HARNESS_WATCH=0
NO_WATCH=0
log() {
  local msg="[det-remediation-verify $(date -u +%H:%M:%S)] $*"
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
  local audit_data="${rule_dir}/audit-data.json"
  mkdir -p "${rule_dir}"
  {
    echo "# Harness detection failure — ${rule_id}"
    echo ""
    echo "Expected ≥1 finding for \`${rule_id}\` on the defect fixture page; got **${fc}**."
    echo ""
    echo "## Suggested fixes"
    echo ""
    echo "- Rule-page **Before example** HTML in \`docs/design/ux-audit/rule-pages/\`"
    echo "- \`generator/build_rule_defect_fixtures.py\`"
    echo "- DET check: \`tools/website-ux-auditor/design-rules/deterministic/generated/\`"
    echo ""
    if [[ -f "${audit_data}" ]]; then
      echo "## audit-data excerpt"
      echo ""
      echo '```json'
      jq -c --arg rid "${rule_id}" '
        [.pages[]?.findings[]? | select((.ruleId // "") == $rid or (.checkId // "") == $rid)] | .[0:5]
      ' "${audit_data}" 2>/dev/null || echo "[]"
      echo '```'
    fi
  } >"${rule_dir}/harness-detection-failure.md"
}

write_remediation_failure() {
  local rule_dir="$1"
  local rule_id="$2"
  local fc="$3"
  local attempts="$4"
  mkdir -p "${rule_dir}"
  {
    echo "# Harness remediation failure — ${rule_id}"
    echo ""
    echo "After agent remediation, **${fc}** finding(s) remain for \`${rule_id}\`."
    echo ""
    echo "- Agent attempts: ${attempts}"
    echo ""
    echo "## Suggested fixes"
    echo ""
    echo "- Ephemeral fixture HTML under workbench (Before → After)"
    echo "- DET check module or harness remediation prompts"
    echo "- \`cursor-agent-run-ux-plan.sh\` / forge-ux-remediation-plan-runner"
  } >"${rule_dir}/harness-remediation-failure.md"
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
    -h|--help)
      sed -n '1,22p' "$0"
      exit 0
      ;;
    *) echo "det-remediation-verify: unknown arg: $1" >&2; exit 2 ;;
  esac
  shift
done

if ! command -v jq >/dev/null 2>&1; then
  echo "det-remediation-verify: jq required" >&2
  exit 2
fi

if [[ ! -x "${LOOP}" ]]; then
  echo "det-remediation-verify: missing ${LOOP}" >&2
  exit 2
fi

# Workbench root
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

OUT_DIR="${UX_AUDIT_OUT_DIR:-${FORGE_UX_AUDIT_WORKBENCH_ROOT}/ux-audit/ruleset-remediation-verify-$(date -u +%Y%m%dT%H%M%SZ)}"
export UX_AUDIT_OUT_DIR="${OUT_DIR}"
mkdir -p "${OUT_DIR}"

STATE_JSONL="${OUT_DIR}/state.jsonl"
touch "${STATE_JSONL}"

CAMPAIGN_ID="$(basename "${OUT_DIR}")"
FIXTURE_ROOT="${FORGE_UX_AUDIT_WORKBENCH_ROOT}/rule-defect-fixtures/${CAMPAIGN_ID}"
if [[ -n "${FORGE_UX_RULESET_FIXTURE_ROOT:-}" && -f "${FORGE_UX_RULESET_FIXTURE_ROOT}/manifest.json" ]]; then
  FIXTURE_ROOT="${FORGE_UX_RULESET_FIXTURE_ROOT}"
fi
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
  harness_merge "{\"phase\":\"harness_start\",\"mode\":\"remediate-verify\",\"fixtureRoot\":\"${FIXTURE_ROOT}\",\"rulesTotal\":0,\"rulesDone\":0}"
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
      or .status == "remediation_ok" or .status == "remediation_fail"
      or .status == "missing_fixture" or .status == "blocked"
    ) | .ruleId
  ' "${STATE_JSONL}" 2>/dev/null || true)
fi

mapfile -t ALL_RULES < <(jq -r '
  .deterministicRules
  | map(select(.status == "implemented" and .modulePath))
  | sort_by(-(.priorityWeight // 0))
  | .[].id
' "${REGISTRY}")

REMAINING=()
for rule_id in "${ALL_RULES[@]}"; do
  [[ -z "${rule_id}" ]] && continue
  [[ "${rule_id}" == "DET.THEME.FONT_STACK" ]] && continue
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
  log "build defect fixtures"
  harness_merge '{"phase":"fixtures"}'
  mkdir -p "${FIXTURE_ROOT}"
  build_args=(--out "${FIXTURE_ROOT}")
  [[ -n "${ONLY_RULE}" ]] && build_args+=(--only-rule "${ONLY_RULE}")
  python3 "${BUILD_FIXTURES}" "${build_args[@]}"
fi

harness_merge "{\"rulesTotal\":${#REMAINING[@]},\"rulesDone\":0,\"outcomes\":{}}"

declare -A RULE_STATUS_SYM=()
outcomes_json='{"detection_ok":0,"detection_miss":0,"remediation_ok":0,"remediation_fail":0,"missing_fixture":0,"blocked":0,"pending":0}'

update_outcomes() {
  outcomes_json="$(jq -n \
    --argjson rows "$(jq -s '.' "${STATE_JSONL}" 2>/dev/null || echo '[]')" '
    {
      detection_ok: ([$rows[] | select(.status == "detection_ok")] | length),
      detection_miss: ([$rows[] | select(.status == "detection_miss")] | length),
      remediation_ok: ([$rows[] | select(.status == "remediation_ok")] | length),
      remediation_fail: ([$rows[] | select(.status == "remediation_fail")] | length),
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
      remediation_ok) sym="R" ;;
      remediation_fail) sym="X" ;;
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

  log "[${idx}/${#REMAINING[@]}] ${rule_id} (fixture ${manifest_status})"
  harness_merge "$(jq -nc \
    --arg rid "${rule_id}" \
    --arg step "start" \
    --argjson idx "${idx}" \
    --argjson total "${#REMAINING[@]}" \
    '{phase:"rule_audit",currentRule:{ruleId:$rid,step:$step,index:$idx,total:$total}}')"

  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  mode_label="remediate-verify"

  if [[ "${manifest_status}" != "ready" ]]; then
    RULE_STATUS_SYM["${rule_id}"]="missing_fixture"
    append_state "$(jq -nc \
      --arg r "${rule_id}" --arg s "missing_fixture" --arg t "${ts}" --arg fr "${FIXTURE_ROOT}" --arg m "${mode_label}" \
      '{ruleId:$r,lane:"deterministic",status:$s,findingsCount:0,agentAttempts:0,fixtureRoot:$fr,mode:$m,note:"no before fixture",ts:$t}')"
    update_outcomes
    harness_merge "$(jq -nc --argjson o "${outcomes_json}" --argjson done "${idx}" \
      --arg grid "$(build_rule_grid)" \
      '{rulesDone:$done,outcomes:$o,ruleGrid:$grid}')"
    continue
  fi

  rule_fixture="${rule_dir}/fixture-website"
  rm -rf "${rule_fixture}"
  mkdir -p "${rule_fixture}"

  fixture_mode="$(jq -r --arg rid "${rule_id}" '
    .rules[]? | select(.ruleId == $rid) | .fixtureMode // "standalone"
  ' "${FIXTURE_ROOT}/manifest.json" 2>/dev/null || echo "standalone")"
  crawl_max_pages="$(jq -r --arg rid "${rule_id}" '
    .rules[]? | select(.ruleId == $rid) | .crawlMaxPages // 1
  ' "${FIXTURE_ROOT}/manifest.json" 2>/dev/null || echo "1")"
  repo_overlay="$(jq -r --arg rid "${rule_id}" '
    .rules[]? | select(.ruleId == $rid) | .repoOverlayPath // ""
  ' "${FIXTURE_ROOT}/manifest.json" 2>/dev/null || echo "")"

  if [[ "${fixture_mode}" == "multi_page" ]]; then
    fail_html="$(jq -r --arg rid "${rule_id}" '
      .rules[]? | select(.ruleId == $rid) | .failHtmlPath // ""
    ' "${FIXTURE_ROOT}/manifest.json" 2>/dev/null || echo "")"
    baseline_html="$(jq -r --arg rid "${rule_id}" '
      .rules[]? | select(.ruleId == $rid) | .htmlPath // ""
    ' "${FIXTURE_ROOT}/manifest.json" 2>/dev/null || echo "")"
    cp "${FIXTURE_ROOT}/${baseline_html}" "${rule_fixture}/index.html"
    cp "${FIXTURE_ROOT}/${fail_html}" "${rule_fixture}/settings.html"
  else
    cp "${FIXTURE_ROOT}/website/${slug}-fail.html" "${rule_fixture}/index.html"
  fi
  mkdir -p "${rule_fixture}/assets"
  cp -R "${MINIMAL_ASSETS}/." "${rule_fixture}/assets/"

  LOOP_REPO="${rule_fixture}"
  if [[ -n "${repo_overlay}" && -d "${FIXTURE_ROOT}/${repo_overlay}" ]]; then
    LOOP_REPO="${FIXTURE_ROOT}/${repo_overlay}"
  fi

  fixer_args=(
    --repo-root "${LOOP_REPO}"
    --audit-data "${rule_dir}/audit-data.json"
    --out-dir "${rule_dir}"
    --rule-id "${rule_id}"
    --harness
    --fixture-dir "${rule_fixture}"
    --fixture-mode "${fixture_mode}"
    --skip-verify
  )
  [[ "${fixture_mode}" == "multi_page" ]] && fixer_args+=(--fixture-root "${FIXTURE_ROOT}")
  if [[ "${fixture_mode}" == "repo_overlay" && -n "${repo_overlay}" ]]; then
    fixer_args+=(--repo-overlay "${FIXTURE_ROOT}/${repo_overlay}")
  fi
  mkdir -p "${rule_dir}"
  if [[ ! -f "${rule_dir}/audit-data.json" ]]; then
    echo '{"schemaVersion":2,"pages":[]}' >"${rule_dir}/audit-data.json"
  fi
  set +e
  if [[ -f "${FIXER_BIN}" ]]; then
    node "${FIXER_BIN}" "${fixer_args[@]}"
    apply_rc=$?
  else
    apply_args=(--rule-id "${rule_id}" --fixture-dir "${rule_fixture}" --fixture-mode "${fixture_mode}")
    [[ "${fixture_mode}" == "multi_page" ]] && apply_args+=(--fixture-root "${FIXTURE_ROOT}")
    if [[ "${fixture_mode}" == "repo_overlay" && -n "${repo_overlay}" ]]; then
      apply_args+=(--repo-overlay "${FIXTURE_ROOT}/${repo_overlay}")
    fi
    python3 "${APPLY}" "${apply_args[@]}"
    apply_rc=$?
  fi
  set -e
  fixer_ok="N"
  if [[ -f "${rule_dir}/deterministic-fixer-report.json" ]]; then
    fixer_ok="$(jq -r --arg r "${rule_id}" '
      .rules[$r].applied // false | if . then "Y" else "N" end
    ' "${rule_dir}/deterministic-fixer-report.json" 2>/dev/null || echo "N")"
  fi
  if [[ "${apply_rc}" -ne 0 ]]; then
    RULE_STATUS_SYM["${rule_id}"]="remediation_fail"
    append_state "$(jq -nc \
      --arg r "${rule_id}" --arg s "remediation_fail" --arg t "${ts}" --arg fr "${FIXTURE_ROOT}" --arg m "${mode_label}" \
      --arg n "deterministic-fixer failed" --arg fo "${fixer_ok}" \
      '{ruleId:$r,lane:"deterministic",status:$s,findingsCount:-1,agentAttempts:0,fixtureRoot:$fr,mode:$m,note:$n,fixerOk:$fo,ts:$t}')"
    update_outcomes
    harness_merge "$(jq -nc --argjson o "${outcomes_json}" --argjson done "${idx}" --arg grid "$(build_rule_grid)" '{rulesDone:$done,outcomes:$o,ruleGrid:$grid}')"
    fin_rc=1
    continue
  fi

  RULE_OUT="${rule_dir}"
  export UX_AUDIT_OUT_DIR="${RULE_OUT}"
  export DESIGN_STANDARD_PATH="${STANDARD}"
  export TIMEOUT_MS="${TIMEOUT_MS:-90000}"

  # run-website-ux-remediation-loop.sh resets env defaults — pass harness flags on CLI.
  loop_extra=(
    --site-kind generic
    --no-screenshots
    --no-ux-csv
    --max-pages "${crawl_max_pages}"
    --stop-disable
    --no-scorer
    --single-pass
    --no-post-agent-build
    --no-breadth-crawl
    --audit-only
    --skip-fixers
  )
  if [[ "${VERBOSE}" -eq 1 ]]; then
    loop_extra+=(--verbose)
  fi
  export FORGE_UX_LOOP_WATCH=0

  harness_merge "$(jq -nc --arg rid "${rule_id}" '{phase:"rule_audit",currentRule:{ruleId:$rid,step:"audit"}}')"

  set +e
  bash "${LOOP}" "${LOOP_REPO}" "${rule_fixture}" "${loop_extra[@]}"
  loop_rc=$?
  set -e

  audit_data="${RULE_OUT}/audit-data.json"
  set +e
  fc="$(bash "${EXPECT_CLEAN}" "${audit_data}" "${rule_id}")"
  set -e
  fc="${fc:-0}"

  log "${rule_id}: post-remediation findings=${fc} loop_rc=${loop_rc}"

  final_status="remediation_ok"
  agent_attempts=0
  note=""
  agent_required="N"
  if [[ "${fixer_ok}" != "Y" && "${fc}" -gt 0 ]]; then
    agent_required="Y"
  fi

  if [[ "${fc}" -gt 0 ]]; then
    final_status="remediation_fail"
    note="expected 0 findings after deterministic fixer"
    write_remediation_failure "${rule_dir}" "${rule_id}" "${fc}" "0"
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
    --arg fo "${fixer_ok}" \
    --arg ar "${agent_required}" \
    '{ruleId:$r,lane:"deterministic",status:$s,findingsCount:$fc,agentAttempts:$aa,fixtureRoot:$fr,mode:$m,note:$n,fixerOk:$fo,agentRequired:$ar,ts:$t}')"

  update_outcomes
  harness_merge "$(jq -nc \
    --argjson o "${outcomes_json}" \
    --argjson done "${idx}" \
    --arg grid "$(build_rule_grid)" \
    --arg rid "${rule_id}" \
    --argjson fc "${fc}" \
    '{rulesDone:$done,outcomes:$o,ruleGrid:$grid,currentRule:{ruleId:$rid,step:"done",findingsCount:$fc}}')"

  if [[ "${final_status}" == "remediation_fail" ]]; then
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
