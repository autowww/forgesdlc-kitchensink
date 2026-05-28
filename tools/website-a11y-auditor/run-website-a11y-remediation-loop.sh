#!/usr/bin/env bash
# A11y remediation loop: audit → deterministic fixers → optional AI audit → optional agent → re-audit.
#
# Usage:
#   ./run-website-a11y-remediation-loop.sh REPO_ROOT SITE_URL_OR_FIXTURE
#
# Env:
#   FORGE_A11Y_FIXERS=1 (default) | FORGE_A11Y_SKIP_FIXERS=1 | FORGE_A11Y_FIXERS_ONLY=1
#   FORGE_A11Y_SKIP_AI_AGENT=1 | FORGE_A11Y_SKIP_CURSOR_AGENT=1
#   FORGE_A11Y_STANDARD=wcag21aa

set -euo pipefail

TOOL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${1:-}"
SITE="${2:-}"
OUT_DIR="${FORGE_A11Y_OUT_DIR:-${UX_AUDIT_OUT_DIR:-/tmp/a11y-remediation-$$}}"
STANDARD="${FORGE_A11Y_STANDARD:-wcag21aa}"
FIXERS="${FORGE_A11Y_FIXERS:-1}"
SKIP_FIXERS="${FORGE_A11Y_SKIP_FIXERS:-0}"
FIXERS_ONLY="${FORGE_A11Y_FIXERS_ONLY:-0}"
SKIP_AI="${FORGE_A11Y_SKIP_AI_AGENT:-1}"
SKIP_AGENT="${FORGE_A11Y_SKIP_CURSOR_AGENT:-1}"

if [[ -z "${REPO_ROOT}" || -z "${SITE}" ]]; then
  echo "usage: $0 REPO_ROOT SITE_URL" >&2
  exit 2
fi

mkdir -p "${OUT_DIR}"
AUDIT_DATA="${OUT_DIR}/a11y-audit-data.json"

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

echo "run-website-a11y-remediation-loop: audit → ${OUT_DIR}"
run_audit
run_fixers
run_ai_audit

if [[ "${FIXERS_ONLY}" == "1" ]]; then
  echo "fixers-only — re-audit"
  run_audit
  exit 0
fi

if [[ "${SKIP_AGENT}" != "1" ]] && command -v agent >/dev/null 2>&1; then
  echo "run-website-a11y-remediation-loop: agent pass (stub — extend with plan runner)"
  # v1: operator uses Cursor on fixer-report agentRequired rows
fi

echo "run-website-a11y-remediation-loop: final re-audit"
run_audit
echo "done → ${AUDIT_DATA}"
