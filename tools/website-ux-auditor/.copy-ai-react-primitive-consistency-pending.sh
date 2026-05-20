#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/tools/website-ux-auditor/docs/design/ux-audit/rule-pages/ai-react-primitive-consistency.md"
DEST="$ROOT/docs/design/ux-audit/rule-pages/ai-react-primitive-consistency.md"
mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST"
echo "--- verify ---"
test -f "$DEST"
head -15 "$DEST"
rm -f "$SRC"
