#!/usr/bin/env bash
# End-to-end: sitewide scorer → auditor Playwright crawl with live stderr feedback.
# Run from tools/website-ux-auditor: npm run test:e2e-loop
set -euo pipefail

AUDITOR_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KS_ROOT="$(cd "${AUDITOR_ROOT}/../.." && pwd)"
LOOP="${AUDITOR_ROOT}/run-website-ux-remediation-loop.sh"
FIXTURE_REPO="${AUDITOR_ROOT}/auditor-tests/fixtures/minimal-repo"
WWW_FIXTURE="${FIXTURE_REPO}/www-fixture"
STANDARD="${KS_ROOT}/docs/design/forge-enterprise-ai-website-standard.md"

if [[ ! -f "${STANDARD}" ]]; then
  echo "run-remediation-loop-e2e: missing design standard: ${STANDARD}" >&2
  exit 2
fi

campaign="$(mktemp -d "${AUDITOR_ROOT}/.ux-loop-e2e-XXXXXXXXXX")"
cleanup() { rm -rf "${campaign}"; }
trap cleanup EXIT

unset FORGE_UX_LOOP_WATCH FORGE_UX_LOOP_WATCH_OUT_DIR FORGE_UX_LOOP_WATCH_LOG FORGE_UX_LOOP_WATCH_REFRESH_MS || true

export SKIP_CURSOR_AGENT=1
export UX_AUDIT_OUT_DIR="${campaign}"
export UX_AUDIT_SCORER_MAX_PAGES=2
export MAX_PAGES=2
export STOP_AFTER_MAJOR_PLUS=99
export UX_AUDIT_BREADTH_CRAWL=1
export TIMEOUT_MS=90000
export FORGE_UX_CRAWL_PROGRESS_HEARTBEAT_SEC=0
export DESIGN_STANDARD_PATH="${STANDARD}"

set +e
merged="$(bash "${LOOP}" "${FIXTURE_REPO}" "${WWW_FIXTURE}" 2>&1)"
ec=$?
set -e

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
grep -q '\[ux-audit\].*launch Chromium' <<<"${merged}" || { echo 'run-remediation-loop-e2e: expected auditor crawl launch Chromium row on stderr' >&2; exit 1; }

grep -q 'crawl_progress_reporter_finished' "${campaign}/auditor-crawl-progress.log" \
  || { echo 'run-remediation-loop-e2e: auditor-crawl-progress.log missing finish sentinel' >&2; exit 1; }

echo 'run-remediation-loop-e2e: OK'
