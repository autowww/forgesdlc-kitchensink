#!/usr/bin/env bash
# Smoke-test DET modules load and LANG harness fixture still fires.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
TOOL="$(cd "${DIR}/.." && pwd)"

bash "${DIR}/invoke-a11y-ruleset-harness.sh" DET.A11Y.GENERIC.LANG

node --input-type=module -e "
const rules = [
  ['DET.A11Y.GENERIC.RESIZE_TEXT', '../design-rules/deterministic/generated/det-a11y-generic-resize-text.check.js'],
  ['DET.A11Y.GENERIC.FOCUS_CONTEXT_CHANGE', '../design-rules/deterministic/generated/det-a11y-generic-focus-context-change.check.js'],
  ['DET.A11Y.GENERIC.STATUS_MESSAGES', '../design-rules/deterministic/generated/det-a11y-generic-status-messages.check.js'],
  ['DET.A11Y.GENERIC.NON_TEXT_CONTRAST', '../design-rules/deterministic/generated/det-a11y-generic-non-text-contrast.check.js'],
  ['DET.A11Y.GENERIC.CONTRAST_ENHANCED', '../design-rules/deterministic/generated/det-a11y-generic-contrast-enhanced.check.js'],
];
for (const [id, rel] of rules) {
  const mod = await import(new URL(rel, import.meta.url));
  if (typeof mod.run !== 'function') throw new Error(id + ' missing run()');
  const out = await mod.run({});
  if (!Array.isArray(out)) throw new Error(id + ' run() must return array');
  console.log('ok', id);
}
"

echo "[harness-matrix] done"
