#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "usage: $0 <REPO_ROOT> <RULE_PROMPT_MD> <URL> [URL...]" >&2
  exit 2
fi

REPO_ROOT="$(cd "$1" && pwd)"
RULE_PROMPT="$2"
shift 2
URLS=("$@")

if ! command -v agent >/dev/null 2>&1; then
  echo "run-design-ai-rule: Cursor CLI agent is required on PATH." >&2
  exit 1
fi

if [[ ! -f "$RULE_PROMPT" ]]; then
  echo "run-design-ai-rule: missing prompt file: $RULE_PROMPT" >&2
  exit 1
fi

PROMPT_BODY="$(cat "$RULE_PROMPT")"
URL_BLOCK="$(printf '%s\n' "${URLS[@]}")"

PROMPT="Repository root: ${REPO_ROOT}

Apply this AI rule with PDCA discipline:
${PROMPT_BODY}

Target URLs:
${URL_BLOCK}

Return one JSON object with:
{
  \"summary\": \"...\",
  \"findings\": [
    {
      \"url\": \"...\",
      \"severity\": \"blocker|critical|major|warn|minor|trivial|cosmetic\",
      \"principleId\": \"AI.*\",
      \"deterministicCoverage\": \"covered|partially-covered|not-covered\",
      \"candidateDeterministicRule\": \"DET.* or AI-only rationale\",
      \"title\": \"...\",
      \"evidence\": \"...\",
      \"screenshotOrDomEvidence\": \"...\",
      \"hashesOrContractsAffected\": [\"...\"],
      \"sourceFiles\": [\"...\"],
      \"confidence\": 0.0,
      \"remediation\": \"...\"
    }
  ]
}"

cd "$REPO_ROOT"
agent -p --trust "$PROMPT"
