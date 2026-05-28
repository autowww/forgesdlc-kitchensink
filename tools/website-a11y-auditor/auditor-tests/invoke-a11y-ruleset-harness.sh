#!/usr/bin/env bash
# Smoke-test one DET.A11Y rule against a static fixture via analyze-website-a11y.mjs.
set -euo pipefail
TOOL="$(cd "$(dirname "$0")/.." && pwd)"
RULE="${1:-DET.A11Y.GENERIC.LANG}"
FIXTURE_DIR="${TOOL}/auditor-tests/fixtures"

# Map rule id → fail fixture basename (default: LANG legacy fixture).
case "${RULE}" in
  DET.A11Y.GENERIC.LANG) FIXTURE_BASENAME="det-a11y-generic-lang-fail.html" ;;
  DET.A11Y.GENERIC.GLOSSARY_ABBR) FIXTURE_BASENAME="det-a11y-generic-glossary-abbr-fail.html" ;;
  DET.A11Y.GENERIC.ERROR_PREVENTION) FIXTURE_BASENAME="det-a11y-generic-error-prevention-fail.html" ;;
  DET.A11Y.GENERIC.READING_LEVEL_HEURISTIC) FIXTURE_BASENAME="det-a11y-generic-reading-level-heuristic-fail.html" ;;
  DET.A11Y.GENERIC.DRAGGING_MOVEMENTS) FIXTURE_BASENAME="det-a11y-generic-dragging-movements-fail.html" ;;
  DET.A11Y.GENERIC.REDUNDANT_ENTRY) FIXTURE_BASENAME="det-a11y-generic-redundant-entry-fail.html" ;;
  DET.A11Y.GENERIC.ACCESSIBLE_AUTHENTICATION) FIXTURE_BASENAME="det-a11y-generic-accessible-authentication-fail.html" ;;
  DET.A11Y.GENERIC.RE_AUTHENTICATION) FIXTURE_BASENAME="det-a11y-generic-re-authentication-fail.html" ;;
  DET.A11Y.GENERIC.CONCURRENT_INPUT) FIXTURE_BASENAME="det-a11y-generic-concurrent-input-fail.html" ;;
  *)
    KEBAB="$(echo "${RULE}" | tr '[:upper:]' '[:lower:]' | tr '.' '-')"
    if [[ -f "${FIXTURE_DIR}/${KEBAB}-fail.html" ]]; then
      FIXTURE_BASENAME="${KEBAB}-fail.html"
    else
      echo "invoke-a11y-ruleset-harness: no fixture for ${RULE}" >&2
      exit 2
    fi
    ;;
esac

FIXTURE="${FIXTURE_DIR}/${FIXTURE_BASENAME}"
if [[ ! -f "${FIXTURE}" ]]; then
  echo "invoke-a11y-ruleset-harness: missing fixture ${FIXTURE}" >&2
  exit 2
fi

OUT="${UX_AUDIT_OUT_DIR:-/tmp/a11y-harness-$$}"
python3 -m http.server 9876 --directory "$(dirname "$FIXTURE")" >/dev/null 2>&1 &
PID=$!
trap 'kill "$PID" 2>/dev/null || true' EXIT
sleep 0.5
node "${TOOL}/analyze-website-a11y.mjs" \
  --repo "${FIXTURE_DIR}" \
  --site "http://127.0.0.1:9876/$(basename "$FIXTURE")" \
  --compliance-profile wcag22aaa \
  --rules-scope generic \
  --lanes det \
  --skip-axe \
  --only-deterministic-rule-ids "${RULE}" \
  --max-pages 1 \
  --out "${OUT}"
node -e "
const fs=require('fs');
const d=JSON.parse(fs.readFileSync('${OUT}/a11y-audit-data.json','utf8'));
if(!d.findings?.length) { console.error('expected findings'); process.exit(1); }
console.log('ok', d.findings.length, 'finding(s) for ${RULE}');
"
