#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/tools/website-ux-auditor/docs/design/ux-audit/rule-pages/ai-premium-enterprise-feel.md"
DEST="$ROOT/docs/design/ux-audit/rule-pages/ai-premium-enterprise-feel.md"
mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST"
cd "$ROOT/tools/website-ux-auditor/design-rules/blender"
node rule-page-version.mjs --write-manifest
echo "--- verify ---"
test -f "$DEST"
grep '^page_version:' "$DEST" | head -1
