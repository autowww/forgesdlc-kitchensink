#!/usr/bin/env bash
# Copy remediated DET.HASH.MARKERS agent-pilot fixture from in-repo mirror to workbench campaign.
set -euo pipefail

TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="${TESTS_ROOT}/agent-pilot-campaigns/ruleset-agent-pilot-applyfirst-20260525T120000Z/rules/DET.HASH.MARKERS"
if [[ ! -d "${SRC}/fixture-website" ]]; then
  SRC="${TESTS_ROOT}/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.HASH.MARKERS"
fi
if [[ ! -d "${SRC}/fixture-website" ]]; then
  SRC="${TESTS_ROOT}/agent-pilot-campaigns/ruleset-agent-pilot-20260525T110025Z/rules/DET.HASH.MARKERS"
fi
DEST="${FORGE_UX_AGENT_PILOT_CAMPAIGN:-$HOME/Code/workbench/ux-auditor/ux-audit/ruleset-agent-pilot-applyfirst-20260525T120000Z/rules/DET.HASH.MARKERS}"

if [[ ! -d "${SRC}/fixture-website" ]]; then
  echo "sync-agent-pilot-hash-markers-fixture: missing source ${SRC}/fixture-website" >&2
  exit 1
fi

mkdir -p "${DEST}/fixture-website"
cp -a "${SRC}/fixture-website/." "${DEST}/fixture-website/"
echo "sync-agent-pilot-hash-markers-fixture: copied remediated fixture → ${DEST}/fixture-website" >&2
