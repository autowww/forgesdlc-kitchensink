import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { COMPLIANCE_DISCLAIMER, COMPLIANCE_PROFILES, getComplianceProfile } from './compliance-profiles.js';
import { A11Y_STANDARD_PRESETS } from './a11y-standards.js';
import { RTM_PROFILE_IDS } from './axe-rule-catalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const TOOL_ROOT = path.resolve(__dirname, '..');
export const STANDARDS_PACKS_DIR = path.resolve(TOOL_ROOT, 'design-rules/standards-packs');

const SPEC_URLS = {
  '2.0': 'https://www.w3.org/TR/WCAG20/',
  '2.1': 'https://www.w3.org/TR/WCAG21/',
  '2.2': 'https://www.w3.org/TR/WCAG22/',
};

/**
 * @param {object} row
 */
function toolingFromRow(row) {
  /** @type {string[]} */
  const tooling = [];
  if (row.axeRules?.length) tooling.push('axe');
  if (row.detRules?.length) tooling.push('det');
  if (row.aiRules?.length) tooling.push('ai');
  if (row.gap === 'manual_expected') tooling.push('manual');
  return tooling;
}

/**
 * @param {ReturnType<import('./build-traceability-matrix.js').buildStandardsTraceability>} matrix
 * @param {string} profileId
 */
export function buildStandardsPackFromProfile(matrix, profileId) {
  const profileMatrix = matrix.profiles[profileId];
  if (!profileMatrix) {
    throw new Error(`No RTM profile in matrix: ${profileId}`);
  }

  const def = getComplianceProfile(profileId);
  const preset = def ? A11Y_STANDARD_PRESETS[def.axePresetKey] : null;
  const wcagVersion = def?.wcagVersion || '—';
  const specUrl = SPEC_URLS[wcagVersion] || '';

  const criteria = profileMatrix.criteria.map((row) => {
    const tooling = toolingFromRow(row);
    return {
      id: row.criterionId,
      title: row.title,
      level: row.level,
      principle: row.principle,
      gap: row.gap,
      tooling,
      rules: {
        axe: [...(row.axeRules || [])],
        det: [...(row.detRules || [])],
        ai: [...(row.aiRules || [])],
      },
    };
  });

  const criteriaIds = new Set(criteria.map((c) => c.id));
  const rulesIndex = (profileMatrix.rules || [])
    .filter((r) => !r.forgeOnly)
    .map((r) => ({
      ruleId: r.ruleId,
      lane: r.lane,
      wcagCriteria: [...(r.wcagCriteria || [])],
      inPack: (r.wcagCriteria || []).some((sc) => criteriaIds.has(sc)),
    }));

  const summary = {
    totalCriteria: profileMatrix.summary.totalCriteria,
    automationMapped: profileMatrix.summary.covered,
    manualExpected: profileMatrix.summary.manualExpected,
    uncovered: profileMatrix.summary.uncovered,
    untiedRuleCount: profileMatrix.summary.untiedRuleCount,
    axeRuleCount: profileMatrix.summary.axeRuleCount,
    byPrinciple: profileMatrix.summary.byPrinciple,
  };

  const automationCoveragePercent =
    summary.totalCriteria > 0
      ? Math.round(
          ((summary.automationMapped + summary.manualExpected) / summary.totalCriteria) * 1000,
        ) / 10
      : 0;

  return {
    schemaVersion: 1,
    packId: profileId,
    label: def?.label || profileId,
    wcagVersion,
    level: def?.level || profileMatrix.level || '—',
    specUrl,
    disclaimer: COMPLIANCE_DISCLAIMER,
    generatedAt: matrix.generatedAt || new Date().toISOString(),
    axeTags: preset?.axeTags ? [...preset.axeTags] : [],
    detStandardsTags: def?.detStandardsTags ? [...def.detStandardsTags] : [],
    summary: {
      ...summary,
      automationCoveragePercent,
    },
    criteria,
    rulesIndex,
    validation: {
      uncoveredCriteria: [...(profileMatrix.gaps.uncoveredCriteria || [])],
      untiedRules: (profileMatrix.gaps.untiedRules || []).map((u) => u.ruleId || u),
      forgeOnlyRules: [...(profileMatrix.gaps.forgeOnlyRules || [])],
    },
  };
}

/**
 * @param {ReturnType<import('./build-traceability-matrix.js').buildStandardsTraceability>} matrix
 * @param {string[]} [profileIds]
 */
export function buildAllStandardsPacks(matrix, profileIds = RTM_PROFILE_IDS) {
  /** @type {Record<string, object>} */
  const packs = {};
  for (const profileId of profileIds) {
    packs[profileId] = buildStandardsPackFromProfile(matrix, profileId);
  }
  return packs;
}

/**
 * @param {object} pack
 * @param {{ allowManualOnly?: boolean }} opts
 */
export function validateStandardsPack(pack, opts = {}) {
  const uncovered = pack.validation?.uncoveredCriteria || [];
  const errors = [];
  if (uncovered.length && !opts.allowManualOnly) {
    errors.push(`uncovered criteria: ${uncovered.join(', ')}`);
  }
  for (const c of pack.criteria || []) {
    const hasTooling = (c.tooling || []).length > 0;
    const inUncovered = uncovered.includes(c.id);
    if (!hasTooling && !inUncovered) {
      errors.push(`criterion ${c.id} has no tooling and is not listed as uncovered`);
    }
  }
  return { ok: errors.length === 0, errors };
}
