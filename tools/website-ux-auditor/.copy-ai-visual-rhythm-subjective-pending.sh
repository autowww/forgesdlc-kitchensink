#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/tools/website-ux-auditor/docs/design/ux-audit/rule-pages/ai-visual-rhythm-subjective.md"
DEST="$ROOT/docs/design/ux-audit/rule-pages/ai-visual-rhythm-subjective.md"
mkdir -p "$(dirname "$DEST")"
cp -f "$SRC" "$DEST"
echo "--- verify ---"
test -f "$DEST"
echo "SOURCE_BYTES=$(stat -c%s "$SRC")"
echo "DEST_BYTES=$(stat -c%s "$DEST")"
grep '^page_version:' "$DEST" | head -1
