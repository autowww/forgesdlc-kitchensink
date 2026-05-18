import { pageContext } from '../checks/context.js';
import { AREA_TO_DESIGN_DIMENSION, DESIGN_DIMENSION_META } from './design-dimensions.js';
import { computeUxScores } from './design-ux-score.js';
import { SCORE_WEIGHTS, countMajorPlus, severityRank } from './severity.js';

export const DEFAULT_DEFECT_PLAN_LIMIT = 10;

function clamp01(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function toSlug(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'defect';
}

function scoreWeightForSeverity(level) {
  const w = SCORE_WEIGHTS[String(level || '').toLowerCase()];
  return Number.isFinite(w) ? w : SCORE_WEIGHTS.minor;
}

function isHomepageGateFinding(finding, isHome) {
  if (!isHome || !finding) return false;
  const id = String(finding.checkId || '');
  const sev = String(finding.severity || '').toLowerCase();
  if (id === 'homepage-shell' && sev === 'blocker') return true;
  if (id === 'first-screen-density' && sev === 'critical') return true;
  if (id === 'product-visual' && (sev === 'blocker' || sev === 'critical')) return true;
  if (id === 'storyline-flow' && sev === 'critical') return true;
  if (id === 'technical-depth' && sev === 'critical') return true;
  return false;
}

function summarizeSeverities(findings) {
  /** @type {Record<string, number>} */
  const bySeverity = {};
  for (const f of findings) {
    const key = String(f?.severity || 'major').toLowerCase();
    bySeverity[key] = (bySeverity[key] || 0) + 1;
  }
  return bySeverity;
}

function summarizeDimensionDamage(findings) {
  /** @type {Record<string, { rawDamage: number, findingCount: number }>} */
  const byDimension = {};
  for (const f of findings) {
    const dim = AREA_TO_DESIGN_DIMENSION[f.area];
    if (!dim) continue;
    if (!byDimension[dim]) byDimension[dim] = { rawDamage: 0, findingCount: 0 };
    byDimension[dim].rawDamage += scoreWeightForSeverity(f.severity);
    byDimension[dim].findingCount += 1;
  }
  return byDimension;
}

function rootCauseHint(checkId, area) {
  const id = String(checkId || '');
  const ar = String(area || '');
  if (id === 'homepage-shell' || ar === 'information-architecture' || ar === 'navigation') {
    return 'Likely shared shell/routing/navigation source (layout templates, nav data, docs-vs-landing routing).';
  }
  if (id === 'product-visual' || id === 'first-screen-density' || ar === 'first-screen') {
    return 'Likely shared homepage/layout composition or CSS rhythm issue (hero structure, first-screen sloting, global spacing).';
  }
  if (id === 'metadata-a11y' || ar === 'accessibility' || ar === 'metadata' || ar === 'semantics') {
    return 'Likely reusable component/theme token issue (contrast/focus/semantics) affecting multiple routes.';
  }
  if (id === 'technical-depth' || id === 'readability-structure' || ar === 'technical-depth' || ar === 'page-depth') {
    return 'Likely content architecture pattern issue (generator output, page template density, docs leakage into landing paths).';
  }
  if (ar === 'trust' || ar === 'ecosystem') {
    return 'Likely shared content model/generator section composition issue (trust/ecosystem modules not consistently emitted).';
  }
  return 'Likely shared generator/layout/content-map source; verify page-local exceptions before making per-page edits.';
}

function coverageShare(clusterCount, totalCount) {
  if (!(totalCount > 0)) return 0;
  return clamp01(clusterCount / totalCount);
}

function makeClusterKey(checkId, area) {
  return `${String(checkId || 'unknown')}::${String(area || 'misc')}`;
}

function makeFindingRef(pageIdx, findingIdx, finding, page, siteKind) {
  const ctx = pageContext(page?.url || page?.pageUrl || '', siteKind);
  return {
    pageIdx,
    findingIdx,
    finding,
    url: page?.url || page?.pageUrl || '',
    isHome: Boolean(ctx.isHome),
    key: makeClusterKey(finding?.checkId, finding?.area),
  };
}

/**
 * Build ranked defect clusters for remediation plans.
 * @param {object} opts
 * @param {Array<{url?: string, pageUrl?: string, findings?: object[]}>} opts.pages
 * @param {object} opts.crawlSummary
 * @param {string} opts.siteKind
 * @param {number} [opts.limit]
 */
export function buildRankedDefectClusters(opts) {
  const pages = opts?.pages || [];
  const crawlSummary = opts?.crawlSummary || {};
  const siteKind = opts?.siteKind || 'generic';
  const limit = Number.isFinite(Number(opts?.limit)) ? Math.max(1, Number(opts.limit)) : DEFAULT_DEFECT_PLAN_LIMIT;

  /** @type {Array<ReturnType<typeof makeFindingRef>>} */
  const refs = [];
  pages.forEach((page, pageIdx) => {
    (page.findings || []).forEach((finding, findingIdx) => {
      if (!finding) return;
      refs.push(makeFindingRef(pageIdx, findingIdx, finding, page, siteKind));
    });
  });

  const baseUx = computeUxScores({ pages, crawlSummary, staticOnly: false, siteKind });
  const totalFindings = refs.length;

  /** @type {Map<string, Array<typeof refs[number]>>} */
  const grouped = new Map();
  for (const r of refs) {
    if (!grouped.has(r.key)) grouped.set(r.key, []);
    grouped.get(r.key).push(r);
  }

  /** @type {Array<object>} */
  const clusters = [];
  for (const [key, items] of grouped.entries()) {
    if (!items.length) continue;
    const first = items[0];
    const checkId = String(first.finding?.checkId || 'unknown');
    const area = String(first.finding?.area || 'misc');
    const affectedUrls = [...new Set(items.map((x) => x.url).filter(Boolean))];
    const findings = items.map((x) => x.finding);
    const bySeverity = summarizeSeverities(findings);
    const dimensionDamage = summarizeDimensionDamage(findings);
    const totalWeight = findings.reduce((acc, f) => acc + scoreWeightForSeverity(f.severity), 0);
    const majorPlusCount = countMajorPlus(findings);
    const hasHomepageGate = items.some((x) => isHomepageGateFinding(x.finding, x.isHome));
    const topSeverityRank = findings.reduce((acc, f) => Math.min(acc, severityRank(f.severity)), Number.MAX_SAFE_INTEGER);

    const removeSet = new Set(items.map((x) => `${x.pageIdx}:${x.findingIdx}`));
    const pagesWithoutCluster = pages.map((p, pageIdx) => ({
      ...p,
      findings: (p.findings || []).filter((_, findingIdx) => !removeSet.has(`${pageIdx}:${findingIdx}`)),
    }));
    const improvedUx = computeUxScores({
      pages: pagesWithoutCluster,
      crawlSummary,
      staticOnly: false,
      siteKind,
    });
    const estimatedOverallDelta = Math.max(0, Number(improvedUx.overall) - Number(baseUx.overall));
    const estimatedDimensionDelta = {};
    for (const [dim, baseDim] of Object.entries(baseUx.dimensions || {})) {
      const nxt = improvedUx.dimensions?.[dim];
      if (!nxt) continue;
      const d = Number(nxt.score) - Number(baseDim.score);
      if (d > 0) estimatedDimensionDelta[dim] = d;
    }

    const mainDimension = Object.entries(dimensionDamage)
      .sort((a, b) => b[1].rawDamage - a[1].rawDamage)[0]?.[0] || (AREA_TO_DESIGN_DIMENSION[area] || null);

    clusters.push({
      key,
      slugBase: toSlug(`${checkId}-${area}`),
      checkId,
      area,
      findingCount: findings.length,
      bySeverity,
      topSeverityRank,
      majorPlusCount,
      affectedUrls,
      totalWeight,
      hasHomepageGate,
      rootCauseHint: rootCauseHint(checkId, area),
      dimensionDamage,
      mainDimension,
      estimatedOverallDelta,
      estimatedDimensionDelta,
      findings,
      coverageShare: coverageShare(findings.length, totalFindings),
    });
  }

  clusters.sort((a, b) => {
    if (a.hasHomepageGate !== b.hasHomepageGate) return a.hasHomepageGate ? -1 : 1;
    if (a.estimatedOverallDelta !== b.estimatedOverallDelta) return b.estimatedOverallDelta - a.estimatedOverallDelta;
    if (a.majorPlusCount !== b.majorPlusCount) return b.majorPlusCount - a.majorPlusCount;
    if (a.totalWeight !== b.totalWeight) return b.totalWeight - a.totalWeight;
    if (a.affectedUrls.length !== b.affectedUrls.length) return b.affectedUrls.length - a.affectedUrls.length;
    if (a.topSeverityRank !== b.topSeverityRank) return a.topSeverityRank - b.topSeverityRank;
    return String(a.key).localeCompare(String(b.key));
  });

  const top = clusters.slice(0, limit).map((cluster, idx) => {
    const order = idx + 1;
    const dimMeta = cluster.mainDimension ? DESIGN_DIMENSION_META[cluster.mainDimension] : null;
    return {
      ...cluster,
      order,
      fileStem: `${String(order).padStart(2, '0')}-defect-${cluster.slugBase}`,
      title: `${String(order).padStart(2, '0')} - Defect: ${cluster.checkId} (${cluster.area})`,
      dimensionLabel: dimMeta?.label || cluster.mainDimension || 'Unmapped dimension',
      dimensionStandardSections: dimMeta?.standardSections || [],
    };
  });

  return {
    totalClusters: clusters.length,
    selectedLimit: limit,
    baseUx,
    clusters: top,
  };
}
