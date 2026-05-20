#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-app-persistent-chrome.md"
DEST="$ROOT/docs/design/ux-audit/rule-pages/det-app-persistent-chrome.md"
mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST"
cd "$ROOT/tools/website-ux-auditor/design-rules/blender"
node rule-page-version.mjs --write-manifest
echo "--- verify ---"
test -f "$DEST"
grep '^page_version:' "$DEST" | head -1
node -e "
const m=require('fs').readFileSync('$ROOT/docs/design/ux-audit/rule-pages/rule-pages.manifest.json','utf8');
const j=JSON.parse(m);
const r=j.rules.find(x=>x.id==='DET.APP.PERSISTENT_CHROME');
console.log('status:', r?.status);
console.log('pageVersion:', r?.pageVersion);
"
