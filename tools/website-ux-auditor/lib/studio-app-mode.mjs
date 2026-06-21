/**
 * App-mode deterministic rule allowlist (Studio dynamic UX).
 */
import { resolveStudioDynamicUxRuleIds } from '../../ui-app-audit/lib/studio-dynamic-ux-ruleset.mjs';
import { loadDesignRuleRegistry } from './design-rule-runtime.js';

/**
 * @param {{ includePrimitives?: boolean }} [opts]
 * @returns {Promise<string[]>}
 */
export async function appModeDeterministicRuleIds(opts = {}) {
  const registry = await loadDesignRuleRegistry();
  const includePrimitives = opts.includePrimitives !== false;
  return resolveStudioDynamicUxRuleIds(registry, { includePrimitives });
}
