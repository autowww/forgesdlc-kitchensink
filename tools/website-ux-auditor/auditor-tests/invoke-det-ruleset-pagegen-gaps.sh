#!/usr/bin/env bash
# Generate rule-page markdown (Before/After examples) for DET rules missing harness fixtures.
#
# Usage:
#   ./invoke-det-ruleset-pagegen-gaps.sh [--dry-run]
#   ./invoke-det-ruleset-pagegen-gaps.sh --from-manifest /path/to/fixture-root/manifest.json
#
# Requires: npm run pagegen (Cursor agent) from tools/website-ux-auditor.

set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUDITOR_ROOT="$(cd "${TESTS_ROOT}/.." && pwd)"
DRY_RUN=0
MANIFEST=""
CONCURRENCY="${FORGE_UX_PAGE_GEN_CONCURRENCY:-4}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --from-manifest) MANIFEST="${2:-}"; shift 2 ;;
    --concurrency) CONCURRENCY="${2:-4}"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

if [[ -z "${MANIFEST}" ]]; then
  MANIFEST="${FORGE_UX_RULESET_FIXTURE_ROOT:-}/manifest.json"
  if [[ ! -f "${MANIFEST}" ]]; then
    echo "invoke-det-ruleset-pagegen-gaps: set --from-manifest or FORGE_UX_RULESET_FIXTURE_ROOT" >&2
    exit 2
  fi
fi

mapfile -t RULES < <(jq -r '.rules[]? | select(.status == "missing_fixture") | .ruleId' "${MANIFEST}")

if [[ ${#RULES[@]} -eq 0 ]]; then
  echo "invoke-det-ruleset-pagegen-gaps: no missing_fixture rules in ${MANIFEST}"
  exit 0
fi

echo "invoke-det-ruleset-pagegen-gaps: ${#RULES[@]} rule(s) need Before examples"
printf '  %s\n' "${RULES[@]}"

PAGEGEN_ARGS=(--lane deterministic --concurrency "${CONCURRENCY}")
for rid in "${RULES[@]}"; do
  PAGEGEN_ARGS+=(--only-rule "${rid}")
done

if [[ "${DRY_RUN}" -eq 1 ]]; then
  cd "${AUDITOR_ROOT}"
  npm run pagegen -- "${PAGEGEN_ARGS[@]}" --dry-run
  exit 0
fi

cd "${AUDITOR_ROOT}"
if npm run pagegen -- "${PAGEGEN_ARGS[@]}"; then
  echo "invoke-det-ruleset-pagegen-gaps: pagegen ok"
else
  echo "invoke-det-ruleset-pagegen-gaps: pagegen failed — falling back to bootstrap_missing_rule_pages.py" >&2
  python3 "${AUDITOR_ROOT}/../../generator/bootstrap_missing_rule_pages.py" --manifest "${MANIFEST}"
fi

echo "invoke-det-ruleset-pagegen-gaps: done — rebuild fixtures and re-run harness"
