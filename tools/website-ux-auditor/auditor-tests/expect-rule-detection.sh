#!/usr/bin/env bash
# Return finding count for a rule from audit-data.json (stdout: count, exit 0).
# Usage: expect-rule-detection.sh <audit-data.json> <ruleId>
set -euo pipefail

AUDIT_DATA="${1:-}"
RULE_ID="${2:-}"

if [[ -z "${AUDIT_DATA}" || -z "${RULE_ID}" ]]; then
  echo "expect-rule-detection: usage: expect-rule-detection.sh audit-data.json RULE_ID" >&2
  exit 2
fi

if [[ ! -f "${AUDIT_DATA}" ]]; then
  echo "0"
  exit 0
fi

jq -r --arg rid "${RULE_ID}" '
  [.pages[]?.findings[]? | select((.ruleId // "") == $rid or (.checkId // "") == $rid)] | length
' "${AUDIT_DATA}" 2>/dev/null || echo "0"
