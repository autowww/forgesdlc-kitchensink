#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-inventory-crosswalk.md"
DEST="$ROOT/docs/design/ux-audit/rule-pages/det-inventory-crosswalk.md"
cp "$SRC" "$DEST"
grep '^page_version:' "$DEST"
