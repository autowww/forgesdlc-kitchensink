#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-data-table-headers.md"
DEST="$ROOT/docs/design/ux-audit/rule-pages/det-data-table-headers.md"
mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST"
echo "--- verify ---"
test -f "$DEST" && echo "dest_exists=yes" || echo "dest_exists=no"
grep '^page_version:' "$DEST" | head -1
