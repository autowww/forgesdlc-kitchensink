#!/usr/bin/env bash
# Build the Kitchen Sink showcase and deploy to Firebase Hosting.
#
# Prereqs:
#   - Node.js + Firebase CLI: npm install -g firebase-tools
#   - Firebase project: https://console.firebase.google.com/ (add Hosting)
#   - Project id: repo ships .firebaserc (default: forge-kitchen-sink). Override with:
#       firebase use --add
#   - Once: firebase login
#
# Live URL path: site is deployed under /cases/ (e.g. …/cases/showcase/index.html).
#   Site root / redirects to /cases/showcase/index.html.
#
# Custom domain (e.g. ks.forgesdlc.com) without the Console UI:
#   ./scripts/hosting-custom-domain-api.py --domain ks.forgesdlc.com --enable-apis
#   (Firebase Hosting REST API; then add DNS records it prints, e.g. in Cloud DNS.)
#
# ACME "upload a file" verification: put Firebase's downloaded file under
#   hosting-static/.well-known/acme-challenge/<filename>
#   then deploy (see hosting-static/README.txt).
#
# CI (Cloud Build): store a token from `firebase login:ci` in Secret Manager as
#   FIREBASE_TOKEN and run cloudbuild.yaml (see comments there).
#
# Usage (from repo root):
#   ./scripts/deploy-firebase.sh
#
# Optional env:
#   FIREBASE_TOKEN    — deploy token for non-interactive / CI (same as Cloud Build)
#   FIREBASE_PROJECT  — passed as firebase deploy --project (if no .firebaserc default)
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

echo "[deploy-firebase] Building showcase + staging dist/"
"$REPO_ROOT/scripts/stage-dist.sh"

FB_ARGS=(deploy --only hosting)
if [[ -n "${FIREBASE_PROJECT:-}" ]]; then
  FB_ARGS+=(--project "$FIREBASE_PROJECT")
fi

if [[ -n "${FIREBASE_TOKEN:-}" ]]; then
  echo "[deploy-firebase] Deploying (token auth)"
  firebase "${FB_ARGS[@]}" --non-interactive --token "$FIREBASE_TOKEN"
else
  echo "[deploy-firebase] Deploying (interactive / cached login)"
  firebase "${FB_ARGS[@]}"
fi

echo "[deploy-firebase] Done"
