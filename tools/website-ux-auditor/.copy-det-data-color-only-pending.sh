#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/tools/website-ux-auditor/forgesdlc-kitchensink/docs/design/ux-audit/rule-pages/det-data-color-only.md"
DEST="$ROOT/docs/design/ux-audit/rule-pages/det-data-color-only.md"
EXPECTED="6867492406d3ec909a0742d87b388c8f118929ae94e16f369025c8fa1c41f736"
mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST"
PAGE_VERSION="$(grep '^page_version:' "$DEST" | head -1 | sed 's/^page_version:[[:space:]]*//')"
if [ "$PAGE_VERSION" != "$EXPECTED" ]; then
  echo "page_version mismatch: got $PAGE_VERSION expected $EXPECTED" >&2
  exit 1
fi
echo "dest=$DEST"
echo "page_version=$PAGE_VERSION"
echo "verified=ok"
