import { runPlanOnlyFixer } from './plan-only.mjs';
import { runRemediationNoteFixer } from './remediation-note.mjs';

const FIXERS = {
  plan_only: runPlanOnlyFixer,
  remediation_note: runRemediationNoteFixer,
};

/**
 * @param {string} fixerId
 * @param {object} ctx
 */
export async function runAiFixerById(fixerId, ctx) {
  const fn = FIXERS[fixerId] || FIXERS.plan_only;
  return fn(ctx);
}
