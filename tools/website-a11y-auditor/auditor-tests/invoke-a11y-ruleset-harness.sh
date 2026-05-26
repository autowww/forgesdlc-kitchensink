#!/usr/bin/env bash
# Smoke-test one DET.A11Y rule against a static fixture via analyze-website-a11y.mjs.
set -euo pipefail
TOOL="$(cd "$(dirname "$0")/.." && pwd)"
RULE="${1:-DET.A11Y.GENERIC.LANG}"
FIXTURE="${TOOL}/auditor-tests/fixtures/det-a11y-generic-lang-fail.html"
OUT="${UX_AUDIT_OUT_DIR:-/tmp/a11y-harness-$$}"
python3 -m http.server 9876 --directory "$(dirname "$FIXTURE")" >/dev/null 2>&1 &
PID=$!
trap 'kill "$PID" 2>/dev/null || true' EXIT
sleep 0.5
node "${TOOL}/analyze-website-a11y.mjs" \
  --repo "${TOOL}/auditor-tests/fixtures" \
  --site "http://127.0.0.1:9876/$(basename "$FIXTURE")" \
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
