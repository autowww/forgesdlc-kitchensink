#!/usr/bin/env bash
set -euo pipefail
TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
out="$(bash "${TESTS_ROOT}/invoke-det-ruleset-handbook-upgrade.sh" --dry-run 2>&1)"
test -n "${out}"
echo "${out}" | grep -q "bootstrap rule" || echo "${out}" | grep -q "no bootstrap"
echo "invoke-det-ruleset-handbook-upgrade.test.sh: OK"
