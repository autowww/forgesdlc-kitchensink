/**
 * UX DET policy for sealed Studio / app-shell scenario audits.
 * Uses an explicit dynamic-UI allowlist (see studio-dynamic-ux-ruleset.mjs).
 */

import {
  A11Y_STUDIO_UX_DET_EXCLUDED,
  resolveStudioDynamicUxRuleIds,
} from './studio-dynamic-ux-ruleset.mjs';
import { loadDesignRuleRegistry } from '../../website-ux-auditor/lib/design-rule-runtime.js';

export { A11Y_STUDIO_UX_DET_EXCLUDED };

/**
 * @param {string} siteKind
 * @param {{ registry?: Awaited<ReturnType<typeof loadDesignRuleRegistry>>, includePrimitives?: boolean }} [opts]
 * @returns {Promise<{ onlyDeterministicRuleIds: string[], excludeDeterministicRuleIds: string[] }>}
 */
export async function studioUxDetRuntimeOpts(siteKind, opts = {}) {
  if (siteKind === 'a11y-studio' || siteKind === 'app-shell') {
    const registry = opts.registry || (await loadDesignRuleRegistry());
    const includePrimitives = opts.includePrimitives === true;
    return {
      onlyDeterministicRuleIds: resolveStudioDynamicUxRuleIds(registry, { includePrimitives }),
      excludeDeterministicRuleIds: [],
    };
  }
  return { onlyDeterministicRuleIds: [], excludeDeterministicRuleIds: [] };
}
