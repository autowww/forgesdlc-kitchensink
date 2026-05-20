#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-context-burden.md"
DEST="$ROOT/docs/design/ux-audit/rule-pages/det-context-burden.md"
mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST"
if cmp -s "$SRC" "$DEST"; then
  rm "$SRC"
fi
echo "--- verify ---"
test -f "$DEST"
grep '^page_version:' "$DEST" | head -1
echo "src_exists=$([ -f "$SRC" ] && echo yes || echo no)"
echo "dest_exists=$([ -f "$DEST" ] && echo yes || echo no)"
