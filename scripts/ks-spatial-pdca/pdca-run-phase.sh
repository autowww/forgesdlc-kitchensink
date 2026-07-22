#!/usr/bin/env bash
# KS spatial effects PDCA harness — run one phase step at a time.
#
# Usage:
#   ./scripts/ks-spatial-pdca/pdca-run-phase.sh <phase> <plan|do|check|act|approve|status>
#
# Examples:
#   ./scripts/ks-spatial-pdca/pdca-run-phase.sh S00 plan
#   ./scripts/ks-spatial-pdca/pdca-run-phase.sh S05 approve
#   ./scripts/ks-spatial-pdca/pdca-run-phase.sh S05 do
#
# Env:
#   KS_SPATIAL_PDCA_MODEL          Do/Act model (default composer-2.5)
#   KS_SPATIAL_PDCA_PLAN_MODEL     Plan model (default composer-2.5)
#   KS_SPATIAL_PDCA_MAX_ACT        Max Act retries (default 3)
#   KS_SPATIAL_PDCA_FORCE          Set 1 to pass --force to agent do/act
#   KS_SPATIAL_SHOWCASE_URL        Base URL for showcase checks (optional)
#   CURSOR_API_KEY                 Non-interactive CLI auth

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PROMPTS_ROOT="${REPO_ROOT}/docs/prompts/ks-spatial-pdca"
SEQUENCE="${SCRIPT_DIR}/SEQUENCE.yaml"
RUNS_ROOT="${SCRIPT_DIR}/runs"

PHASE="${1:-}"
STEP="${2:-}"

usage() {
  sed -n '2,12p' "$0"
  exit 1
}

[[ -n "${PHASE}" && -n "${STEP}" ]] || usage

valid_phase() {
  case "${PHASE}" in
    S[0-9][0-9])
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

valid_phase || { echo "Unknown phase: ${PHASE}" >&2; exit 1; }

phase_meta() {
  local key="$1"
  local line
  line="$(awk -v p="${PHASE}" -v k="${key}" '
    $0 ~ "^  " p ":$" { found=1; next }
    found && $0 ~ "^  S[0-9][0-9]:$" { exit }
    found && $0 ~ "^    " k ":" {
      sub(/^    [^:]+: */, "")
      gsub(/^"|"$/, "")
      print
      exit
    }
  ' "${SEQUENCE}")"
  echo "${line}"
}

resolve_prompt_file() {
  case "${PHASE}" in
    S00) echo "${PROMPTS_ROOT}/S00-architecture-spike.md" ;;
    S01) echo "${PROMPTS_ROOT}/S01-dual-wiki-spike.md" ;;
    S02) echo "${PROMPTS_ROOT}/S02-harness-spike.md" ;;
    S23) echo "${PROMPTS_ROOT}/S00-architecture-spike.md" ;;
    S03|S04|S05|S06|S07|S08|S09|S10|S11|S12|S13|S14|S15|S16|S17|S18|S19|S20|S21|S22|S23|S24|S25|S26|S27|S28|S29|S30|S31|S32|S33|S34|S35|S36|S37|S38|S39|S40|S41|S42|S43|S44|S45|S46|S47|S48|S49|S50|S51|S52|S53|S54|S55|S56|S57|S58|S59|S60|S61|S62|S63|S64|S65|S66|S67)
      echo "${PROMPTS_ROOT}/S03-component-phase.md"
      ;;
    *) echo "Unknown phase: ${PHASE}" >&2; return 1 ;;
  esac
}

phase_run_dir() {
  echo "${RUNS_ROOT}/${PHASE}"
}

utc_stamp() {
  date -u +%Y%m%dT%H%M%SZ
}

ensure_run_dir() {
  mkdir -p "$(phase_run_dir)"
}

gate_file() {
  echo "$(phase_run_dir)/gate.json"
}

session_file() {
  echo "$(phase_run_dir)/session.id"
}

foundation_docs_only() {
  case "${PHASE}" in
    S00|S01) return 0 ;;
    *) return 1 ;;
  esac
}

build_agent_prompt() {
  local mode="$1"
  local prompt_file
  prompt_file="$(resolve_prompt_file "${PHASE}")"
  local master_plan="${REPO_ROOT}/.cursor/plans/ks-spatial-effects/00-master-sequence.md"
  local title hash slug kind
  title="$(phase_meta title)"
  hash="$(phase_meta hash)"
  slug="$(phase_meta slug)"
  kind="$(phase_meta kind)"

  cat <<EOF
Repository root: ${REPO_ROOT}
Phase: ${PHASE}
Phase title: ${title}
Phase kind: ${kind}
Component hash: ${hash}
Component slug: ${slug}
PDCA step: ${mode}
Sequence: ${SEQUENCE}

Read and follow:
- ${master_plan}
- ${prompt_file}

Write outputs under: $(phase_run_dir)/$(utc_stamp)/

For Plan: produce plan.md with assumptions, files to touch, acceptance criteria, test plan, and rollback note.
Stop at phase boundary; one commit increment per phase in forgesdlc-kitchensink only.

Governance:
- No Fleet-specific UX auditor profile (Fleet may appear only as a generic regression fixture).
- analyze-website-ux.mjs and score-website-ux.mjs must not call each other.
- Spatial verifier is separate from UX auditor/scorer.

$(if foundation_docs_only && [[ "${mode}" == "plan" || "${mode}" == "do" ]]; then
  if [[ "${PHASE}" == "S00" ]]; then
    echo "CRITICAL (S00): Focus on css/ks-spatial.css, js/ks-pointer-depth.js, tilt refactor, tokens, and fallbacks. Do not implement all 20 component demos yet."
  else
    echo "CRITICAL (S01): Focus on docs/design/spatial/, ORACLE-SCHEMA, showcase hub, hash allocation. Scaffold oracles; full component implementation belongs in S03+."
  fi
fi)

$(if [[ "${kind}" == "component" && ( "${mode}" == "plan" || "${mode}" == "do" ) ]]; then
  cat <<INNER
Component phase ${PHASE} (${hash} / ${slug}):
- Implement render_* emitter, CSS/JS, design contract, maintainer doc, oracle JSON, showcase section.
- Oracle scenarios must match docs/design/spatial/effects/${slug}.md.
- Run gate: ./scripts/ks-spatial-pdca/check-phase-gate.sh ${PHASE}
INNER
fi)

$(if [[ "${mode}" == "do" ]]; then
  echo "Implement only the approved plan at $(phase_run_dir)/latest/plan.md. Stop at phase boundary."
  echo "After code changes run: ./scripts/ks-spatial-pdca/check-phase-gate.sh ${PHASE}"
fi)

$(if [[ "${mode}" == "act" ]]; then
  echo "Check failed. Read $(phase_run_dir)/check.log and fix only what is required to pass check. Do not expand scope."
fi)
EOF
}

run_agent() {
  local agent_mode="$1"
  local log_file="$2"
  shift 2
  if ! command -v agent >/dev/null 2>&1; then
    echo "agent CLI not found; write deliverables manually to $(phase_run_dir)/" >&2
    return 2
  fi
  local extra=()
  if [[ "${agent_mode}" == "plan" ]]; then
    extra=(--mode plan)
  fi
  local model="${KS_SPATIAL_PDCA_PLAN_MODEL:-composer-2.5}"
  if [[ "${agent_mode}" == "do" || "${agent_mode}" == "act" ]]; then
    model="${KS_SPATIAL_PDCA_MODEL:-composer-2.5}"
  fi
  extra+=(--model "${model}")
  if [[ "${KS_SPATIAL_PDCA_FORCE:-0}" == "1" && "${agent_mode}" != "plan" ]]; then
    extra+=(--force)
  fi
  if [[ -f "$(session_file)" && "${agent_mode}" == "act" ]]; then
    local sid
    sid="$(cat "$(session_file)")"
    extra+=(--resume "${sid}")
  fi
  set +e
  agent -p --trust "${extra[@]}" "$@" 2>&1 | tee "${log_file}"
  local rc=${PIPESTATUS[0]}
  set -e
  return "${rc}"
}

write_gate() {
  local approved="$1"
  local note="${2:-}"
  ensure_run_dir
  printf '{"phase":"%s","approved":%s,"at":"%s","note":"%s"}\n' \
    "${PHASE}" "${approved}" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "${note}" > "$(gate_file)"
}

cd "${REPO_ROOT}"
ensure_run_dir

case "${STEP}" in
  plan)
    STAMP="$(utc_stamp)"
    RUN_DIR="$(phase_run_dir)/${STAMP}"
    mkdir -p "${RUN_DIR}"
    LOG="${RUN_DIR}/plan-agent.log"
    PROMPT="$(build_agent_prompt plan)"
    echo "${PROMPT}" > "${RUN_DIR}/plan-prompt.txt"
    if run_agent plan "${LOG}" "${PROMPT}"; then
      cp "${LOG}" "${RUN_DIR}/plan.md" 2>/dev/null || true
      ln -sfn "${STAMP}" "$(phase_run_dir)/latest"
      echo "Plan logged: ${LOG}"
      echo "Prompt assembly: ${RUN_DIR}/plan-prompt.txt"
    else
      echo "Agent plan failed or unavailable; create ${RUN_DIR}/plan.md manually." >&2
      echo "Prompt saved for manual run: ${RUN_DIR}/plan-prompt.txt"
      exit 2
    fi
    ;;
  approve)
    write_gate true "operator approved"
    echo "Gate approved: $(gate_file)"
    ;;
  do)
    if [[ ! -f "$(gate_file)" ]] || ! grep -q '"approved":true' "$(gate_file)" 2>/dev/null; then
      echo "Refusing do: run 'approve' after reviewing plan (gate.json missing or not approved)." >&2
      exit 1
    fi
    STAMP="$(utc_stamp)"
    RUN_DIR="$(phase_run_dir)/${STAMP}"
    mkdir -p "${RUN_DIR}"
    LOG="${RUN_DIR}/do-agent.log"
    PROMPT="$(build_agent_prompt do)"
    run_agent do "${LOG}" "${PROMPT}" || exit $?
    ln -sfn "${STAMP}" "$(phase_run_dir)/latest"
    ;;
  check)
    LOG="$(phase_run_dir)/check.log"
    "${SCRIPT_DIR}/check-phase-gate.sh" "${PHASE}" 2>&1 | tee "${LOG}"
    rc=${PIPESTATUS[0]}
    if [[ ${rc} -eq 0 ]]; then
      write_gate true "check passed $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    fi
    exit "${rc}"
    ;;
  act)
    MAX="${KS_SPATIAL_PDCA_MAX_ACT:-3}"
    ATTEMPT_FILE="$(phase_run_dir)/act-attempts"
    n=0
    [[ -f "${ATTEMPT_FILE}" ]] && n="$(cat "${ATTEMPT_FILE}")"
    if [[ "${n}" -ge "${MAX}" ]]; then
      echo "Max Act retries (${MAX}) reached for phase ${PHASE}." >&2
      exit 1
    fi
    echo $((n + 1)) > "${ATTEMPT_FILE}"
    STAMP="$(utc_stamp)"
    RUN_DIR="$(phase_run_dir)/${STAMP}"
    mkdir -p "${RUN_DIR}"
    LOG="${RUN_DIR}/act-agent.log"
    PROMPT="$(build_agent_prompt act)"
    run_agent act "${LOG}" "${PROMPT}" || true
    "${SCRIPT_DIR}/pdca-run-phase.sh" "${PHASE}" check
    ;;
  status)
    echo "Phase: ${PHASE}"
    echo "Title: $(phase_meta title)"
    echo "Hash: $(phase_meta hash)"
    echo "Prompt: $(resolve_prompt_file "${PHASE}" 2>/dev/null || echo unknown)"
    echo "Gate: $(gate_file)"
    [[ -f "$(gate_file)" ]] && cat "$(gate_file)" || echo "(no gate)"
    echo "Latest run: $(phase_run_dir)/latest"
    ls -la "$(phase_run_dir)" 2>/dev/null | tail -10 || true
    ;;
  *)
    usage
    ;;
esac
