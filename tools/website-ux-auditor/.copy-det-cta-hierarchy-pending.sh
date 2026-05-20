#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/tools/website-ux-auditor/docs/design/ux-audit/rule-pages/det-cta-hierarchy.md"
DEST="$ROOT/docs/design/ux-audit/rule-pages/det-cta-hierarchy.md"
EXPECTED="96c734fbaeda694dfccadfe33c76c0e18ce82d905b6013754688a044463755af"
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
