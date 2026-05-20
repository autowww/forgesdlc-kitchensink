/**
 * Compute watch-dashboard progress bar models from campaign artifacts.
 */

import fs from 'node:fs';
import path from 'node:path';

import {
  countBySeverity,
  evaluateAuditQualityGate,
  evaluateQualityGate,
  flattenAuditFindings,
  loadQualityGateThresholdsFromEnv,
  pagePassesQualityGate,
} from './quality-gate.js';
import { SEVERITY_LEVELS } from './severity.js';
import { rollupRuleExecution } from './rule-execution-rollup.js';
import { readDashboardStateSafe } from './ux-loop-dashboard-state.js';

/** @typedef {'unvisited'|'clean'|'issues'|'error'} PageBucket */

/** @typedef {'unvisited'|'full'|'partial'|'error'} RulePageBucket */

const CYCLE_STEPS = ['scorer', 'audit', 'remediation', 'build'];

/** @type {Map<string, { mtimeMs: number, audit: object | null }>} */
const auditCache = new Map();

/**
 * @param {number} violationUnits
 * @param {Record<SeverityId, number>} counts
 * @param {Record<SeverityId, number>} thresholds
 */
export function computeViolationUnits(counts, thresholds) {
  const ev = evaluateQualityGate(counts, thresholds);
  if (ev.pass) return 0;
  return ev.violations.reduce((acc, v) => acc + v.overBy, 0);
}

/**
 * @param {object} opts
 * @param {number} opts.iteration
 * @param {number} opts.maxIterations
 * @param {number} opts.violationUnits
 * @param {number} [opts.violationUnitsPrev]
 * @param {number} [opts.avgDeltaEma]
 * @param {boolean} opts.gatePass
 * @param {number | null} [opts.targetIterations]
 * @param {boolean} [opts.recomputeEstimate]
 */
export function computeExpectedIterations(opts) {
  const iteration = Math.max(0, Number(opts.iteration) || 0);
  const maxIterations = Math.max(1, Number(opts.maxIterations) || 20);
  if (opts.targetIterations != null && Number.isFinite(Number(opts.targetIterations))) {
    return Math.min(maxIterations, Math.max(iteration, Math.floor(Number(opts.targetIterations))));
  }
  if (opts.gatePass) return Math.max(1, iteration);
  if (opts.recomputeEstimate === false) {
    return Math.min(maxIterations, Math.max(iteration + 1, iteration));
  }
  const vu = Math.max(0, Number(opts.violationUnits) || 0);
  const prev = Math.max(0, Number(opts.violationUnitsPrev) || 0);
  let avgDelta = Number(opts.avgDeltaEma);
  const drop = Math.max(0, prev - vu);
  if (drop > 0) {
    if (!Number.isFinite(avgDelta) || avgDelta <= 0) avgDelta = Math.max(drop, 1);
    else avgDelta = 0.7 * avgDelta + 0.3 * drop;
  } else if (!Number.isFinite(avgDelta) || avgDelta <= 0) {
    avgDelta = 1;
  }
  const remaining = vu > 0 ? Math.ceil(vu / avgDelta) : 0;
  let expected = iteration + Math.max(remaining, 1);
  expected = Math.min(maxIterations, expected);
  return Math.max(expected, iteration + 1);
}

/**
 * @param {string} outDir
 */
function readAuditCached(outDir) {
  const p = path.join(outDir, 'audit-data.json');
  let mtimeMs = -1;
  try {
    mtimeMs = fs.statSync(p).mtimeMs;
  } catch {
    auditCache.set(outDir, { mtimeMs: -1, audit: null });
    return null;
  }
  const hit = auditCache.get(outDir);
  if (hit && hit.mtimeMs === mtimeMs) return hit.audit;
  try {
    const audit = JSON.parse(fs.readFileSync(p, 'utf8'));
    auditCache.set(outDir, { mtimeMs, audit });
    return audit;
  } catch {
    auditCache.set(outDir, { mtimeMs, audit: null });
    return null;
  }
}

/**
 * @param {Array<{ url?: string, error?: string, findings?: unknown[], ruleExecution?: object }>} pages
 * @param {Record<string, number>} thresholds
 */
export function classifyPagesForProgress(pages, thresholds) {
  /** @type {PageBucket[]} */
  const buckets = [];
  let clean = 0;
  let issues = 0;
  let error = 0;
  for (const p of pages || []) {
    if (p?.error) {
      buckets.push('error');
      error += 1;
      continue;
    }
    if (pagePassesQualityGate(p.findings || [], thresholds)) {
      buckets.push('clean');
      clean += 1;
    } else {
      buckets.push('issues');
      issues += 1;
    }
  }
  return { buckets, clean, issues, error };
}

/**
 * @param {object} crawlSummary
 */
export function isPagesCrawlBudgetComplete(crawlSummary) {
  if (!crawlSummary || typeof crawlSummary !== 'object') return false;
  const queued = Number(crawlSummary.queuedRemainingAtStop ?? crawlSummary.queuedRemaining ?? NaN);
  const captured = Number(crawlSummary.pagesCaptured ?? NaN);
  const budget = Number(crawlSummary.pagesPlannedBudget ?? NaN);
  const stopReason = String(crawlSummary.stopReason || crawlSummary.crawlMode || '');
  if (queued === 0 && Number.isFinite(captured) && captured > 0) {
    if (Number.isFinite(budget) && captured >= budget) return true;
    if (stopReason === 'normal_completion' || stopReason === 'full_budget_within_max_pages') return true;
    if (stopReason === 'major_plus_governed_complete') return true;
  }
  return false;
}

/**
 * @param {Array<{ url?: string, error?: string, ruleExecution?: { deterministic?: object[] } }>} pages
 * @param {string[]} implementedRuleIds
 */
export function classifyRuleCoveragePages(pages, implementedRuleIds) {
  const implemented = implementedRuleIds || [];
  const implSet = new Set(implemented);
  /** @type {RulePageBucket[]} */
  const buckets = [];
  let full = 0;
  let partial = 0;
  let error = 0;
  for (const p of pages || []) {
    if (p?.error && !p?.ruleExecution) {
      buckets.push('error');
      error += 1;
      continue;
    }
    const det = p?.ruleExecution?.deterministic || [];
    const ranIds = new Set(
      det
        .filter((r) => {
          const s = String(r?.status || '');
          return s === 'ran' || s === 'skipped_no_findings_cache';
        })
        .map((r) => String(r.ruleId || '')),
    );
    let ok = true;
    for (const id of implSet) {
      if (!ranIds.has(id)) {
        ok = false;
        break;
      }
    }
    if (ok && implSet.size > 0) {
      buckets.push('full');
      full += 1;
    } else if (det.length) {
      buckets.push('partial');
      partial += 1;
    } else {
      buckets.push('partial');
      partial += 1;
    }
  }
  return { buckets, full, partial, error, implementedCount: implSet.size };
}

/**
 * @param {object} coverage from rollupRuleExecution
 */
export function isRulesCoverageComplete(coverage) {
  if (!coverage) return false;
  if (!(coverage.pagesVisited > 0)) return false;
  if (!(coverage.registryImplementedCount > 0)) return false;
  if (!coverage.deterministicRanOnAllVisitedPages) return false;
  const bad = (coverage.deterministicRules || []).some(
    (r) => (r.import_error || 0) > 0 || (r.threw || 0) > 0,
  );
  return !bad;
}

/**
 * @param {string} cyclePhase
 * @param {boolean} postAgentBuildEnabled
 */
export function isRunsCycleComplete(cyclePhase, postAgentBuildEnabled = true) {
  const ph = String(cyclePhase || '').toLowerCase();
  if (!ph) return false;
  if (ph === 'build' || ph === 'build_done' || ph === 'build_skip') return true;
  if (!postAgentBuildEnabled && (ph === 'remediation' || ph === 'remediation_done')) return true;
  return false;
}

/**
 * @param {string} cyclePhase
 */
export function formatCyclePhaseLights(cyclePhase) {
  const ph = String(cyclePhase || '').toLowerCase();
  const order = ['scorer', 'audit', 'remediation', 'build'];
  const idx = order.findIndex((s) => ph === s || ph.startsWith(`${s}_`));
  return CYCLE_STEPS.map((step, i) => {
    const lit = idx >= 0 && i <= idx;
    return lit ? step[0].toUpperCase() : step[0].toLowerCase();
  }).join('');
}

/**
 * Compress page buckets into bar cells.
 * @param {PageBucket[]} buckets
 * @param {number} unvisitedSlots
 * @param {number} width
 */
export function compressBucketsToCells(buckets, unvisitedSlots, width) {
  const w = Math.max(1, width);
  const total = buckets.length + Math.max(0, unvisitedSlots);
  if (total <= 0) return Array.from({ length: w }, () => 'unvisited');
  /** @type {PageBucket[]} */
  const expanded = [...buckets];
  for (let i = 0; i < unvisitedSlots; i += 1) expanded.push('unvisited');
  /** @type {PageBucket[]} */
  const cells = [];
  for (let c = 0; c < w; c += 1) {
    const start = Math.floor((c * expanded.length) / w);
    const end = Math.floor(((c + 1) * expanded.length) / w);
    const slice = expanded.slice(start, Math.max(start + 1, end));
    const priority = ['error', 'issues', 'clean', 'unvisited'];
    let pick = 'unvisited';
    for (const p of priority) {
      if (slice.includes(/** @type {PageBucket} */ (p))) {
        pick = /** @type {PageBucket} */ (p);
        break;
      }
    }
    cells.push(pick);
  }
  return cells;
}

/**
 * @param {RulePageBucket[]} buckets
 * @param {number} unvisitedSlots
 * @param {number} width
 */
export function compressRuleBucketsToCells(buckets, unvisitedSlots, width) {
  const w = Math.max(1, width);
  const total = buckets.length + Math.max(0, unvisitedSlots);
  if (total <= 0) return Array.from({ length: w }, () => 'unvisited');
  const expanded = [...buckets];
  for (let i = 0; i < unvisitedSlots; i += 1) expanded.push('unvisited');
  /** @type {RulePageBucket[]} */
  const cells = [];
  for (let c = 0; c < w; c += 1) {
    const start = Math.floor((c * expanded.length) / w);
    const end = Math.floor(((c + 1) * expanded.length) / w);
    const slice = expanded.slice(start, Math.max(start + 1, end));
    const priority = ['error', 'partial', 'full', 'unvisited'];
    let pick = 'unvisited';
    for (const p of priority) {
      if (slice.includes(/** @type {RulePageBucket} */ (p))) {
        pick = /** @type {RulePageBucket} */ (p);
        break;
      }
    }
    cells.push(pick);
  }
  return cells;
}

/**
 * @param {string} outDir
 * @param {Record<string, unknown>} [dashboardState]
 * @param {{ env?: Record<string, string | undefined>, barWidth?: number, postAgentBuild?: boolean }} [opts]
 */
export function computeLoopWatchProgress(outDir, dashboardState = null, opts = {}) {
  const env = opts.env || process.env;
  const state = dashboardState || readDashboardStateSafe(outDir);
  const loop = state.loop && typeof state.loop === 'object' && !Array.isArray(state.loop)
    ? /** @type {Record<string, unknown>} */ (state.loop)
    : {};
  const iteration = Math.max(0, Number(loop.iteration) || 0);
  const maxIterations = Math.max(1, Number(loop.maxIterations) || Number(env.FORGE_UX_LOOP_MAX_ITERATIONS) || 20);
  const cyclePhase = String(state.cyclePhase || loop.cyclePhase || '');
  const postAgentBuild = opts.postAgentBuild !== false
    && String(env.FORGE_UX_LOOP_POST_AGENT_BUILD ?? '1') !== '0';

  let thresholds;
  try {
    thresholds = loadQualityGateThresholdsFromEnv(env);
  } catch {
    thresholds = loadQualityGateThresholdsFromEnv({});
  }

  const audit = readAuditCached(outDir);
  const pages = audit?.pages || [];
  const crawlSummary = audit?.crawlSummary || {};
  const flat = flattenAuditFindings(audit || {});
  const gateEval = audit ? evaluateAuditQualityGate(audit, thresholds) : evaluateQualityGate(countBySeverity([]), thresholds);

  const violationUnits = computeViolationUnits(gateEval.counts, gateEval.thresholds);
  const violationUnitsPrev = Number(loop.violationUnitsPrev);
  const avgDeltaEma = Number(loop.avgDeltaEma);
  const targetRaw = env.FORGE_UX_LOOP_TARGET_ITERATIONS;
  const targetIterations = targetRaw != null && String(targetRaw).trim() !== ''
    ? Number(targetRaw)
    : null;
  const recompute = String(env.FORGE_UX_LOOP_RECOMPUTE_ESTIMATE ?? '1') !== '0';

  const expectedIterations = computeExpectedIterations({
    iteration,
    maxIterations,
    violationUnits,
    violationUnitsPrev: Number.isFinite(violationUnitsPrev) ? violationUnitsPrev : violationUnits,
    avgDeltaEma: Number.isFinite(avgDeltaEma) ? avgDeltaEma : undefined,
    gatePass: gateEval.pass,
    targetIterations,
    recomputeEstimate: recompute,
  });

  const cycleComplete = isRunsCycleComplete(cyclePhase, postAgentBuild);
  const runsComplete = iteration >= expectedIterations && (iteration === 0 || cycleComplete || gateEval.pass);

  const budget = Number(crawlSummary.pagesPlannedBudget) || Number(env.MAX_PAGES) || 500;
  const captured = Number(crawlSummary.pagesCaptured) || pages.length;
  const pageClass = classifyPagesForProgress(pages, gateEval.thresholds);
  const unvisitedPageSlots = Math.max(0, budget - captured);
  const barWidth = opts.barWidth ?? Math.min(48, Math.max(12, Number(env.FORGE_UX_WATCH_BAR_WIDTH) || 40));
  const pageCells = compressBucketsToCells(pageClass.buckets, unvisitedPageSlots, barWidth);
  const pagesComplete = isPagesCrawlBudgetComplete(crawlSummary);

  const implementedIds = crawlSummary.deterministicImplementedRuleIds || [];
  const ruleCoverage = rollupRuleExecution(pages, { implementedRuleIds: implementedIds });
  const ruleClass = classifyRuleCoveragePages(pages, implementedIds);
  const unvisitedRuleSlots = Math.max(0, budget - pages.length);
  const ruleCells = compressRuleBucketsToCells(ruleClass.buckets, unvisitedRuleSlots, barWidth);
  const rulesComplete = isRulesCoverageComplete(ruleCoverage);

  const gateSegments = SEVERITY_LEVELS.map((id) => {
    const count = gateEval.counts[id] || 0;
    const threshold = gateEval.thresholds[id] ?? 0;
    let status = 'ok';
    if (count > threshold) status = 'over';
    else if (count > 0 && count === threshold) status = 'at_cap';
    return { id, count, threshold, status };
  });

  return {
    barWidth,
    runs: {
      iteration,
      expectedIterations,
      maxIterations,
      cyclePhase,
      cycleLights: formatCyclePhaseLights(cyclePhase),
      complete: runsComplete,
      violationUnits,
      expectedIterationsNote: targetIterations != null ? 'fixed' : 'est',
    },
    pages: {
      budget,
      captured,
      clean: pageClass.clean,
      issues: pageClass.issues,
      error: pageClass.error,
      unvisited: unvisitedPageSlots,
      cells: pageCells,
      complete: pagesComplete,
      queuedRemaining: Number(crawlSummary.queuedRemainingAtStop ?? 0),
    },
    gate: {
      pass: gateEval.pass,
      segments: gateSegments,
      complete: gateEval.pass,
    },
    rules: {
      pagesVisited: ruleCoverage.pagesVisited,
      pagesFull: ruleClass.full,
      pagesPartial: ruleClass.partial,
      pagesError: ruleClass.error,
      implementedCount: ruleClass.implementedCount,
      cells: ruleCells,
      complete: rulesComplete,
      missingRules: ruleCoverage.deterministicMissingOnPages || [],
    },
    allBarsPass: runsComplete && pagesComplete && gateEval.pass && rulesComplete,
    /** Fields to persist on next loop merge after audit */
    loopPatch: {
      violationUnits,
      expectedIterations,
      avgDeltaEma: (() => {
        const prev = Number.isFinite(violationUnitsPrev) ? violationUnitsPrev : violationUnits;
        const drop = Math.max(0, prev - violationUnits);
        if (drop <= 0) return Number.isFinite(avgDeltaEma) ? avgDeltaEma : 1;
        if (!Number.isFinite(avgDeltaEma) || avgDeltaEma <= 0) return Math.max(drop, 1);
        return 0.7 * avgDeltaEma + 0.3 * drop;
      })(),
    },
  };
}
