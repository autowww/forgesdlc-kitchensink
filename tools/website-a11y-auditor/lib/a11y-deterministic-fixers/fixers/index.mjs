import { runHandbookAfterFixer } from './handbook-after.mjs';

/**
 * @param {string} fixerId
 * @param {object} ctx
 */
export async function runFixerById(fixerId, ctx) {
  switch (fixerId) {
    case 'handbook_after':
      return runHandbookAfterFixer(ctx);
    default:
      return { applied: false, error: `unknown fixerId: ${fixerId}` };
  }
}
