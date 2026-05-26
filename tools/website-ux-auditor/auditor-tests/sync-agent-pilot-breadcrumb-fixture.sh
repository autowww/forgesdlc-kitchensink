#!/usr/bin/env bash
# Copy remediated DET.NAV.BREADCRUMB agent-pilot fixture from in-repo mirror to workbench campaign.
set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="${TESTS_ROOT}/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.NAV.BREADCRUMB"
DEST="${FORGE_UX_AGENT_PILOT_CAMPAIGN:-$HOME/Code/workbench/ux-auditor/ux-audit/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.NAV.BREADCRUMB}"

if [[ ! -d "${SRC}/fixture-website" ]]; then
  echo "sync-agent-pilot-breadcrumb-fixture: missing source ${SRC}/fixture-website" >&2
  exit 1
fi

mkdir -p "${DEST}/fixture-website"
cp -a "${SRC}/fixture-website/." "${DEST}/fixture-website/"
echo "sync-agent-pilot-breadcrumb-fixture: copied remediated fixture → ${DEST}/fixture-website" >&2
