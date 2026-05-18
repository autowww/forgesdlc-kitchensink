#!/usr/bin/env node
/**
 * Merge a JSON patch into ux-loop-dashboard-state.json (stdin or argv).
 * Usage:
 *   node merge-ux-dashboard-state.mjs OUT_DIR PATCH_JSON_STRING
 *   echo '{"phase":"x"}' | node merge-ux-dashboard-state.mjs OUT_DIR
 */

import process from 'node:process';

import { mergeDashboardState } from './lib/ux-loop-dashboard-state.js';

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8').trim();
}

async function main() {
  const outDir = process.argv[2];
  let raw = process.argv[3];
  if (!outDir) {
    console.error('usage: merge-ux-dashboard-state.mjs OUT_DIR [PATCH_JSON]');
    console.error('       echo \'{"phase":"…"}\' | merge-ux-dashboard-state.mjs OUT_DIR');
    process.exit(2);
  }
  if (raw === undefined || raw === '') {
    raw = await readStdin();
  }
  if (!raw) {
    console.error('merge-ux-dashboard-state: empty patch');
    process.exit(2);
  }
  const patch = JSON.parse(raw);
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    console.error('merge-ux-dashboard-state: patch must be a JSON object');
    process.exit(2);
  }
  mergeDashboardState(outDir, patch);
}

main().catch((e) => {
  console.error(`merge-ux-dashboard-state: ${e?.message ?? e}`);
  process.exit(1);
});
