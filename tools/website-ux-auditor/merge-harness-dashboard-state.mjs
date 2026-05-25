#!/usr/bin/env node
/**
 * Merge JSON patch into harness-dashboard-state.json.
 * Usage: node merge-harness-dashboard-state.mjs OUT_DIR '{"phase":"…"}'
 */

import process from 'node:process';

import { mergeHarnessState } from './lib/harness-watch-state.js';

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8').trim();
}

async function main() {
  const outDir = process.argv[2];
  let raw = process.argv[3];
  if (!outDir) {
    console.error('usage: merge-harness-dashboard-state.mjs OUT_DIR [PATCH_JSON]');
    process.exit(2);
  }
  if (raw === undefined || raw === '') {
    raw = await readStdin();
  }
  if (!raw) {
    console.error('merge-harness-dashboard-state: empty patch');
    process.exit(2);
  }
  const patch = JSON.parse(raw);
  mergeHarnessState(outDir, patch);
}

main().catch((e) => {
  console.error(e?.message || e);
  process.exit(1);
});
