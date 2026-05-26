#!/usr/bin/env node
/**
 * Materialize a plain-text snapshot of the Forge UX loop watch frame for external watch(1) / tail -f.
 *
 * Writes OUT_DIR/ux-loop-dashboard-snapshot.txt atomically (temp + rename) whenever content changes
 * (unless FORGE_UX_LOOP_WATCH_SNAPSHOT_SKIP_UNCHANGED=0).
 *
 * Usage:
 *   node write-ux-loop-dashboard-snapshot.mjs /path/to/UX_OUT_DIR
 *
 * Second terminal (GNU watch):
 *   watch -n 0.5 cat /path/to/UX_OUT_DIR/ux-loop-dashboard-snapshot.txt
 *
 * Or:
 *   tail -f /path/to/UX_OUT_DIR/ux-loop-dashboard-snapshot.txt
 *
 * Env (optional):
 *   FORGE_UX_LOOP_WATCH_REFRESH_MS   Poll interval (default 500 for disk-friendly cadence).
 *   FORGE_UX_LOOP_WATCH_SNAPSHOT_COLS  Box width (default 120).
 *   FORGE_UX_LOOP_WATCH_SNAPSHOT_SKIP_UNCHANGED=0  Write every tick even if unchanged.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import {
  UX_LOOP_DASHBOARD_SNAPSHOT_FILE,
  writeUxLoopDashboardSnapshotFile,
} from './lib/ux-loop-dashboard-snapshot-text.js';

const SNAPSHOT_NAME = UX_LOOP_DASHBOARD_SNAPSHOT_FILE;

function main() {
  const outDir = path.resolve(process.argv[2] || '');
  if (!outDir || !fs.existsSync(outDir)) {
    console.error(`usage: node write-ux-loop-dashboard-snapshot.mjs <OUT_DIR>`);
    console.error(`example: node write-ux-loop-dashboard-snapshot.mjs "$UX_AUDIT_OUT_DIR"`);
    process.exit(2);
  }

  const tickMs = Number(process.env.FORGE_UX_LOOP_WATCH_REFRESH_MS || '') || 500;
  const cols = Number(process.env.FORGE_UX_LOOP_WATCH_SNAPSHOT_COLS || '') || 120;
  const skipUnchanged = process.env.FORGE_UX_LOOP_WATCH_SNAPSHOT_SKIP_UNCHANGED !== '0';

  const dest = path.join(outDir, SNAPSHOT_NAME);
  let lastText = '';
  let cleaned = false;

  function cleanup() {
    if (cleaned) return;
    cleaned = true;
  }

  process.on('SIGINT', () => {
    cleanup();
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(143);
  });

  const tick = () => {
    try {
      const { text } = writeUxLoopDashboardSnapshotFile(outDir, cols);
      if (skipUnchanged && text === lastText) {
        return;
      }
      lastText = text;
    } catch (e) {
      console.error(`write-ux-loop-dashboard-snapshot: ${e?.message ?? e}`);
    }
  };

  tick();
  setInterval(tick, tickMs);
  console.error(`write-ux-loop-dashboard-snapshot: polling ${outDir} every ${tickMs}ms → ${dest}`);
  console.error('write-ux-loop-dashboard-snapshot: second terminal: watch -n 0.5 cat "' + dest + '"');
}

main();
