/** @see loop-watch-dashboard.mjs */

import { stripAnsi, visibleLength } from './terminal-ansi.js';

const HOME = '\x1b[H';
const CLEAR_FROM_CURSOR = '\x1b[J';
/** Clear from cursor to end of line (cursor at column 1 after `CSI row;1H`). */
const CLEAR_LINE = '\x1b[2K';

/**
 * @param {string} line
 * @param {number} minVisibleWidth
 */
function padLineVisible(line, minVisibleWidth) {
  const need = minVisibleWidth - visibleLength(line);
  if (need <= 0) return line;
  return `${line}${' '.repeat(need)}`;
}

/**
 * Build an ANSI sequence that updates the alternate-screen frame with minimal redraw.
 * Full clear is used on first paint, row-count change, or when `forceFull` is true.
 *
 * @param {string[]} prevLines prior frame lines
 * @param {string[]} nextLines current frame lines
 * @param {boolean} forceFull always use HOME + erase below + full text
 * @returns {{ mode: 'none' } | { mode: 'full'; seq: string } | { mode: 'delta'; seq: string }}
 */
export function buildWatchFrameRedrawSequence(prevLines, nextLines, forceFull) {
  if (forceFull || prevLines.length === 0 || prevLines.length !== nextLines.length) {
    return { mode: 'full', seq: HOME + CLEAR_FROM_CURSOR + `${nextLines.join('\n')}\n` };
  }
  let seq = '';
  for (let i = 0; i < nextLines.length; i += 1) {
    if (stripAnsi(prevLines[i]) !== stripAnsi(nextLines[i])) {
      const minW = Math.max(visibleLength(prevLines[i]), visibleLength(nextLines[i]));
      const painted = padLineVisible(nextLines[i], minW);
      seq += `\x1b[${i + 1};1H${CLEAR_LINE}${painted}`;
    }
  }
  if (!seq) return { mode: 'none' };
  return { mode: 'delta', seq };
}
