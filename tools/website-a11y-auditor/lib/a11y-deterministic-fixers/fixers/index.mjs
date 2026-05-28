import { runHandbookAfterFixer } from './handbook-after.mjs';
import { A11Y_FIXER_BY_ID } from './patch-registry.mjs';

/**
 * @param {string} fixerId
 * @param {object} ctx
 */
export async function runFixerById(fixerId, ctx) {
  if (fixerId === 'handbook_after') {
    return runHandbookAfterFixer(ctx);
  }
  const fn = A11Y_FIXER_BY_ID[fixerId];
  if (typeof fn === 'function') {
    return fn(ctx);
  }
  return { applied: false, error: `unknown fixerId: ${fixerId}` };
}
