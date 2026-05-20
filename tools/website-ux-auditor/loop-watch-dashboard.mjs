#!/usr/bin/env node
/**
 * Alternate-screen dashboard for FORGE_UX_LOOP_WATCH (polls ux-loop-dashboard-state.json + log tail).
 * Updates only changed screen rows by default (low flicker, still live). Set FORGE_UX_LOOP_WATCH_FULL_REDRAW=1 for legacy full clears.
 *
 * Usage: node loop-watch-dashboard.mjs OUT_DIR
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { buildWatchFrameRedrawSequence } from './lib/loop-watch-redraw.js';
import { stripAnsi } from './lib/terminal-ansi.js';
import { readDashboardStateSafe } from './lib/ux-loop-dashboard-state.js';
import { buildUxLoopDashboardSnapshotLines } from './lib/ux-loop-dashboard-snapshot-text.js';

const ALT_SCREEN_ON = '\x1b[?1049h';
const ALT_SCREEN_OFF = '\x1b[?1049l';
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';
const HOME = '\x1b[H';
const CLEAR_FROM_CURSOR = '\x1b[J';

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
  /** When the merged frame text is unchanged (common between crawl events), skip writing: avoids idle full-screen flicker. */
  const skipIdleRedraw =
    process.env.FORGE_UX_LOOP_WATCH_SKIP_IDLE_REDRAW === '0' ? false : true;
  /** Every tick: HOME + clear entire frame (legacy; more flicker). Default: incremental row updates only. */
  const forceFullRedraw = process.env.FORGE_UX_LOOP_WATCH_FULL_REDRAW === '1';
  let lastFrameText = '';
  let lastFrameCompare = '';
  /** @type {string[]} */
  let lastFrameLines = [];
  /** Last `state.phase` from disk — used to force a full redraw when phases change (stderr from child steps otherwise desyncs row-addressed updates). */
  let lastDashboardPhase = '';
  let volatileRepaintTick = 0;
  process.on('SIGWINCH', () => {
    lastFrameLines = [];
    lastFrameText = '';
    lastFrameCompare = '';
    lastDashboardPhase = '';
    volatileRepaintTick = 0;
  });

  const frameCols = () => {
    const w = stdout.columns;
    if (!w || !Number.isFinite(w) || w < 40) return 100;
    /** Avoid huge widths (wrapping glitches) while tracking real terminal size. */
    return Math.min(w, 200);
  };

  const interval = setInterval(() => {
    const dashState = readDashboardStateSafe(outDir);
    const phaseNow = typeof dashState.phase === 'string' ? dashState.phase : '';
    const phaseTransitioned = lastDashboardPhase !== '' && phaseNow !== lastDashboardPhase;
    lastDashboardPhase = phaseNow;
    /** Child scripts (AI audit, remediation agent) write to stderr; incremental CSI row updates then paint the wrong rows. */
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
          stdout.write(HOME + CLEAR_FROM_CURSOR + frameText);
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
      stdout.write(redraw.seq);
    } catch {
      cleanupAndExit(1);
    }
    lastFrameText = frameText;
    lastFrameCompare = frameCompare;
    lastFrameLines = frame.slice();
  }, tickMs);
}

main();
