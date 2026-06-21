#!/usr/bin/env bash
set -euo pipefail
BLENDER="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$BLENDER/../../../.." && pwd)"
SRC="$BLENDER/docs/design/ux-audit/rule-pages/det-page-viewport.md"
DEST="$ROOT/docs/design/ux-audit/rule-pages/det-page-viewport.md"
mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST"
echo "--- verify ---"
grep '^page_version:' "$DEST" | head -1
grep '^generated_at:' "$DEST" | head -1
grep '^related_rules:' -A4 "$DEST" | head -5
