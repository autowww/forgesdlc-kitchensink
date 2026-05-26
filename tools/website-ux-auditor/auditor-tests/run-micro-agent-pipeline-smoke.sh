#!/usr/bin/env bash
# Smoke: harness --llm path with mocked workcell output (no live LLM).
set -euo pipefail
TESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export FORGE_WORKCELLS_MOCK_FINDINGS_JSON="${TESTS_ROOT}/fixtures/micro-agent-mock-findings.json"
export FORGE_WORKCELLS_BIN="${FORGE_WORKCELLS_BIN:-$(cd "${TESTS_ROOT}/../../../forge-workcells" 2>/dev/null && pwd)/.venv/bin/forge-workcells}"
if [[ ! -x "${FORGE_WORKCELLS_BIN}" ]]; then
  FORGE_WORKCELLS_BIN="$(cd "${TESTS_ROOT}/../../../../forge-workcells" && pwd)/.venv/bin/forge-workcells"
fi
bash "${TESTS_ROOT}/invoke-ai-ruleset-harness.sh" \
  --only-rule AI.VISUAL.HIERARCHY \
  --llm \
  --llm-env=/dev/null \
  --force \
  --no-watch
echo "run-micro-agent-pipeline-smoke.sh: OK"
