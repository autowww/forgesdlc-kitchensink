#!/usr/bin/env bash
# Write SUMMARY.md and failure rollups for DET ruleset harness campaigns.
#
# Usage: ./finalize-ruleset-harness.sh [OUT_DIR]

set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

OUT_DIR="${1:-${UX_AUDIT_OUT_DIR:-}}"
if [[ -z "${OUT_DIR}" ]]; then
  echo "finalize-ruleset-harness: OUT_DIR required" >&2
  exit 2
fi

STATE_JSONL="${OUT_DIR}/state.jsonl"
if [[ ! -f "${STATE_JSONL}" ]]; then
  echo "finalize-ruleset-harness: missing ${STATE_JSONL}" >&2
  exit 2
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "finalize-ruleset-harness: jq required" >&2
  exit 2
fi

count_status() {
  local st="$1"
  jq -s --arg s "${st}" '[.[] | select(.status == $s)] | length' "${STATE_JSONL}"
}

detection_ok_n="$(count_status detection_ok)"
detection_miss_n="$(count_status detection_miss)"
remediation_ok_n="$(count_status remediation_ok)"
remediation_fail_n="$(count_status remediation_fail)"
missing_fixture_n="$(count_status missing_fixture)"
blocked_n="$(count_status blocked)"
total_n="$(jq -s 'length' "${STATE_JSONL}")"

fixture_root="$(jq -s -r '[.[] | select(.fixtureRoot != null)] | .[0].fixtureRoot // empty' "${STATE_JSONL}" 2>/dev/null || true)"
mode="$(jq -s -r '[.[] | select(.mode != null)] | .[0].mode // "check-only"' "${STATE_JSONL}" 2>/dev/null || echo "check-only")"
harness_lane="$(jq -s -r '[.[] | select(.lane != null)] | .[0].lane // "deterministic"' "${STATE_JSONL}" 2>/dev/null || echo "deterministic")"
if [[ "${harness_lane}" == "ai" ]]; then
  harness_label="AI"
  harness_invoke="invoke-ai-ruleset-harness.sh"
else
  harness_label="DET"
  harness_invoke="invoke-det-ruleset-harness.sh"
fi

DETECTION_FAILURES_MD="${OUT_DIR}/DETECTION-FAILURES.md"
if [[ "${detection_miss_n}" -gt 0 ]]; then
  {
    echo "# ${harness_label} harness — detection failures"
    echo ""
    echo "Auditor did not report ≥1 finding for the rule on its defect fixture page."
    echo ""
    echo "| Rule | Findings | Note | Report |"
    echo "|------|----------|------|--------|"
  } >"${DETECTION_FAILURES_MD}"
  jq -s -r '
    .[] | select(.status == "detection_miss")
    | [.ruleId, (.findingsCount | tostring), (.note // ""), ("rules/" + .ruleId + "/harness-detection-failure.md")]
    | @tsv
  ' "${STATE_JSONL}" | while IFS=$'\t' read -r rid fc note report; do
    printf '| %s | %s | %s | %s |\n' "${rid}" "${fc}" "${note:0:80}" "${report}"
  done >>"${DETECTION_FAILURES_MD}"
fi

REMEDIATION_FAILURES_MD="${OUT_DIR}/REMEDIATION-FAILURES.md"
if [[ "${remediation_fail_n}" -gt 0 ]]; then
  {
    echo "# ${harness_label} harness — remediation failures"
    echo ""
    echo "| Rule | Findings | Agent attempts | Report |"
    echo "|------|----------|----------------|--------|"
  } >"${REMEDIATION_FAILURES_MD}"
  jq -s -r '
    .[] | select(.status == "remediation_fail")
    | [.ruleId, (.findingsCount | tostring), (.agentAttempts | tostring), ("rules/" + .ruleId + "/harness-remediation-failure.md")]
    | @tsv
  ' "${STATE_JSONL}" | while IFS=$'\t' read -r rid fc aa report; do
    printf '| %s | %s | %s | %s |\n' "${rid}" "${fc}" "${aa}" "${report}"
  done >>"${REMEDIATION_FAILURES_MD}"
fi

HARNESS_GAPS_MD="${OUT_DIR}/HARNESS-GAPS.md"
if [[ "${missing_fixture_n}" -gt 0 ]]; then
  {
    echo "# ${harness_label} harness — missing fixtures"
    echo ""
    echo "No ## Before example HTML in rule-page markdown."
    echo ""
  } >"${HARNESS_GAPS_MD}"
  jq -s -r '.[] | select(.status == "missing_fixture") | "- " + .ruleId' "${STATE_JSONL}" >>"${HARNESS_GAPS_MD}"
fi

{
  echo "# ${harness_label} ruleset harness summary"
  echo ""
  echo "- **lane:** ${harness_lane}"
  echo "- **OUT_DIR:** ${OUT_DIR}"
  echo "- **fixture root:** ${fixture_root:-unknown}"
  echo "- **mode:** ${mode}"
  echo "- **rules in state.jsonl:** ${total_n}"
  echo "- **detection_ok:** ${detection_ok_n}"
  echo "- **detection_miss:** ${detection_miss_n}"
  echo "- **remediation_ok:** ${remediation_ok_n}"
  echo "- **remediation_fail:** ${remediation_fail_n}"
  echo "- **missing_fixture:** ${missing_fixture_n}"
  echo "- **blocked:** ${blocked_n}"
  echo ""
  [[ -f "${DETECTION_FAILURES_MD}" ]] && echo "- [DETECTION-FAILURES.md](DETECTION-FAILURES.md)"
  [[ -f "${REMEDIATION_FAILURES_MD}" ]] && echo "- [REMEDIATION-FAILURES.md](REMEDIATION-FAILURES.md)"
  [[ -f "${HARNESS_GAPS_MD}" ]] && echo "- [HARNESS-GAPS.md](HARNESS-GAPS.md)"
  echo ""
  echo "## Re-run"
  echo ""
  echo '```bash'
  echo "bash ${TESTS_ROOT}/${harness_invoke} --resume"
  echo '```'
} >"${OUT_DIR}/SUMMARY.md"

echo "finalize-ruleset-harness: wrote ${OUT_DIR}/SUMMARY.md" >&2

fail_total=$((detection_miss_n + remediation_fail_n))
if [[ "${fail_total}" -gt 0 ]]; then
  exit 1
fi
exit 0
