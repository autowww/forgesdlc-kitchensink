#!/usr/bin/env bash
# Smoke-test DET modules load and LANG harness fixture still fires.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
TOOL="$(cd "${DIR}/.." && pwd)"

bash "${DIR}/invoke-a11y-ruleset-harness.sh" DET.A11Y.GENERIC.LANG

bash "${DIR}/invoke-ai-ruleset-harness.sh" --skip-agent

bash "${DIR}/run-a11y-deterministic-fixers.smoke.sh"

TOOL="${TOOL}" node --input-type=module -e "
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const tool = process.env.TOOL;
const rules = [
  ['DET.A11Y.GENERIC.RESIZE_TEXT', 'det-a11y-generic-resize-text.check.js'],
  ['DET.A11Y.GENERIC.FOCUS_CONTEXT_CHANGE', 'det-a11y-generic-focus-context-change.check.js'],
  ['DET.A11Y.GENERIC.STATUS_MESSAGES', 'det-a11y-generic-status-messages.check.js'],
  ['DET.A11Y.GENERIC.NON_TEXT_CONTRAST', 'det-a11y-generic-non-text-contrast.check.js'],
  ['DET.A11Y.GENERIC.CONTRAST_ENHANCED', 'det-a11y-generic-contrast-enhanced.check.js'],
  ['DET.A11Y.GENERIC.ORIENTATION', 'det-a11y-generic-orientation.check.js'],
  ['DET.A11Y.GENERIC.INPUT_PURPOSE', 'det-a11y-generic-input-purpose.check.js'],
  ['DET.A11Y.GENERIC.LABEL_IN_NAME', 'det-a11y-generic-label-in-name.check.js'],
  ['DET.A11Y.GENERIC.CONCURRENT_INPUT', 'det-a11y-generic-concurrent-input.check.js'],
];
const gen = path.join(tool, 'design-rules/deterministic/generated');
for (const [id, file] of rules) {
  const mod = await import(pathToFileURL(path.join(gen, file)));
  if (typeof mod.run !== 'function') throw new Error(id + ' missing run()');
  const out = await mod.run({});
  if (!Array.isArray(out)) throw new Error(id + ' run() must return array');
  console.log('ok', id);
}
"

echo "[harness-matrix] done"
