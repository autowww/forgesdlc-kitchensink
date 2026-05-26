/**
 * Loop-watch map cell: stable base status + ephemeral process overlay.
 * See ../docs/LOOP-WATCH-MAP-CELLS.md
 */

/** @typedef {'unseen'|'scored'|'audited-clean'|'audited-minor'|'audited-major'|'pending-ai'|'fixed'|'error'} MapCellBaseStatus */

/** @typedef {'scoring'|'auditing'|'fixing'} MapCellOverlay */

/** @typedef {'unseen'|'scored'|'scoring'|'auditing'|'auditing-dim'|'audited-clean'|'audited-major'|'audited-minor'|'fixing'|'fixing-dim'|'fixed'|'error'|'pending-ai'|'clean'|'issue'} MapCellStatus */

const ROTATING_DASHES = ['─', '╲', '│', '╱'];

const IN_FLIGHT = new Set([
  'scoring',
  'auditing',
  'auditing-dim',
  'fixing',
  'fixing-dim',
]);

/**
 * @param {MapCellStatus | string} status
 * @returns {MapCellBaseStatus}
 */
export function toMapCellBaseStatus(status) {
  const s = String(status || 'unseen');
  switch (s) {
    case 'scoring':
      return 'scored';
    case 'auditing':
    case 'auditing-dim':
      return 'scored';
    case 'fixing':
    case 'fixing-dim':
      return 'scored';
    case 'clean':
    case 'issue':
      return 'scored';
    case 'unseen':
    case 'scored':
    case 'audited-clean':
    case 'audited-minor':
    case 'audited-major':
    case 'pending-ai':
    case 'fixed':
    case 'error':
      return /** @type {MapCellBaseStatus} */ (s);
    default:
      return 'unseen';
  }
}

/**
 * @param {MapCellStatus | string} status
 * @returns {MapCellOverlay | null}
 */
export function overlayFromInFlightStatus(status) {
  const s = String(status || '');
  if (s === 'scoring') return 'scoring';
  if (s === 'auditing' || s === 'auditing-dim') return 'auditing';
  if (s === 'fixing' || s === 'fixing-dim') return 'fixing';
  return null;
}

/**
 * @param {MapCellBaseStatus | string} base
 * @param {MapCellOverlay | null | undefined} overlay
 * @param {number} [tick]
 * @param {{ useColor?: boolean }} [opts]
 */
export function renderMapCell(base, overlay, tick = 0, opts = {}) {
  const uc = opts.useColor !== false && !(process.env.NO_COLOR != null && String(process.env.NO_COLOR).length > 0);
  const b = toMapCellBaseStatus(/** @type {MapCellStatus} */ (base));
  const [bgCh, bgFg, bgBg] = mapCellBaseStyle(b);
  if (!overlay) {
    return paintFlat(bgCh, bgFg, bgBg, uc);
  }
  const dash = ROTATING_DASHES[Math.abs(tick) % ROTATING_DASHES.length];
  const [, ovFg] = mapCellOverlayStyle(overlay);
  if (!uc) return dash;
  const bg = bgBg ? `\x1b[48;5;${bgBg}m` : '';
  const fg = `\x1b[38;5;${ovFg}m`;
  return `${bg}${fg}${dash}\x1b[0m`;
}

/**
 * @param {MapCellBaseStatus} base
 * @returns {[string, number | null, number | null]}
 */
function mapCellBaseStyle(base) {
  switch (base) {
    case 'unseen':
      return ['░', 240, 236];
    case 'scored':
      return ['▒', 252, 238];
    case 'audited-clean':
      return ['█', 46, 22];
    case 'audited-major':
      return ['█', 196, 52];
    case 'audited-minor':
      return ['█', 214, 58];
    case 'fixed':
      return ['█', 28, 22];
    case 'error':
      return ['▒', 226, 58];
    case 'pending-ai':
      return ['○', 39, 17];
    default:
      return ['░', 240, 236];
  }
}

/**
 * @param {MapCellOverlay} overlay
 * @returns {[string, number]}
 */
function mapCellOverlayStyle(overlay) {
  switch (overlay) {
    case 'scoring':
      return ['─', 39];
    case 'auditing':
      return ['─', 45];
    case 'fixing':
      return ['─', 39];
    default:
      return ['─', 39];
  }
}

/**
 * @param {string} ch
 * @param {number | null} fg
 * @param {number | null} bg
 * @param {boolean} uc
 */
function paintFlat(ch, fg, bg, uc) {
  if (!uc) return ch;
  let s = '';
  if (bg != null) s += `\x1b[48;5;${bg}m`;
  if (fg != null) s += `\x1b[38;5;${fg}m`;
  return `${s}${ch}\x1b[0m`;
}

/**
 * @param {MapCellStatus[][]} baseMatrix
 * @param {number} row
 * @param {number} col
 * @param {MapCellOverlay | null} overlay
 */
export function applyOverlayToMatrix(baseMatrix, row, col, overlay) {
  if (row < 0 || col < 0 || !baseMatrix.length) return baseMatrix;
  /** @type {(MapCellOverlay | null)[][]} */
  const overlays = baseMatrix.map((r) => r.map(() => /** @type {MapCellOverlay | null} */ (null)));
  for (let ri = 0; ri < baseMatrix.length; ri += 1) {
    for (let ci = 0; ci < (baseMatrix[ri] || []).length; ci += 1) {
      if (ri === row && ci === col && overlay) overlays[ri][ci] = overlay;
    }
  }
  return overlays;
}

/**
 * Build overlay grid: single active intersection only.
 * @param {MapCellBaseStatus[][]} baseMatrix
 * @param {{ row?: number, col?: number, overlay?: MapCellOverlay | null }} active
 */
export function buildOverlayMatrix(baseMatrix, active = {}) {
  const row = Number(active.row);
  const col = Number(active.col);
  const overlay = active.overlay || null;
  return (baseMatrix || []).map((r, ri) =>
    (r || []).map((_, ci) => (ri === row && ci === col && overlay ? overlay : null)),
  );
}
