#!/usr/bin/env node
/**
 * Alternate-screen dashboard for FORGE_UX_LOOP_WATCH (polls ux-loop-dashboard-state.json + log tail).
 *
 * Usage: node loop-watch-dashboard.mjs OUT_DIR
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { buildWatchFrameLines } from './lib/loop-watch-dashboard-frame.js';
import { dashboardLogPath, readDashboardStateSafe } from './lib/ux-loop-dashboard-state.js';

const ALT_SCREEN_ON = '\x1b[?1049h';
const ALT_SCREEN_OFF = '\x1b[?1049l';
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';
const HOME = '\x1b[H';
const CLEAR_FROM_CURSOR = '\x1b[J';

/**
 * @param {string} logFile
 * @param {number} maxLines
 * @param {number} maxBytes
 */
export function tailLogLines(logFile, maxLines = 10, maxBytes = 8192) {
  try {
    const st = fs.statSync(logFile);
    const start = Math.max(0, st.size - maxBytes);
    const buf = Buffer.alloc(st.size - start);
    const fd = fs.openSync(logFile, 'r');
    try {
      fs.readSync(fd, buf, 0, buf.length, start);
    } finally {
      fs.closeSync(fd);
    }
    const lines = buf.toString('utf8').split(/\r?\n/).filter((x) => x.trim().length > 0);
    return lines.slice(-maxLines);
  } catch {
    return [];
  }
}

/** @param {string} outDir */
function readRunMetaSafe(outDir) {
  try {
    const raw = fs.readFileSync(path.join(outDir, 'run-meta.json'), 'utf8');
    const j = JSON.parse(raw);
    return j && typeof j === 'object' ? j : {};
  } catch {
    return {};
  }
}

/** @param {string} outDir */
function readScoreOverallSafe(outDir) {
  try {
    const raw = fs.readFileSync(path.join(outDir, 'ux-quality-score.json'), 'utf8');
    const j = JSON.parse(raw);
    const o = j?.uxScores?.overall;
    return o != null && Number.isFinite(Number(o)) ? String(o) : '';
  } catch {
    return '';
  }
}

/** @param {string} outDir */
function readDeltaVerbalSafe(outDir) {
  try {
    const raw = fs.readFileSync(path.join(outDir, 'ux-quality-score-loop-delta.json'), 'utf8');
    const j = JSON.parse(raw);
    const v = j?.verbalSummary;
    return typeof v === 'string' ? v : '';
  } catch {
    return '';
  }
}

function main() {
  const outDir = path.resolve(process.argv[2] || '');
  if (!outDir || !fs.existsSync(outDir)) {
    console.error('usage: loop-watch-dashboard.mjs OUT_DIR');
    process.exit(2);
  }

  const stdout = process.stdout;
  if (!stdout.isTTY) {
    console.error('loop-watch-dashboard: stdout must be a TTY');
    process.exit(1);
  }

  let cleaned = false;
  function cleanupAndExit(code) {
    if (cleaned) return;
    cleaned = true;
    try {
      stdout.write(SHOW_CURSOR + ALT_SCREEN_OFF);
    } catch {
      /* ignore */
    }
    process.exit(code);
  }

  process.on('SIGINT', () => cleanupAndExit(130));
  process.on('SIGTERM', () => cleanupAndExit(143));

  stdout.write(ALT_SCREEN_ON + HIDE_CURSOR);

  const tickMs = Number(process.env.FORGE_UX_LOOP_WATCH_REFRESH_MS || '') || 350;
  const interval = setInterval(() => {
    const cols = stdout.columns || 100;
    const state = readDashboardStateSafe(outDir);
    const meta = readRunMetaSafe(outDir);
    const websiteRepo = typeof meta.website_repo === 'string' ? meta.website_repo : '';
    const siteUrl = typeof meta.site_url === 'string' ? meta.site_url : '';
    const outDisp = typeof meta.output_directory === 'string' ? meta.output_directory : outDir;

    const scoreOverall = readScoreOverallSafe(outDir);
    const deltaVerbal = readDeltaVerbalSafe(outDir);

    const logTail = tailLogLines(dashboardLogPath(outDir));

    const frame = buildWatchFrameLines(cols, state, logTail, {
      websiteRepo,
      siteUrl,
      outDir: outDisp,
      scoreOverall,
      deltaVerbal,
    });

    try {
      stdout.write(HOME + CLEAR_FROM_CURSOR + `${frame.join('\n')}\n`);
    } catch {
      cleanupAndExit(1);
    }
  }, tickMs);
}

main();
