#!/usr/bin/env node
/**
 * Recompute agent run / token metrics from OUT_DIR logs and merge into ux-loop-dashboard-state.json.
 *
 * Usage: node refresh-agent-metrics.mjs <AUDIT_OUT_DIR>
 */

import process from 'node:process';

import { collectAgentMetricsFromOutDir, refreshAgentMetricsInDashboardState } from './lib/loop-watch-agent-metrics.js';

const outDir = process.argv[2];
if (!outDir) {
  console.error('usage: refresh-agent-metrics.mjs <AUDIT_OUT_DIR>');
  process.exit(2);
}

const metrics = refreshAgentMetricsInDashboardState(outDir);
if (process.argv.includes('--json')) {
  console.log(JSON.stringify(metrics, null, 2));
} else {
  console.log(
    `agent-metrics: runs=${metrics.runs.total} cursor=${metrics.tokens.cursor} local=${metrics.tokens.local} cloud=${metrics.tokens.cloud}`,
  );
}
