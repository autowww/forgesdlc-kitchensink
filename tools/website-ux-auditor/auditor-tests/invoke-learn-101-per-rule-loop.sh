#!/usr/bin/env bash
# Legacy Fleet Learn 101 invoker (single handbook page). Prefer invoke-det-ruleset-harness.sh
# for DET ruleset validation on synthetic defect fixtures.
#
# Test-wrapper invoker: rule-by-rule check → remediate → verify for one Fleet handbook page.
# Uses ONLY existing KS auditor/remediation CLIs (no new audit logic).
#
# Default run requires Cursor CLI `agent` (authenticated). Use --check-only for CI wiring.
#
# Usage:
#   ./invoke-learn-101-per-rule-loop.sh [--verbose] [--check-only] [--smoke-agent] [--include-ai] [--from-rule DET.X] [--only-rule DET.X]
#
# Env:
#   UX_AUDIT_OUT_DIR=/abs/campaign     Stable output folder
#   MAX_ATTEMPTS=3                     Per-rule product-agent retries before meta-agent
#   REPO_ROOT=/path/forge-fleet-website
#   PAGE_HTML=docs-learn-101-01-what-is-fleet.html
#   CURSOR_API_KEY                     Skip interactive agent login when set
#   SKIP_CURSOR_LOGIN=1                Do not run `agent login`
#   FORGE_UX_CURSOR_AGENT_MODEL        Cursor model (default: auto)
#   FORGE_UX_LEARN101_SKIP_META_AGENT=1  Skip meta-agent on exhaustion
#   FORGE_UX_LEARN101_VERBOSE=1        Same as --verbose (auditor --verbose, agent stream-json summary)
#   FORGE_UX_LEARN101_APPEND_STATE=1   Append to state.jsonl (batch child — see invoke-learn-101-remaining-rules.sh)
#   FORGE_UX_LEARN101_SKIP_BUILD=1      Skip build-site.py (batch child)
#   FORGE_UX_LEARN101_SKIP_BASELINE=1  Skip shared-check audit when trace exists
#   FORGE_UX_LEARN101_SKIP_FINALIZE=1   Skip SUMMARY/AGENT-FAILURES (batch parent finalizes)
#   FORGE_UX_LEARN101_PAGE_URL=…        Reuse HTTP server URL (batch parent)
#   FORGE_UX_LEARN101_PER_RULE_AUDIT=1  Always run analyze in rules/<id>/ on attempt 1 (batch)
#   FORGE_UX_LEARN101_BATCH_CHILD=1     Set by invoke-learn-101-remaining-rules.sh children
#
# Examples:
#   ./invoke-learn-101-per-rule-loop.sh
#   ./invoke-learn-101-per-rule-loop.sh --only-rule DET.NAV.DEDUP
#   ./invoke-learn-101-per-rule-loop.sh --check-only
#   ./invoke-learn-101-per-rule-loop.sh --include-ai
#
# Full campaign: Cursor CLI on PATH + auth. CI wiring: --check-only (no agent).

set -euo pipefail

AUDITOR_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KS_ROOT="$(cd "${AUDITOR_ROOT}/../.." && pwd)"
ANALYZE="${AUDITOR_ROOT}/analyze-website-ux.mjs"
GATE="${AUDITOR_ROOT}/audit-quality-gate.mjs"
RUN_PLAN="${AUDITOR_ROOT}/cursor-agent-run-ux-plan.sh"
RUN_AI="${AUDITOR_ROOT}/cursor-agent-run-ux-audit.sh"
RUN_META="${TESTS_ROOT}/cursor-agent-run-learn-101-meta.sh"
META_TEMPLATE="${TESTS_ROOT}/learn-101-agent-meta.prompt.md"
REGISTRY="${AUDITOR_ROOT}/design-rules/registry.generated.json"
MANIFEST="${KS_ROOT}/docs/design/ux-audit/rule-pages/rule-pages.manifest.json"

REPO_ROOT="${REPO_ROOT:-/home/lzvyahin/Code/forge-fleet-website}"
PAGE_HTML="${PAGE_HTML:-docs-learn-101-01-what-is-fleet.html}"
PAGE_SLUG="${PAGE_HTML%.html}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-3}"
CHECK_ONLY=0
INCLUDE_AI=0
VERBOSE=0
SMOKE_AGENT=0
FROM_RULE=""
ONLY_RULE=""
SHARED_BASELINE_ONLY=0

log() {
  echo "[invoke-learn-101 $(date -u +%H:%M:%S)] $*" >&2
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --verbose|-v) VERBOSE=1 ;;
    --smoke-agent) SMOKE_AGENT=1 ;;
    --check-only) CHECK_ONLY=1 ;;
    --include-ai) INCLUDE_AI=1 ;;
    --from-rule) FROM_RULE="${2:-}"; shift ;;
    --only-rule) ONLY_RULE="${2:-}"; shift ;;
    --shared-baseline-only) SHARED_BASELINE_ONLY=1 ;;
    -h|--help)
      sed -n '1,32p' "$0"
      exit 0
      ;;
    *) echo "invoke-learn-101: unknown arg: $1" >&2; exit 2 ;;
  esac
  shift
done

if [[ "${CHECK_ONLY}" -eq 1 ]]; then
  export SKIP_CURSOR_AGENT=1
  log "mode: check-only (SKIP_CURSOR_AGENT=1)"
else
  unset SKIP_CURSOR_AGENT
  log "mode: full-agent (product agent + meta on failure)"
fi
if [[ "${VERBOSE}" -eq 1 || "${FORGE_UX_LEARN101_VERBOSE:-}" == "1" ]]; then
  VERBOSE=1
  export FORGE_UX_CURSOR_AGENT_VERBOSE=1
  export FORGE_UX_AGENT_STREAM_SUMMARY=1
  export UX_AUDIT_VERBOSE=1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "invoke-learn-101: jq required" >&2
  exit 2
fi

ensure_cursor_agent_auth() {
  if [[ "${SKIP_CURSOR_AGENT:-}" == "1" ]]; then
    log 'SKIP_CURSOR_AGENT=1 — audit/trace only (no remediation agent)'
    return 0
  fi

  log 'Cursor CLI — checking authentication (before audit)'

  if [[ "${SKIP_CURSOR_LOGIN:-}" == "1" ]]; then
    echo 'invoke-learn-101: SKIP_CURSOR_LOGIN=1 — must already be authenticated.' >&2
    return 0
  fi
  if [[ -n "${CURSOR_API_KEY:-}" ]]; then
    echo 'invoke-learn-101: CURSOR_API_KEY set — skipping interactive `agent login`.' >&2
    return 0
  fi
  if ! command -v agent >/dev/null 2>&1; then
    echo 'invoke-learn-101: `agent` not on PATH — install Cursor CLI, or use --check-only.' >&2
    exit 1
  fi
  if agent status >/dev/null 2>&1; then
    echo 'invoke-learn-101: Cursor CLI OK (`agent status`).' >&2
    return 0
  fi

  echo 'invoke-learn-101: running interactive `agent login`…' >&2
  agent login
  echo 'invoke-learn-101: `agent login` finished.' >&2
}

UTC_TAG="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="${UX_AUDIT_OUT_DIR:-/home/lzvyahin/Code/workbench/ux-auditor/ux-audit/forge-fleet-website/learn-101-rule-loop-${UTC_TAG}}"
mkdir -p "${OUT_DIR}/rules"
log "OUT_DIR=${OUT_DIR}"

STANDARD="${REPO_ROOT}/kitchensink/docs/design/forge-enterprise-ai-website-standard.md"
if [[ ! -f "${STANDARD}" ]]; then
  STANDARD="${KS_ROOT}/docs/design/forge-enterprise-ai-website-standard.md"
fi

BASELINE_GAP="${OUT_DIR}/GAP-ANALYSIS.md"
BASELINE_OWN="${OUT_DIR}/OWNERSHIP.md"
if [[ ! -f "${BASELINE_GAP}" ]]; then
  if [[ -f /home/lzvyahin/Code/workbench/ux-auditor/ux-audit/forge-fleet-website/learn-101-rule-loop-baseline/GAP-ANALYSIS.md ]]; then
    cp /home/lzvyahin/Code/workbench/ux-auditor/ux-audit/forge-fleet-website/learn-101-rule-loop-baseline/GAP-ANALYSIS.md "${BASELINE_GAP}"
    cp /home/lzvyahin/Code/workbench/ux-auditor/ux-audit/forge-fleet-website/learn-101-rule-loop-baseline/OWNERSHIP.md "${BASELINE_OWN}"
  else
    echo "invoke-learn-101: seed GAP-ANALYSIS.md / OWNERSHIP.md from baseline campaign first" >&2
  fi
fi

if [[ "${SHARED_BASELINE_ONLY}" -ne 1 ]]; then
  ensure_cursor_agent_auth
fi

if [[ -z "${FORGE_UX_LEARN101_SKIP_BUILD:-}" ]]; then
  echo "invoke-learn-101: build site" >&2
  (cd "${REPO_ROOT}" && python3 generator/build-site.py) >&2
else
  log "skip build (FORGE_UX_LEARN101_SKIP_BUILD=1)"
fi

SRV_PID=""
if [[ -n "${FORGE_UX_LEARN101_PAGE_URL:-}" ]]; then
  PAGE_URL="${FORGE_UX_LEARN101_PAGE_URL}"
  log "reuse PAGE_URL=${PAGE_URL}"
else
  PORT="$(python3 -c 'import socket;s=socket.socket();s.bind(("",0));print(s.getsockname()[1]);s.close()')"
  cd "${REPO_ROOT}/website"
  python3 -m http.server "${PORT}" >/dev/null 2>&1 &
  SRV_PID=$!
  cleanup() { kill "${SRV_PID}" 2>/dev/null || true; }
  trap cleanup EXIT
  sleep 0.4
  PAGE_URL="http://127.0.0.1:${PORT}/${PAGE_HTML}"
fi

if [[ -z "${SRV_PID}" ]]; then
  cleanup() { :; }
  trap cleanup EXIT
fi
echo "invoke-learn-101: PAGE_URL=${PAGE_URL}" >&2
echo "invoke-learn-101: OUT_DIR=${OUT_DIR}" >&2

STATE_JSONL="${OUT_DIR}/state.jsonl"
AGENT_FAILURES_MD="${OUT_DIR}/AGENT-FAILURES.md"
if [[ -n "${FORGE_UX_LEARN101_APPEND_STATE:-}" ]]; then
  log "append state (FORGE_UX_LEARN101_APPEND_STATE=1)"
  mkdir -p "${OUT_DIR}"
  touch "${STATE_JSONL}"
elif [[ -f "${STATE_JSONL}" && -s "${STATE_JSONL}" ]]; then
  log "append existing state.jsonl (${STATE_JSONL})"
else
  : >"${STATE_JSONL}"
fi

rule_page_md() {
  local rule_id="$1"
  local slug
  slug="$(echo "${rule_id}" | tr '[:upper:]' '[:lower:]' | tr '.' '-')"
  local from_manifest
  from_manifest="$(jq -r --arg id "${rule_id}" '.rules[] | select(.id==$id) | .mdPath // empty' "${MANIFEST}" 2>/dev/null || true)"
  if [[ -n "${from_manifest}" && -f "${KS_ROOT}/${from_manifest}" ]]; then
    echo "${KS_ROOT}/${from_manifest}"
    return
  fi
  local cand="${KS_ROOT}/docs/design/ux-audit/rule-pages/${slug}.md"
  if [[ -f "${cand}" ]]; then
    echo "${cand}"
    return
  fi
  echo ""
}

append_state() {
  printf '%s\n' "$1" >>"${STATE_JSONL}"
}

parse_trace_for_rule() {
  local rule_dir="$1"
  local rule_id="$2"
  local trace="${rule_dir}/ux-audit-rule-page-trace.json"
  if [[ ! -f "${trace}" ]]; then
    echo "0|missing_trace|"
    return
  fi
  jq -r --arg slug "${PAGE_SLUG}" --arg rid "${rule_id}" '
    [.entries[] | select((.url // "") | contains($slug)) | select(.ruleId == $rid)][0]
    | if . == null then "0|no_entry|" else
        "\(.findingsCount // 0)|\(.status // "unknown")|\(.severityCounts // {})"
      end
  ' "${trace}" 2>/dev/null || echo "0|parse_error|"
}

audit_findings_for_rule() {
  local audit_data="$1"
  local rule_id="$2"
  jq -r --arg slug "${PAGE_SLUG}" --arg rid "${rule_id}" '
    [.pages[]? | select((.url // "") | contains($slug)) | .findings[]? |
      select((.ruleId // "") == $rid or (.checkId // "") == $rid)]
    | length
  ' "${audit_data}" 2>/dev/null || echo 0
}

audit_findings_json_for_rule() {
  local audit_data="$1"
  local rule_id="$2"
  if [[ ! -f "${audit_data}" ]]; then
    echo "[]"
    return
  fi
  jq -c --arg slug "${PAGE_SLUG}" --arg rid "${rule_id}" '
    [.pages[]? | select((.url // "") | contains($slug)) | .findings[]? |
      select((.ruleId // "") == $rid or (.checkId // "") == $rid)]
  ' "${audit_data}" 2>/dev/null || echo "[]"
}

last_finding_evidence_for_rule() {
  local audit_data="$1"
  local rule_id="$2"
  jq -r --arg slug "${PAGE_SLUG}" --arg rid "${rule_id}" '
    [.pages[]? | select((.url // "") | contains($slug)) | .findings[]? |
      select((.ruleId // "") == $rid or (.checkId // "") == $rid)]
    | last | .evidence // "n/a"
  ' "${audit_data}" 2>/dev/null || echo "n/a"
}

sync_rule_audit_artifacts() {
  local rule_dir="$1"
  local src_dir="$2"
  mkdir -p "${rule_dir}"
  cp -f "${src_dir}/audit-data.json" "${rule_dir}/" 2>/dev/null || true
  cp -f "${src_dir}/ux-audit-rule-page-trace.json" "${rule_dir}/" 2>/dev/null || true
  cp -f "${src_dir}/audit-report.md" "${rule_dir}/" 2>/dev/null || true
}

run_analyze() {
  local out="$1"
  mkdir -p "${out}"
  log "analyze → ${out}"
  local -a analyze_args=(
    --repo "${REPO_ROOT}"
    --site "${PAGE_URL}"
    --site-kind fleet
    --standard "${STANDARD}"
    --max-pages 1
    --breadth-crawl
    --no-screenshots
    --no-ux-csv
    --out "${out}"
    --no-mirror-root-plan
  )
  if [[ "${VERBOSE}" -eq 1 ]]; then
    analyze_args+=(--verbose)
  fi
  if [[ "${VERBOSE}" -eq 1 ]]; then
    node "${ANALYZE}" "${analyze_args[@]}"
  else
    node "${ANALYZE}" "${analyze_args[@]}" >/dev/null
  fi
}

write_rule_plan() {
  local rule_dir="$1"
  local rule_id="$2"
  local findings_count="$3"
  local plan="${rule_dir}/forge-ux-remediation.plan.md"
  local prompt="${rule_dir}/remediation.prompt.md"
  local rule_md
  rule_md="$(rule_page_md "${rule_id}")"
  local audit_data="${rule_dir}/audit-data.json"
  local findings_json
  findings_json="$(audit_findings_json_for_rule "${audit_data}" "${rule_id}")"

  {
    echo "# Remediation prompt — ${rule_id}"
    echo ""
    echo "Target URL only: ${PAGE_URL}"
    echo "Page file: ${PAGE_HTML}"
    echo ""
    echo "Read **OWNERSHIP.md** in campaign folder (\`${OUT_DIR}/OWNERSHIP.md\`) before editing."
    echo "Follow **.cursor/rules/forge-ux-remediation-plan-runner.mdc** (root-cause, Plan–Do–Check–Adjust)."
    echo ""
    echo "## Constraints"
    echo ""
    echo "- Fix only layers listed in OWNERSHIP.md for this finding type."
    echo "- After edits: \`cd ${REPO_ROOT} && python3 generator/build-site.py\`"
    echo "- Re-verify only this URL (do not change other handbook pages)."
    echo ""
    if [[ -n "${rule_md}" && -f "${rule_md}" ]]; then
      echo "## Rule handbook"
      echo ""
      cat "${rule_md}"
      echo ""
    fi
    echo "## Structured findings (${findings_count})"
    echo ""
    echo '```json'
    echo "${findings_json}" | jq '.' 2>/dev/null || echo "${findings_json}"
    echo '```'
    echo ""
    if [[ -f "${rule_dir}/audit-report.md" ]]; then
      echo "## Audit report excerpt"
      echo ""
      head -n 80 "${rule_dir}/audit-report.md"
      echo ""
    fi
  } >"${prompt}"

  cat >"${plan}" <<EOF
---
name: "Learn 101 — ${rule_id}"
overview: "Single-rule remediation for ${PAGE_HTML} (${findings_count} finding(s))."
generated_at: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
todos:
  - id: ux-00
    content: "Read remediation.prompt.md and OWNERSHIP.md; follow forge-ux-remediation-plan-runner.mdc; fix at root-cause layer; rebuild with python3 generator/build-site.py; scope to ${PAGE_HTML} only."
    status: pending
isProject: true
---

# ${rule_id} — Learn 101

See \`${prompt}\` in this folder.
EOF
}

remediate_rule() {
  local rule_dir="$1"
  local plan="${rule_dir}/forge-ux-remediation.plan.md"
  export FORGE_UX_REMEDIATION_AGENT_LOG="${rule_dir}/remediation-agent.log"
  log "product agent → ${plan}"
  log "transcript → ${FORGE_UX_REMEDIATION_AGENT_LOG}"
  (cd "${REPO_ROOT}" && bash "${RUN_PLAN}" "${REPO_ROOT}" "${plan}")
}

build_agent_meta_prompt() {
  local rule_dir="$1"
  local rule_id="$2"
  local findings_json="$3"
  local out_prompt="${rule_dir}/agent-meta.prompt.md"
  local proposal="${rule_dir}/agent-improvement-proposal.md"
  local findings_path="${rule_dir}/findings-for-meta.json"
  local rule_md
  rule_md="$(rule_page_md "${rule_id}")"
  local handbook_path="${rule_md:-n/a}"

  if [[ ! -f "${META_TEMPLATE}" ]]; then
    echo "invoke-learn-101: missing meta template ${META_TEMPLATE}" >&2
    return 1
  fi

  printf '%s\n' "${findings_json}" >"${findings_path}"

  sed \
    -e "s|{{RULE_ID}}|${rule_id}|g" \
    -e "s|{{PAGE_URL}}|${PAGE_URL}|g" \
    -e "s|{{PAGE_HTML}}|${PAGE_HTML}|g" \
    -e "s|{{OUT_DIR}}|${OUT_DIR}|g" \
    -e "s|{{RULE_DIR}}|${rule_dir}|g" \
    -e "s|{{OWNERSHIP_PATH}}|${BASELINE_OWN}|g" \
    -e "s|{{RULE_HANDBOOK_PATH}}|${handbook_path}|g" \
    -e "s|{{PROPOSAL_PATH}}|${proposal}|g" \
    -e "s|{{FINDINGS_JSON_PATH}}|${findings_path}|g" \
    "${META_TEMPLATE}" >"${out_prompt}"
  echo "${out_prompt}"
}

run_meta_agent() {
  local rule_dir="$1"
  local rule_id="$2"
  local findings_json="$3"

  if [[ "${FORGE_UX_LEARN101_SKIP_META_AGENT:-}" == "1" ]]; then
    echo "invoke-learn-101: ${rule_id} meta-agent skipped (FORGE_UX_LEARN101_SKIP_META_AGENT=1)" >&2
    return 0
  fi

  local meta_prompt
  meta_prompt="$(build_agent_meta_prompt "${rule_dir}" "${rule_id}" "${findings_json}")" || return 1

  export FORGE_UX_LEARN101_META_AGENT_LOG="${rule_dir}/meta-agent.log"
  echo "invoke-learn-101: ${rule_id} meta-agent (one shot) → ${FORGE_UX_LEARN101_META_AGENT_LOG}" >&2
  set +e
  bash "${RUN_META}" "${meta_prompt}"
  local meta_rc=$?
  set -e
  return "${meta_rc}"
}

record_agent_failure_row() {
  local rule_id="$1"
  local findings_count="$2"
  local agent_attempts="$3"
  local evidence="$4"
  local rule_dir="$5"
  local proposal="${rule_dir}/agent-improvement-proposal.md"
  local meta_log="${rule_dir}/meta-agent.log"
  printf '| %s | %s | %s | %s | %s | %s |\n' \
    "${rule_id}" "${findings_count}" "${agent_attempts}" "${evidence}" \
    "$( [[ -f "${proposal}" ]] && echo "rules/${rule_id}/agent-improvement-proposal.md" || echo "—" )" \
    "$( [[ -f "${meta_log}" ]] && echo "rules/${rule_id}/meta-agent.log" || echo "—" )" \
    >>"${AGENT_FAILURES_MD}.tmp"
}

# Build DET rule list (implemented, sorted by priorityWeight desc)
mapfile -t DET_RULES < <(jq -r '
  .deterministicRules
  | map(select(.status=="implemented" and .modulePath))
  | sort_by(-(.priorityWeight // 0))
  | .[].id
' "${REGISTRY}")

SHARED_CHECK_DIR="${OUT_DIR}/shared-check"
if [[ "${SHARED_BASELINE_ONLY}" -eq 1 ]]; then
  echo "invoke-learn-101: shared baseline only" >&2
  run_analyze "${SHARED_CHECK_DIR}" || true
  log "shared baseline → ${SHARED_CHECK_DIR}"
  exit 0
fi

if [[ -n "${FORGE_UX_LEARN101_SKIP_BASELINE:-}" && -f "${SHARED_CHECK_DIR}/ux-audit-rule-page-trace.json" ]]; then
  log "skip baseline audit (FORGE_UX_LEARN101_SKIP_BASELINE=1)"
else
  echo "invoke-learn-101: baseline shared audit for DET rules" >&2
  run_analyze "${SHARED_CHECK_DIR}" || true
fi

started=0
for rule_id in "${DET_RULES[@]}"; do
  [[ -z "${rule_id}" ]] && continue
  if [[ -n "${ONLY_RULE}" && "${rule_id}" != "${ONLY_RULE}" ]]; then
    continue
  fi
  if [[ -n "${FROM_RULE}" && "${started}" -eq 0 ]]; then
    if [[ "${rule_id}" == "${FROM_RULE}" ]]; then
      started=1
    else
      continue
    fi
  else
    started=1
  fi

  if [[ "${rule_id}" == "DET.THEME.FONT_STACK" ]]; then
    append_state "$(jq -nc --arg r "${rule_id}" --arg s "blocked" --arg n "stub" --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
      '{ruleId:$r,lane:"deterministic",status:$s,findingsCount:0,agentAttempts:0,metaAgentRan:false,note:$n,ts:$ts}')"
    echo "invoke-learn-101: ${rule_id} stub — skip" >&2
    continue
  fi

  rule_dir="${OUT_DIR}/rules/${rule_id}"
  echo "invoke-learn-101: [DET] ${rule_id}" >&2

  attempt=0
  agent_attempts=0
  agent_exit_code=0
  meta_agent_ran=false
  final_status="pass"
  final_count=0
  last_evidence=""

  while [[ "${attempt}" -lt "${MAX_ATTEMPTS}" ]]; do
    attempt=$((attempt + 1))
    use_shared_sync=0
    if [[ "${attempt}" -eq 1 && -f "${SHARED_CHECK_DIR}/ux-audit-rule-page-trace.json" ]]; then
      if [[ "${FORGE_UX_LEARN101_PER_RULE_AUDIT:-}" != "1" ]]; then
        use_shared_sync=1
      else
        log "rule ${rule_id}: per-rule audit (FORGE_UX_LEARN101_PER_RULE_AUDIT=1)"
      fi
    fi
    if [[ "${use_shared_sync}" -eq 1 ]]; then
      sync_rule_audit_artifacts "${rule_dir}" "${SHARED_CHECK_DIR}"
    else
      run_analyze "${rule_dir}" || true
      sync_rule_audit_artifacts "${rule_dir}" "${rule_dir}"
    fi

    IFS='|' read -r fc _status _rest <<<"$(parse_trace_for_rule "${rule_dir}" "${rule_id}")"
    fc="${fc:-0}"
    audit_fc="$(audit_findings_for_rule "${rule_dir}/audit-data.json" "${rule_id}")"
    if [[ "${audit_fc}" -gt "${fc}" ]]; then
      fc="${audit_fc}"
    fi
    final_count="${fc}"
    last_evidence="$(last_finding_evidence_for_rule "${rule_dir}/audit-data.json" "${rule_id}")"

    if [[ "${fc}" -eq 0 && "${SMOKE_AGENT}" -eq 0 ]]; then
      final_status="pass"
      log "rule ${rule_id}: pass (findings=0)"
      break
    fi
    log "rule ${rule_id}: trace findings=${fc} evidence=${last_evidence}"
    if [[ "${fc}" -eq 0 && "${SMOKE_AGENT}" -eq 1 ]]; then
      log "rule ${rule_id}: --smoke-agent — running agent pipeline despite findings=0"
    fi

    if [[ "${SKIP_CURSOR_AGENT:-}" == "1" ]]; then
      final_status="blocked"
      break
    fi

    log "rule ${rule_id}: findings=${fc} attempt=${attempt}/${MAX_ATTEMPTS} → write plan + agent"
    write_rule_plan "${rule_dir}" "${rule_id}" "${fc}"
    agent_attempts=$((agent_attempts + 1))
    set +e
    remediate_rule "${rule_dir}"
    agent_exit_code=$?
    set -e
    log "rule ${rule_id}: agent exit=${agent_exit_code}; rebuild site"
    (cd "${REPO_ROOT}" && python3 generator/build-site.py) >&2

    if [[ "${agent_exit_code}" -ne 0 ]]; then
      final_status="remediation_error"
    else
      final_status="fail"
    fi
  done

  if [[ "${fc}" -gt 0 && "${final_status}" == "pass" ]]; then
    final_status="fail"
  fi

  if [[ "${fc}" -gt 0 && "${final_status}" == "blocked" ]]; then
    :
  elif [[ "${fc}" -eq 0 && "${SMOKE_AGENT}" -eq 1 && "${agent_attempts}" -gt 0 ]]; then
    final_status="smoke_agent_ok"
    log "rule ${rule_id}: smoke-agent pipeline finished (findings still 0)"
  elif [[ "${agent_attempts}" -gt 0 && "${fc}" -gt 0 ]]; then
    if [[ "${final_status}" != "remediation_error" ]]; then
      final_status="agent_exhausted"
    fi
    findings_json="$(audit_findings_json_for_rule "${rule_dir}/audit-data.json" "${rule_id}")"
    if [[ "${FORGE_UX_LEARN101_SKIP_META_AGENT:-}" != "1" ]]; then
      run_meta_agent "${rule_dir}" "${rule_id}" "${findings_json}" || true
      meta_agent_ran=true
    fi
    record_agent_failure_row "${rule_id}" "${final_count}" "${agent_attempts}" "${last_evidence}" "${rule_dir}"
  elif [[ "${fc}" -gt 0 ]]; then
    final_status="fail"
  fi

  note=""
  if [[ "${final_status}" == "blocked" ]]; then
    note="check-only; findings remain; no agent run"
  fi

  append_state "$(jq -nc \
    --arg r "${rule_id}" \
    --arg s "${final_status}" \
    --arg u "${PAGE_URL}" \
    --arg n "${note}" \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg mel "${rule_dir}/meta-agent.log" \
    --argjson c "${final_count}" \
    --argjson a "${attempt}" \
    --argjson aa "${agent_attempts}" \
    --argjson aec "${agent_exit_code}" \
    --argjson mar "${meta_agent_ran}" \
    '{
      ruleId: $r,
      lane: "deterministic",
      status: $s,
      findingsCount: $c,
      attempts: $a,
      agentAttempts: $aa,
      agentExitCode: $aec,
      metaAgentRan: $mar,
      metaAgentLog: (if $mar then $mel else null end),
      ts: $ts,
      page: { url: $u }
    }
    + (if $n != "" then { note: $n } else {} end)')"

  if [[ "${final_status}" != "pass" && "${final_status}" != "blocked" ]]; then
    echo "invoke-learn-101: ${rule_id} → ${final_status} (findings=${final_count}, agentAttempts=${agent_attempts})" >&2
  fi
done

if [[ "${INCLUDE_AI}" -eq 1 ]]; then
  shared_ai_out="${OUT_DIR}/ai-pass"
  run_analyze "${shared_ai_out}" || true

  if [[ "${SKIP_CURSOR_AGENT:-}" != "1" ]]; then
    export FORGE_UX_FORCE_AI_AUDIT=1
    export FORGE_UX_AI_AUDIT_BATCH_SIZE=1
    (cd "${REPO_ROOT}" && bash "${RUN_AI}" "${REPO_ROOT}" "${shared_ai_out}" "${STANDARD}") || true
  fi

  mapfile -t AI_RULES < <(jq -r '.aiRules[].id' "${REGISTRY}")
  for rule_id in "${AI_RULES[@]}"; do
    [[ -z "${rule_id}" ]] && continue
    if [[ -n "${ONLY_RULE}" && "${rule_id}" != "${ONLY_RULE}" ]]; then
      continue
    fi
    append_state "$(jq -nc --arg r "${rule_id}" --arg s "advisory" --arg u "${PAGE_URL}" \
      --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
      '{ruleId:$r,lane:"ai",status:$s,findingsCount:0,agentAttempts:0,metaAgentRan:false,note:"see ai-audit/ artifacts",ts:$ts,page:{url:$u}}')"
    echo "invoke-learn-101: [AI] ${rule_id} advisory" >&2
  done
fi

if [[ -n "${FORGE_UX_LEARN101_SKIP_FINALIZE:-}" ]]; then
  log "skip finalize (FORGE_UX_LEARN101_SKIP_FINALIZE=1)"
  exit 0
fi

# AGENT-FAILURES.md
pass_n=0
agent_exhausted_n=0
remediation_error_n=0
blocked_n=0
fail_n=0
if [[ -f "${STATE_JSONL}" ]]; then
  pass_n="$(jq -s '[.[] | select(.status == "pass")] | length' "${STATE_JSONL}")"
  agent_exhausted_n="$(jq -s '[.[] | select(.status == "agent_exhausted")] | length' "${STATE_JSONL}")"
  remediation_error_n="$(jq -s '[.[] | select(.status == "remediation_error")] | length' "${STATE_JSONL}")"
  blocked_n="$(jq -s '[.[] | select(.status == "blocked")] | length' "${STATE_JSONL}")"
  fail_n="$(jq -s '[.[] | select(.status == "fail" or .status == "fail_no_agent")] | length' "${STATE_JSONL}")"
fi

agent_failure_total=$((agent_exhausted_n + remediation_error_n))
if [[ "${agent_failure_total}" -gt 0 ]]; then
  {
    echo "# Learn 101 — agent failures"
    echo ""
    echo "Rules where the product remediation agent did not clear findings. Meta-agent ran once per row (unless \`FORGE_UX_LEARN101_SKIP_META_AGENT=1\`)."
    echo ""
    echo "| Rule | Findings | Agent attempts | Last evidence | Proposal | Meta log |"
    echo "|------|----------|----------------|---------------|----------|----------|"
  } >"${AGENT_FAILURES_MD}"
  if [[ -f "${AGENT_FAILURES_MD}.tmp" ]]; then
    cat "${AGENT_FAILURES_MD}.tmp" >>"${AGENT_FAILURES_MD}"
    rm -f "${AGENT_FAILURES_MD}.tmp"
  fi
  {
    echo ""
    echo "## Recommended prompt/runner changes"
    echo ""
    for rule_id in "${DET_RULES[@]}"; do
      proposal="${OUT_DIR}/rules/${rule_id}/agent-improvement-proposal.md"
      if [[ -f "${proposal}" ]]; then
        echo "### ${rule_id}"
        echo ""
        sed -n '1,40p' "${proposal}"
        echo ""
      fi
    done
    echo "## Re-run"
    echo ""
    echo "\`\`\`bash"
    echo "bash ${TESTS_ROOT}/invoke-learn-101-per-rule-loop.sh"
    echo "\`\`\`"
  } >>"${AGENT_FAILURES_MD}"
fi

{
  echo "# Learn 101 rule loop summary"
  echo ""
  echo "- **OUT_DIR:** ${OUT_DIR}"
  echo "- **PAGE_URL:** ${PAGE_URL}"
  echo "- **mode:** $( [[ "${CHECK_ONLY}" -eq 1 ]] && echo check-only || echo full-agent )"
  echo "- **pass:** ${pass_n}"
  echo "- **agent_exhausted:** ${agent_exhausted_n}"
  echo "- **remediation_error:** ${remediation_error_n}"
  echo "- **blocked:** ${blocked_n}"
  echo "- **fail:** ${fail_n}"
  echo ""
  if [[ -f "${AGENT_FAILURES_MD}" ]]; then
    echo "Agent failures: [AGENT-FAILURES.md](AGENT-FAILURES.md)"
    echo ""
  fi
  echo "See \`state.jsonl\` for per-rule rows."
} >"${OUT_DIR}/SUMMARY.md"

if [[ -f "${OUT_DIR}/rules/${DET_RULES[0]}/audit-data.json" ]]; then
  node "${GATE}" "${OUT_DIR}/rules/${DET_RULES[0]}/audit-data.json" --check 2>/dev/null || true
fi

log "campaign complete → ${OUT_DIR}/SUMMARY.md"
if [[ "${SKIP_CURSOR_AGENT:-}" == "1" ]]; then
  COVERAGE_SCRIPT="${TESTS_ROOT}/analyze-learn-101-det-coverage.mjs"
  if [[ -f "${COVERAGE_SCRIPT}" ]]; then
    log "DET coverage report → analyze-learn-101-det-coverage.mjs"
    LEARN_101_PAGE_URL="${PAGE_URL}" node "${COVERAGE_SCRIPT}" "${OUT_DIR}" >&2 || true
  fi
fi
if [[ "${agent_failure_total}" -eq 0 && "${SKIP_CURSOR_AGENT:-}" != "1" ]]; then
  log "no agent failures (product agent runs only when findingsCount > 0)"
fi
echo "invoke-learn-101: done → ${OUT_DIR}/SUMMARY.md" >&2
if [[ "${agent_failure_total}" -gt 0 ]]; then
  echo "invoke-learn-101: agent failures → ${AGENT_FAILURES_MD}" >&2
  exit 1
fi
if [[ "${fail_n}" -gt 0 ]]; then
  log "exit 1: ${fail_n} rule(s) with status fail"
  exit 1
fi
log "exit 0: campaign success"
