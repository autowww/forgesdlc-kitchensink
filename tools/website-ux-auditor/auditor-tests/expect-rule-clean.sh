#!/usr/bin/env bash
# Require zero design-rule-runtime findings for a rule in audit-data.json (stdout: count, exit 1 if > 0).
# Usage: expect-rule-clean.sh <audit-data.json> <ruleId>
set -euo pipefail

AUDIT_DATA="${1:-}"
RULE_ID="${2:-}"

if [[ -z "${AUDIT_DATA}" || -z "${RULE_ID}" ]]; then
  echo "expect-rule-clean: usage: expect-rule-clean.sh audit-data.json RULE_ID" >&2
  exit 2
fi

if [[ ! -f "${AUDIT_DATA}" ]]; then
  echo "0"
  exit 0
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "expect-rule-clean: jq required" >&2
  exit 2
fi

fc="$(jq -r --arg rid "${RULE_ID}" '
  [.pages[]?.findings[]?
   | select((.checkId // "") == "design-rule-runtime" and (.ruleId // "") == $rid)
  ] | length
' "${AUDIT_DATA}" 2>/dev/null || echo "0")"
fc="${fc:-0}"
echo "${fc}"
if [[ "${fc}" -gt 0 ]]; then
  exit 1
fi
exit 0
