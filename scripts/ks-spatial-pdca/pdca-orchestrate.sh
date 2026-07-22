#!/usr/bin/env bash
# KS spatial effects PDCA — wave orchestrator.
#
# Usage:
#   ./scripts/ks-spatial-pdca/pdca-orchestrate.sh <wave-foundation|wave-components|plan-only>
#
# Env:
#   KS_SPATIAL_PDCA_AUTO_APPROVE   0 = require manual approve between plan and do
#   KS_SPATIAL_PDCA_PLAN_ONLY      1 = run plan step only per phase (smoke / dry)
#   KS_SPATIAL_PDCA_SKIP_DO        1 = plan (+ approve) only, no do/check

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNNER="${SCRIPT_DIR}/pdca-run-phase.sh"
LEDGER="${SCRIPT_DIR}/pdca-ledger.md"
SEQUENCE="${SCRIPT_DIR}/SEQUENCE.yaml"

WAVE="${1:-}"

usage() {
  echo "usage: $0 <wave-foundation|wave-components|plan-only>" >&2
  exit 1
}

[[ -n "${WAVE}" ]] || usage

resolve_phases() {
  case "$1" in
    wave-foundation) echo "S00 S01 S02" ;;
    wave-components) echo "S03 S04 S05 S06 S07 S08 S09 S10 S11 S12 S13 S14 S15 S16 S17 S18 S19 S20 S21 S22" ;;
    plan-only) echo "S00 S01 S02 S03 S04 S05 S06 S07 S08 S09 S10 S11 S12 S13 S14 S15 S16 S17 S18 S19 S20 S21 S22" ;;
    *) echo "unknown wave: $1" >&2; return 1 ;;
  esac
}

log_ledger() {
  local phase="$1"
  local status="$2"
  local note="${3:-}"
  printf '| %s | %s | %s | %s |\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "${phase}" "${status}" "${note}" >> "${LEDGER}"
}

run_phase_loop() {
  local phase="$1"
  echo ""
  echo "========== Phase ${phase} =========="

  if ! "${RUNNER}" "${phase}" plan; then
    log_ledger "${phase}" "PLAN_FAIL" "agent unavailable or plan failed"
    if [[ "${KS_SPATIAL_PDCA_PLAN_ONLY:-0}" == "1" ]]; then
      echo "plan-only: continuing after plan failure for smoke"
      return 0
    fi
    return 1
  fi
  log_ledger "${phase}" "PLAN_OK" ""

  if [[ "${KS_SPATIAL_PDCA_AUTO_APPROVE:-0}" == "1" ]]; then
    "${RUNNER}" "${phase}" approve
    log_ledger "${phase}" "APPROVED" "auto"
  else
    echo "Review plan at scripts/ks-spatial-pdca/runs/${phase}/latest/plan.md"
    echo "Then: ./scripts/ks-spatial-pdca/pdca-run-phase.sh ${phase} approve"
    if [[ "${KS_SPATIAL_PDCA_PLAN_ONLY:-0}" == "1" || "${KS_SPATIAL_PDCA_SKIP_DO:-0}" == "1" ]]; then
      log_ledger "${phase}" "PLAN_ONLY" "awaiting approve"
      return 0
    fi
    echo "Refusing do without KS_SPATIAL_PDCA_AUTO_APPROVE=1 — stopping wave after plan."
    log_ledger "${phase}" "AWAIT_APPROVE" ""
    return 0
  fi

  if [[ "${KS_SPATIAL_PDCA_SKIP_DO:-0}" == "1" ]]; then
    return 0
  fi

  "${RUNNER}" "${phase}" do || { log_ledger "${phase}" "DO_FAIL" ""; return 1; }
  log_ledger "${phase}" "DO_OK" ""

  if "${RUNNER}" "${phase}" check; then
    log_ledger "${phase}" "CHECK_GREEN" ""
    return 0
  fi

  local max="${KS_SPATIAL_PDCA_MAX_ACT:-3}"
  local attempt=0
  while [[ "${attempt}" -lt "${max}" ]]; do
    attempt=$((attempt + 1))
    echo "Act attempt ${attempt}/${max} for ${phase}"
    if "${RUNNER}" "${phase}" act; then
      log_ledger "${phase}" "CHECK_GREEN" "after act ${attempt}"
      return 0
    fi
  done
  log_ledger "${phase}" "CHECK_FAIL" "max act retries"
  return 1
}

PHASES="$(resolve_phases "${WAVE}")"
echo "Wave: ${WAVE}"
echo "Phases: ${PHASES}"
echo "Sequence: ${SEQUENCE}"

for p in ${PHASES}; do
  run_phase_loop "${p}" || exit 1
done

if [[ "${WAVE}" == "wave-components" ]]; then
  echo ""
  echo "All component phases complete. Optional consumer propagation:"
  echo "  cd /path/to/Code && ./sync-kitchensink-and-rebuild.sh"
fi

echo "Wave ${WAVE} complete."
