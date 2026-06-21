#!/usr/bin/env bash
set -euo pipefail
BLENDER="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$BLENDER/../../../.." && pwd)"
SRC="$BLENDER/docs/design/ux-audit/rule-pages/det-nav-breadcrumb.md"
DEST="$ROOT/docs/design/ux-audit/rule-pages/det-nav-breadcrumb.md"
mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST"
echo "--- verify ---"
grep '^page_version:' "$DEST" | head -1
grep '^generated_at:' "$DEST" | head -1
grep -c '^related_rules:' "$DEST" || true
