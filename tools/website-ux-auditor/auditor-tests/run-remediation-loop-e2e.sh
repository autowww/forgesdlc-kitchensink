#!/usr/bin/env bash
# End-to-end: sitewide scorer → auditor Playwright crawl with live stderr feedback.
# Run from tools/website-ux-auditor: npm run test:e2e-loop
#
# Watchdog: the combined log must gain at least one new line every E2E_LOG_IDLE_SEC seconds
# (default 60). Otherwise the loop child is killed and this script exits 2 — treat as hang/stall.
#
# Env:
#   E2E_LOG_IDLE_SEC   Stall threshold in seconds (default 60).
set -euo pipefail

AUDITOR_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KS_ROOT="$(cd "${AUDITOR_ROOT}/../.." && pwd)"
LOOP="${AUDITOR_ROOT}/run-website-ux-remediation-loop.sh"
FIXTURE_REPO="${AUDITOR_ROOT}/auditor-tests/fixtures/minimal-repo"
WWW_FIXTURE="${FIXTURE_REPO}/www-fixture"
STANDARD="${KS_ROOT}/docs/design/forge-enterprise-ai-website-standard.md"
E2E_LOG_IDLE_SEC="${E2E_LOG_IDLE_SEC:-60}"

if [[ ! -f "${STANDARD}" ]]; then
  echo "run-remediation-loop-e2e: missing design standard: ${STANDARD}" >&2
  exit 2
fi

campaign="$(mktemp -d "${AUDITOR_ROOT}/.ux-loop-e2e-XXXXXXXXXX")"
log="$(mktemp "${AUDITOR_ROOT}/.ux-loop-e2e-log-XXXXXXXX.txt")"
stall_flag="$(mktemp "${AUDITOR_ROOT}/.ux-loop-e2e-stall-XXXXXXXX.flag")"
rm -f "${stall_flag}"
cleanup() {
  rm -rf "${campaign}"
  rm -f "${log}" "${stall_flag}"
}
trap cleanup EXIT

unset FORGE_UX_LOOP_WATCH FORGE_UX_LOOP_WATCH_OUT_DIR FORGE_UX_LOOP_WATCH_LOG FORGE_UX_LOOP_WATCH_REFRESH_MS || true

export SKIP_CURSOR_AGENT=1
export UX_AUDIT_SCORER_NO_CSV=1
export UX_AUDIT_OUT_DIR="${campaign}"
export UX_AUDIT_SCORER_MAX_PAGES=2
export MAX_PAGES=2
export STOP_AFTER_MAJOR_PLUS=99
export FORGE_UX_AUDIT_STOP_AFTER_BACKLOG=0
export UX_AUDIT_BREADTH_CRAWL=1
export TIMEOUT_MS=90000
# During crawl idle windows, emit a progress row at least every 30s so the log-line watchdog
# does not false-positive while Playwright is between page events.
export FORGE_UX_CRAWL_PROGRESS_HEARTBEAT_SEC=30
export DESIGN_STANDARD_PATH="${STANDARD}"

stall_watchdog() {
  local log_path=$1
  local child_pid=$2
  local idle_sec=$3
  local flag_path=$4
  while kill -0 "${child_pid}" 2>/dev/null; do
    local n1 n2
    n1=$(wc -l <"${log_path}" 2>/dev/null | tr -d ' ' || echo 0)
    sleep "${idle_sec}"
    kill -0 "${child_pid}" 2>/dev/null || return 0
    n2=$(wc -l <"${log_path}" 2>/dev/null | tr -d ' ' || echo 0)
    if [[ "${n1}" == "${n2}" ]]; then
      : >"${flag_path}"
      echo "run-remediation-loop-e2e: STALL · no new log lines within ${idle_sec}s (threshold E2E_LOG_IDLE_SEC=${E2E_LOG_IDLE_SEC})" >&2
      echo "run-remediation-loop-e2e: log tail (${log_path}):" >&2
      tail -n 50 "${log_path}" >&2 || true
      kill -TERM "${child_pid}" 2>/dev/null || true
      sleep 4
      kill -KILL "${child_pid}" 2>/dev/null || true
      return 1
    fi
  done
  return 0
}

: >"${log}"

set +e
bash "${LOOP}" "${FIXTURE_REPO}" "${WWW_FIXTURE}" > >(tee -a "${log}") 2>&1 &
child=$!

stall_watchdog "${log}" "${child}" "${E2E_LOG_IDLE_SEC}" "${stall_flag}" &
wg_pid=$!

wait "${child}"
ec=$?

kill "${wg_pid}" 2>/dev/null || true
wait "${wg_pid}" 2>/dev/null || true

set -e

if [[ -f "${stall_flag}" ]]; then
  echo 'run-remediation-loop-e2e: failed — log idle watchdog (no new lines within E2E_LOG_IDLE_SEC)' >&2
  exit 2
fi

merged="$(cat "${log}")"

if [[ "${ec}" -ne 0 ]]; then
  if grep -qiE 'browserType\.launch|Executable doesn'\''t exist|playwright install|Chromium distribution' <<<"${merged}"; then
    echo "run-remediation-loop-e2e: SKIP — Playwright Chromium not installed (install with: cd tools/website-ux-auditor && npx playwright install chromium)"
    exit 0
  fi
  printf '%s\n' "${merged}" | head -c 12000 >&2
  exit "${ec}"
fi

grep -q '\[ux-score\] complete' <<<"${merged}" || { echo 'run-remediation-loop-e2e: expected [ux-score] complete in combined output' >&2; exit 1; }
grep -q 'scorer=complete · next=analyze-website-ux\.mjs' <<<"${merged}" || { echo 'run-remediation-loop-e2e: expected shell handoff after scorer' >&2; exit 1; }
grep -q '\[ux-audit\] phase=run ' <<<"${merged}" || { echo 'run-remediation-loop-e2e: expected [ux-audit] phase=run' >&2; exit 1; }
grep -q '\[ux-audit\] phase=main_crawl' <<<"${merged}" || { echo 'run-remediation-loop-e2e: expected [ux-audit] phase=main_crawl' >&2; exit 1; }
grep -qE '\[ux-audit\].*(launch Chromium|…ch Chromium)' <<<"${merged}" || { echo 'run-remediation-loop-e2e: expected auditor crawl Chromium launch row on stderr' >&2; exit 1; }

grep -q 'crawl_progress_reporter_finished' "${campaign}/auditor-crawl-progress.log" \
  || { echo 'run-remediation-loop-e2e: auditor-crawl-progress.log missing finish sentinel' >&2; exit 1; }

echo 'run-remediation-loop-e2e: OK'
