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
const WCAG3_CATALOG_PATH = path.resolve(
  REPO_KS_ROOT,
  'docs/design/a11y-audit/wcag3-outcomes-catalog.json',
);

/** @type {string[]} */
export const WCAG3_PROFILE_IDS = ['wcag30bronze', 'wcag30silver', 'wcag30gold'];

const WCAG3_LEGACY_ALIASES = new Set(['wcag30a', 'wcag30aa', 'wcag30aaa']);

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
 * @param {object} catalog3Json
 * @param {string} profileId
 */
export function resolveWcag3ProfileRequirements(catalog3Json, profileId) {
  const profiles = catalog3Json?.profiles || {};
  const profile = profiles[profileId];
  if (!profile) return [];

  if (profile.extendsProfile) {
    const base = resolveWcag3ProfileRequirements(catalog3Json, profile.extendsProfile);
    const additional = profile.additionalRequirements || [];
    const byId = new Map(base.map((r) => [r.id, r]));
    if (profile.useGlobalRequirements && profile.tierFilter && catalog3Json.requirements) {
      for (const r of catalog3Json.requirements) {
        if ((r.tiers || []).includes(profile.tierFilter)) byId.set(r.id, r);
      }
    }
    for (const r of additional) byId.set(r.id, r);
    let merged = [...byId.values()];
    if (profile.tierFilter && !profile.useGlobalRequirements) {
      merged = merged.filter((r) => (r.tiers || []).includes(profile.tierFilter));
    }
    return merged.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  }

  let reqs = [...(profile.requirements || [])];
  if (!reqs.length && profile.useGlobalRequirements && catalog3Json.requirements) {
    reqs = [...catalog3Json.requirements];
  }
  if (profile.tierFilter) {
    reqs = reqs.filter((r) => (r.tiers || []).includes(profile.tierFilter));
  }
  return reqs.sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

/**
 * @param {Map<string, object>} proxyRowsBySc
 * @param {string[]} mapsToWcag22
 */
function mergeCrosswalkCoverage(targetRow, proxyRowsBySc, mapsToWcag22) {
  for (const sc of mapsToWcag22 || []) {
    const src = proxyRowsBySc.get(sc);
    if (!src) continue;
    for (const id of src.axeRules || []) {
      if (!targetRow.axeRules.includes(id)) targetRow.axeRules.push(id);
    }
    for (const id of src.detRules || []) {
      if (!targetRow.detRules.includes(id)) targetRow.detRules.push(id);
    }
    for (const id of src.aiRules || []) {
      if (!targetRow.aiRules.includes(id)) targetRow.aiRules.push(id);
    }
    if (src.coverage && src.coverage !== 'none') {
      targetRow.coverage = mergeCoverage(targetRow.coverage, src.coverage.split('+')[0]);
      if (targetRow.gap === 'uncovered') targetRow.gap = 'covered';
    }
  }
}

/**
 * @param {object} params
 */
function buildWcag3ProfileSection(params) {
  const {
    profileId,
    catalog3Json,
    catalogJson,
    registry,
    axeCatalog,
    forgeRules,
    proxyProfileMatrix,
  } = params;

  const requirements = resolveWcag3ProfileRequirements(catalog3Json, profileId);
  const axeRules = axeCatalog.filter((a) => a.inProfiles[profileId]);

  const proxyRowsBySc = new Map();
  for (const row of proxyProfileMatrix?.criteria || []) {
    proxyRowsBySc.set(row.criterionId, row);
  }

  /** @type {Map<string, object>} */
  const criterionRows = new Map();
  for (const r of requirements) {
    criterionRows.set(r.id, {
      criterionId: r.id,
      title: r.title,
      level: r.tiers?.includes('core') ? 'core' : 'supplemental',
      principle: r.guideline || 'WCAG3',
      defaultCoverage: r.defaultCoverage || null,
      mapsToWcag22: r.mapsToWcag22 || [],
      coverage: r.defaultCoverage === 'manual_only' ? 'manual_catalog' : 'none',
      axeRules: [],
      detRules: [],
      aiRules: [],
      gap: r.defaultCoverage === 'manual_only' ? 'manual_expected' : 'uncovered',
    });
  }

  for (const row of criterionRows.values()) {
    mergeCrosswalkCoverage(row, proxyRowsBySc, row.mapsToWcag22);
  }

  for (const axe of axeRules) {
    for (const sc of axe.wcagCriteria) {
      const row = [...criterionRows.values()].find((r) => r.mapsToWcag22?.includes(sc));
      if (!row) continue;
      if (!row.axeRules.includes(axe.forgeRuleId)) row.axeRules.push(axe.forgeRuleId);
      row.coverage = mergeCoverage(row.coverage, 'axe');
      if (row.gap === 'uncovered') row.gap = 'covered';
    }
  }

  for (const rule of forgeRules) {
    for (const sc of rule.wcagCriteria) {
      const row = [...criterionRows.values()].find((r) => r.mapsToWcag22?.includes(sc));
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
    ruleRows.push({
      ruleId: rule.ruleId,
      lane: rule.lane,
      wcagCriteria: rule.wcagCriteria,
      tiedToStandard: forgeOnly || rule.wcagCriteria.length > 0,
      forgeOnly,
      traceabilityRole: rule.traceabilityRole,
      profiles: [profileId],
    });
  }

  const uncoveredCriteria = criteriaRows.filter((r) => r.gap === 'uncovered').map((r) => r.criterionId);
  const manualExpected = criteriaRows.filter((r) => r.gap === 'manual_expected').map((r) => r.criterionId);
  const coveredCriteria = criteriaRows.filter((r) => r.gap === 'covered').map((r) => r.criterionId);

  const byPrinciple = {};
  for (const row of criteriaRows) {
    const p = String(row.principle || 'other');
    if (!byPrinciple[p]) {
      byPrinciple[p] = { principle: p, total: 0, covered: 0, manualExpected: 0, uncovered: 0 };
    }
    byPrinciple[p].total += 1;
    if (row.gap === 'covered') byPrinciple[p].covered += 1;
    else if (row.gap === 'manual_expected') byPrinciple[p].manualExpected += 1;
    else if (row.gap === 'uncovered') byPrinciple[p].uncovered += 1;
  }

  return {
    profileId,
    wcagVersion: '3.0',
    level: catalog3Json.profiles[profileId]?.conformanceTier || profileId,
    criteria: criteriaRows,
    rules: ruleRows,
    gaps: {
      uncoveredCriteria,
      manualExpected,
      coveredCriteria,
      untiedRules: ruleRows
        .filter((r) => !r.tiedToStandard && !r.forgeOnly)
        .map((r) => ({ ruleId: r.ruleId, lane: r.lane, reason: 'no_wcag_criteria_mapping' })),
      forgeOnlyRules: ruleRows.filter((r) => r.forgeOnly).map((r) => r.ruleId),
      overMappedCriteria: [],
    },
    summary: {
      totalCriteria: criteriaRows.length,
      covered: coveredCriteria.length,
      manualExpected: manualExpected.length,
      uncovered: uncoveredCriteria.length,
      untiedRuleCount: ruleRows.filter((r) => !r.tiedToStandard && !r.forgeOnly).length,
      axeRuleCount: axeRules.length,
      detRuleCount: forgeRules.filter((r) => r.lane === 'deterministic').length,
      aiRuleCount: forgeRules.filter((r) => r.lane === 'ai').length,
      byPrinciple,
    },
  };
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
    if (WCAG3_PROFILE_IDS.includes(profileId)) continue;
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

  if (inputs.catalog3Json) {
    for (const profileId of WCAG3_PROFILE_IDS) {
      const proxyId = profileId === 'wcag30gold' ? 'wcag22aaa' : 'wcag22aa';
      profiles[profileId] = buildWcag3ProfileSection({
        profileId,
        catalog3Json: inputs.catalog3Json,
        catalogJson: inputs.catalogJson,
        registry: inputs.registry,
        axeCatalog: inputs.axeCatalog,
        forgeRules,
        proxyProfileMatrix: profiles[proxyId],
      });
    }
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    disclaimer: COMPLIANCE_DISCLAIMER,
    catalogSource: 'docs/design/a11y-audit/wcag-criteria-catalog.json',
    catalog3Source: inputs.catalog3Json
      ? 'docs/design/a11y-audit/wcag3-outcomes-catalog.json'
      : null,
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
  let catalog3Json = null;
  if (fs.existsSync(WCAG3_CATALOG_PATH)) {
    catalog3Json = JSON.parse(fs.readFileSync(WCAG3_CATALOG_PATH, 'utf8'));
  }
  const axeCatalog = buildAxeRuleCatalog();
  const matrix = buildStandardsTraceability({
    catalogJson,
    catalog3Json,
    registry,
    axeCatalog,
  });
  const gapsMd = renderTraceabilityGapsMarkdown(matrix);
  return { matrix, gapsMd, axeCatalog };
}

/**
 * @param {string} complianceProfileId
 */
export function resolveRtmProfileId(complianceProfileId) {
  const id = String(complianceProfileId || 'wcag22aa').toLowerCase();
  if (WCAG3_LEGACY_ALIASES.has(id)) {
    throw new Error(
      `Profile "${id}" is not supported. Use wcag30bronze, wcag30silver, or wcag30gold (WCAG 3.0 tiers are not equivalent to A/AA/AAA).`,
    );
  }
  if (id === 'wcag30bronze' || id === 'wcag30silver' || id === 'wcag30gold') return id;
  if (id === 'wcag20a' || id === 'wcag20aa' || id === 'wcag20aaa') return id;
  if (id === 'wcag21a' || id === 'wcag21aa' || id === 'wcag21aaa') return id;
  if (id === 'wcag22a' || id === 'wcag22aa' || id === 'wcag22aaa') return id;
  if (id.startsWith('ada-title-')) return 'wcag21aa';
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
