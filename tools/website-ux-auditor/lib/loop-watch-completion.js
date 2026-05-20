/**
 * Composite loop completion (all four watch progress bars).
 */

import path from 'node:path';

import { computeLoopWatchProgress } from './loop-watch-progress.js';
import { readDashboardStateSafe } from './ux-loop-dashboard-state.js';

/**
 * @param {string} outDir
 * @param {{ env?: Record<string, string | undefined>, allBarsMode?: boolean }} [opts]
 */
export function evaluateLoopCompletion(outDir, opts = {}) {
  const env = opts.env || process.env;
  const allBarsMode = opts.allBarsMode === true
    || (opts.allBarsMode !== false && String(env.FORGE_UX_LOOP_ALL_BARS ?? '') === '1');

  const state = readDashboardStateSafe(outDir);
  const progress = computeLoopWatchProgress(outDir, state, { env });

  if (!allBarsMode) {
    const gateOnly = progress.gate.pass;
    return {
      pass: gateOnly,
      mode: 'gate_only',
      bars: {
        runs: progress.runs.complete,
        pages: true,
        gate: progress.gate.complete,
        rules: true,
      },
      progress,
      reasons: gateOnly ? [] : ['quality gate not met'],
    };
  }

  const reasons = [];
  if (!progress.runs.complete) {
    reasons.push(`runs: ${progress.runs.iteration}/${progress.runs.expectedIterations} expected (cycle=${progress.runs.cyclePhase || '—'})`);
  }
  if (!progress.pages.complete) {
    reasons.push(
      `pages: ${progress.pages.captured}/${progress.pages.budget} captured, queue=${progress.pages.queuedRemaining}`,
    );
  }
  if (!progress.gate.complete) {
    reasons.push('quality gate: severity thresholds exceeded');
  }
  if (!progress.rules.complete) {
    const miss = (progress.rules.missingRules || []).slice(0, 5).join(', ');
    reasons.push(
      `rules: ${progress.rules.pagesFull}/${progress.rules.pagesVisited} full trace`
        + (miss ? `; missing: ${miss}` : ''),
    );
  }

  const pass = progress.runs.complete && progress.pages.complete && progress.gate.complete && progress.rules.complete;

  return {
    pass,
    mode: 'all_bars',
    bars: {
      runs: progress.runs.complete,
      pages: progress.pages.complete,
      gate: progress.gate.complete,
      rules: progress.rules.complete,
    },
    progress,
    reasons,
  };
}

/**
 * @param {string} auditPath
 * @param {{ outDir?: string, env?: Record<string, string | undefined> }} [opts]
 */
export function evaluateLoopCompletionFromAuditPath(auditPath, opts = {}) {
  const outDir = opts.outDir || path.dirname(path.resolve(auditPath));
  return evaluateLoopCompletion(outDir, opts);
}
