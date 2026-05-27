import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { COMPLIANCE_DISCLAIMER } from './compliance-profiles.js';
import { buildAxeRuleCatalog, RTM_PROFILE_IDS } from './axe-rule-catalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '..');
const REPO_KS_ROOT = path.resolve(TOOL_ROOT, '../..');
const WCAG_CATALOG_PATH = path.resolve(
  REPO_KS_ROOT,
  'docs/design/a11y-audit/wcag-criteria-catalog.json',
);

/**
 * @param {object} catalogJson
 * @param {string} profileId
 */
export function resolveProfileCriteria(catalogJson, profileId) {
  const profiles = catalogJson?.profiles || {};
  const profile = profiles[profileId];
  if (!profile) return [];

  if (profile.extendsProfile) {
    const base = resolveProfileCriteria(catalogJson, profile.extendsProfile);
    const additional = profile.additionalCriteria || [];
    const byId = new Map(base.map((c) => [c.id, c]));
    for (const c of additional) byId.set(c.id, c);
    let merged = [...byId.values()];
    if (profile.levelFilter) {
      merged = merged.filter((c) => c.level === profile.levelFilter);
    }
    return merged.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }

  let criteria = [...(profile.criteria || [])];
  if (profile.levelFilter) {
    criteria = criteria.filter((c) => c.level === profile.levelFilter);
  }
  return criteria.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

/**
 * @param {object} registry
 */
function forgeRulesFromRegistry(registry) {
  const det = (registry?.deterministicRules || []).map((r) => ({
    ruleId: r.id,
    lane: 'deterministic',
    scope: r.scope,
    wcagCriteria: [...(r.wcagCriteria || [])],
    traceabilityRole: r.traceabilityRole || null,
    standards: [...(r.standards || [])],
  }));
  const ai = (registry?.aiRules || []).map((r) => ({
    ruleId: r.id,
    lane: 'ai',
    scope: r.scope,
    wcagCriteria: [...(r.wcagCriteria || [])],
    traceabilityRole: r.traceabilityRole || null,
    standards: [],
  }));
  return [...det, ...ai];
}

/**
 * @param {string} existing
 * @param {string} add
 */
function mergeCoverage(existing, add) {
  if (add === 'manual_catalog') return existing === 'none' ? 'manual_catalog' : existing;
  if (existing === 'manual_catalog' && add !== 'none') return add;
  if (existing === 'none') return add;
  if (existing === add) return existing;
  const hasAxe = existing.includes('axe') || add === 'axe';
  const hasDet = existing.includes('det') || add === 'det';
  const hasAi = existing.includes('manual_ai') || add === 'manual_ai';
  const parts = [];
  if (hasAxe) parts.push('axe');
  if (hasDet) parts.push('det');
  if (hasAi) parts.push('manual_ai');
  return parts.length ? parts.join('+') : add;
}

/**
 * @param {{
 *   catalogJson: object,
 *   registry: object,
 *   axeCatalog: ReturnType<typeof buildAxeRuleCatalog>,
 * }} inputs
 */
export function buildStandardsTraceability(inputs) {
  const forgeRules = forgeRulesFromRegistry(inputs.registry);
  const profiles = {};

  for (const profileId of RTM_PROFILE_IDS) {
    const criteria = resolveProfileCriteria(inputs.catalogJson, profileId);
    const axeRules = inputs.axeCatalog.filter((a) => a.inProfiles[profileId]);

    /** @type {Map<string, object>} */
    const criterionRows = new Map();
    for (const c of criteria) {
      criterionRows.set(c.id, {
        criterionId: c.id,
        title: c.title,
        level: c.level,
        principle: c.principle,
        defaultCoverage: c.defaultCoverage || null,
        coverage: c.defaultCoverage === 'manual_only' ? 'manual_catalog' : 'none',
        axeRules: [],
        detRules: [],
        aiRules: [],
        gap: c.defaultCoverage === 'manual_only' ? 'manual_expected' : 'uncovered',
      });
    }

    for (const axe of axeRules) {
      for (const sc of axe.wcagCriteria) {
        const row = criterionRows.get(sc);
        if (!row) continue;
        if (!row.axeRules.includes(axe.forgeRuleId)) row.axeRules.push(axe.forgeRuleId);
        row.coverage = mergeCoverage(row.coverage, 'axe');
        if (row.gap === 'uncovered') row.gap = 'covered';
      }
    }

    for (const rule of forgeRules) {
      for (const sc of rule.wcagCriteria) {
        const row = criterionRows.get(sc);
        if (!row) continue;
        const laneKey = rule.lane === 'ai' ? 'aiRules' : 'detRules';
        if (!row[laneKey].includes(rule.ruleId)) row[laneKey].push(rule.ruleId);
        const cov = rule.lane === 'ai' ? 'manual_ai' : 'det';
        row.coverage = mergeCoverage(row.coverage, cov);
        if (row.gap === 'uncovered') row.gap = 'covered';
      }
    }

    for (const row of criterionRows.values()) {
      if (row.gap === 'uncovered' && row.coverage !== 'none') row.gap = 'covered';
      if (row.coverage === 'manual_catalog') row.gap = 'manual_expected';
      if (row.coverage === 'none' && row.defaultCoverage !== 'manual_only') row.gap = 'uncovered';
    }

    const criteriaRows = [...criterionRows.values()];

    const ruleRows = [];
    for (const axe of axeRules) {
      ruleRows.push({
        ruleId: axe.forgeRuleId,
        lane: 'axe',
        wcagCriteria: axe.wcagCriteria,
        tiedToStandard: axe.wcagCriteria.length > 0,
        forgeOnly: false,
        profiles: [profileId],
        axeRuleId: axe.axeRuleId,
      });
    }

    for (const rule of forgeRules) {
      const forgeOnly = rule.traceabilityRole === 'forge_only';
      const tied =
        forgeOnly || rule.wcagCriteria.length > 0;
      ruleRows.push({
        ruleId: rule.ruleId,
        lane: rule.lane,
        wcagCriteria: rule.wcagCriteria,
        tiedToStandard: tied,
        forgeOnly,
        traceabilityRole: rule.traceabilityRole,
        profiles: [profileId],
      });
    }

    const uncoveredCriteria = criteriaRows
      .filter((r) => r.gap === 'uncovered')
      .map((r) => r.criterionId);
    const manualExpected = criteriaRows
      .filter((r) => r.gap === 'manual_expected')
      .map((r) => r.criterionId);
    const coveredCriteria = criteriaRows
      .filter((r) => r.gap === 'covered')
      .map((r) => r.criterionId);

    const untiedRules = ruleRows
      .filter((r) => !r.tiedToStandard && !r.forgeOnly)
      .map((r) => ({ ruleId: r.ruleId, lane: r.lane, reason: 'no_wcag_criteria_mapping' }));

    const forgeOnlyRules = ruleRows
      .filter((r) => r.forgeOnly)
      .map((r) => r.ruleId);

    const overMappedCriteria = criteriaRows
      .filter((r) => r.axeRules.length + r.detRules.length + r.aiRules.length > 5)
      .map((r) => ({
        criterionId: r.criterionId,
        ruleCount: r.axeRules.length + r.detRules.length + r.aiRules.length,
      }));

    const byPrinciple = {};
    for (const row of criteriaRows) {
      const p = String(row.principle || '?');
      if (!byPrinciple[p]) {
        byPrinciple[p] = { covered: 0, manualExpected: 0, uncovered: 0, total: 0 };
      }
      byPrinciple[p].total += 1;
      if (row.gap === 'covered') byPrinciple[p].covered += 1;
      else if (row.gap === 'manual_expected') byPrinciple[p].manualExpected += 1;
      else byPrinciple[p].uncovered += 1;
    }

    profiles[profileId] = {
      profileId,
      criteriaCount: criteriaRows.length,
      criteria: criteriaRows,
      rules: ruleRows,
      gaps: {
        uncoveredCriteria,
        manualExpected,
        coveredCriteria,
        untiedRules,
        forgeOnlyRules,
        overMappedCriteria,
      },
      summary: {
        totalCriteria: criteriaRows.length,
        covered: coveredCriteria.length,
        manualExpected: manualExpected.length,
        uncovered: uncoveredCriteria.length,
        untiedRuleCount: untiedRules.length,
        axeRuleCount: axeRules.length,
        detRuleCount: forgeRules.filter((r) => r.lane === 'deterministic').length,
        aiRuleCount: forgeRules.filter((r) => r.lane === 'ai').length,
        byPrinciple,
      },
    };
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    disclaimer: COMPLIANCE_DISCLAIMER,
    catalogSource: 'docs/design/a11y-audit/wcag-criteria-catalog.json',
    profiles,
  };
}

/**
 * @param {ReturnType<typeof buildStandardsTraceability>} matrix
 */
export function renderTraceabilityGapsMarkdown(matrix) {
  const lines = [];
  lines.push('# Standards traceability — gap report');
  lines.push('');
  lines.push(`> ${matrix.disclaimer}`);
  lines.push('');
  lines.push(`Generated: ${matrix.generatedAt}`);
  lines.push('');
  lines.push('Refresh: `cd tools/website-a11y-auditor && npm run blend-rules`');
  lines.push('');

  for (const profileId of RTM_PROFILE_IDS) {
    const p = matrix.profiles[profileId];
    if (!p) continue;
    lines.push(`## ${profileId}`);
    lines.push('');
    lines.push(`| Metric | Count |`);
    lines.push(`|--------|------:|`);
    lines.push(`| Total success criteria | ${p.summary.totalCriteria} |`);
    lines.push(`| Covered (axe and/or DET/AI) | ${p.summary.covered} |`);
    lines.push(`| Manual expected (catalog) | ${p.summary.manualExpected} |`);
    lines.push(`| Uncovered (automation gap) | ${p.summary.uncovered} |`);
    lines.push(`| Untied Forge rules | ${p.summary.untiedRuleCount} |`);
    lines.push(`| Axe rules in profile | ${p.summary.axeRuleCount} |`);
    lines.push('');

    lines.push('### Uncovered criteria (no axe/DET/AI mapping)');
    lines.push('');
    if (p.gaps.uncoveredCriteria.length) {
      for (const id of p.gaps.uncoveredCriteria) {
        const row = p.criteria.find((c) => c.criterionId === id);
        lines.push(`- **${id}** — ${row?.title || ''}`);
      }
    } else {
      lines.push('- _(none)_');
    }
    lines.push('');

    lines.push('### Manual expected (documented in catalog)');
    lines.push('');
    if (p.gaps.manualExpected.length) {
      for (const id of p.gaps.manualExpected) {
        const row = p.criteria.find((c) => c.criterionId === id);
        lines.push(`- **${id}** — ${row?.title || ''}`);
      }
    } else {
      lines.push('- _(none)_');
    }
    lines.push('');

    lines.push('### Untied rules (no WCAG criteria; not forge_only)');
    lines.push('');
    if (p.gaps.untiedRules.length) {
      for (const u of p.gaps.untiedRules) {
        lines.push(`- \`${u.ruleId}\` (${u.lane}) — ${u.reason}`);
      }
    } else {
      lines.push('- _(none)_');
    }
    lines.push('');

    lines.push('### Forge-only rules (KS governance; excluded from untied)');
    lines.push('');
    if (p.gaps.forgeOnlyRules.length) {
      for (const id of p.gaps.forgeOnlyRules) lines.push(`- \`${id}\``);
    } else {
      lines.push('- _(none)_');
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

/**
 * @param {object} registry
 */
export function buildTraceabilityFromRegistry(registry) {
  const catalogRaw = fs.readFileSync(WCAG_CATALOG_PATH, 'utf8');
  const catalogJson = JSON.parse(catalogRaw);
  const axeCatalog = buildAxeRuleCatalog();
  const matrix = buildStandardsTraceability({ catalogJson, registry, axeCatalog });
  const gapsMd = renderTraceabilityGapsMarkdown(matrix);
  return { matrix, gapsMd, axeCatalog };
}

/**
 * @param {string} complianceProfileId
 */
export function resolveRtmProfileId(complianceProfileId) {
  const id = String(complianceProfileId || 'wcag22aa').toLowerCase();
  if (id === 'wcag20a' || id === 'wcag20aa' || id === 'wcag20aaa') return id;
  if (id === 'wcag21a' || id === 'wcag21aa' || id === 'wcag21aaa') return id;
  if (id.startsWith('ada-title-')) return 'wcag21aa';
  if (id === 'wcag22aa' || id === 'wcag22aaa') return 'wcag22aa';
  return 'wcag22aa';
}

/**
 * @param {ReturnType<typeof buildStandardsTraceability>} matrix
 * @param {string} complianceProfileId
 */
/**
 * @returns {ReturnType<typeof buildStandardsTraceability> | null}
 */
export function loadTraceabilityMatrix() {
  const p = path.resolve(TOOL_ROOT, 'design-rules/standards-traceability.generated.json');
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

export function traceabilitySummaryForProfile(matrix, complianceProfileId) {
  const rtmId = resolveRtmProfileId(complianceProfileId);
  const p = matrix.profiles[rtmId];
  if (!p) return null;
  return {
    rtmProfileId: rtmId,
    totalCriteria: p.summary.totalCriteria,
    covered: p.summary.covered,
    manualExpected: p.summary.manualExpected,
    uncovered: p.summary.uncovered,
    untiedRuleCount: p.summary.untiedRuleCount,
    gapsDocPath: 'docs/design/a11y-audit/standards-traceability-gaps.md',
    matrixPath: 'tools/website-a11y-auditor/design-rules/standards-traceability.generated.json',
  };
}
