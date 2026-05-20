/**
 * Large ASCII score for loop-watch header (5×7 digits, dot, 3×5 fractional digit bottom-aligned).
 */

/** @type {string[][]} */
const BLANK_5X7 = ['     ', '     ', '     ', '     ', '     ', '     ', '     '];

/** @type {Record<number, string[]>} */
const DIGIT_5X7 = {
  0: [' ### ', '#   #', '#  ##', '# # #', '##  #', '#   #', ' ### '],
  1: ['  #  ', ' ##  ', '# #  ', '  #  ', '  #  ', '  #  ', ' ### '],
  2: [' ### ', '#   #', '    #', '   # ', '  #  ', ' #   ', '#####'],
  3: [' ### ', '#   #', '    #', ' ### ', '    #', '#   #', ' ### '],
  4: ['   # ', '  ## ', ' # # ', '#  # ', '#####', '   # ', '   # '],
  5: ['#####', '#    ', '#    ', '#### ', '    #', '#   #', ' ### '],
  6: [' ### ', '#   #', '#    ', '#### ', '#   #', '#   #', ' ### '],
  7: ['#####', '    #', '   # ', '   # ', '  #  ', '  #  ', '  #  '],
  8: [' ### ', '#   #', '#   #', ' ### ', '#   #', '#   #', ' ### '],
  9: [' ### ', '#   #', '#   #', ' ####', '    #', '#   #', ' ### '],
};

/** Decimal point aligned to 5×7 baseline (bottom row). */
const DOT_5X7 = ['     ', '     ', '     ', '     ', '     ', '  #  ', '  #  '];

/** @type {Record<number, string[]>} */
const DIGIT_3X5 = {
  0: ['###', '# #', '# #', '# #', '###'],
  1: [' # ', '## ', ' # ', ' # ', '###'],
  2: ['###', '  #', '###', '#  ', '###'],
  3: ['###', '  #', '###', '  #', '###'],
  4: ['# #', '# #', '###', '  #', '  #'],
  5: ['###', '#  ', '###', '  #', '###'],
  6: ['###', '#  ', '###', '# #', '###'],
  7: ['###', '  #', '  #', '  #', '  #'],
  8: ['###', '# #', '###', '# #', '###'],
  9: ['###', '# #', '###', '  #', '###'],
};

const BLANK_3X5 = ['   ', '   ', '   ', '   ', '   '];

/**
 * @param {string[]} rows
 * @param {string} from
 * @param {string} to
 */
function mapGlyphChars(rows, from, to) {
  return rows.map((row) => row.split('').map((ch) => (ch === from ? to : ch)).join(''));
}

/**
 * @param {number | null} d
 */
function glyph5x7(d) {
  if (d == null || !Number.isFinite(d)) return BLANK_5X7.map((r) => r);
  const g = DIGIT_5X7[Math.max(0, Math.min(9, Math.floor(d)))] || BLANK_5X7;
  return g.map((r) => r);
}

/**
 * @param {number | null} d
 */
function glyph3x5(d) {
  if (d == null || !Number.isFinite(d)) return [...BLANK_3X5];
  const g = DIGIT_3X5[Math.max(0, Math.min(9, Math.floor(d)))] || BLANK_3X5;
  return [...g];
}

/**
 * @param {string[][]} parts
 */
function hJoinGlyphParts(parts) {
  const height = Math.max(...parts.map((p) => p.length));
  /** @type {string[]} */
  const lines = [];
  for (let r = 0; r < height; r += 1) {
    lines.push(parts.map((p) => p[r] || ' '.repeat(p[0]?.length || 0)).join(' '));
  }
  return lines;
}

/**
 * @param {string[]} small5 pad 3×5 to 7 rows, bottom-aligned with 5×7 digits
 */
function pad3x5To7(small5) {
  return ['   ', '   ', ...small5];
}

/**
 * @param {number | string | null | undefined} scoreRaw
 * @returns {{ tens: number | null, ones: number, frac: number, numeric: number | null, display: string }}
 */
export function parseUxScoreForGlyphs(scoreRaw) {
  const raw = scoreRaw;
  if (raw == null || raw === '' || raw === '—') {
    return { tens: null, ones: 0, frac: 0, numeric: null, display: '—' };
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    return { tens: null, ones: 0, frac: 0, numeric: null, display: '—' };
  }
  const clamped = Math.max(0, Math.min(99.9, n));
  const intPart = Math.floor(clamped);
  const tens = intPart >= 10 ? Math.floor(intPart / 10) : null;
  const ones = intPart % 10;
  const frac = Math.round((clamped - intPart) * 10) % 10;
  const display = `${tens != null ? tens : ''}${ones}.${frac}`;
  return { tens, ones, frac, numeric: clamped, display };
}

/**
 * @param {number | string | null | undefined} scoreRaw
 * @param {{ useColor?: boolean }} [opts]
 * @returns {{ width: number, height: number, lines: string[], numeric: number | null }}
 */
export function renderLargeUxScoreGlyphs(scoreRaw, opts = {}) {
  const { tens, ones, frac, numeric } = parseUxScoreForGlyphs(scoreRaw);
  const parts = [glyph5x7(tens), glyph5x7(ones), DOT_5X7, pad3x5To7(glyph3x5(frac))];
  let lines = hJoinGlyphParts(parts);
  const width = lines[0]?.length || 0;

  let col = '\x1b[32m';
  if (numeric != null) {
    if (numeric < 50) col = '\x1b[31m';
    else if (numeric < 80) col = '\x1b[33m';
  } else {
    col = '\x1b[90m';
  }
  const useColor = opts.useColor !== false && !(process.env.NO_COLOR != null && String(process.env.NO_COLOR).length > 0);
  if (useColor) {
    lines = lines.map((row) =>
      `${col}${row.replace(/#/g, '█').replace(/ /g, ' ')}\x1b[0m`,
    );
  } else {
    lines = lines.map((row) => row.replace(/#/g, '█'));
  }

  return { width, height: lines.length, lines, numeric };
}

/**
 * @param {number} frameCols
 * @param {number} scoreWidth
 */
export function scorePanelReserveCols(frameCols, scoreWidth) {
  return Math.min(scoreWidth + 2, Math.max(18, Math.floor(frameCols * 0.28)));
}
