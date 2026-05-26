/**
 * ANSI SGR helpers for terminal UI (loop-watch dashboard).
 */

const ANSI_SGR_RE = /\x1b\[[0-9;]*m/g;

/** @param {string} s */
export function stripAnsi(s) {
  return String(s ?? '').replace(ANSI_SGR_RE, '');
}

/** Visible character count (ignores ANSI SGR sequences). */
export function visibleLength(s) {
  return stripAnsi(s).length;
}

/**
 * Pad or truncate for monospace columns using visible width (ANSI stripped in output).
 * @param {string} s
 * @param {number} w
 */
export function clipPadVisible(s, w) {
  const t = stripAnsi(String(s ?? '')).replace(/\r?\n/g, ' ');
  if (w <= 0) return '';
  if (t.length >= w) return w <= 1 ? t.slice(0, w) : `${t.slice(0, w - 1)}…`;
  return t.padEnd(w, ' ');
}

const ANSI_SGR_PREFIX_RE = /^\x1b\[[0-9;]*m/;

/**
 * Pad or truncate using visible width while preserving ANSI SGR sequences.
 * @param {string} s
 * @param {number} w
 */
export function clipPadAnsi(s, w) {
  const str = String(s ?? '').replace(/\r?\n/g, ' ');
  if (w <= 0) return '';
  const plain = stripAnsi(str);
  if (plain.length <= w) {
    return plain.length === str.length ? plain.padEnd(w, ' ') : `${str}${' '.repeat(w - plain.length)}`;
  }
  const maxVis = w <= 1 ? w : w - 1;
  let out = '';
  let vis = 0;
  for (let i = 0; i < str.length; ) {
    const esc = ANSI_SGR_PREFIX_RE.exec(str.slice(i));
    if (esc) {
      out += esc[0];
      i += esc[0].length;
      continue;
    }
    if (vis >= maxVis) break;
    out += str[i];
    vis += 1;
    i += 1;
  }
  if (w > 1) out += '…';
  return out;
}

/**
 * Right-aligned ruleset heading with slow bright/dim pulse when the auditor is on that ruleset.
 * @param {string} label
 * @param {number} colW visible width
 * @param {{ active?: boolean, tick?: number }} [opts]
 */
export function formatRulesetHeading(label, colW, opts = {}) {
  const plain = stripAnsi(String(label ?? ''));
  const clipped =
    plain.length > colW ? (colW <= 1 ? plain.slice(0, colW) : `${plain.slice(0, colW - 1)}…`) : plain;
  const padded = clipped.padStart(colW, ' ');
  if (!opts.active) {
    return `\x1b[2m\x1b[90m${padded}\x1b[0m`;
  }
  const t = (Number(opts.tick) || 0) * 0.35;
  const wave = 0.5 + 0.5 * Math.sin(t);
  if (wave > 0.72) {
    return `\x1b[1m\x1b[97m${padded}\x1b[0m`;
  }
  if (wave > 0.45) {
    return `\x1b[2m\x1b[37m${padded}\x1b[0m`;
  }
  return `\x1b[2m\x1b[90m${padded}\x1b[0m`;
}
