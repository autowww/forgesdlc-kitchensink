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

# Lenses Studio static museum: same /__ks/ paths as forge-lenses (css, js, assets/svg only).
mkdir -p dist/__ks/css dist/__ks/js dist/__ks/assets/svg
cp "$REPO_ROOT"/css/*.css dist/__ks/css/
cp "$REPO_ROOT"/js/*.js dist/__ks/js/
if [[ -d "$REPO_ROOT/assets/svg" ]]; then
  cp -a "$REPO_ROOT/assets/svg/." dist/__ks/assets/svg/
fi

# Prebuilt Studio SPA (manual refresh: scripts/rebuild-static-studio-museum.sh)
MUSEUM="$REPO_ROOT/museum/studio"
MUSEUM_DATA="$REPO_ROOT/museum/museum-data"
if [[ -d "$MUSEUM" ]] && [[ -f "$MUSEUM/index.html" ]]; then
  mkdir -p dist/studio
  cp -a "$MUSEUM/." dist/studio/
  if [[ -d "$MUSEUM_DATA" ]]; then
    mkdir -p dist/studio/museum-data
    cp -a "$MUSEUM_DATA/." dist/studio/museum-data/
    echo "[stage-dist] Included Lenses Studio museum-data -> dist/studio/museum-data/"
  fi
  echo "[stage-dist] Included Lenses Studio museum -> dist/studio/"
else
  echo "[stage-dist] Warning: museum/studio/ missing or empty — deploy will omit /studio/ (run scripts/rebuild-static-studio-museum.sh to populate)" >&2
fi

echo "[stage-dist] Wrote dist/ — Lenses: /local-site/<repo>/cases/showcase/surfaces.html"
