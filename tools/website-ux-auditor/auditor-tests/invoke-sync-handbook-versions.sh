#!/usr/bin/env bash
# Sync page_version in handbook front matter to contentVersion (no Cursor pagegen).
# Use when bootstrap/stale pages have valid Before/After and harness already passes.
set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUDITOR_ROOT="$(cd "${TESTS_ROOT}/.." && pwd)"

MODE="--sync-stale"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --bootstrap-only) MODE="--sync-bootstrap-only"; shift ;;
    -h|--help)
      echo "usage: $0 [--bootstrap-only]"
      exit 0
      ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

(cd "${AUDITOR_ROOT}" && node design-rules/blender/rule-page-version.mjs "${MODE}" --write-manifest)
