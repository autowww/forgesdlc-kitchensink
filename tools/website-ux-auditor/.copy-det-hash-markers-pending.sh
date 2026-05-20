#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-hash-markers.md"
DEST="$ROOT/docs/design/ux-audit/rule-pages/det-hash-markers.md"
mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST"
head -n 12 "$DEST"
