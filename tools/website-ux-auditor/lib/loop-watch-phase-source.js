/**
 * Loop-watch: scorer crawl vs audit crawl — only audit drives gate / bugs UI.
 * Scorer findings are stored in `scorerBacklog` for later analysis (no agent fixes).
 */

import { loadQualityGateThresholdsFromEnv } from './quality-gate.js';
import { SEVERITY_LEVELS } from './severity.js';

/**
 * @param {string} [phase]
 * @param {string} [crawlLabel]
 */
export function isScorerWatchPhase(phase, crawlLabel = '') {
  const p = String(phase || '').toLowerCase();
  const l = String(crawlLabel || '').toLowerCase();
  if (p.includes('scorer')) return true;
  if (l.includes('ux-score') || l.includes('[ux-score]')) return true;
  return false;
}

/**
 * Dashboard should use audit crawl / audit-data for gate and bug counts.
 * @param {string} [phase]
 * @param {string} [crawlLabel]
 */
export function usesAuditIssueControls(phase, crawlLabel = '') {
  return !isScorerWatchPhase(phase, crawlLabel);
}

/**
 * @param {Record<string, unknown> | null | undefined} qg
 */
export function isScorerSourcedQualityGate(qg) {
  if (!qg || typeof qg !== 'object') return false;
  return String(/** @type {{ source?: string }} */ (qg).source || '').toLowerCase() === 'scorer';
}

/**
 * @param {Record<string, number>} counts
 */
export function sumSeverityCounts(counts) {
  let n = 0;
  for (const v of Object.values(counts || {})) {
    const x = Number(v);
    if (Number.isFinite(x) && x > 0) n += x;
  }
  return n;
}

/**
 * @param {Record<string, unknown>} state
 */
export function readScorerBacklogFromState(state) {
  const sb =
    state.scorerBacklog && typeof state.scorerBacklog === 'object' && !Array.isArray(state.scorerBacklog)
      ? /** @type {Record<string, unknown>} */ (state.scorerBacklog)
      : null;
  if (!sb) return null;
  const counts =
    sb.counts && typeof sb.counts === 'object' && !Array.isArray(sb.counts)
      ? /** @type {Record<string, number>} */ (sb.counts)
      : {};
  const total = Number.isFinite(Number(sb.total)) ? Number(sb.total) : sumSeverityCounts(counts);
  return { counts, total, source: String(sb.source || 'scorer') };
}

/**
 * Neutral gate snapshot while scorer runs (audit not driving UI yet).
 * @param {Record<string, number>} [thresholds]
 */
export function emptyAuditGatePlaceholder(thresholds) {
  let thr = thresholds;
  if (!thr) {
    try {
      thr = loadQualityGateThresholdsFromEnv(process.env);
    } catch {
      thr = loadQualityGateThresholdsFromEnv({});
    }
  }
  /** @type {Record<string, number>} */
  const counts = {};
  for (const id of SEVERITY_LEVELS) counts[id] = 0;
  return {
    pass: true,
    counts,
    thresholds: thr,
    total: 0,
    majorPlus: 0,
    source: 'audit',
  };
}

/**
 * @param {Record<string, number>} counts
 * @param {{ phase?: string, source?: string }} [meta]
 */
export function buildScorerBacklogPatch(counts, meta = {}) {
  const total = sumSeverityCounts(counts);
  return {
    scorerBacklog: {
      counts: { ...counts },
      total,
      source: meta.source || 'scorer_crawl',
      phase: meta.phase || 'scorer',
      updatedAt: new Date().toISOString(),
    },
  };
}
