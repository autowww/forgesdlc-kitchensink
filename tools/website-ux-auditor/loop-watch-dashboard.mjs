#!/usr/bin/env node
/**
 * Alternate-screen dashboard for FORGE_UX_LOOP_WATCH (polls ux-loop-dashboard-state.json + log tail).
 * Updates only changed screen rows by default (low flicker, still live). Set FORGE_UX_LOOP_WATCH_FULL_REDRAW=1 for legacy full clears.
 *
 * Usage:
 *   node loop-watch-dashboard.mjs OUT_DIR
 *   node loop-watch-dashboard.mjs OUT_DIR --print-final-only   # one-shot: snapshot file + main-screen frame
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { buildWatchFrameRedrawSequence } from './lib/loop-watch-redraw.js';
import { stripAnsi } from './lib/terminal-ansi.js';
import { printUxLoopDashboardFinalToStream } from './lib/ux-loop-dashboard-snapshot-text.js';
import { readDashboardStateSafe } from './lib/ux-loop-dashboard-state.js';
import { buildUxLoopDashboardSnapshotLines } from './lib/ux-loop-dashboard-snapshot-text.js';

const ALT_SCREEN_ON = '\x1b[?1049h';
const ALT_SCREEN_OFF = '\x1b[?1049l';
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';
const HOME = '\x1b[H';
const CLEAR_FROM_CURSOR = '\x1b[J';

/** @param {string[]} argv */
function parseArgs(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith('--')));
  const positional = argv.filter((a) => !a.startsWith('--'));
  return {
    printFinalOnly: flags.has('--print-final-only'),
    outDir: path.resolve(positional[0] || ''),
  };
}

/** @returns {import('node:stream').WritableStream} */
function pickWatchStream() {
  if (process.stdout.isTTY) return process.stdout;
  if (process.stderr.isTTY) return process.stderr;
  return process.stdout;
}

/**
 * @param {import('node:stream').WritableStream} stream
 * @param {string} outDir
 * @param {number} cols
 */
function finalizeDashboardOnMainScreen(stream, outDir, cols) {
  printUxLoopDashboardFinalToStream(stream, outDir, { cols, leaveAltScreen: true, showCursor: true });
}

function main() {
  const { printFinalOnly, outDir } = parseArgs(process.argv.slice(2));
  if (!outDir || !fs.existsSync(outDir)) {
    console.error('usage: loop-watch-dashboard.mjs OUT_DIR [--print-final-only]');
    process.exit(2);
  }

  const stream = pickWatchStream();
  const frameCols = () => {
    const w = stream.columns || process.stdout.columns || process.stderr.columns;
    if (!w || !Number.isFinite(w) || w < 40) return 100;
    return Math.min(w, 200);
  };

  if (printFinalOnly) {
    finalizeDashboardOnMainScreen(stream, outDir, frameCols());
    process.exit(0);
  }

  if (!stream.isTTY) {
    console.error('loop-watch-dashboard: stdout must be a TTY');
    process.exit(1);
  }

  let cleaned = false;
  /** @type {ReturnType<typeof setInterval> | null} */
  let interval = null;

  function cleanupAndExit(code) {
    if (cleaned) return;
    cleaned = true;
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    try {
      finalizeDashboardOnMainScreen(stream, outDir, frameCols());
    } catch {
      try {
        stream.write(SHOW_CURSOR + ALT_SCREEN_OFF);
      } catch {
        /* ignore */
      }
    }
    process.exit(code);
  }

  process.on('SIGINT', () => cleanupAndExit(130));
  process.on('SIGTERM', () => cleanupAndExit(143));

  stream.write(ALT_SCREEN_ON + HIDE_CURSOR);

  const tickMs = Number(process.env.FORGE_UX_LOOP_WATCH_REFRESH_MS || '') || 350;
  const skipIdleRedraw =
    process.env.FORGE_UX_LOOP_WATCH_SKIP_IDLE_REDRAW === '0' ? false : true;
  const forceFullRedraw = process.env.FORGE_UX_LOOP_WATCH_FULL_REDRAW === '1';
  let lastFrameText = '';
  let lastFrameCompare = '';
  /** @type {string[]} */
  let lastFrameLines = [];
  let lastDashboardPhase = '';
  let volatileRepaintTick = 0;
  process.on('SIGWINCH', () => {
    lastFrameLines = [];
    lastFrameText = '';
    lastFrameCompare = '';
    lastDashboardPhase = '';
    volatileRepaintTick = 0;
  });

  interval = setInterval(() => {
    const dashState = readDashboardStateSafe(outDir);
    const phaseNow = typeof dashState.phase === 'string' ? dashState.phase : '';
    const phaseTransitioned = lastDashboardPhase !== '' && phaseNow !== lastDashboardPhase;
    lastDashboardPhase = phaseNow;
    const volatileChildPhase = /ai_audit|remediation_agent/i.test(phaseNow);
    if (volatileChildPhase) volatileRepaintTick += 1;
    else volatileRepaintTick = 0;
    const volatileFullInterval = Math.max(
      4,
      Math.floor(3000 / Math.max(100, tickMs)),
    );
    const forceFullThisTick =
      forceFullRedraw
      || phaseTransitioned
      || (volatileChildPhase && volatileRepaintTick % volatileFullInterval === 1);

    const frame = buildUxLoopDashboardSnapshotLines(outDir, frameCols());

    const frameText = `${frame.join('\n')}\n`;
    const ap =
      dashState.auditProgress && typeof dashState.auditProgress === 'object'
        ? /** @type {Record<string, unknown>} */ (dashState.auditProgress)
        : {};
    const prp =
      ap.pageRuleProgress && typeof ap.pageRuleProgress === 'object'
        ? /** @type {Record<string, unknown>} */ (ap.pageRuleProgress)
        : {};
    const rulesetPulseActive = Boolean(String(prp.ruleId || '').trim());
    const frameCompare = rulesetPulseActive ? frameText : frame.map(stripAnsi).join('\n');
    if (skipIdleRedraw && frameCompare === lastFrameCompare) {
      return;
    }

    const redraw = buildWatchFrameRedrawSequence(lastFrameLines, frame, forceFullThisTick);
    if (redraw.mode === 'none') {
      if (!skipIdleRedraw) {
        try {
          stream.write(HOME + CLEAR_FROM_CURSOR + frameText);
        } catch {
          cleanupAndExit(1);
        }
      }
      lastFrameText = frameText;
      lastFrameCompare = frameCompare;
      lastFrameLines = frame.slice();
      return;
    }

    try {
      stream.write(redraw.seq);
    } catch {
      cleanupAndExit(1);
    }
    lastFrameText = frameText;
    lastFrameCompare = frameCompare;
    lastFrameLines = frame.slice();
  }, tickMs);
}

main();
