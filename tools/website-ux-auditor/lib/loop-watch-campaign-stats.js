/**
 * Top-of-dashboard campaign counters (pages, bugs, quality gate).
 */

import fs from 'node:fs';
import path from 'node:path';

import {
  isScorerSourcedQualityGate,
  isScorerWatchPhase,
  usesAuditIssueControls,
} from './loop-watch-phase-source.js';
import {
  evaluateAuditQualityGate,
  flattenAuditFindings,
  formatQualityGateSlashPairs,
  loadQualityGateThresholdsFromEnv,
} from './quality-gate.js';
import { clipPadVisible } from './terminal-ansi.js';

/**
 * @param {string | number | null | undefined} pagesStr e.g. "80/500"
 * @returns {{ current: number, budget: number } | null}
 */
export function parseWatchPagesProgress(pagesStr) {
  const s = String(pagesStr ?? '').trim();
  const m = /^(\d+)\s*\/\s*(\d+)$/.exec(s);
  if (!m) return null;
  const current = Number(m[1]);
  const budget = Number(m[2]);
  if (!Number.isFinite(current) || !Number.isFinite(budget)) return null;
  return { current, budget };
}

/**
 * @param {{ current?: number | null, budget?: number | null }} pair
 */
export function formatWatchPagesPair(pair) {
  if (pair?.current == null || !Number.isFinite(Number(pair.current))) return '—';
  const cur = Math.max(0, Math.floor(Number(pair.current)));
  const bud = pair.budget != null && Number.isFinite(Number(pair.budget))
    ? Math.max(0, Math.floor(Number(pair.budget)))
    : null;
  return bud != null ? `${cur}/${bud}` : String(cur);
}

/**
 * @param {string} outDir
 */
function readScorePagesCaptured(outDir) {
  try {
    const raw = fs.readFileSync(path.join(outDir, 'ux-quality-score.json'), 'utf8');
    const j = JSON.parse(raw);
    const cs = j?.crawlSummary;
    const captured = Number(cs?.pagesCaptured);
    const budget = Number(cs?.pagesPlannedBudget);
    if (!Number.isFinite(captured)) return null;
    return {
      current: captured,
      budget: Number.isFinite(budget) ? budget : null,
    };
  } catch {
    return null;
  }
}

/**
 * @param {string} outDir
 * @returns {number | null}
 */
function readBugsFixedFromLoopDelta(outDir) {
  try {
    const raw = fs.readFileSync(path.join(outDir, 'ux-quality-score-loop-delta.json'), 'utf8');
    const j = JSON.parse(raw);
    const prior = Number(j?.delta?.priorEffectiveFindingCount);
    const cur = Number(j?.delta?.currentEffectiveFindingCount);
    if (Number.isFinite(prior) && Number.isFinite(cur) && prior > cur) {
      return Math.floor(prior - cur);
    }
  } catch {
    /* no delta */
  }
  return null;
}

/**
 * @param {string} outDir
 * @param {string} phase
 */
function readAiAuditProgress(outDir, phase) {
  const p = path.join(outDir, 'ai-audit', 'ai-audit-data.json');
  try {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    let pages = 0;
    for (const b of j.batches || []) {
      if (b && b.ok !== false) pages += Math.max(0, Number(b.urlCount) || 0);
    }
    const planned = Number(j.batchesPlanned);
    const processed = Number(j.batchesProcessed);
    return {
      pages,
      batchesProcessed: Number.isFinite(processed) ? processed : null,
      batchesPlanned: Number.isFinite(planned) ? planned : null,
      running: false,
    };
  } catch {
    if (String(phase || '').toLowerCase().includes('ai_audit')) {
      return { pages: null, batchesProcessed: null, batchesPlanned: null, running: true };
    }
    return null;
  }
}

/**
 * @param {object | null} audit
 */
function readAuditedPagesFromAudit(audit) {
  if (!audit || typeof audit !== 'object') return null;
  const cs = audit.crawlSummary;
  if (cs && typeof cs === 'object') {
    const captured = Number(cs.pagesCaptured);
    const budget = Number(cs.pagesPlannedBudget);
    if (Number.isFinite(captured)) {
      return {
        current: captured,
        budget: Number.isFinite(budget) ? budget : (audit.pages?.length || null),
      };
    }
  }
  const n = Array.isArray(audit.pages) ? audit.pages.length : 0;
  if (n > 0) return { current: n, budget: null };
  return null;
}

/**
 * @param {string} outDir
 * @param {Record<string, unknown>} state
 * @param {object | null} [audit]
 * @param {{ env?: Record<string, string | undefined> }} [opts]
 */
export function computeWatchCampaignStats(outDir, state, audit = null, opts = {}) {
  const phase = String(state.phase || '').toLowerCase();
  const crawl =
    state.crawl && typeof state.crawl === 'object' && !Array.isArray(state.crawl)
      ? /** @type {Record<string, unknown>} */ (state.crawl)
      : {};
  const ap =
    state.auditProgress && typeof state.auditProgress === 'object' && !Array.isArray(state.auditProgress)
      ? /** @type {Record<string, unknown>} */ (state.auditProgress)
      : {};
  const qg =
    state.qualityGate && typeof state.qualityGate === 'object' && !Array.isArray(state.qualityGate)
      ? /** @type {Record<string, unknown>} */ (state.qualityGate)
      : null;

  const liveCrawl = parseWatchPagesProgress(crawl.pages);
  const label = String(crawl.label || '');
  const isScorerLive = phase.includes('scorer') || label.includes('ux-score');
  const isAuditorLive =
    phase.includes('auditor')
    || phase.includes('remediation')
    || phase.includes('ai_audit')
    || label.includes('ux-audit');

  let pagesScored = readScorePagesCaptured(outDir);
  if (isScorerLive && liveCrawl) {
    if (!pagesScored || liveCrawl.current >= pagesScored.current) pagesScored = liveCrawl;
  }

  let pagesAudited = readAuditedPagesFromAudit(audit);
  if (isAuditorLive && liveCrawl && label.includes('ux-audit')) {
    pagesAudited = liveCrawl;
  }

  const ai = readAiAuditProgress(outDir, phase);

  const auditIssueControls = usesAuditIssueControls(phase, label);

  let bugsFound = null;
  if (auditIssueControls) {
    bugsFound = Number(ap.findingAccum);
    if (!Number.isFinite(bugsFound) && audit) {
      bugsFound = flattenAuditFindings(audit).length;
    }
    if (!Number.isFinite(bugsFound) && qg?.total != null && !isScorerSourcedQualityGate(qg)) {
      bugsFound = Number(qg.total);
    }
    if (!Number.isFinite(bugsFound)) bugsFound = null;
  }

  let bugsFixed = readBugsFixedFromLoopDelta(outDir);
  if (bugsFixed == null) {
    const loop =
      state.loop && typeof state.loop === 'object' && !Array.isArray(state.loop)
        ? /** @type {Record<string, unknown>} */ (state.loop)
        : {};
    const prev = Number(loop.violationUnitsPrev);
    const cur = Number(loop.violationUnits);
    if (Number.isFinite(prev) && Number.isFinite(cur) && prev > cur) {
      bugsFixed = Math.floor(prev - cur);
    }
  }

  let gatePass = auditIssueControls ? qg?.pass === true : true;
  /** @type {Record<string, number>} */
  let gateCounts = {};
  /** @type {Record<string, number>} */
  let gateThresholds = {};
  if (!auditIssueControls) {
    try {
      gateThresholds = loadQualityGateThresholdsFromEnv(opts.env || process.env);
    } catch {
      gateThresholds = loadQualityGateThresholdsFromEnv({});
    }
  } else if (qg?.counts && qg?.thresholds && !isScorerSourcedQualityGate(qg)) {
    gateCounts = /** @type {Record<string, number>} */ (qg.counts);
    gateThresholds = /** @type {Record<string, number>} */ (qg.thresholds);
  } else if (audit) {
    try {
      const thresholds = loadQualityGateThresholdsFromEnv(opts.env || process.env);
      const ev = evaluateAuditQualityGate(audit, thresholds);
      gatePass = ev.pass;
      gateCounts = ev.counts;
      gateThresholds = ev.thresholds;
    } catch {
      gatePass = false;
    }
  }

  return {
    pagesScored,
    pagesAudited,
    ai,
    bugsFound: bugsFound != null ? Math.max(0, Math.floor(bugsFound)) : null,
    bugsFixed: bugsFixed != null ? Math.max(0, bugsFixed) : null,
    gate: {
      pass: gatePass,
      counts: gateCounts,
      thresholds: gateThresholds,
      slash: Object.keys(gateCounts).length
        ? formatQualityGateSlashPairs(gateCounts, gateThresholds)
        : '',
    },
  };
}

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

/**
 * @param {Awaited<ReturnType<typeof computeWatchCampaignStats>>} stats
 */
function formatAiAuditedSegment(stats) {
  const ai = stats.ai;
  if (!ai) return '—';
  if (ai.running) return '…';
  const pages = ai.pages != null && Number.isFinite(ai.pages) ? String(ai.pages) : '—';
  if (ai.batchesProcessed != null && ai.batchesPlanned != null && ai.batchesPlanned > 0) {
    return `${pages} pg · ${ai.batchesProcessed}/${ai.batchesPlanned} bat`;
  }
  return `${pages} pg`;
}

/**
 * @param {Awaited<ReturnType<typeof computeWatchCampaignStats>>} stats
 * @param {{ innerWidth?: number, useColor?: boolean }} [opts]
 * @returns {string[]}
 */
export function formatWatchCampaignStatsLines(stats, opts = {}) {
  const useColor = opts.useColor !== false && !(process.env.NO_COLOR != null && String(process.env.NO_COLOR).length > 0);
  const paint = (text, code) => (useColor && code ? `${code}${text}${ANSI.reset}` : text);

  const scored = formatWatchPagesPair(stats.pagesScored);
  const audited = formatWatchPagesPair(stats.pagesAudited);
  const aiSeg = formatAiAuditedSegment(stats);
  const found = stats.bugsFound != null ? String(stats.bugsFound) : '—';
  const fixed = stats.bugsFixed != null ? String(stats.bugsFixed) : '—';

  const gateLabel = stats.gate.pass ? 'PASS' : 'FAIL';
  const gateCol = stats.gate.pass ? ANSI.green : ANSI.red;
  const gateHead = paint(`${gateLabel}`, `${ANSI.bold}${gateCol}`);
  const gateDetail = stats.gate.slash || '—';

  const metrics = [
    `${paint('Scored', ANSI.dim)} ${scored}`,
    `${paint('Audited', ANSI.dim)} ${audited}`,
    `${paint('AI-audited', ANSI.dim)} ${aiSeg}`,
    `${paint('Bugs found', ANSI.dim)} ${found}`,
    `${paint('Bugs fixed', ANSI.dim)} ${fixed}`,
  ].join('  │  ');

  const gatePart = `${paint('Gate', ANSI.cyan)} ${gateHead}  ${gateDetail}`;
  const innerW = Math.max(40, opts.innerWidth || 120);
  const line1 = clipPadVisible(` ${metrics}`, innerW);
  const line2 = clipPadVisible(` ${gatePart}`, innerW);
  return [line1, line2];
}
