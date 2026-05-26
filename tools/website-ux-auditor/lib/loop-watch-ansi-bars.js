/**
 * Render loop-watch progress bar models as terminal strings (ANSI or plain).
 */

import { formatIndexFragmentLegend } from './loop-watch-page-groups.js';
import { computeDefragMapLayout } from './loop-watch-progress-map.js';
import { loadQualityGateThresholdsFromEnv } from './quality-gate.js';
import { SEVERITY_GATE_SHORT } from './quality-gate.js';
import { SEVERITY_LEVELS } from './severity.js';
import { renderMapCell } from './loop-watch-map-cell-model.js';
import { clipPadAnsi, clipPadVisible, formatRulesetHeading, visibleLength } from './terminal-ansi.js';

/** Fixed columns so Audit / Remed rows align (gate strip at same offset). */
export const PHASE_BAR_LAYOUT = {
  rowLabelW: 6,
  modeW: 5,
  barW: 10,
  countW: 16,
  midW: 15,
  /** Visible width of `gate [` + 7×3-char segments + `]` + optional `!`. */
  gateBoxW: 34,
  tailW: 24,
};

/**
 * @param {{
 *   row: string,
 *   mode: string,
 *   bar: string,
 *   count: string,
 *   mid: string,
 *   gateBox: string,
 *   tail?: string,
 * }} cols
 */
export function formatPhaseBarRow(cols) {
  const barVis = visibleLength(cols.bar);
  const barSlot = PHASE_BAR_LAYOUT.barW + 2;
  const barPad =
    barVis >= barSlot ? cols.bar : `${cols.bar}${' '.repeat(Math.max(0, barSlot - barVis))}`;
  return (
    `${clipPadVisible(cols.row, PHASE_BAR_LAYOUT.rowLabelW)}`
    + `${clipPadVisible(cols.mode, PHASE_BAR_LAYOUT.modeW)}`
    + ` [${barPad}] `
    + `${clipPadVisible(cols.count, PHASE_BAR_LAYOUT.countW)}`
    + `${clipPadVisible(cols.mid, PHASE_BAR_LAYOUT.midW)}`
    + `${clipPadVisible(cols.gateBox, PHASE_BAR_LAYOUT.gateBoxW)}`
    + `${clipPadVisible(cols.tail || '', PHASE_BAR_LAYOUT.tailW)}`
  );
}

/** @param {boolean} [useColor] */
export function colorEnabled(useColor) {
  if (useColor === false) return false;
  if (process.env.NO_COLOR != null && String(process.env.NO_COLOR).length > 0) return false;
  return useColor !== false;
}

const ANSI = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  greenDark: '\x1b[38;5;28m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  blueBright: '\x1b[94m',
  blueDim: '\x1b[38;5;17m',
  cyan: '\x1b[36m',
  amber: '\x1b[33m',
  grayDark: '\x1b[38;5;236m',
  grayMid: '\x1b[38;5;240m',
};

/**
 * @param {string} ch
 * @param {string} color
 * @param {boolean} useColor
 */
function paint(ch, color, useColor) {
  if (!colorEnabled(useColor)) return ch;
  return `${color}${ch}${ANSI.reset}`;
}

/**
 * @param {number} filled
 * @param {number} width
 * @param {boolean} useColor
 */
export function renderRunsBar(filled, width, useColor = true) {
  const w = Math.max(1, width);
  const f = Math.max(0, Math.min(w, filled));
  const ch = (on) => (on ? '█' : '░');
  let s = '';
  for (let i = 0; i < w; i += 1) {
    const on = i < f;
    s += paint(ch(on), on ? ANSI.green : ANSI.dim, colorEnabled(useColor));
  }
  return s;
}

/**
 * @param {import('./loop-watch-progress.js').PageBucket[] | string[]} cells
 * @param {boolean} useColor
 */
export function renderPageCells(cells, useColor = true) {
  const map = {
    unvisited: ['░', ANSI.dim],
    clean: ['█', ANSI.green],
    issues: ['█', ANSI.red],
    error: ['▒', ANSI.yellow],
  };
  return (cells || [])
    .map((c) => {
      const [ch, col] = map[c] || map.unvisited;
      return paint(ch, col, colorEnabled(useColor));
    })
    .join('');
}

/**
 * @param {import('./loop-watch-progress.js').RulePageBucket[] | string[]} cells
 * @param {boolean} useColor
 */
export function renderRuleCells(cells, useColor = true) {
  const map = {
    unvisited: ['░', ANSI.dim],
    full: ['█', ANSI.green],
    partial: ['█', ANSI.amber],
    error: ['█', ANSI.red],
  };
  return (cells || [])
    .map((c) => {
      const [ch, col] = map[c] || map.unvisited;
      return paint(ch, col, colorEnabled(useColor));
    })
    .join('');
}

/**
 * @param {Array<{ id: string, count: number, threshold: number, status: string }>} segments
 * @param {boolean} useColor
 */
export function renderGateSegments(segments, useColor = true) {
  const uc = colorEnabled(useColor);
  return (segments || [])
    .map((seg) => {
      const label = SEVERITY_GATE_SHORT[seg.id] || seg.id.slice(0, 2);
      let col = ANSI.green;
      if (seg.status === 'over') col = ANSI.red;
      else if (seg.status === 'at_cap') col = ANSI.amber;
      const inner = paint('■', col, uc);
      return uc ? `${label}${inner}` : `${label}${seg.count > seg.threshold ? '+' : seg.count === seg.threshold && seg.count > 0 ? '=' : ''}`;
    })
    .join(uc ? ' ' : '');
}

/**
 * One 3-char gate segment: fill level toward threshold (count/threshold).
 * @param {{ count: number, threshold: number, status: string }} seg
 * @param {boolean} useColor
 */
export function renderGateThresholdCell(seg, useColor = true) {
  const t = Math.max(0, Number(seg.threshold) || 0);
  const c = Math.max(0, Number(seg.count) || 0);
  let ratio = 0;
  if (t > 0) ratio = Math.min(1.5, c / t);
  else if (c > 0) ratio = 1;
  const filled = Math.min(3, Math.round(ratio * 3));
  let col = ANSI.dim;
  if (seg.status === 'over') col = ANSI.red;
  else if (seg.status === 'at_cap') col = ANSI.amber;
  else if (filled >= 3) col = ANSI.green;
  else if (filled > 0) col = ANSI.yellow;
  const ch = (on) => paint(on ? '█' : '░', on ? col : ANSI.dim, colorEnabled(useColor));
  let s = '';
  for (let i = 0; i < 3; i += 1) {
    s += ch(i < filled);
  }
  return s;
}

/**
 * @param {Array<{ status?: string }>} segments
 */
export function gateStripHasOverSegment(segments) {
  return (segments || []).some((seg) => seg.status === 'over');
}

/**
 * @param {string} gateStrip
 * @param {Array<{ status?: string }>} segments
 */
export function formatGateThresholdBox(gateStrip, segments) {
  if (!gateStrip) return '';
  const bang = gateStripHasOverSegment(segments) ? '!' : '';
  return `gate [${gateStrip}]${bang}`;
}

/**
 * @param {Array<{ id: string, count: number, threshold: number, status: string }>} segments
 * @param {boolean} [useColor]
 */
export function renderGateThresholdStrip(segments, useColor = true) {
  return (segments || [])
    .map((seg) => renderGateThresholdCell(seg, useColor))
    .join(paint('│', ANSI.dim, colorEnabled(useColor)));
}

/**
 * @param {Array<{ label?: string, cell: string }>} defectCols
 * @param {boolean} [useColor]
 */
function paintDefectCell(raw, useColor) {
  const text = String(raw || '  -')
    .padStart(3, ' ')
    .slice(-3);
  let colAnsi = ANSI.dim;
  if (/\+/.test(text)) colAnsi = ANSI.red;
  else if (/○/.test(text)) colAnsi = ANSI.blue;
  else if (!/^[\s\-—·0]+$/.test(text)) colAnsi = ANSI.yellow;
  return paint(text, colAnsi, colorEnabled(useColor));
}

/**
 * @param {Array<{ cell: string }>} defectCols
 * @param {number} rowIndex
 * @param {boolean} [useColor]
 */
export function renderRowRulesetDefectColumns(defectCols, rowIndex, useColor = true) {
  const uc = colorEnabled(useColor);
  const div = paint('│', ANSI.dim, uc);
  return (defectCols || [])
    .map((col, i) => {
      if (i !== rowIndex) return paint('   ', ANSI.dim, uc);
      return paintDefectCell(col.cell, useColor);
    })
    .join(div);
}

/**
 * @param {Array<{ cell: string }>} defectCols
 * @param {boolean} [useColor]
 */
export function renderRulesetDefectStrip(defectCols, useColor = true) {
  const uc = colorEnabled(useColor);
  const div = paint('│', ANSI.dim, uc);
  return (defectCols || []).map((col) => paintDefectCell(col.cell, useColor)).join(div);
}

/**
 * @param {ReturnType<import('./loop-watch-progress.js').computeLoopWatchProgress>} progress
 * @param {{ useColor?: boolean, innerWidth?: number }} [opts]
 */
export function renderProgressBarLines(progress, opts = {}) {
  const useColor = opts.useColor !== false && colorEnabled(opts.useColor);
  const innerW = Math.max(8, progress.barWidth || opts.innerWidth || 40);
  const runs = progress.runs;
  const runsFilled = runs.expectedIterations > 0
    ? Math.round((runs.iteration / runs.expectedIterations) * innerW)
    : 0;
  const runsBar = renderRunsBar(runsFilled, innerW, useColor);
  const runsSuffix = runs.complete ? 'done' : `${runs.iteration}/${runs.expectedIterations} ${runs.expectedIterationsNote}`;
  const cycle = runs.cycleLights ? ` · ${runs.cycleLights}` : '';

  const pg = progress.pages;
  const pageBar = renderPageCells(pg.cells, useColor);
  const pagePctIssue = pg.captured > 0 ? Math.round((pg.issues / pg.captured) * 100) : 0;
  const pageSuffix = `${pg.captured}/${pg.budget}`
    + (pg.issues ? ` · ${pagePctIssue}% issues` : '')
    + (pg.complete ? ' · budget done' : '');

  const gateStrip = renderGateThresholdStrip(progress.gate.segments, useColor);
  const gateSeg = renderGateSegments(progress.gate.segments, useColor);
  const gateLegend = SEVERITY_LEVELS.map((id) => {
    const s = progress.gate.segments.find((x) => x.id === id);
    if (!s) return '';
    return `${SEVERITY_GATE_SHORT[id]}${s.count}/${s.threshold}`;
  }).filter(Boolean).join(' ');

  const rl = progress.rules;
  const ruleBar = renderRuleCells(rl.cells, useColor);
  const ruleSuffix = `${rl.pagesFull}/${rl.pagesVisited} full · ${rl.implementedCount} DET`;

  const mark = (ok) => (ok ? (useColor ? paint('✓', ANSI.green, true) : '+') : (useColor ? paint('○', ANSI.dim, true) : '-'));

  return [
    ` Progress`,
    ` Runs  ${mark(runs.complete)} [${runsBar}] ${runsSuffix}${cycle}`,
    ` Pages ${mark(pg.complete)} [${pageBar}] ${pageSuffix}`,
    ` Gate  ${mark(progress.gate.complete)} [${gateStrip}] ${gateSeg}`,
    `       ${gateLegend}`,
    ` Rules ${mark(rl.complete)} [${ruleBar}] ${ruleSuffix}`,
  ];
}

/**
 * @param {number} pct 0–100
 * @param {number} width
 * @param {boolean} useColor
 * @param {string} [fillColor]
 */
export function renderPctBar(pct, width, useColor = false, fillColor = ANSI.green) {
  const w = Math.max(4, width);
  const f = Math.max(0, Math.min(w, Math.round((Math.max(0, Math.min(100, pct)) / 100) * w)));
  const ch = (on) => (on ? '█' : '░');
  let s = '';
  for (let i = 0; i < w; i += 1) {
    const on = i < f;
    s += paint(ch(on), on ? fillColor : ANSI.dim, colorEnabled(useColor));
  }
  return s;
}

/**
 * @param {import('./loop-watch-progress-map.js').computeAuditPhaseBar extends (...args: any) => infer R ? R : never} auditBar
 * @param {number} barWidth
 */
export function formatAuditPhaseBarLine(auditBar, barWidth = 24) {
  const p = auditBar.primary;
  const sec = auditBar.secondary;
  const haltBar = renderPctBar(p.pct, PHASE_BAR_LAYOUT.barW, true, ANSI.amber);
  const gateSegs = auditBar.gateSegments || [];
  const gateStrip = gateSegs.length ? renderGateThresholdStrip(gateSegs, true) : '';
  const secTxt =
    sec.kind === 'major_plus'
      ? `Mj ${sec.current}/${sec.cap}`
      : `all ${sec.current}/${sec.cap}`;
  const haltLabel =
    p.kind === 'gate_violations' ? 'gate+' : p.kind === 'backlog' ? 'findings' : 'Major+';
  const countTxt = `${p.current}/${p.cap} ${haltLabel}`;
  const tailParts = [];
  if (auditBar.capReached) tailParts.push('halt cap→remed');
  if (auditBar.gatePass) tailParts.push('gate OK');
  else if (auditBar.gateFillPct) tailParts.push(`gate ${auditBar.gateFillPct}%`);
  return formatPhaseBarRow({
    row: ' Audit',
    mode: 'halt',
    bar: haltBar,
    count: countTxt,
    mid: secTxt,
    gateBox: gateStrip ? `gate [${gateStrip}]` : '',
    tail: tailParts.length ? `· ${tailParts.join(' · ')}` : '',
  });
}

/**
 * @param {{ done: number, total: number, pct: number, todoPct?: number, gateFixPct?: number, gateSegments?: object[], note?: string }} remBar
 * @param {number} barWidth
 */
export function formatRemediationPhaseBarLine(remBar, barWidth = 24) {
  const todoPct = Number.isFinite(remBar.todoPct) ? remBar.todoPct : remBar.pct;
  const gateFixPct = Number.isFinite(remBar.gateFixPct) ? remBar.gateFixPct : remBar.pct;
  const todoBar = renderPctBar(todoPct, PHASE_BAR_LAYOUT.barW, true, ANSI.cyan);
  const bugsBar = renderPctBar(gateFixPct, Math.min(8, PHASE_BAR_LAYOUT.midW - 7), true, ANSI.green);
  const gateStrip =
    remBar.gateSegments?.length ? renderGateThresholdStrip(remBar.gateSegments, true) : '';
  const tot = remBar.total > 0 ? `${remBar.done}/${remBar.total} todos` : remBar.note || '—';
  const activeNote = String(remBar.note || '').trim();
  const tailParts = [`${gateFixPct}%→pass`];
  if (activeNote && !tot.includes(activeNote)) tailParts.unshift(activeNote);
  return formatPhaseBarRow({
    row: ' Remed',
    mode: 'plan',
    bar: todoBar,
    count: tot,
    mid: `bugs [${bugsBar}]`,
    gateBox: gateStrip ? `gate [${gateStrip}]` : '',
    tail: `· ${tailParts.join(' · ')}`,
  });
}

/** Rotating dash cycle for in-flight map cells (matches legend colors). */
const ROTATING_DASHES = ['─', '╲', '│', '╱'];

/**
 * @param {number} tick
 * @param {string} bright
 * @param {string} [dim]
 */
function rotatingDashChar(tick, bright, dim) {
  const ch = ROTATING_DASHES[Math.abs(tick) % ROTATING_DASHES.length];
  const col = dim && tick % 2 === 1 ? dim : bright;
  return [ch, col];
}

/**
 * @param {string} status
 * @param {number} [tick]
 */
export function mapCellChar(status, tick = 0, opts = {}) {
  switch (status) {
    case 'unseen':
      return ['░', ANSI.grayDark];
    case 'scored':
      if (opts.scoringInFlight) {
        return rotatingDashChar(tick, ANSI.grayMid, ANSI.grayDark);
      }
      return ['▒', ANSI.grayMid];
    case 'scoring':
      return rotatingDashChar(tick, ANSI.blueBright, ANSI.blueDim);
    case 'auditing':
      return rotatingDashChar(tick, ANSI.blueBright, ANSI.blueDim);
    case 'auditing-dim':
      return rotatingDashChar(tick, ANSI.blueDim, ANSI.grayMid);
    case 'audited-clean':
      return ['█', ANSI.green];
    case 'audited-major':
      return ['█', ANSI.red];
    case 'audited-minor':
      return ['█', ANSI.amber];
    case 'fixing':
      return rotatingDashChar(tick, ANSI.blueBright, ANSI.blueDim);
    case 'fixing-dim':
      return rotatingDashChar(tick, ANSI.blueDim, ANSI.grayMid);
    case 'fixed':
      return ['█', ANSI.greenDark];
    case 'error':
      return ['▒', ANSI.yellow];
    case 'pending-ai':
      return ['○', ANSI.blue];
    case 'clean':
      return ['█', ANSI.green];
    case 'issue':
      return ['█', ANSI.red];
    default:
      return ['░', ANSI.grayDark];
  }
}

/**
 * Multi-line map legend with color swatches (matches {@link mapCellChar}).
 * @param {{ useColor?: boolean }} [opts]
 */
export function renderMapStatusLegendLines(opts = {}) {
  const uc = colorEnabled(opts.useColor);
  const swBase = (base) => renderMapCell(base, null, 0, { useColor: uc });
  const tick = 2;
  return [
    ` ${swBase('unseen')} unseen  ${swBase('scored')} scored  ${renderMapCell('scored', 'scoring', tick, { useColor: uc })} scoring  ${renderMapCell('scored', 'auditing', tick, { useColor: uc })} auditing  ${swBase('audited-clean')} audited`,
    ` ${swBase('audited-major')} Maj+  ${swBase('audited-minor')} min/warn  ${renderMapCell('audited-major', 'fixing', tick, { useColor: uc })} fixing  ${swBase('fixed')} fixed`,
    ' bug: per-ruleset counts · per-row gate strip · overlay dash rotates on unchanged base (see LOOP-WATCH-MAP-CELLS.md)',
  ];
}

/**
 * @param {{ maxSlots?: number, mode?: string, bars?: Array<{ label: string, pct: number, done: number, total: number, state?: string }> }} pageSlotBars
 * @param {Array<{ pct: number }>} [ruleWorkerSlots]
 * @param {{ innerWidth?: number }} [opts]
 */
export function renderPageSlotBarLines(pageSlotBars, ruleWorkerSlots, opts = {}) {
  const innerW = Math.max(24, opts.innerWidth || 48);
  const bars = pageSlotBars?.bars || [];
  const maxSlots = pageSlotBars?.maxSlots || bars.length;
  if (!bars.length && !ruleWorkerSlots?.length) return [];

  const lines = [];
  const barW = Math.min(18, Math.max(8, innerW - 28));
  const modeLabel =
    pageSlotBars?.mode === 'remediation'
      ? 'remed'
      : pageSlotBars?.mode === 'auditor'
        ? 'audit'
        : 'score';
  lines.push(` Slots  ${modeLabel} · up to ${maxSlots} pages`);

  for (let i = 0; i < Math.min(maxSlots, bars.length); i += 1) {
    const b = bars[i];
    const fill =
      b.state === 'issue' ? ANSI.red : b.state === 'active' ? ANSI.cyan : b.state === 'done' ? ANSI.green : ANSI.dim;
    const bar = renderPctBar(b.pct, barW, true, fill);
    const suffix =
      b.state === 'queued'
        ? 'queued'
        : b.total > 0 && b.state === 'active'
          ? pageSlotBars?.mode === 'remediation'
            ? 'in flight'
            : `${b.done}/${b.total} rules`
          : b.state === 'done'
            ? 'done'
            : '';
    const label = String(b.label || '').slice(0, Math.max(8, innerW - barW - 16));
    lines.push(`  ${label.padEnd(14, ' ')} [${bar}] ${suffix}`.slice(0, innerW + 6));
  }

  if (pageSlotBars?.mode === 'remediation' && pageSlotBars?.remediation) {
    const rem = pageSlotBars.remediation;
    const todoTxt = `${rem.done}/${rem.total} todos`;
    const ip = rem.inProgress > 0 ? ` · ${rem.inProgress} active` : '';
    lines.push(` Plan   ${todoTxt}${ip}`.slice(0, innerW + 8));
  } else if (ruleWorkerSlots?.length && bars.some((b) => b.state === 'active')) {
    let workers = '';
    for (const w of ruleWorkerSlots) {
      const ch = w.pct >= 100 ? '█' : w.pct > 0 ? '▓' : '░';
      workers += ch;
    }
    lines.push(` Workers [${workers}] DET concurrency`.slice(0, innerW + 8));
  }
  return lines;
}

/**
 * @param {Awaited<ReturnType<import('./loop-watch-progress-map.js').buildLoopWatchProgressMap>>} mapModel
 * @param {{ innerWidth?: number, maxRows?: number }} [opts]
 */
export function renderDefragMapLines(mapModel, opts = {}) {
  const uc = colorEnabled(opts.useColor);
  const maxRows = opts.maxRows ?? 16;
  const fragments = mapModel.pageFragments || [];
  const ruleRows = mapModel.ruleRows || [];
  const matrix = mapModel.matrix || [];
  const defectCols = mapModel.rulesetDefectCols || [];
  const { labelColW, gridSlotW, cols, headerGridPad, gateStripW } = computeDefragMapLayout(mapModel, opts);
  const mapLead = ' Map';
  if (!cols || !matrix.length) {
    return [' Map    (no crawl data yet)'];
  }

  const tick = Number(mapModel.mapTick) || 0;
  const activeRulesetId = mapModel.activeRulesetId || null;
  const gridPad = ' '.repeat(headerGridPad);

  const logicalLegend = mapModel.pageGroupPlan?.legend;
  const fragLegend = logicalLegend
    ? logicalLegend
    : formatIndexFragmentLegend(fragments, cols, mapModel.pageBudget);
  const modeTag =
    mapModel.pageGroupPlan?.mode === 'depth'
      ? ' dp'
      : mapModel.pageGroupPlan?.mode === 'chapter'
        ? ' ch'
        : '';
  const budgetNote = mapModel.pageBudget ? ` · ${mapModel.pageBudget}pg${modeTag}` : modeTag;
  const defectHdr =
    defectCols.length > 0
      ? `${paint('│', ANSI.dim, uc)}${clipPadVisible('bug', 4).trimEnd()}`
      : '';
  let thresholds;
  try {
    thresholds = loadQualityGateThresholdsFromEnv(process.env);
  } catch {
    thresholds = loadQualityGateThresholdsFromEnv({});
  }
  const byId = new Map((mapModel.auditBar?.gateSegments || []).map((s) => [s.id, s]));
  const gateSegments = SEVERITY_LEVELS.map((id) => {
    const live = byId.get(id);
    if (live) return live;
    return {
      id,
      count: 0,
      threshold: thresholds[id] ?? 0,
      status: 'ok',
    };
  });
  const gateStrip = renderGateThresholdStrip(gateSegments, uc);
  const gateHdr =
    gateStripW > 0
      ? `${paint('│', ANSI.dim, uc)}${clipPadAnsi(gateStrip, gateStripW - 1)}`
      : '';
  /** Sitewide gate strip is header-only; data rows pad so the bug column stays aligned. */
  const rulesetGateRows = mapModel.rulesetGateSegmentRows || [];
  const overlayMatrix = mapModel.rulesetMatrixOverlay || [];
  const headerGridBody = clipPadVisible(`pg ${fragLegend}${budgetNote}`.trim(), gridSlotW);
  const headerGridTailPad = Math.max(0, gridSlotW - visibleLength(headerGridBody));
  const lines = [`${mapLead}${gridPad}${headerGridBody}${' '.repeat(headerGridTailPad)}${defectHdr}${gateHdr}`];
  let detRows = 0;
  let aiStarted = false;

  const sepLine = (title) => {
    const t = `─ ${title} ─`;
    const plain = t.length <= labelColW ? t.padStart(labelColW, ' ') : clipPadVisible(t, labelColW);
    return ` \x1b[2m\x1b[90m${plain}\x1b[0m`;
  };

  for (let r = 0; r < matrix.length && lines.length < maxRows + 3; r += 1) {
    const rule = ruleRows[r];
    if (rule?.lane === 'ai' && !aiStarted) {
      lines.push(sepLine('AI rulesets'));
      aiStarted = true;
    }
    if (rule?.lane === 'deterministic') detRows += 1;
    const labelText = String(rule?.label || rule?.short || rule?.id || '');
    const isActive = Boolean(activeRulesetId && rule?.id === activeRulesetId);
    const label = formatRulesetHeading(labelText, labelColW, { active: isActive, tick });
    let cells = '';
    for (let c = 0; c < cols; c += 1) {
      const base = matrix[r]?.[c] || 'unseen';
      const overlay = overlayMatrix[r]?.[c] || null;
      cells += renderMapCell(base, overlay, tick, { useColor: uc });
    }
    const defectPart =
      defectCols.length > 0
        ? `${paint('│', ANSI.dim, uc)}${paintDefectCell(defectCols[r]?.cell, uc)}`
        : '';
    const rowGateSegs = rulesetGateRows[r] || gateSegments;
    const rowGateStrip = gateStripW > 0 ? renderGateThresholdStrip(rowGateSegs, uc) : '';
    const gatePart =
      gateStripW > 0
        ? `${paint('│', ANSI.dim, uc)}${clipPadAnsi(rowGateStrip, gateStripW - 1)}`
        : '';
    const cellPad = Math.max(0, gridSlotW - visibleLength(cells));
    lines.push(` ${label} ${cells}${' '.repeat(cellPad)}${defectPart}${gatePart}`);
    if (
      rule?.lane === 'deterministic' &&
      detRows === mapModel.detCount &&
      mapModel.aiCount > 0 &&
      !aiStarted
    ) {
      lines.push(sepLine('AI rulesets'));
      aiStarted = true;
    }
  }
  const detN = mapModel.rulesetDetCount ?? mapModel.detCount ?? 0;
  const aiN = mapModel.rulesetAiCount ?? mapModel.aiCount ?? 0;
  const fullDet = mapModel.ruleRowsFull?.filter((x) => x.lane === 'deterministic').length;
  lines.push(...renderMapStatusLegendLines({ useColor: uc }));
  const meta = ` ${detN} DET + ${aiN} AI rulesets${fullDet ? ` · ${fullDet} rules` : ''}`;
  lines.push(` \x1b[2m\x1b[90m${clipPadVisible(meta, labelColW + 1 + gridSlotW)}\x1b[0m`);
  return lines;
}

/**
 * @param {Awaited<ReturnType<import('./loop-watch-progress-map.js').buildLoopWatchProgressMap>> | null} mapModel
 * @param {{ innerWidth?: number }} [opts]
 */
export function renderPhaseAndMapLines(mapModel, opts = {}) {
  if (!mapModel) return [];
  const innerW = opts.innerWidth || 40;
  const useColor = opts.useColor;
  const lines = [];
  if (mapModel.auditBar) lines.push(formatAuditPhaseBarLine(mapModel.auditBar, Math.min(28, innerW - 10)));
  if (mapModel.remediationBar) {
    lines.push(formatRemediationPhaseBarLine(mapModel.remediationBar, Math.min(28, innerW - 10)));
  }
  if (mapModel.pageSlotBars) {
    lines.push(...renderPageSlotBarLines(mapModel.pageSlotBars, mapModel.ruleWorkerSlots, { innerWidth: innerW }));
  }
  lines.push(...renderDefragMapLines(mapModel, { innerWidth: innerW, useColor }));
  return lines;
}
