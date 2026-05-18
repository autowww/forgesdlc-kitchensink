#!/usr/bin/env bash
# Verifies check-visual-catalog.mjs fails on the synthetic bad registry fixture (exit 1).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
FIX="$ROOT/tools/design-catalog/fixtures/bad-visual-catalog"
set +e
node "$ROOT/tools/design-catalog/check-visual-catalog.mjs" \
  --repo "$FIX" \
  --registry "$FIX/docs/design/catalog/visual-registry.yaml" \
  --showcase "$FIX/showcase" \
  --allow-minimal-showcase
c=$?
set -e
if [[ "$c" -eq 0 ]]; then
  echo "Expected checker to fail on bad-visual-catalog fixture" >&2
  exit 1
fi
if [[ "$c" -ne 1 ]]; then
  echo "Unexpected exit code: $c (want 1)" >&2
  exit "$c"
fi
echo "OK: bad-visual-catalog fixture triggered failures (exit 1)."
