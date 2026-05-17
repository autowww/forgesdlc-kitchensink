import {
  AREA_TO_DESIGN_DIMENSION,
  ANCILLARY_FINDING_AREAS,
  DESIGN_DIMENSION_IDS,
  DESIGN_DIMENSION_META,
} from './design-dimensions.js';
import { SCORE_WEIGHTS } from './severity.js';

export const DESIGN_UX_SCORE_VERSION = 1;

/** Penalty curvature on ln(1 + damage). */
export const DESIGN_UX_LOG_K = 15;

const HARM_EPS = 1e-6;

/**
 * Severity weight used in dimension damage (aligned with auditor SCORE_WEIGHTS).
 */
export function findingDamageWeight(finding) {
  if (!finding) return 0;
  const w = SCORE_WEIGHTS[String(finding.severity || '').toLowerCase()];
  return Number.isFinite(w) ? w : 8;
}

function dimensionScoreFromDamage(rawDamage) {
  if (!(rawDamage > 0)) return 100;
  const raw = 100 - DESIGN_UX_LOG_K * Math.log1p(rawDamage);
  return Math.round(Math.min(99, Math.max(1, raw)));
}

export function harmonicMean(values) {
  const xs = values.filter((v) => Number.isFinite(v) && v > 0);
  if (!xs.length) return 0;
  let inv = 0;
  for (const x of xs) inv += 1 / (x + HARM_EPS);
  return inv <= 0 ? 0 : Math.round(xs.length / inv);
}

/**
 * @typedef {object} UxScoresResult
 * @property {number} version
 * @property {string} formula
 * @property {number} overall
 * @property {Record<string, { score: number, rawDamage: number, findingCount: number }>} dimensions
 * @property {{
 *   staticOnly: boolean,
 *   crawlStoppedEarly: boolean,
 *   ancillaryFindingCount: number,
 *   effectiveFindingCount: number,
 *   pagesAnalyzed: number,
 *   perfectScoreEligible: boolean,
 * }} coverage
 */

/**
 * Read `uxScores` from auditor `audit-data.json` or scorer `ux-quality-score.json`.
 * @param {unknown} parsed
 * @returns {UxScoresResult}
 */
export function extractUxScoresFromSavedJson(parsed) {
  const root = parsed && typeof parsed === 'object' ? parsed : {};
  const blob = /** @type {{ uxScores?: object }} */ (root).uxScores;
  if (
    blob
    && typeof blob === 'object'
    && Number.isFinite(/** @type {{ overall?: unknown }} */ (blob).overall)
    && blob.dimensions
    && typeof blob.dimensions === 'object'
  ) {
    return /** @type {UxScoresResult} */ (blob);
  }
  throw new Error('Saved JSON must include a numeric uxScores.overall plus uxScores.dimensions (audit-data.json or ux-quality-score.json).');
}

/**
 * Aggregate pages into design UX scores (log penalty per dimension + harmonic overall).
 *
 * Overall **100** only when crawl coverage permits perfection and **no** effective findings remain.
 *
 * @param {object} opts
 * @param {{ url?: string, findings?: object[] }[]} opts.pages
 * @param {{
 *   staticOnly?: boolean,
 *   stopReason?: string,
 *   pagesPlannedBudget?: number,
 *   queuedRemainingAtStop?: number,
 * }} [opts.crawlSummary]
 */
export function computeUxScores(opts) {
  const pages = opts?.pages || [];
  const crawl = opts?.crawlSummary || {};
  const flat = pages.flatMap((p) => (p.findings || []).map((f) => ({ ...f, url: p.url || p.pageUrl })));

  const staticOnly = Boolean(opts?.staticOnly ?? (crawl.stopReason === 'static_only'));
  const crawlStoppedEarly = crawl.stopReason === 'major_plus_threshold';
  const ancillary = flat.filter((f) => ANCILLARY_FINDING_AREAS.has(f.area));
  const effective = flat.filter((f) => !ANCILLARY_FINDING_AREAS.has(f.area));

  /** @type {Record<string, { rawDamage: number, findingCount: number }>} */
  const damageByDim = {};
  for (const id of DESIGN_DIMENSION_IDS) damageByDim[id] = { rawDamage: 0, findingCount: 0 };

  for (const f of effective) {
    const dim = AREA_TO_DESIGN_DIMENSION[f.area];
    if (!dim) continue;
    const w = findingDamageWeight(f);
    damageByDim[dim].rawDamage += w;
    damageByDim[dim].findingCount += 1;
  }

  /** @type {Record<string, { score: number, rawDamage: number, findingCount: number }>} */
  const dimensions = {};
  const dimScores = [];
  for (const id of DESIGN_DIMENSION_IDS) {
    const { rawDamage, findingCount } = damageByDim[id];
    const score = dimensionScoreFromDamage(rawDamage);
    dimensions[id] = { score, rawDamage, findingCount };
    dimScores.push(score);
  }

  const perfectScoreEligible = !staticOnly && !crawlStoppedEarly && effective.length === 0;
  let overall = 100;
  if (!perfectScoreEligible) {
    const h = harmonicMean(dimScores);
    if (!effective.length) {
      overall = staticOnly ? Math.min(h, 95) : crawlStoppedEarly ? Math.min(h, 98) : Math.min(h, 99);
    } else {
      overall = Math.min(99, Math.max(1, h));
    }
  }

  return {
    version: DESIGN_UX_SCORE_VERSION,
    formula:
      `per_dimension: clamp 1–99 · round(100 - ${DESIGN_UX_LOG_K}*ln(1+rawDamage)); overall: harmonic mean of dimension scores capped 1–99 if effective findings remain; overall 100 if perfectScoreEligible.`,
    overall,
    dimensions,
    dimensionsMeta: DESIGN_DIMENSION_META,
    coverage: {
      staticOnly,
      crawlStoppedEarly,
      ancillaryFindingCount: ancillary.length,
      effectiveFindingCount: effective.length,
      pagesAnalyzed: pages.length,
      perfectScoreEligible,
      queuedRemainingAtStop: crawl.queuedRemainingAtStop ?? null,
      pagesPlannedBudget: crawl.pagesPlannedBudget ?? null,
      stopReason: crawl.stopReason ?? null,
    },
  };
}

/**
 * Numeric deltas vs a prior scorer/audit export (overall + pillar scores only).
 *
 * @param {UxScoresResult} previous
 * @param {UxScoresResult} next
 */
export function compareUxScores(previous, next) {
  const p = previous?.dimensions ?? {};
  const n = next?.dimensions ?? {};
  /** @type {Record<string, { prior: number, current: number, delta: number }>} */
  const byId = {};
  for (const id of DESIGN_DIMENSION_IDS) {
    const ps = Number(p[id]?.score);
    const ns = Number(n[id]?.score);
    const pv = Number.isFinite(ps) ? ps : null;
    const nv = Number.isFinite(ns) ? ns : null;
    if (pv !== null && nv !== null) {
      const delta = nv - pv;
      byId[id] = { prior: pv, current: nv, delta };
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
  };
}

/**
 * Markdown UX quality scorecard + JSON fence for human review.
 */
export function buildUxQualityScoreMarkdown(opts) {
  const {
    runMeta,
    profile,
    designStandard,
    uxScores,
    argsSummary,
    crawlSummary,
  } = opts;

  const lines = [];
  lines.push('---');
  lines.push(`title: Forge UX quality score (design standard)`);
  lines.push(`kind: ux-quality-score`);
  lines.push(`schema_version_ux_scores: ${uxScores.version}`);
  if (profile?.name) lines.push(`site_kind: ${profile.name}`);
  if (runMeta?.generatedAt) lines.push(`generated_at: ${runMeta.generatedAt}`);
  if (runMeta?.auditRunId) lines.push(`run_id: ${runMeta.auditRunId}`);
  lines.push(`design_standard_sha256: ${designStandard?.sha256 || ''}`);
  lines.push('---');
  lines.push('');
  lines.push('# Forge UX quality score');
  lines.push('');
  lines.push(`**Overall:** **${uxScores.overall}** / 100 (log-penalty + harmonic rollup; schema v${uxScores.version})`);
  lines.push('');
  lines.push('| Coverage signal | Value |');
  lines.push('|-----------------|-------|');
  lines.push(`| Perfect score eligible (no effective findings + full live crawl) | \`${uxScores.coverage.perfectScoreEligible}\` |`);
  lines.push(`| Static-only | \`${uxScores.coverage.staticOnly}\` |`);
  lines.push(`| Crawl stopped early (Major+ backlog) | \`${uxScores.coverage.crawlStoppedEarly}\` |`);
  lines.push(`| Pages analyzed | \`${uxScores.coverage.pagesAnalyzed}\` |`);
  lines.push(`| Effective findings | \`${uxScores.coverage.effectiveFindingCount}\` |`);
  lines.push(`| Ancillary (${[...ANCILLARY_FINDING_AREAS].join(', ')}) | \`${uxScores.coverage.ancillaryFindingCount}\` |`);
  if (typeof crawlSummary?.queuedRemainingAtStop === 'number') {
    lines.push(`| URLs queued at boundary | \`${crawlSummary.queuedRemainingAtStop}\` |`);
  }
  lines.push('');
  if (designStandard?.path) {
    lines.push(`Design standard pinned: path \`${String(designStandard.path)}\`; id **${designStandard.id || '—'}**`);
    lines.push('');
  }
  if (argsSummary) lines.push(argsSummary.trim(), '');
  lines.push('## Dimension scores');
  lines.push('');
  lines.push('| Dimension | Score (1–100) | Raw damage (Σ severity weights) | Findings | Standard sections |');
  lines.push('|-----------|----------------:|---:|---------:|-------|');
  for (const id of DESIGN_DIMENSION_IDS) {
    const d = uxScores.dimensions[id];
    const meta = DESIGN_DIMENSION_META[id];
    const sec = meta?.standardSections?.join('; ') ?? '—';
    lines.push(`| **${meta?.label ?? id}** | ${d.score} | ${Math.round(d.rawDamage * 100) / 100} | ${d.findingCount} | ${sec} |`);
  }
  lines.push('');
  lines.push('## Interpretation');
  lines.push('');
  lines.push('- **Overall 100**: only when the run is a **live** crawl that did **not** stop early **and** there are **no** effective findings mapped to pillars (severity v2 heuristic checks only). Ancillary artifacts such as `site-inspection` / `inventory` do not satisfy that bar.');
  lines.push('- **Below 100 with zero effective findings**: can happen after **static-only** analysis or a **paused** crawl (`major_plus_threshold`); numeric score is indicative only.');
  lines.push('- **Dimensional damage** uses summed `SCORE_WEIGHTS` penalties (blocker→cosmetic ladder) grouped by heuristic `area` → design pillar.');
  lines.push('');
  lines.push('## Machine-readable blob');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify({ uxScores }, null, 2));
  lines.push('```');
  lines.push('');
  return lines.join('\n');
}

/**
 * Compact block for forge UX audit-report.md (delegates breadth to `score-website-ux.mjs`).
 *
 * @param {UxScoresResult} rollupUxScores
 * @param {{
 *   precrawlUxScores?: UxScoresResult | null,
 *   precrawlCrawlSummary?: object | null,
 *   uxScoreDeltaVsPrior?: ReturnType<typeof compareUxScores> | null,
 *   priorUxScoresSourceDisplay?: string | null,
 * }} [extras]
 */
export function buildUxScoresAuditSnippet(rollupUxScores, extras = {}) {
  const ancillary = [...ANCILLARY_FINDING_AREAS].sort().join('`, `');
  const lines = [];
  lines.push('## Design-standard UX rollup (heuristic)');
  lines.push('');
  lines.push('- **Interpretation:** this block combines optional **prior-run deltas** (--prior-ux-scores), an optional **precrawl sitewide** rollup (--scores-first), and the rollup for **URLs analyzed in this audit output**.');
  lines.push('');
  const priorPath = extras.priorUxScoresSourceDisplay ?? null;
  const delta = extras.uxScoreDeltaVsPrior ?? null;
  const precrawl = extras.precrawlUxScores ?? null;

  if (delta && typeof delta.overall === 'object') {
    const d = delta.overall.delta;
    const deltaStr = d === null || d === undefined ? '—' : (d >= 0 ? `+${d}` : `${d}`);
    lines.push('### Vs prior UX snapshot (--prior-ux-scores)');
    lines.push('');
    lines.push(`| | Prior file | Prior | **This audit rollup** | Δ overall |`);
    lines.push('|--:|---|--:|--:|--:|');
    lines.push(`| Overall | ${priorPath ? `\`${priorPath}\`` : '—'} | ${delta.overall.prior} | **${delta.overall.current}** | **${deltaStr}** |`);
    lines.push('| _Effective findings_ | — | `' + String(delta.priorEffectiveFindingCount ?? '—') + '` | **`' + String(delta.currentEffectiveFindingCount ?? '—') + '`** | — |');
    lines.push('');
    lines.push('| Pillar id | Prior score | Current (audit rollup) | Δ |');
    lines.push('|-----------|------------|--------------------------|--:|');
    for (const id of DESIGN_DIMENSION_IDS) {
      const row = delta.dimensions[id];
      if (!row) continue;
      const dd = row.delta >= 0 ? `+${row.delta}` : `${row.delta}`;
      lines.push(`| \`${id}\` | ${row.prior} | ${row.current} | ${dd} |`);
    }
    lines.push('');
    lines.push('_Positive Δ means improvement on pillar score (higher better). Comparisons assume both exports use comparable crawl modes — prefer priors captured with the same --stop-disable / breadth as this audit when possible._');
    lines.push('');
  }

  if (precrawl) {
    const cs = extras.precrawlCrawlSummary || {};
    lines.push('### Precrawl sitewide snapshot (--scores-first)');
    lines.push('');
    lines.push(
      `_Full-budget crawler pass **before** the remediation crawl (budget \`${String(cs.pagesPlannedBudget ?? '?')}\` pages, \`${String(cs.crawlMode ?? '')}\`, \`${String(cs.stopReason ?? '')}\`; **${precrawl.coverage.pagesAnalyzed}** URLs → \`precrawlUxScores\`). Screenshots skipped for speed._`,
    );
    lines.push('');
    lines.push('| Lens | Precrawl overall | Audit rollup overall | Precrawl Maj+ backlog | Effective findings precrawl vs rollup |');
    lines.push('|------|----------------:|---------------------:|----------:|--------------------------------------------|');
    lines.push(
      `| Combined | ${precrawl.overall} | **${rollupUxScores.overall}** | ${String(cs.majorPlusFindingCountTotal ?? '')} | ${precrawl.coverage.effectiveFindingCount} → ${rollupUxScores.coverage.effectiveFindingCount} |`,
    );
    lines.push('');
    lines.push('| Pillar id | Precrawl | Audit rollup |');
    lines.push('|-----------|---------:|---------------:|');
    for (const id of DESIGN_DIMENSION_IDS) {
      const a = precrawl.dimensions[id];
      const b = rollupUxScores.dimensions[id];
      lines.push(`| \`${id}\` | ${a.score} | **${b.score}** |`);
    }
    lines.push('');
    lines.push('_Precrawl aggregates **more URLs** than the remediation crawl when the audit stops early — differences are indicative, not a strict before/after of the same page set._');
    lines.push('');
  }

  lines.push('### Audit crawl rollup (this report’s URLs)');
  lines.push('');
  lines.push(`- **Overall score:** **${rollupUxScores.overall}** / 100 (schema **v${rollupUxScores.version}**) — logarithmic pillar penalties + harmonic blend over **only** URLs that appear above in the crawl tables.`);
  lines.push('- **Breadth:** for a paused Major+ crawl without precrawl/scorer pairing, run **`npm run score -- …`** (**`score-website-ux.mjs`**) across the site budget.');
  lines.push('');
  lines.push('| Pillar id | Score | Damage | Findings |');
  lines.push('|-----------|-------|--------|-----------|');
  for (const id of DESIGN_DIMENSION_IDS) {
    const d = rollupUxScores.dimensions[id];
    lines.push(`| \`${id}\` | ${d.score} | ${Math.round(d.rawDamage * 100) / 100} | ${d.findingCount} |`);
  }
  lines.push('');
  lines.push(`**Coverage flags** — \`staticOnly\`, \`crawlStoppedEarly\`, \`effectiveFindingCount\` (excluding ancillary \`${ancillary}\`) + \`perfectScoreEligible\`; see \`audit-data.json → uxScores\`.`);
  lines.push('');
  return lines.join('\n');
}
