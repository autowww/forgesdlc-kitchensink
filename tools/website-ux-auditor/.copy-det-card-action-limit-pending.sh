#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-card-action-limit.md"
DEST="$ROOT/docs/design/ux-audit/rule-pages/det-card-action-limit.md"
EXPECTED="8b47ef1cec520e036dadd4f0ae3e9fb630d0f96e8be3c9728b373c131624629c"
mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST"
if ! cmp -s "$SRC" "$DEST"; then
  echo "MISMATCH"
  exit 1
fi
rm "$SRC"
PV="$(grep '^page_version:' "$DEST" | sed 's/^page_version: *//')"
if [ "$PV" != "$EXPECTED" ]; then
  echo "page_version mismatch: got $PV"
  exit 1
fi
echo "SUCCESS $DEST"
