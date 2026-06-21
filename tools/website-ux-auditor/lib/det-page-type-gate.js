/**
 * Skip DET rules that do not apply to the page type (token/cost optimization).
 * Mapping is conservative: only skip when page type clearly out of scope.
 */

/** @type {Record<string, Set<string>>} */
const SKIP_RULES_BY_PAGE_TYPE = {
  'app-shell': new Set([
    'DET.PAGE.MODE',
    'homepage-shell',
  ]),
  'handbook-chapter': new Set([
    'homepage-shell',
    'first-screen-density',
    'product-visual',
    'storyline-flow',
  ]),
  landing: new Set([]),
  'handbook-home': new Set(['storyline-flow']),
};

/**
 * @param {string} ruleId
 * @param {string} pageTypeId
 * @param {boolean} [enabled]
 */
export function shouldRunDeterministicRuleForPageType(ruleId, pageTypeId, enabled = true) {
  if (!enabled) return true;
  const pt = String(pageTypeId || 'generic');
  const skip = SKIP_RULES_BY_PAGE_TYPE[pt];
  if (!skip) return true;
  return !skip.has(ruleId);
}

/**
 * @param {string[]} ruleIds
 * @param {string} pageTypeId
 * @param {boolean} [enabled]
 */
export function filterDeterministicRulesForPageType(ruleIds, pageTypeId, enabled = true) {
  if (!enabled) return ruleIds;
  return ruleIds.filter((id) => shouldRunDeterministicRuleForPageType(id, pageTypeId, true));
}
