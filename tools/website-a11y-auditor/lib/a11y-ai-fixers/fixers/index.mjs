import { runPlanOnlyFixer } from './plan-only.mjs';

const FIXERS = {
  plan_only: runPlanOnlyFixer,
};

/**
 * @param {string} fixerId
 * @param {object} ctx
 */
export function runAiFixerById(fixerId, ctx) {
  const fn = FIXERS[fixerId] || FIXERS.plan_only;
  return fn(ctx);
}
