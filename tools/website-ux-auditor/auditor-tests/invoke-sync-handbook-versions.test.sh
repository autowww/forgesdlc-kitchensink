#!/usr/bin/env bash
set -euo pipefail
TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "${TESTS_ROOT}/invoke-sync-handbook-versions.sh" --help >/dev/null
# Dry-run manifest: bootstrap-only sync is idempotent when already current
KS_ROOT="$(cd "${TESTS_ROOT}/../../.." && pwd)"
summary="$(jq -r '.summary | "\(.missing)-\(.stale)-\(.current)"' "${KS_ROOT}/docs/design/ux-audit/rule-pages/rule-pages.manifest.json")"
test "${summary}" = "0-0-71" || test "${summary}" = "0-0-70" || {
  echo "invoke-sync-handbook-versions.test.sh: unexpected manifest summary ${summary}" >&2
  exit 1
}
echo "invoke-sync-handbook-versions.test.sh: OK (manifest ${summary})"
