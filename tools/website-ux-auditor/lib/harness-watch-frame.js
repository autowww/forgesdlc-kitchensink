/**
 * Plain-text frame for DET ruleset harness watch board.
 */

import fs from 'node:fs';

import { boxRow, clipPad } from './loop-watch-dashboard-frame.js';
import { colorEnabled } from './loop-watch-ansi-bars.js';
import { clipPadVisible } from './terminal-ansi.js';
import {
  harnessLogPath,
  readHarnessStateSafe,
} from './harness-watch-state.js';

const ANSI = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

/**
 * @param {number} filled
 * @param {number} width
 * @param {boolean} useColor
 */
function paintText(text, col, useColor) {
  if (!useColor) return text;
  return `${col}${text}${ANSI.reset}`;
}

function simpleBar(filled, width, useColor) {
  const w = Math.max(4, width);
  const n = Math.min(w, Math.max(0, filled));
  const uc = useColor && colorEnabled(true);
  return `[${paintText('█'.repeat(n), ANSI.green, uc)}${paintText('·'.repeat(w - n), ANSI.dim, uc)}]`;
}

/**
 * @param {string} status
 */
function statusSymbol(status) {
  switch (status) {
    case 'detection_ok':
      return 'D';
    case 'detection_miss':
      return '!';
    case 'remediation_ok':
      return 'R';
    case 'remediation_fail':
      return 'X';
    case 'missing_fixture':
      return '-';
    case 'blocked':
      return 'B';
    default:
      return '·';
  }
}

/**
 * @param {string} logFile
 * @param {number} maxLines
 */
function tailLog(logFile, maxLines = 8) {
  try {
    const raw = fs.readFileSync(logFile, 'utf8');
    const lines = raw.split(/\r?\n/).filter((l) => l.trim().length);
    return lines.slice(-maxLines);
  } catch {
    return [];
  }
}

/**
 * @param {string} outDir
 * @param {{ cols?: number, useColor?: boolean }} [opts]
 */
export function buildHarnessWatchSnapshotLines(outDir, opts = {}) {
  const cols = Math.max(72, opts.cols || 120);
  const useColor = opts.useColor !== false && colorEnabled(opts.useColor);
  const state = readHarnessStateSafe(outDir);
  const outcomes =
    state.outcomes && typeof state.outcomes === 'object' && !Array.isArray(state.outcomes)
      ? /** @type {Record<string, number>} */ (state.outcomes)
      : {};
  const total = Number(state.rulesTotal) || 0;
  const done = Number(state.rulesDone) || 0;
  const phase = String(state.phase || 'idle');
  const mode = String(state.mode || 'check-only');
  const fixtureRoot = String(state.fixtureRoot || '—');
  const current = state.currentRule && typeof state.currentRule === 'object'
    ? /** @type {Record<string, unknown>} */ (state.currentRule)
    : {};
  const ruleId = String(current.ruleId || '—');
  const rulePhase = String(current.step || '—');
  const findings = current.findingsCount != null ? String(current.findingsCount) : '—';

  const grid = Array.isArray(state.ruleGrid) ? state.ruleGrid.map(String) : [];
  const gridLine = grid.length ? grid.join('') : '·'.repeat(Math.min(40, total || 40));

  const lines = [];
  lines.push(boxRow(cols, 'DET ruleset harness', 'top'));
  lines.push(boxRow(cols, `OUT  ${outDir}`, 'mid'));
  lines.push(boxRow(cols, `Mode ${mode} · Phase ${phase}`, 'mid'));
  lines.push(boxRow(cols, `Fixture ${fixtureRoot}`, 'mid'));
  lines.push(
    boxRow(
      cols,
      `Rules ${simpleBar(done, 24, useColor)} ${done}/${total || '?'}`,
      'mid',
    ),
  );
  lines.push(
    boxRow(
      cols,
      `Now  ${clipPadVisible(ruleId, 28)} · ${clipPadVisible(rulePhase, 14)} · findings ${findings}`,
      'mid',
    ),
  );
  const oc = `ok ${outcomes.detection_ok || 0} · miss ${outcomes.detection_miss || 0} · rem_ok ${outcomes.remediation_ok || 0} · rem_fail ${outcomes.remediation_fail || 0} · gap ${outcomes.missing_fixture || 0}`;
  lines.push(boxRow(cols, `Out  ${clipPad(oc, cols - 8)}`, 'mid'));
  lines.push(boxRow(cols, `Grid ${clipPadVisible(gridLine, cols - 8)}`, 'mid'));
  lines.push(boxRow(cols, 'Log · milestones', 'mid'));
  const logLines = tailLog(harnessLogPath(outDir), 6);
  if (!logLines.length) {
    lines.push(boxRow(cols, '  (no log lines yet)', 'mid'));
  } else {
    for (const ln of logLines) {
      lines.push(boxRow(cols, `  ${clipPadVisible(ln, cols - 4)}`, 'mid'));
    }
  }
  lines.push(boxRow(cols, '', 'bot'));
  return lines;
}

/**
 * @param {string} outDir
 * @param {{ cols?: number }} [opts]
 */
export function writeHarnessSnapshotFile(outDir, opts = {}) {
  const cols = opts.cols || 120;
  const text = `${buildHarnessWatchSnapshotLines(outDir, { cols, useColor: false }).join('\n')}\n`;
  const dest = `${outDir}/harness-dashboard-snapshot.txt`;
  const tmp = `${dest}.${process.pid}.tmp`;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, dest);
  return { text, dest };
}

export { statusSymbol };
