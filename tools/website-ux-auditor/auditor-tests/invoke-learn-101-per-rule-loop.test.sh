#!/usr/bin/env bash
# Validates invoker wiring: one DET rule, check-only (no Cursor agent), expects state.jsonl row.
#
# Full campaign (product + meta agent on failure):
#   bash invoke-learn-101-per-rule-loop.sh
# Requires: Cursor CLI `agent` on PATH and authenticated (or CURSOR_API_KEY).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INV="${ROOT}/invoke-learn-101-per-rule-loop.sh"

# CI wiring only — do not export SKIP_CURSOR_AGENT in the parent shell before a full run.
export SKIP_CURSOR_AGENT=1
export UX_AUDIT_OUT_DIR="$(mktemp -d "${ROOT}/.learn101-test-XXXXXXXX")"
trap 'rm -rf "${UX_AUDIT_OUT_DIR}"' EXIT

bash "${INV}" --check-only --only-rule DET.LANDMARKS.REQUIRED

test -f "${UX_AUDIT_OUT_DIR}/state.jsonl"
grep -q 'DET.LANDMARKS.REQUIRED' "${UX_AUDIT_OUT_DIR}/state.jsonl"
test -f "${UX_AUDIT_OUT_DIR}/SUMMARY.md"

echo "invoke-learn-101-per-rule-loop.test.sh: OK (check-only wiring)"
