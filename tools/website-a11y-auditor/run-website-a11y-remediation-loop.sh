#!/usr/bin/env bash
# A11y remediation loop: audit → fixers → AI audit (optional) → plan → agent → re-audit.
#
# Usage:
#   ./run-website-a11y-remediation-loop.sh REPO_ROOT SITE_URL_OR_FIXTURE_DIR
#
# Env:
#   FORGE_A11Y_OUT_DIR / UX_AUDIT_OUT_DIR     Campaign output directory
#   FORGE_A11Y_STANDARD=wcag21aa
#   FORGE_A11Y_FIXERS=1 | FORGE_A11Y_SKIP_FIXERS=1 | FORGE_A11Y_FIXERS_ONLY=1
#   FORGE_A11Y_SKIP_AI_AGENT=1 (default) | FORGE_A11Y_ENABLE_AI_AUDIT=1
#   FORGE_A11Y_SKIP_CURSOR_AGENT=1 (default) | SKIP_CURSOR_AGENT=1
#   FORGE_A11Y_REMEDIATION_AGENT_LOG             Tee agent transcript (default: OUT_DIR/remediation-agent.log)
#   FORGE_A11Y_LOOP_POST_AGENT_BUILD=1           Run generator/build-site.py after agent when present

set -euo pipefail

TOOL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KS_ROOT="$(cd "${TOOL_DIR}/../.." && pwd)"

if [[ -z "${FORGE_A11Y_AUDIT_WORKBENCH_ROOT:-}" ]]; then
  _probe="${TOOL_DIR}"
  while [[ "${_probe}" != "/" ]]; do
    if [[ "$(basename "${_probe}")" == "Code" ]]; then
      FORGE_A11Y_AUDIT_WORKBENCH_ROOT="${_probe}/workbench/a11y-auditor"
      break
    fi
    _probe="$(dirname "${_probe}")"
  done
  export FORGE_A11Y_AUDIT_WORKBENCH_ROOT="${FORGE_A11Y_AUDIT_WORKBENCH_ROOT:-${TMPDIR:-/tmp}/forge-a11y-workbench}"
fi

REPO_ROOT="${1:-}"
SITE="${2:-}"
STANDARD="${FORGE_A11Y_STANDARD:-wcag21aa}"
FIXERS="${FORGE_A11Y_FIXERS:-1}"
SKIP_FIXERS="${FORGE_A11Y_SKIP_FIXERS:-0}"
FIXERS_ONLY="${FORGE_A11Y_FIXERS_ONLY:-0}"
SKIP_AI="${FORGE_A11Y_SKIP_AI_AGENT:-1}"
if [[ "${FORGE_A11Y_ENABLE_AI_AUDIT:-0}" == "1" ]]; then
  SKIP_AI=0
fi
SKIP_AGENT="${FORGE_A11Y_SKIP_CURSOR_AGENT:-1}"
if [[ "${SKIP_CURSOR_AGENT:-0}" == "1" ]]; then
  SKIP_AGENT=1
fi
POST_AGENT_BUILD="${FORGE_A11Y_LOOP_POST_AGENT_BUILD:-1}"

RUN_PLAN_BIN="${FORGE_A11Y_RUN_PLAN_BIN:-${TOOL_DIR}/cursor-agent-run-a11y-plan.sh}"
GEN_PLAN_BIN="${FORGE_A11Y_GEN_PLAN_BIN:-${TOOL_DIR}/generate-a11y-remediation-plan.mjs}"

if [[ -z "${REPO_ROOT}" || -z "${SITE}" ]]; then
  echo "usage: $0 REPO_ROOT SITE_URL_OR_FIXTURE" >&2
  exit 2
fi

REPO_ROOT="$(cd "${REPO_ROOT}" && pwd)"
slug="$(basename "${REPO_ROOT}")"
if [[ -n "${FORGE_A11Y_OUT_DIR:-}" ]]; then
  OUT_DIR="$(mkdir -p "${FORGE_A11Y_OUT_DIR}" && cd "${FORGE_A11Y_OUT_DIR}" && pwd)"
elif [[ -n "${UX_AUDIT_OUT_DIR:-}" ]]; then
  OUT_DIR="$(mkdir -p "${UX_AUDIT_OUT_DIR}" && cd "${UX_AUDIT_OUT_DIR}" && pwd)"
else
  RUN_TAG="$(date -u +%Y%m%dT%H%M%SZ)_$$"
  OUT_DIR="${FORGE_A11Y_AUDIT_WORKBENCH_ROOT}/a11y-audit/${slug}/${RUN_TAG}"
  mkdir -p "${OUT_DIR}"
fi

AUDIT_DATA="${OUT_DIR}/a11y-audit-data.json"
FIXER_REPORT="${OUT_DIR}/deterministic-fixer-report.json"
export FORGE_A11Y_REMEDIATION_PLAN="${OUT_DIR}/forge-a11y-remediation.plan.md"
export FORGE_A11Y_REMEDIATION_AGENT_LOG="${FORGE_A11Y_REMEDIATION_AGENT_LOG:-${OUT_DIR}/remediation-agent.log}"

run_audit() {
  node "${TOOL_DIR}/analyze-website-a11y.mjs" \
    --repo "${REPO_ROOT}" \
    --site "${SITE}" \
    --standard "${STANDARD}" \
    --lanes axe,det \
    --enable-ai \
    --rules-scope generic \
    --out "${OUT_DIR}" \
    --max-pages "${FORGE_A11Y_MAX_PAGES:-20}"
}

run_fixers() {
  if [[ "${SKIP_FIXERS}" == "1" || "${FIXERS}" != "1" ]]; then
    return 0
  fi
  if [[ ! -f "${AUDIT_DATA}" ]]; then
    echo "fixers skipped — no audit data" >&2
    return 0
  fi
  node "${TOOL_DIR}/lib/a11y-deterministic-fixers/run-deterministic-fixers.mjs" \
    --repo-root "${REPO_ROOT}" \
    --audit-data "${AUDIT_DATA}" \
    --out-dir "${OUT_DIR}"
}

run_ai_fixers() {
  if [[ "${SKIP_AI_FIXERS}" == "1" || "${FIXERS}" != "1" ]]; then
    return 0
  fi
  if [[ ! -f "${AUDIT_DATA}" ]]; then
    return 0
  fi
  node "${TOOL_DIR}/lib/a11y-ai-fixers/run-ai-fixers.mjs" \
    --audit-data "${AUDIT_DATA}" \
    --out-dir "${OUT_DIR}" || true
}

run_ai_audit() {
  if [[ "${SKIP_AI}" == "1" ]]; then
    return 0
  fi
  node "${TOOL_DIR}/run-website-a11y-ai-audit.mjs" \
    --audit-data "${AUDIT_DATA}" \
    --repo "${REPO_ROOT}" \
    --site "${SITE}" \
    --out-dir "${OUT_DIR}" || true
}

generate_plan() {
  if [[ ! -f "${AUDIT_DATA}" ]]; then
    return 0
  fi
  node "${GEN_PLAN_BIN}" \
    --audit-data "${AUDIT_DATA}" \
    --out-dir "${OUT_DIR}" \
    --repo "${REPO_ROOT}" \
    ${FIXER_REPORT:+--fixer-report "${FIXER_REPORT}"}
}

run_agent() {
  if [[ "${SKIP_AGENT}" == "1" ]]; then
    return 0
  fi
  if ! command -v agent >/dev/null 2>&1; then
    echo "run-website-a11y-remediation-loop: agent not on PATH — skip" >&2
    return 0
  fi
  bash "${RUN_PLAN_BIN}" "${REPO_ROOT}" "${FORGE_A11Y_REMEDIATION_PLAN}"
}

post_agent_build() {
  if [[ "${POST_AGENT_BUILD}" != "1" ]]; then
    return 0
  fi
  if [[ -f "${REPO_ROOT}/generator/build-site.py" ]]; then
    (cd "${REPO_ROOT}" && python3 generator/build-site.py) || true
  elif [[ -f "${REPO_ROOT}/generator/build-handbook.py" ]]; then
    (cd "${REPO_ROOT}" && python3 generator/build-handbook.py --all) || true
  fi
}

echo "run-website-a11y-remediation-loop: OUT_DIR=${OUT_DIR}"
run_audit
run_fixers
run_ai_fixers
run_ai_audit
generate_plan

if [[ "${FIXERS_ONLY}" == "1" ]]; then
  echo "fixers-only — re-audit"
  run_audit
  generate_plan
  echo "done → ${AUDIT_DATA}"
  exit 0
fi

run_agent
post_agent_build

echo "run-website-a11y-remediation-loop: final re-audit"
run_audit
generate_plan
echo "done → ${AUDIT_DATA}"
