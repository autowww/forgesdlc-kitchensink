#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/tools/website-ux-auditor/docs/design/ux-audit/rule-pages/ai-theme-personality-coherence.md"
DEST="$ROOT/docs/design/ux-audit/rule-pages/ai-theme-personality-coherence.md"
mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST"
echo "--- verify ---"
test -f "$DEST"
grep '^page_version:' "$DEST" | head -1
