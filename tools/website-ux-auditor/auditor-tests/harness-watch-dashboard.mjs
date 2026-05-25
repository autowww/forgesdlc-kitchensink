#!/usr/bin/env node
/**
 * Alternate-screen dashboard for FORGE_UX_HARNESS_WATCH.
 * Usage: node harness-watch-dashboard.mjs OUT_DIR
 */

import fs from 'node:fs';
import process from 'node:process';

import { buildHarnessWatchSnapshotLines } from '../lib/harness-watch-frame.js';
import { writeHarnessSnapshotFile } from '../lib/harness-watch-frame.js';
import { stripAnsi } from '../lib/terminal-ansi.js';

const ALT_SCREEN_ON = '\x1b[?1049h';
const ALT_SCREEN_OFF = '\x1b[?1049l';
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';
const HOME = '\x1b[H';
const CLEAR_FROM_CURSOR = '\x1b[J';

function pickStream() {
  if (process.stderr.isTTY) return process.stderr;
  if (process.stdout.isTTY) return process.stdout;
  return process.stderr;
}

function main() {
  const outDir = process.argv[2];
  if (!outDir || !fs.existsSync(outDir)) {
    console.error('usage: harness-watch-dashboard.mjs OUT_DIR');
    process.exit(2);
  }
  const stream = pickStream();
  if (!stream.isTTY) {
    console.error('harness-watch-dashboard: stderr/stdout must be a TTY');
    process.exit(1);
  }

  const tickMs = Number(process.env.FORGE_UX_HARNESS_WATCH_REFRESH_MS || '') || 350;
  const cols = () => {
    const w = stream.columns || 120;
    return Math.min(Math.max(72, w), 200);
  };

  let cleaned = false;
  /** @type {ReturnType<typeof setInterval> | null} */
  let interval = null;

  function cleanup(code) {
    if (cleaned) return;
    cleaned = true;
    if (interval) clearInterval(interval);
    try {
      writeHarnessSnapshotFile(outDir, { cols: cols() });
      stream.write(SHOW_CURSOR + ALT_SCREEN_OFF);
    } catch {
      /* ignore */
    }
    process.exit(code);
  }

  process.on('SIGINT', () => cleanup(130));
  process.on('SIGTERM', () => cleanup(143));

  stream.write(ALT_SCREEN_ON + HIDE_CURSOR);
  let lastText = '';

  interval = setInterval(() => {
    try {
      const lines = buildHarnessWatchSnapshotLines(outDir, { cols: cols(), useColor: true });
      const text = `${lines.join('\n')}\n`;
      if (stripAnsi(text) === stripAnsi(lastText)) return;
      stream.write(HOME + CLEAR_FROM_CURSOR + text);
      lastText = text;
      writeHarnessSnapshotFile(outDir, { cols: cols() });
    } catch {
      cleanup(1);
    }
  }, tickMs);
}

main();
