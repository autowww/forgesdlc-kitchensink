#!/usr/bin/env bash
# Dry-run wiring for invoke-learn-101-remaining-rules.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="${ROOT}/invoke-det-ruleset-harness.sh"

export UX_AUDIT_OUT_DIR="$(mktemp -d "${ROOT}/.learn101-remaining-test-XXXXXXXX")"
trap 'rm -rf "${UX_AUDIT_OUT_DIR}"' EXIT

lines="$(bash "${SCRIPT}" --use-completed-list --dry-run 2>/dev/null | grep -c '^DET\.' || true)"
test "${lines}" -ge 35

echo "invoke-learn-101-remaining-rules.test.sh: OK (${lines} remaining rules)"
