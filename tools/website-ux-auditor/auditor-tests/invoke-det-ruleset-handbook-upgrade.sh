#!/usr/bin/env bash
# Upgrade bootstrap DET rule pages via pagegen (batched, concurrency 1).
#
# Usage:
#   ./invoke-det-ruleset-handbook-upgrade.sh [--dry-run] [--batch-size N] [--from N]
#
# On pagegen failure: logs rule to handbook-upgrade-failures.log (does not overwrite).

set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUDITOR_ROOT="$(cd "${TESTS_ROOT}/.." && pwd)"
KS_ROOT="$(cd "${AUDITOR_ROOT}/../.." && pwd)"
MANIFEST="${KS_ROOT}/docs/design/ux-audit/rule-pages/rule-pages.manifest.json"
FAIL_LOG="${TESTS_ROOT}/handbook-upgrade-failures.log"

DRY_RUN=0
BATCH_SIZE=5
FROM_IDX=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --batch-size) BATCH_SIZE="${2:-5}"; shift 2 ;;
    --from) FROM_IDX="${2:-0}"; shift 2 ;;
    -h|--help)
      sed -n '1,12p' "$0"
      exit 0
      ;;
    *) echo "invoke-det-ruleset-handbook-upgrade: unknown arg: $1" >&2; exit 2 ;;
  esac
done

if [[ ! -f "${MANIFEST}" ]]; then
  echo "invoke-det-ruleset-handbook-upgrade: missing ${MANIFEST}" >&2
  exit 2
fi

mapfile -t RULES < <(jq -r '
  .rules[]?
  | select(.agentModel == "bootstrap-missing-rule-pages.py")
  | .id
' "${MANIFEST}")

if [[ ${#RULES[@]} -eq 0 ]]; then
  echo "invoke-det-ruleset-handbook-upgrade: no bootstrap rules in manifest"
  exit 0
fi

if [[ "${FROM_IDX}" -gt 0 ]]; then
  RULES=("${RULES[@]:${FROM_IDX}}")
fi

echo "invoke-det-ruleset-handbook-upgrade: ${#RULES[@]} bootstrap rule(s), batch=${BATCH_SIZE}"
: >"${FAIL_LOG}"

idx=0
while [[ "${idx}" -lt ${#RULES[@]} ]]; do
  end=$((idx + BATCH_SIZE))
  [[ "${end}" -gt ${#RULES[@]} ]] && end=${#RULES[@]}
  batch=("${RULES[@]:idx:end}")
  echo "invoke-det-ruleset-handbook-upgrade: batch $((idx / BATCH_SIZE + 1)) — ${batch[*]}"

  PAGEGEN_ARGS=(--lane deterministic --concurrency 1)
  for rid in "${batch[@]}"; do
    PAGEGEN_ARGS+=(--only-rule "${rid}")
  done

  if [[ "${DRY_RUN}" -eq 1 ]]; then
    (cd "${AUDITOR_ROOT}" && npm run pagegen -- "${PAGEGEN_ARGS[@]}" --dry-run)
    idx="${end}"
    continue
  fi

  set +e
  (cd "${AUDITOR_ROOT}" && npm run pagegen -- "${PAGEGEN_ARGS[@]}")
  pg_rc=$?
  set -e

  if [[ "${pg_rc}" -ne 0 ]]; then
    for rid in "${batch[@]}"; do
      echo "${rid} pagegen_rc=${pg_rc}" >>"${FAIL_LOG}"
    done
    echo "invoke-det-ruleset-handbook-upgrade: batch failed (logged)" >&2
  fi

  idx="${end}"
  if [[ "${idx}" -lt ${#RULES[@]} ]]; then
    sleep 2
  fi
done

if [[ "${DRY_RUN}" -eq 0 ]]; then
  (cd "${AUDITOR_ROOT}" && node rule-page-version.mjs --write-manifest) || true
fi

if [[ -s "${FAIL_LOG}" ]]; then
  echo "invoke-det-ruleset-handbook-upgrade: failures in ${FAIL_LOG}" >&2
  exit 1
fi

echo "invoke-det-ruleset-handbook-upgrade: done"
