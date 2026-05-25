#!/usr/bin/env node
/**
 * Poll harness-dashboard-state.json and write harness-dashboard-snapshot.txt.
 * Usage: node write-harness-dashboard-snapshot.mjs OUT_DIR
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { writeHarnessSnapshotFile } from './lib/harness-watch-frame.js';
import { harnessSnapshotPath } from './lib/harness-watch-state.js';

function main() {
  const outDir = path.resolve(process.argv[2] || '');
  if (!outDir || !fs.existsSync(outDir)) {
    console.error('usage: node write-harness-dashboard-snapshot.mjs <OUT_DIR>');
    process.exit(2);
  }
  const tickMs = Number(process.env.FORGE_UX_HARNESS_WATCH_REFRESH_MS || '') || 500;
  const cols = Number(process.env.FORGE_UX_HARNESS_WATCH_SNAPSHOT_COLS || '') || 120;
  let last = '';

  const tick = () => {
    try {
      const { text } = writeHarnessSnapshotFile(outDir, { cols });
      if (text !== last) last = text;
    } catch (e) {
      console.error(`write-harness-dashboard-snapshot: ${e?.message || e}`);
    }
  };

  tick();
  setInterval(tick, tickMs);
  console.error(
    `write-harness-dashboard-snapshot: polling ${outDir} every ${tickMs}ms → ${harnessSnapshotPath(outDir)}`,
  );
}

main();
