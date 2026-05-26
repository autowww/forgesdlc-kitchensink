#!/usr/bin/env bash
# Copy remediated DET.APP.PERSISTENT_CHROME agent-pilot fixture from in-repo mirror to workbench campaign.
set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="${TESTS_ROOT}/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.APP.PERSISTENT_CHROME"
DEST="${FORGE_UX_AGENT_PILOT_CAMPAIGN:-$HOME/Code/workbench/ux-auditor/ux-audit/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.APP.PERSISTENT_CHROME}"

if [[ ! -d "${SRC}/fixture-website" ]]; then
  echo "sync-agent-pilot-persistent-chrome-fixture: missing source ${SRC}/fixture-website" >&2
  exit 1
fi

mkdir -p "${DEST}/fixture-website"
cp -a "${SRC}/fixture-website/." "${DEST}/fixture-website/"
echo "sync-agent-pilot-persistent-chrome-fixture: copied remediated fixture → ${DEST}/fixture-website" >&2
