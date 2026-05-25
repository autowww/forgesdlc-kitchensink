#!/usr/bin/env bash
# Deprecated: use invoke-det-ruleset-harness.sh (DET ruleset harness).
set -euo pipefail
TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "invoke-learn-101-remaining-rules: deprecated — use invoke-det-ruleset-harness.sh" >&2
exec bash "${TESTS_ROOT}/invoke-det-ruleset-harness.sh" "$@"
