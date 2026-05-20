#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-chart-alt-summary.md"
DEST="$ROOT/docs/design/ux-audit/rule-pages/det-chart-alt-summary.md"
mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST"
sed -i 's/motion\/div#ks-cw/div#ks-cw/g' "$DEST"
echo "--- verify ---"
test -f "$SRC" && echo "src_exists=yes" || echo "src_exists=no"
test -f "$DEST" && echo "dest_exists=yes" || echo "dest_exists=no"
grep '^page_version:' "$DEST" | head -1
sed -n '125p' "$DEST"
