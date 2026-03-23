#!/usr/bin/env bash
# Build the Kitchen Sink showcase and deploy to Firebase Hosting.
#
# Prereqs:
#   - Node.js + Firebase CLI: npm install -g firebase-tools
#   - Firebase project: https://console.firebase.google.com/ (add Hosting)
#   - Set your project id in .firebaserc (replace REPLACE_WITH_FIREBASE_PROJECT_ID), or:
#       firebase use --add
#   - Once: firebase login
#
# Custom domain (e.g. ks.forgesdlc.com) without the Console UI:
#   ./scripts/hosting-custom-domain-api.py --domain ks.forgesdlc.com --enable-apis
#   (Firebase Hosting REST API; then add DNS records it prints, e.g. in Cloud DNS.)
#
# CI (Cloud Build): store a token from `firebase login:ci` in Secret Manager as
#   FIREBASE_TOKEN and run cloudbuild.yaml (see comments there).
#
# Usage (from repo root):
#   ./scripts/deploy-firebase.sh
#
# Optional env:
#   FIREBASE_TOKEN   — deploy token for non-interactive / CI (same as Cloud Build)
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if ! command -v firebase >/dev/null 2>&1; then
  echo "deploy-firebase: install Firebase CLI first: npm install -g firebase-tools" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "deploy-firebase: python3 is required" >&2
  exit 1
fi

echo "[deploy-firebase] Building showcase"
python3 generator/build-showcase.py

echo "[deploy-firebase] Staging static files into dist/"
rm -rf dist
mkdir -p dist
cp "$REPO_ROOT/index.html" dist/
cp -R "$REPO_ROOT/showcase" dist/showcase

if [[ -n "${FIREBASE_TOKEN:-}" ]]; then
  echo "[deploy-firebase] Deploying (token auth)"
  firebase deploy --only hosting --non-interactive --token "$FIREBASE_TOKEN"
else
  echo "[deploy-firebase] Deploying (interactive / cached login)"
  firebase deploy --only hosting
fi

echo "[deploy-firebase] Done"
