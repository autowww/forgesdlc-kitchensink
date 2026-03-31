#!/usr/bin/env bash
# Rebuild the showcase and copy it into dist/ (same layout as deploy-firebase.sh).
# Use this to refresh /local-site/…/cases/showcase/ in Forge Lenses without deploying.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
python3 generator/build-showcase.py
rm -rf dist
mkdir -p dist/cases
cp "$REPO_ROOT/index.html" dist/cases/
cp -R "$REPO_ROOT/showcase" dist/cases/showcase
cp "$REPO_ROOT/scripts/hosting-dist-root-index.html" dist/index.html
if [[ -d "$REPO_ROOT/hosting-static/.well-known" ]]; then
  cp -R "$REPO_ROOT/hosting-static/.well-known" dist/
fi
echo "[stage-dist] Wrote dist/ — Lenses: /local-site/<repo>/cases/showcase/surfaces.html"
