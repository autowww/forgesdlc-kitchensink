#!/usr/bin/env bash
# Build Lenses Studio in forge-lenses and copy the production bundle into museum/studio/.
# Not run by build-showcase.py or stage-dist — invoke manually when the Studio UI should be updated on ks.forgesdlc.com/studio/.
#
# Prereqs: Node.js + npm; sibling clone of forge-lenses (override with FORGE_LENSES_ROOT).
#
# Usage (from forgesdlc-kitchensink repo root):
#   ./scripts/rebuild-static-studio-museum.sh
#
# Env:
#   FORGE_LENSES_ROOT — path to forge-lenses repo (default: ../forge-lenses relative to ks repo root)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FL_ROOT="${FORGE_LENSES_ROOT:-$REPO_ROOT/../forge-lenses}"
FL_ROOT="$(cd "$FL_ROOT" && pwd)"
ENT="$FL_ROOT/lenses-enterprise"
OUT="$FL_ROOT/lenses/static/studio"
DEST="$REPO_ROOT/museum/studio"

if [[ ! -d "$ENT" ]]; then
  echo "rebuild-static-studio-museum: expected lenses-enterprise under forge-lenses: $ENT" >&2
  echo "Set FORGE_LENSES_ROOT to your forge-lenses checkout." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "rebuild-static-studio-museum: npm is required" >&2
  exit 1
fi

echo "[rebuild-static-studio-museum] Building in $ENT"
cd "$ENT"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi
npm run build:museum

if [[ ! -f "$OUT/index.html" ]]; then
  echo "rebuild-static-studio-museum: missing $OUT/index.html after build" >&2
  exit 1
fi

mkdir -p "$DEST"
echo "[rebuild-static-studio-museum] Syncing $OUT/ -> museum/studio/"
rsync -a --delete "$OUT/" "$DEST/"

echo "[rebuild-static-studio-museum] Done. Commit museum/studio/ when you want this snapshot deployed."
