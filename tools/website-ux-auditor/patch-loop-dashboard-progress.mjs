#!/usr/bin/env node
/**
 * Merge loop progress fields into ux-loop-dashboard-state.json (stdout JSON patch for shell).
 * Usage: node patch-loop-dashboard-progress.mjs OUT_DIR
 */

import process from 'node:process';

import { computeLoopWatchProgress } from './lib/loop-watch-progress.js';
import { mergeDashboardState, readDashboardStateSafe } from './lib/ux-loop-dashboard-state.js';

const outDir = process.argv[2];
if (!outDir) {
  console.error('usage: patch-loop-dashboard-progress.mjs OUT_DIR');
  process.exit(2);
}

const state = readDashboardStateSafe(outDir);
const progress = computeLoopWatchProgress(outDir, state);
const prevLoop = state.loop && typeof state.loop === 'object' ? state.loop : {};
const prevVu = Number(prevLoop.violationUnits);
const violationUnitsPrev = Number.isFinite(prevVu) ? prevVu : progress.loopPatch.violationUnits;
mergeDashboardState(outDir, {
  loop: {
    ...prevLoop,
    expectedIterations: progress.runs.expectedIterations,
    violationUnits: progress.loopPatch.violationUnits,
    violationUnitsPrev,
    avgDeltaEma: progress.loopPatch.avgDeltaEma,
  },
});

const patch = JSON.stringify({
  loop: {
    expectedIterations: progress.runs.expectedIterations,
    violationUnits: progress.loopPatch.violationUnits,
    violationUnitsPrev: prevLoop.violationUnits != null ? prevLoop.violationUnits : undefined,
    avgDeltaEma: progress.loopPatch.avgDeltaEma,
  },
});
process.stdout.write(`${patch}\n`);
