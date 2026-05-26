#!/usr/bin/env bash
# Write SUMMARY.md, AGENT-FAILURES.md, and optional DET coverage from state.jsonl.
#
# Usage:
#   ./finalize-learn-101-campaign.sh [OUT_DIR]
#
# Env:
#   UX_AUDIT_OUT_DIR — campaign folder (default if no arg)
#   LEARN_101_PAGE_URL — for coverage analyzer (optional)

set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUDITOR_ROOT="$(cd "${TESTS_ROOT}/.." && pwd)"
REGISTRY="${AUDITOR_ROOT}/design-rules/registry.generated.json"
COVERAGE_SCRIPT="${TESTS_ROOT}/analyze-learn-101-det-coverage.mjs"

OUT_DIR="${1:-${UX_AUDIT_OUT_DIR:-}}"
if [[ -z "${OUT_DIR}" ]]; then
  echo "finalize-learn-101: OUT_DIR required" >&2
  exit 2
fi

STATE_JSONL="${OUT_DIR}/state.jsonl"
if [[ ! -f "${STATE_JSONL}" ]]; then
  echo "finalize-learn-101: missing ${STATE_JSONL}" >&2
  exit 2
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "finalize-learn-101: jq required" >&2
  exit 2
fi

PAGE_URL="$(jq -s -r '[.[] | select(.page.url != null and .page.url != "")] | .[0].page.url // empty' "${STATE_JSONL}")"
if [[ -z "${PAGE_URL}" ]]; then
  PAGE_URL="${LEARN_101_PAGE_URL:-}"
fi

pass_n="$(jq -s '[.[] | select(.status == "pass")] | length' "${STATE_JSONL}")"
agent_exhausted_n="$(jq -s '[.[] | select(.status == "agent_exhausted")] | length' "${STATE_JSONL}")"
remediation_error_n="$(jq -s '[.[] | select(.status == "remediation_error")] | length' "${STATE_JSONL}")"
blocked_n="$(jq -s '[.[] | select(.status == "blocked")] | length' "${STATE_JSONL}")"
fail_n="$(jq -s '[.[] | select(.status == "fail" or .status == "fail_no_agent")] | length' "${STATE_JSONL}")"
smoke_n="$(jq -s '[.[] | select(.status == "smoke_agent_ok")] | length' "${STATE_JSONL}")"
total_n="$(jq -s 'length' "${STATE_JSONL}")"

AGENT_FAILURES_MD="${OUT_DIR}/AGENT-FAILURES.md"
agent_failure_total=$((agent_exhausted_n + remediation_error_n))

if [[ "${agent_failure_total}" -gt 0 ]]; then
  {
    echo "# Learn 101 — agent failures"
    echo ""
    echo "Rules where the product remediation agent did not clear findings."
    echo ""
    echo "| Rule | Status | Findings | Agent attempts | Evidence | Proposal | Meta log |"
    echo "|------|--------|----------|----------------|----------|----------|----------|"
  } >"${AGENT_FAILURES_MD}"

  jq -s -r '
    .[] | select(.status == "agent_exhausted" or .status == "remediation_error")
    | [
        .ruleId,
        .status,
        (.findingsCount | tostring),
        (.agentAttempts | tostring),
        ((.note // "") + " " + (.page.url // "")),
        (if .metaAgentRan then ("rules/" + .ruleId + "/agent-improvement-proposal.md") else "—" end),
        (if .metaAgentRan and .metaAgentLog then .metaAgentLog else "—" end)
      ] | @tsv
  ' "${STATE_JSONL}" | while IFS=$'\t' read -r rule_id status fc aa evidence proposal meta; do
    printf '| %s | %s | %s | %s | %s | %s | %s |\n' \
      "${rule_id}" "${status}" "${fc}" "${aa}" "${evidence:0:120}" "${proposal}" "${meta}"
  done >>"${AGENT_FAILURES_MD}"

  {
    echo ""
    echo "## Re-run remaining"
    echo ""
    echo '```bash'
    echo "bash ${TESTS_ROOT}/invoke-learn-101-remaining-rules.sh --resume"
    echo '```'
  } >>"${AGENT_FAILURES_MD}"
fi

mode="full-agent"
if [[ "${SKIP_CURSOR_AGENT:-}" == "1" ]]; then
  mode="check-only"
fi

{
  echo "# Learn 101 rule loop summary"
  echo ""
  echo "- **OUT_DIR:** ${OUT_DIR}"
  echo "- **PAGE_URL:** ${PAGE_URL:-unknown}"
  echo "- **rules in state.jsonl:** ${total_n}"
  echo "- **mode:** ${mode}"
  echo "- **pass:** ${pass_n}"
  echo "- **agent_exhausted:** ${agent_exhausted_n}"
  echo "- **remediation_error:** ${remediation_error_n}"
  echo "- **blocked:** ${blocked_n}"
  echo "- **fail:** ${fail_n}"
  echo "- **smoke_agent_ok:** ${smoke_n}"
  echo ""
  if [[ -f "${AGENT_FAILURES_MD}" ]]; then
    echo "Agent failures: [AGENT-FAILURES.md](AGENT-FAILURES.md)"
    echo ""
  fi
  echo "See \`state.jsonl\` for per-rule rows."
} >"${OUT_DIR}/SUMMARY.md"

if [[ -f "${COVERAGE_SCRIPT}" ]]; then
  echo "finalize-learn-101: DET coverage report" >&2
  LEARN_101_PAGE_URL="${PAGE_URL}" node "${COVERAGE_SCRIPT}" "${OUT_DIR}" >&2 || true
fi

echo "finalize-learn-101: wrote ${OUT_DIR}/SUMMARY.md (${total_n} rules)" >&2
if [[ "${agent_failure_total}" -gt 0 || "${fail_n}" -gt 0 ]]; then
  exit 1
fi
exit 0
