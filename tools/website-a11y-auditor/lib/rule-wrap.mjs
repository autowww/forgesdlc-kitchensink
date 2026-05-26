/**
 * Re-export a UX auditor check with A11Y rule metadata.
 * @param {object} baseRule
 * @param {string} newId
 * @param {string} scope
 * @param {string} source
 */
export function wrapRule(baseRule, newId, scope, source) {
  return {
    ...baseRule,
    id: newId,
    scope,
    source,
    lane: 'deterministic',
    area: 'accessibility',
  };
}
