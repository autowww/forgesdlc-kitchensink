/**
 * Scenario / app-shell UX scoring — shared log-penalty model with website design-ux-score.
 */
import {
  ANCILLARY_FINDING_AREAS,
  AREA_TO_DESIGN_DIMENSION,
  DESIGN_DIMENSION_IDS,
  DESIGN_DIMENSION_META,
} from '../../website-ux-auditor/lib/design-dimensions.js';
import {
  DESIGN_UX_LOG_K,
  DESIGN_UX_SCORE_VERSION,
  dimensionScoreFromDamage,
  findingDamageWeight,
  formatUxScoreDisplay,
  formatUxScoreSignedDelta,
} from '../../website-ux-auditor/lib/design-ux-score.js';
import {
  filterScoreableAiFindings,
  loadAiScoreGateOptionsFromEnv,
  shouldMergeAiFindingForScoreGate,
} from '../../website-ux-auditor/lib/ai-audit-batches.js';
import { severityRank } from '../../website-ux-auditor/lib/severity.js';

export const SCENARIO_UX_SCORE_VERSION = DESIGN_UX_SCORE_VERSION;

export const APP_DIMENSION_IDS = [
  'workflowContinuity',
  'stateFeedbackRecovery',
  'dataActionability',
  'appShellStability',
];

/** Website pillars + app-specific pillars for scenario audits. */
export const SCENARIO_DIMENSION_IDS = [...DESIGN_DIMENSION_IDS, ...APP_DIMENSION_IDS];

export const APP_DIMENSION_META = {
  workflowContinuity: {
    label: 'Workflow continuity',
    standardSections: ['Scenario navigation', 'Route/deeplink state', 'Wizard progress'],
  },
  stateFeedbackRecovery: {
    label: 'State, feedback & recovery',
    standardSections: ['Loading/empty/error', 'Toasts', 'Error boundaries', 'Disabled reasons'],
  },
  dataActionability: {
    label: 'Data & actionability',
    standardSections: ['Tables/charts', 'Bulk actions', 'Primary CTA', 'Tile affordances'],
  },
  appShellStability: {
    label: 'App shell stability',
    standardSections: ['Persistent chrome', 'Shell integration', 'Focus/modal guards'],
  },
};

export const SCENARIO_DIMENSION_META = {
  ...DESIGN_DIMENSION_META,
  ...APP_DIMENSION_META,
};

/** Narrative bands for progress tracking (distinct from release gate pass/fail). */
export const UX_SCORE_BANDS = [
  { id: 'excellent', label: 'Excellent', min: 90, max: 100 },
  { id: 'good', label: 'Good', min: 75, max: 89 },
  { id: 'fair', label: 'Fair', min: 60, max: 74 },
  { id: 'poor', label: 'Poor', min: 40, max: 59 },
  { id: 'critical', label: 'Critical', min: 1, max: 39 },
];

const RULE_PREFIX_TO_APP_DIMENSION = [
  ['DET.APP.ROUTE_', 'workflowContinuity'],
  ['DET.APP.WIZARD_', 'workflowContinuity'],
  ['DET.APP.DEMO_', 'workflowContinuity'],
  ['DET.APP.NAV.', 'workflowContinuity'],
  ['DET.NAV.', 'workflowContinuity'],
  ['DET.APP.EMPTY_', 'stateFeedbackRecovery'],
  ['DET.APP.ERROR_', 'stateFeedbackRecovery'],
  ['DET.APP.TOAST_', 'stateFeedbackRecovery'],
  ['DET.APP.DISABLED_', 'stateFeedbackRecovery'],
  ['DET.APP.PRIMARY_STATE', 'stateFeedbackRecovery'],
  ['DET.APP.CLIENT_ERROR', 'stateFeedbackRecovery'],
  ['DET.APP.DATA_', 'dataActionability'],
  ['DET.APP.BULK_', 'dataActionability'],
  ['DET.APP.TAB_PANEL', 'dataActionability'],
  ['DET.APP.TILE_', 'dataActionability'],
  ['DET.APP.PRIMARY_CTA', 'dataActionability'],
  ['DET.DATA.', 'dataActionability'],
  ['DET.CARD.', 'dataActionability'],
  ['DET.CHART.', 'dataActionability'],
  ['DET.APP.SHELL_', 'appShellStability'],
  ['DET.APP.PERSISTENT_', 'appShellStability'],
  ['DET.APP.PRIMITIVE_', 'appShellStability'],
  ['DET.APP.FOCUS_', 'appShellStability'],
  ['DET.APP.MODAL_', 'appShellStability'],
  ['DET.CHROME.', 'appShellStability'],
  ['DET.APP.AMBIENT', 'appShellStability'],
];

const AI_GUARDRAIL_TO_DIMENSION = {
  'ai-judgment': 'narrativeHero',
  'visual-hierarchy': 'visualRhythmFirstScreen',
  'context-clarity': 'depthAndTechnicalDisclosure',
  'enterprise-feel': 'trustAndEcosystemTruth',
  'contract-usefulness': 'visualCatalogGovernance',
  workflow: 'workflowContinuity',
  'state-feedback': 'stateFeedbackRecovery',
  data: 'dataActionability',
  'app-shell': 'appShellStability',
};

/** Profile dimension weights (damage multiplier + harmonic rollup weight). */
export const SCENARIO_SCORE_PROFILES = {
  generic: {
    narrativeHero: 1,
    informationArchitecture: 1,
    depthAndTechnicalDisclosure: 1,
    trustAndEcosystemTruth: 1,
    visualRhythmFirstScreen: 1,
    accessibilitySemanticsMeta: 1,
    visualCatalogGovernance: 1,
    workflowContinuity: 0.85,
    stateFeedbackRecovery: 0.85,
    dataActionability: 0.85,
    appShellStability: 0.85,
  },
  forgesdlc: {
    narrativeHero: 1.15,
    informationArchitecture: 1.1,
    depthAndTechnicalDisclosure: 1.05,
    trustAndEcosystemTruth: 1.1,
    visualRhythmFirstScreen: 1.1,
    accessibilitySemanticsMeta: 1,
    visualCatalogGovernance: 1.2,
    workflowContinuity: 0.7,
    stateFeedbackRecovery: 0.7,
    dataActionability: 0.7,
    appShellStability: 0.75,
  },
  'app-shell': {
    narrativeHero: 0.55,
    informationArchitecture: 0.75,
    depthAndTechnicalDisclosure: 0.65,
    trustAndEcosystemTruth: 0.7,
    visualRhythmFirstScreen: 0.9,
    accessibilitySemanticsMeta: 1,
    visualCatalogGovernance: 1,
    workflowContinuity: 1.2,
    stateFeedbackRecovery: 1.15,
    dataActionability: 1.1,
    appShellStability: 1.25,
  },
  'a11y-studio': {
    narrativeHero: 0.5,
    informationArchitecture: 0.7,
    depthAndTechnicalDisclosure: 0.65,
    trustAndEcosystemTruth: 0.75,
    visualRhythmFirstScreen: 0.85,
    accessibilitySemanticsMeta: 1.35,
    visualCatalogGovernance: 0.9,
    workflowContinuity: 1.15,
    stateFeedbackRecovery: 1.1,
    dataActionability: 1.05,
    appShellStability: 1.15,
  },
};

const FORGESDLC_SITE_KINDS = new Set(['forgesdlc', 'lenses', 'lcdl', 'fleet', 'platform']);

/**
 * @param {string} siteKind
 */
export function resolveScenarioScoreProfileKey(siteKind) {
  const k = String(siteKind || 'generic').toLowerCase();
  if (SCENARIO_SCORE_PROFILES[k]) return k;
  if (FORGESDLC_SITE_KINDS.has(k)) return 'forgesdlc';
  return 'generic';
}

/**
 * @param {string} siteKind
 */
export function scenarioDimensionWeights(siteKind) {
  const key = resolveScenarioScoreProfileKey(siteKind);
  const base = SCENARIO_SCORE_PROFILES[key];
  /** @type {Record<string, number>} */
  const out = {};
  for (const id of SCENARIO_DIMENSION_IDS) {
    out[id] = base[id] ?? SCENARIO_SCORE_PROFILES.generic[id] ?? 1;
  }
  return out;
}

/**
 * @param {object} finding
 */
export function mapFindingToScenarioDimension(finding) {
  if (!finding || typeof finding !== 'object') return null;
  const ruleId = String(finding.ruleId || finding.principleId || finding.checkId || '');
  const checkId = String(finding.checkId || '');
  const area = String(finding.area || finding.guardrail || '');

  if (checkId === 'app-shell-inner') return 'appShellStability';
  if (checkId === 'axe-lane' || checkId === 'a11y-rule-runtime' || ruleId.includes('A11Y')) {
    return 'accessibilitySemanticsMeta';
  }

  for (const [prefix, dim] of RULE_PREFIX_TO_APP_DIMENSION) {
    if (ruleId.startsWith(prefix)) return dim;
  }

  if (ruleId.startsWith('AI.')) {
    const g = String(finding.guardrail || area || '').toLowerCase();
    return AI_GUARDRAIL_TO_DIMENSION[g] || 'narrativeHero';
  }

  const fromArea = AREA_TO_DESIGN_DIMENSION[area];
  if (fromArea) return fromArea;

  if (area.includes('navigation') || area.includes('workflow')) return 'workflowContinuity';
  if (area.includes('feedback') || area.includes('state')) return 'stateFeedbackRecovery';
  if (area.includes('data') || area.includes('table')) return 'dataActionability';
  if (area.includes('shell') || area.includes('chrome')) return 'appShellStability';

  if (checkId === 'design-rule-runtime' && ruleId.startsWith('DET.')) {
    return 'visualRhythmFirstScreen';
  }

  return 'accessibilitySemanticsMeta';
}

function weightedHarmonicMean(dimScores, weights) {
  let sumW = 0;
  let sumInv = 0;
  for (const id of SCENARIO_DIMENSION_IDS) {
    const w = weights[id] ?? 1;
    if (w <= 0) continue;
    const score = dimScores[id]?.score;
    if (!Number.isFinite(score)) continue;
    sumW += w;
    sumInv += w / (score + 1e-6);
  }
  if (sumW <= 0 || sumInv <= 0) return 0;
  return Math.round(sumW / sumInv);
}

/**
 * @param {number} overall
 */
export function uxScoreBandForOverall(overall) {
  const n = Number(overall);
  if (!Number.isFinite(n)) {
    return { id: 'unknown', label: 'Unknown', min: null, max: null };
  }
  for (const band of UX_SCORE_BANDS) {
    if (n >= band.min && n <= band.max) return { ...band };
  }
  if (n >= 100) return { ...UX_SCORE_BANDS[0] };
  return { id: 'below-scale', label: 'Below scale', min: 0, max: 0 };
}

/**
 * @param {object[]} findings effective findings used in scoring
 * @param {Record<string, number>} weights
 * @param {number} [limit]
 */
export function collectTopScoreDamageContributors(findings, weights, limit = 8) {
  /** @type {Map<string, { key: string, label: string, dimension: string, weightedDamage: number, findingCount: number, topSeverity: string }>} */
  const buckets = new Map();
  for (const f of findings || []) {
    const dim = mapFindingToScenarioDimension(f);
    if (!dim) continue;
    const dimW = weights[dim] ?? 1;
    const damage = findingDamageWeight(f) * dimW;
    const key = String(f.ruleId || f.principleId || f.checkId || 'finding');
    const prev = buckets.get(key) || {
      key,
      label: key,
      dimension: dim,
      weightedDamage: 0,
      findingCount: 0,
      topSeverity: f.severity || 'minor',
    };
    prev.weightedDamage += damage;
    prev.findingCount += 1;
    if (severityRank(f.severity) < severityRank(prev.topSeverity)) prev.topSeverity = f.severity;
    buckets.set(key, prev);
  }
  return [...buckets.values()]
    .sort((a, b) => b.weightedDamage - a.weightedDamage)
    .slice(0, limit)
    .map((row) => ({
      ...row,
      weightedDamage: Math.round(row.weightedDamage * 100) / 100,
    }));
}

/**
 * @param {object} auditData
 * @param {object[]} scoredFindings
 * @param {object} aiScoreMeta
 */
function buildScenarioCoverage(auditData, scoredFindings, aiScoreMeta) {
  const pages = auditData.pages || [];
  const crawl = auditData.crawlSummary || {};
  const tiers = new Set(pages.map((p) => p.tier).filter(Boolean));
  const lanesExecuted = new Set(auditData.lanesExecuted || pages.flatMap((p) => p.lanesExecuted || []));
  const scenariosWithScreenshot = pages.filter((p) => p.screenshot).length;
  const staticOnly =
    Boolean(crawl.staticOnly) ||
    crawl.crawlMode === 'static_only' ||
    auditData.auditMode === 'static-scenario';

  return {
    staticOnly,
    liveScenarioRun: !staticOnly && auditData.auditMode !== 'static-scenario',
    scenariosTotal: crawl.scenariosTotal ?? pages.length,
    scenariosVisited: crawl.pagesVisited ?? pages.length,
    tierCoverage: {
      tiersPresent: [...tiers],
      scenarioCountByTier: Object.fromEntries(
        [...tiers].map((t) => [t, pages.filter((p) => p.tier === t).length]),
      ),
    },
    laneCoverage: {
      lanesExecuted: [...lanesExecuted],
      findingsByLane: aiScoreMeta.findingsByLane,
    },
    screenshotAvailability: {
      scenariosWithScreenshot,
      scenariosTotal: pages.length,
      ratio: pages.length ? scenariosWithScreenshot / pages.length : null,
    },
    aiFindings: aiScoreMeta.aiFindings,
    ancillaryFindingCount: aiScoreMeta.ancillaryFindingCount,
    effectiveFindingCount: scoredFindings.length,
    perfectScoreEligible: aiScoreMeta.perfectScoreEligible,
    profileKey: aiScoreMeta.profileKey,
  };
}

function partitionFindingsForScenarioScore(findings, opts = {}) {
  const aiOpts = { minConfidence: opts.minConfidence };
  const ancillary = [];
  const detAndLegacy = [];
  const aiCandidates = [];
  const aiExcluded = [];

  for (const f of findings || []) {
    if (ANCILLARY_FINDING_AREAS.has(f.area)) {
      ancillary.push(f);
      continue;
    }
    const lane = String(f.lane || '').toLowerCase();
    const source = String(f.source || '').toLowerCase();
    const isAi = lane === 'ai' || source.includes('ai');
    if (isAi) {
      if (shouldMergeAiFindingForScoreGate(f, aiOpts)) aiCandidates.push(f);
      else aiExcluded.push(f);
      continue;
    }
    detAndLegacy.push(f);
  }

  const scoreable = [...detAndLegacy, ...filterScoreableAiFindings(aiCandidates, aiOpts)];
  return { ancillary, detAndLegacy, aiCandidates, aiExcluded, scoreable };
}

/**
 * @param {object} opts
 * @param {object[]} opts.findings
 * @param {object} [opts.auditData]
 * @param {string} [opts.siteKind]
 * @param {number} [opts.minAiConfidence]
 */
export function computeScenarioUxScores(opts) {
  const auditData = opts.auditData || {};
  const findings = opts.findings ?? auditData.findings ?? [];
  const siteKind = opts.siteKind || auditData.siteKind || 'generic';
  const profileKey = resolveScenarioScoreProfileKey(siteKind);
  const weights = scenarioDimensionWeights(siteKind);
  const aiGate = loadAiScoreGateOptionsFromEnv();
  const minConfidence = opts.minAiConfidence ?? aiGate.minConfidence;

  const parts = partitionFindingsForScenarioScore(findings, { minConfidence });
  const { scoreable, ancillary, aiCandidates, aiExcluded, detAndLegacy } = parts;

  const findingsByLane = { legacy: 0, uxDet: 0, a11yDet: 0, axe: 0, ai: 0, other: 0 };
  for (const f of findings) {
    if (f.ruleId?.startsWith('DET.') && f.lane === 'deterministic') {
      if (f.checkId === 'a11y-rule-runtime' || String(f.ruleId).includes('A11Y')) findingsByLane.a11yDet++;
      else findingsByLane.uxDet++;
    } else if (f.checkId === 'axe-lane' || f.ruleId?.startsWith('AXE.')) findingsByLane.axe++;
    else if (f.checkId === 'app-shell-inner') findingsByLane.legacy++;
    else if (String(f.lane || '').toLowerCase() === 'ai') findingsByLane.ai++;
    else findingsByLane.other++;
  }

  /** @type {Record<string, { rawDamage: number, findingCount: number }>} */
  const damageByDim = {};
  for (const id of SCENARIO_DIMENSION_IDS) damageByDim[id] = { rawDamage: 0, findingCount: 0 };

  for (const f of scoreable) {
    const dim = mapFindingToScenarioDimension(f);
    if (!dim || !damageByDim[dim]) continue;
    const w = findingDamageWeight(f) * (weights[dim] ?? 1);
    damageByDim[dim].rawDamage += w;
    damageByDim[dim].findingCount += 1;
  }

  /** @type {Record<string, { score: number, rawDamage: number, findingCount: number, profileWeight: number }>} */
  const dimensions = {};
  const dimScores = [];
  for (const id of SCENARIO_DIMENSION_IDS) {
    const { rawDamage, findingCount } = damageByDim[id];
    const score = dimensionScoreFromDamage(rawDamage);
    dimensions[id] = {
      score,
      rawDamage: Math.round(rawDamage * 100) / 100,
      findingCount,
      profileWeight: weights[id] ?? 1,
    };
    if ((weights[id] ?? 1) > 0) dimScores.push(score);
  }

  const staticOnly = Boolean(auditData.crawlSummary?.staticOnly);
  const perfectScoreEligible = !staticOnly && scoreable.length === 0;

  let overall = 100;
  if (!perfectScoreEligible) {
    if (!scoreable.length) {
      overall = staticOnly ? Math.min(weightedHarmonicMean(dimensions, weights), 95) : 99;
    } else {
      overall = Math.min(99, Math.max(1, weightedHarmonicMean(dimensions, weights)));
    }
  }

  const aiFindings = {
    candidates: aiCandidates.length,
    includedInScore: scoreable.length - detAndLegacy.length,
    excludedBelowConfidence: aiExcluded.filter(
      (f) => Number(f.confidence) < minConfidence || f.confidence == null,
    ).length,
    excludedDeterministicCovered: aiExcluded.filter(
      (f) => String(f.deterministicCoverage || '').toLowerCase() === 'covered',
    ).length,
    minConfidence,
    detAuthoritative: true,
  };

  const coverage = buildScenarioCoverage(auditData, scoreable, {
    findingsByLane,
    ancillaryFindingCount: ancillary.length,
    perfectScoreEligible,
    profileKey,
    aiFindings,
  });

  const scoreBand = uxScoreBandForOverall(overall);
  const topDamageContributors = collectTopScoreDamageContributors(scoreable, weights);

  return {
    version: SCENARIO_UX_SCORE_VERSION,
    formula: `per_dimension: clamp 1–99 · round(100 - ${DESIGN_UX_LOG_K}*ln(1+rawDamage)) with site-kind profile weights on damage; overall: weighted harmonic mean of pillar scores; overall 100 when perfectScoreEligible; release gatePass remains independent.`,
    overall,
    scoreBand,
    dimensions,
    dimensionsMeta: SCENARIO_DIMENSION_META,
    topDamageContributors,
    coverage,
    profile: { siteKind, profileKey, dimensionWeights: weights },
  };
}

/**
 * @param {ReturnType<typeof computeScenarioUxScores>} previous
 * @param {ReturnType<typeof computeScenarioUxScores>} next
 */
export function compareScenarioUxScores(previous, next) {
  const p = previous?.dimensions ?? {};
  const n = next?.dimensions ?? {};
  /** @type {Record<string, { prior: number, current: number, delta: number }>} */
  const byId = {};
  for (const id of SCENARIO_DIMENSION_IDS) {
    const ps = Number(p[id]?.score);
    const ns = Number(n[id]?.score);
    if (Number.isFinite(ps) && Number.isFinite(ns)) {
      byId[id] = { prior: ps, current: ns, delta: ns - ps };
    }
  }
  const po = Number(previous?.overall);
  const co = Number(next?.overall);
  return {
    overall: {
      prior: po,
      current: co,
      delta: Number.isFinite(po) && Number.isFinite(co) ? Math.round(co - po) : null,
    },
    dimensions: byId,
    priorEffectiveFindingCount: previous?.coverage?.effectiveFindingCount ?? null,
    currentEffectiveFindingCount: next?.coverage?.effectiveFindingCount ?? null,
    priorPerfectEligible: Boolean(previous?.coverage?.perfectScoreEligible),
    currentPerfectEligible: Boolean(next?.coverage?.perfectScoreEligible),
    priorScoreBand: previous?.scoreBand?.id ?? null,
    currentScoreBand: next?.scoreBand?.id ?? null,
  };
}

/**
 * @param {ReturnType<typeof compareScenarioUxScores>} delta
 */
export function formatScenarioUxScoreLoopDeltaVerbalParagraph(delta) {
  if (!delta?.overall || delta.overall.delta === null || delta.overall.delta === undefined) return '';
  const odStr = formatUxScoreSignedDelta(delta.overall.delta);
  const bandPart =
    delta.priorScoreBand && delta.currentScoreBand
      ? ` Band ${delta.priorScoreBand} → ${delta.currentScoreBand}.`
      : '';
  const pillarRows = SCENARIO_DIMENSION_IDS.map((id) => {
    const row = delta.dimensions[id];
    return row ? { id, ...row } : null;
  })
    .filter(Boolean)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const top = pillarRows.slice(0, 4).filter((r) => r.delta !== 0);
  const pillarPart = top.length
    ? ` Notable pillar Δ: ${top.map((r) => `${r.id} ${formatUxScoreSignedDelta(r.delta)}`).join(', ')}.`
    : '';
  return `Scenario UX score ${formatUxScoreDisplay(delta.overall.prior)} → ${formatUxScoreDisplay(delta.overall.current)} (Δ ${odStr}).${bandPart}${pillarPart}`;
}

/**
 * @param {object} scorecard full studio-ux-quality-score payload
 */
export function buildScenarioUxScoreMarkdown(scorecard) {
  const { uxScores, gateMode, passGate, qualityGate, uxQualityGate, majorPlusTotal, findingsTotal } =
    scorecard;
  const lines = [];
  lines.push('---');
  lines.push('title: Forge Studio UX quality score');
  lines.push('kind: studio-ux-quality-score');
  lines.push(`schema_version_ux_scores: ${uxScores.version}`);
  lines.push(`site_kind: ${scorecard.siteKind || ''}`);
  lines.push('---');
  lines.push('');
  lines.push('# Forge Studio UX quality score');
  lines.push('');
  lines.push(
    `**Overall UX score:** **${formatUxScoreDisplay(uxScores.overall)}** / 100 — band **${uxScores.scoreBand?.label || '—'}** (${uxScores.scoreBand?.id || '—'})`,
  );
  lines.push('');
  lines.push(
    `**Release gate (\`${gateMode}\`):** ${passGate ? '**pass**' : '**fail**'} — independent of UX score (a11y gate ${qualityGate?.pass ? 'pass' : 'fail'}, UX gate ${uxQualityGate?.pass ? 'pass' : 'fail'}).`,
  );
  lines.push('');
  lines.push('| Signal | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Findings (total) | \`${findingsTotal}\` |`);
  lines.push(`| Major+ (all lanes) | \`${majorPlusTotal}\` |`);
  lines.push(`| Effective scored findings | \`${uxScores.coverage.effectiveFindingCount}\` |`);
  lines.push(`| Perfect score eligible | \`${uxScores.coverage.perfectScoreEligible}\` |`);
  lines.push(`| Scenarios visited | \`${uxScores.coverage.scenariosVisited}\` / \`${uxScores.coverage.scenariosTotal}\` |`);
  lines.push(
    `| Screenshots | \`${uxScores.coverage.screenshotAvailability?.scenariosWithScreenshot ?? '—'}\` / \`${uxScores.coverage.screenshotAvailability?.scenariosTotal ?? '—'}\` |`,
  );
  lines.push(`| Static-only run | \`${uxScores.coverage.staticOnly}\` |`);
  lines.push(`| AI included in score | \`${uxScores.coverage.aiFindings?.includedInScore ?? 0}\` |`);
  lines.push(`| AI excluded (confidence/coverage) | \`${(uxScores.coverage.aiFindings?.excludedBelowConfidence ?? 0) + (uxScores.coverage.aiFindings?.excludedDeterministicCovered ?? 0)}\` |`);
  lines.push('');
  lines.push('## Dimension scores');
  lines.push('');
  lines.push('| Dimension | Score | Raw damage | Findings | Profile weight |');
  lines.push('|-----------|------:|-----------:|---------:|---------------:|');
  for (const id of SCENARIO_DIMENSION_IDS) {
    const d = uxScores.dimensions[id];
    const meta = SCENARIO_DIMENSION_META[id];
    lines.push(
      `| **${meta?.label ?? id}** | ${formatUxScoreDisplay(d.score)} | ${formatUxScoreDisplay(d.rawDamage)} | ${d.findingCount} | ${formatUxScoreDisplay(d.profileWeight)} |`,
    );
  }
  lines.push('');
  if (uxScores.topDamageContributors?.length) {
    lines.push('## Top score damage contributors');
    lines.push('');
    lines.push('| Rule / check | Dimension | Weighted damage | Findings | Worst severity |');
    lines.push('|--------------|-----------|----------------:|---------:|----------------|');
    for (const row of uxScores.topDamageContributors) {
      lines.push(
        `| \`${row.label}\` | \`${row.dimension}\` | ${formatUxScoreDisplay(row.weightedDamage)} | ${row.findingCount} | ${row.topSeverity} |`,
      );
    }
    lines.push('');
  }
  if (scorecard.uxScoreDelta?.delta) {
    const d = scorecard.uxScoreDelta.delta;
    lines.push('## Vs prior scenario score snapshot');
    lines.push('');
    lines.push(
      `Overall ${formatUxScoreDisplay(d.overall.prior)} → **${formatUxScoreDisplay(d.overall.current)}** (Δ ${formatUxScoreSignedDelta(d.overall.delta)}).`,
    );
    if (scorecard.uxScoreDelta.verbalSummary) {
      lines.push('');
      lines.push(`> ${scorecard.uxScoreDelta.verbalSummary}`);
    }
    lines.push('');
  }
  lines.push('## Machine-readable blob');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify({ uxScores }, null, 2));
  lines.push('```');
  lines.push('');
  return lines.join('\n');
}
