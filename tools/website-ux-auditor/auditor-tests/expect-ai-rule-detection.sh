#!/usr/bin/env bash
# Count AI findings for a principleId in agent JSON output (stdout: count, exit 0).
# Usage: expect-ai-rule-detection.sh <agent-json-or-findings.json> <ruleId>
set -euo pipefail

INPUT="${1:-}"
RULE_ID="${2:-}"

if [[ -z "${INPUT}" || -z "${RULE_ID}" ]]; then
  echo "expect-ai-rule-detection: usage: expect-ai-rule-detection.sh findings.json RULE_ID" >&2
  exit 2
fi

if [[ ! -f "${INPUT}" ]]; then
  echo "0"
  exit 0
fi

jq -r --arg rid "${RULE_ID}" '
  (.findings // []) | map(select((.principleId // "") == $rid)) | length
' "${INPUT}" 2>/dev/null || echo "0"
