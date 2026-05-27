import axe from 'axe-core';

import { A11Y_STANDARD_PRESETS } from './a11y-standards.js';
import { COMPLIANCE_PROFILES } from './compliance-profiles.js';
import { axeRuleEligibleForProfile, wcagCriteriaFromAxeTags } from './wcag-tag-parse.js';

export const RTM_PROFILE_IDS = [
  'wcag20a',
  'wcag20aa',
  'wcag20aaa',
  'wcag21aa',
  'wcag22aa',
];

/**
 * @param {string} profileId
 */
function profileAxeTags(profileId) {
  const def = COMPLIANCE_PROFILES[profileId];
  if (!def?.axePresetKey) return [];
  const preset = A11Y_STANDARD_PRESETS[def.axePresetKey];
  return preset?.axeTags ? [...preset.axeTags] : [];
}

/**
 * @returns {Array<{
 *   axeRuleId: string,
 *   forgeRuleId: string,
 *   description: string,
 *   axeTags: string[],
 *   wcagCriteria: string[],
 *   inProfiles: Record<string, boolean>,
 * }>}
 */
export function buildAxeRuleCatalog() {
  const rules = axe.getRules();
  const entries = [];

  for (const [axeRuleId, rule] of Object.entries(rules)) {
    const axeTags = [...(rule.tags || [])];
    const wcagCriteria = wcagCriteriaFromAxeTags(axeTags);
    /** @type {Record<string, boolean>} */
    const inProfiles = {};
    for (const profileId of RTM_PROFILE_IDS) {
      inProfiles[profileId] = axeRuleEligibleForProfile(axeTags, profileAxeTags(profileId));
    }
    entries.push({
      axeRuleId,
      forgeRuleId: `AXE.${String(axeRuleId).replace(/[^a-zA-Z0-9._-]+/g, '_')}`,
      description: String(rule.description || rule.help || axeRuleId),
      axeTags,
      wcagCriteria,
      inProfiles,
    });
  }

  return entries.sort((a, b) => a.forgeRuleId.localeCompare(b.forgeRuleId));
}

/**
 * @param {string} profileId
 * @param {ReturnType<typeof buildAxeRuleCatalog>} catalog
 */
export function axeCatalogForProfile(profileId, catalog) {
  return catalog.filter((e) => e.inProfiles[profileId]);
}
