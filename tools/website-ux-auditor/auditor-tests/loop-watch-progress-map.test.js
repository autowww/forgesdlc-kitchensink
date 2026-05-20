import assert from 'node:assert/strict';
import test from 'node:test';

import {
  aggregateMapStatus,
  buildOrderedPageSets,
  buildPageFragments,
  buildPageSlotBars,
  buildRulesetGroups,
  buildRuleWorkerSlots,
  classifyRulesetPageCell,
  computeAuditPhaseBar,
  computePageRuleMatrix,
  computeRulesetFragmentMatrix,
  countDetProgressOnPage,
  overlayActiveColumnPulse,
  overlayScoringBlink,
  parseRemediationPlanTodos,
  formatRulesetDefectCell,
  gateSegmentsMaxFillPct,
  resolveActiveRulesetId,
  rulesetLabelColWidth,
  selectDisplayRuleRows,
  computeDefragMapLayout,
  buildRulesetDefectColumns,
} from '../lib/loop-watch-progress-map.js';
import {
  formatAuditPhaseBarLine,
  formatPhaseBarRow,
  formatRemediationPhaseBarLine,
  formatGateThresholdBox,
  PHASE_BAR_LAYOUT,
  renderDefragMapLines,
  renderGateThresholdCell,
  renderGateThresholdStrip,
  renderMapStatusLegendLines,
  renderPageSlotBarLines,
} from '../lib/loop-watch-ansi-bars.js';
import { boxRow } from '../lib/loop-watch-dashboard-frame.js';
import { loadDesignRuleRegistry } from '../lib/design-rule-runtime.js';
import { stripAnsi } from '../lib/terminal-ansi.js';
import { SEVERITY_LEVELS } from '../lib/severity.js';

const THR = { blocker: 0, critical: 0, major: 0, warn: 5, minor: 10, trivial: 15, cosmetic: 100 };

test('buildOrderedPageSets sorts lowest score and issues first', () => {
  const pages = [
    { url: 'http://x/a', findings: [], score: 90 },
    { url: 'http://x/b', findings: [{ severity: 'blocker' }], score: 40 },
  ];
  const sets = buildOrderedPageSets(pages, THR);
  assert.equal(sets[0].url, 'http://x/b');
  assert.equal(sets[0].status, 'issue');
});

test('computeAuditPhaseBar reaches cap at 100%', () => {
  const bar = computeAuditPhaseBar(
    { auditProgress: { findingAccum: 11, majorPlusAccum: 2, stopAfterBacklog: 10, stopAfterMajorPlus: 10 } },
    null,
  );
  assert.equal(bar.primary.cap, 10);
  assert.ok(bar.capReached);
  assert.ok(bar.primary.pct >= 100);
  const line = formatAuditPhaseBarLine(bar, 20);
  assert.ok(line.includes('halt cap→remed'));
});

test('formatPhaseBarRow aligns gate column across Audit and Remed', () => {
  const gateSegs = [
    { id: 'blocker', count: 0, threshold: 0, status: 'ok' },
    { id: 'critical', count: 0, threshold: 0, status: 'ok' },
    { id: 'major', count: 0, threshold: 0, status: 'ok' },
    { id: 'warn', count: 6, threshold: 5, status: 'over' },
    { id: 'minor', count: 0, threshold: 10, status: 'ok' },
    { id: 'trivial', count: 0, threshold: 15, status: 'ok' },
    { id: 'cosmetic', count: 0, threshold: 100, status: 'ok' },
  ];
  const strip = renderGateThresholdStrip(gateSegs, false);
  const audit = formatAuditPhaseBarLine(
    {
      primary: { kind: 'backlog', current: 23, cap: 10, pct: 100 },
      secondary: { kind: 'major_plus', current: 0, cap: 10 },
      capReached: true,
      gateSegments: gateSegs,
      gateFillPct: 100,
      gatePass: false,
    },
    20,
  );
  const remed = formatRemediationPhaseBarLine(
    {
      done: 0,
      total: 2,
      pct: 0,
      todoPct: 0,
      gateFixPct: 0,
      gateSegments: gateSegs,
      note: 'running agent',
    },
    20,
  );
  const gateIdx = (s) => stripAnsi(s).indexOf('gate [');
  const off =
    PHASE_BAR_LAYOUT.rowLabelW
    + PHASE_BAR_LAYOUT.modeW
    + 2
    + (PHASE_BAR_LAYOUT.barW + 2)
    + 2
    + PHASE_BAR_LAYOUT.countW
    + PHASE_BAR_LAYOUT.midW;
  assert.equal(gateIdx(audit), off);
  assert.equal(gateIdx(audit), gateIdx(remed));
});

test('parseRemediationPlanTodos counts completed', () => {
  const plan = `---
name: test
todos:
  - id: ux-01
    content: "a"
    status: completed
  - id: ux-02
    content: "b"
    status: pending
---
`;
  const t = parseRemediationPlanTodos(plan);
  assert.equal(t.total, 2);
  assert.equal(t.done, 1);
  assert.equal(t.pending, 1);
});

test('formatRemediationPhaseBarLine shows percent', () => {
  const line = formatRemediationPhaseBarLine({ done: 2, total: 5, pct: 40, pending: 3, inProgress: 0, note: '' }, 16);
  assert.ok(line.includes('2/5'));
  assert.ok(line.includes('40%'));
});

test('overlayActiveColumnPulse alternates auditing column', () => {
  const matrix = [['audited-clean', 'auditing']];
  const a = overlayActiveColumnPulse(matrix, 1, 0);
  const b = overlayActiveColumnPulse(matrix, 1, 3);
  assert.equal(a[0][1], 'auditing');
  assert.equal(b[0][1], 'auditing-dim');
});

test('selectDisplayRuleRows limits row count', () => {
  const ruleRows = [
    { id: 'd1', lane: 'deterministic', short: 'd1' },
    { id: 'd2', lane: 'deterministic', short: 'd2' },
    { id: 'a1', lane: 'ai', short: 'a1' },
  ];
  const matrix = [
    ['issue', 'clean'],
    ['clean', 'clean'],
    ['unseen', 'unseen'],
  ];
  const d = selectDisplayRuleRows(ruleRows, matrix, 1, 1);
  assert.equal(d.ruleRows.length, 2);
});

test('aggregateMapStatus prefers error over audited-major', () => {
  assert.equal(aggregateMapStatus(['audited-clean', 'audited-major', 'error']), 'error');
  assert.equal(aggregateMapStatus(['unseen', 'audited-clean']), 'audited-clean');
});

test('classifyRulesetPageCell detects scored vs audited states', () => {
  const rs = { lane: 'deterministic', label: 'conversion', ruleIds: ['DET.X'] };
  const page = {
    url: 'http://x/p',
    findings: [{ ruleId: 'DET.X', severity: 'warn', area: 'conversion' }],
    ruleExecution: {
      deterministic: [{ ruleId: 'DET.X', status: 'ran', findingsCount: 1 }],
    },
  };
  const ctx = { scoredUrls: new Set(), priorPagesByUrl: new Map(), auditInFlight: false };
  assert.equal(classifyRulesetPageCell(ctx, rs, 'http://x/other', null, THR), 'unseen');
  assert.equal(classifyRulesetPageCell(ctx, rs, 'http://x/p', page, THR), 'audited-minor');
  const mj = {
    ...page,
    findings: [{ ruleId: 'DET.X', severity: 'major', area: 'conversion' }],
  };
  assert.equal(classifyRulesetPageCell(ctx, rs, 'http://x/p', mj, THR), 'audited-major');
});

test('buildPageFragments covers full budget in columns', () => {
  const frags = buildPageFragments([{ url: 'http://x/a' }], 10, 5);
  assert.equal(frags.length, 5);
  const covered = frags.reduce((n, f) => n + (f.endIdx - f.startIdx), 0);
  assert.equal(covered, 10);
});

test('formatRulesetDefectCell returns 3-char summary', () => {
  const cell = formatRulesetDefectCell(
    { lane: 'deterministic', label: 'conversion', ruleIds: ['DET.X'] },
    [{ ruleId: 'DET.X', severity: 'major', area: 'conversion' }],
    THR,
  );
  assert.equal(cell.length, 3);
  assert.ok(cell.includes('Mj') || cell.includes('M'));
});

test('gateSegmentsMaxFillPct tracks highest severity fill', () => {
  const segs = [
    { id: 'blocker', count: 0, threshold: 0, status: 'ok' },
    { id: 'warn', count: 4, threshold: 5, status: 'ok' },
  ];
  assert.equal(gateSegmentsMaxFillPct(segs), 80);
});

test('renderGateThresholdStrip renders seven 3-char cells', () => {
  const segs = SEVERITY_LEVELS.map((id) => ({ id, count: 0, threshold: THR[id], status: 'ok' }));
  const strip = renderGateThresholdStrip(segs, false);
  assert.ok(strip.length >= 21);
  const one = renderGateThresholdCell({ count: 6, threshold: 5, status: 'over' }, false);
  assert.equal(one.length, 3);
  assert.ok(!one.includes('!'), 'over marker belongs after gate box, not inside segment');
});

test('formatGateThresholdBox appends ! after closing bracket when over', () => {
  const segs = [{ id: 'warn', count: 6, threshold: 5, status: 'over' }];
  const strip = renderGateThresholdStrip(segs, false);
  const box = formatGateThresholdBox(strip, segs);
  assert.ok(box.endsWith(']!'), box);
  assert.ok(!strip.includes('!'));
});

test('computeDefragMapLayout reserves fixed grid slot, defect, and gate columns', () => {
  const mapModel = {
    ruleRows: [{ label: 'conversion' }, { label: 'layout' }],
    pageFragments: Array.from({ length: 20 }, (_, i) => ({ label: `${i + 1}` })),
    rulesetDefectCols: [{ cell: '  -' }, { cell: 'W3 ' }],
    showGateColumn: true,
  };
  const layout = computeDefragMapLayout(mapModel, { innerWidth: 80 });
  assert.equal(layout.defectStripW, 4);
  assert.equal(layout.gateStripW, 28);
  assert.equal(layout.gridSlotW, 80 - 4 - 1 - layout.labelColW - 1 - 4 - 28);
  assert.ok(layout.cols <= layout.gridSlotW);
});

test('renderDefragMapLines pins defect column across header and rows', () => {
  const rulesets = [
    { id: 'rs1', lane: 'deterministic', label: 'conversion', ruleIds: ['DET.A'] },
    { id: 'rs2', lane: 'deterministic', label: 'layout', ruleIds: ['DET.B'] },
  ];
  const defectCols = buildRulesetDefectColumns(rulesets, null, THR);
  const mapModel = {
    ruleRows: rulesets,
    matrix: [
      ['audited-clean', 'audited-major', 'unseen'],
      ['unseen', 'unseen'],
    ],
    pageFragments: [
      { label: '1-3' },
      { label: '4-6' },
      { label: '7-9' },
      { label: '10-12' },
    ],
    pageBudget: 12,
    rulesetDefectCols: defectCols,
    auditBar: {
      gateSegments: [
        { id: 'warn', count: 2, threshold: 5, status: 'ok' },
        { id: 'minor', count: 0, threshold: 10, status: 'ok' },
      ],
    },
    detCount: 2,
    aiCount: 0,
    mapTick: 0,
  };
  const lines = renderDefragMapLines(mapModel, { innerWidth: 72, useColor: false });
  const gateBarIdx = (line) => {
    const plain = stripAnsi(line);
    const parts = plain.split('│');
    assert.ok(parts.length >= 2, `expected bug and gate dividers in: ${plain}`);
    return plain.lastIndexOf('│');
  };
  const header = lines.find((l) => stripAnsi(l).includes('pg '));
  assert.ok(header);
  const headerGateIdx = gateBarIdx(header);
  assert.ok(stripAnsi(header).includes('bug'));
  const dataRows = lines.filter((l) => stripAnsi(l).includes('conversion') || stripAnsi(l).includes('layout'));
  assert.equal(dataRows.length, 2);
  for (const row of dataRows) {
    assert.equal(gateBarIdx(row), headerGateIdx, stripAnsi(row));
  }
});

test('rulesetLabelColWidth fits informationArchitecture', () => {
  const w = rulesetLabelColWidth([{ label: 'informationArchitecture' }, { label: 'conversion' }]);
  assert.ok(w >= 23);
});

test('resolveActiveRulesetId maps rule to ruleset', () => {
  const rulesets = [{ id: 'rs1', ruleIds: ['DET.A'] }];
  assert.equal(resolveActiveRulesetId(rulesets, 'DET.A'), 'rs1');
  assert.equal(resolveActiveRulesetId(rulesets, ''), null);
});

test('buildRulesetGroups groups DET by area', async () => {
  const registry = await loadDesignRuleRegistry();
  const groups = buildRulesetGroups(registry);
  assert.ok(groups.deterministic.length >= 3);
  assert.ok(groups.ai.length >= 1);
  const allIds = new Set(groups.all.flatMap((g) => g.ruleIds));
  assert.ok(allIds.has('DET.AMBIENT.Z_INDEX'));
});

test('computeRulesetFragmentMatrix aggregates page cells', () => {
  const pageSets = [{ url: 'http://x/a', order: 0 }];
  const matrix = [['audited-major'], ['audited-clean']];
  const frags = buildPageFragments(pageSets, 1, 1);
  const m = computeRulesetFragmentMatrix(frags, pageSets, matrix);
  assert.equal(m[0][0], 'audited-major');
});

test('buildPageSlotBars shows active rule progress', async () => {
  const registry = await loadDesignRuleRegistry();
  const detTotal = registry.deterministicRules.filter((r) => r.status === 'implemented').length;
  const bars = buildPageSlotBars(
    { phase: 'auditor', auditProgress: { pageRuleProgress: { url: 'http://x/p', done: 2, total: 10 } } },
    [],
    null,
    registry,
    { detTotal },
  );
  assert.equal(bars.bars[0].state, 'active');
  assert.equal(bars.bars[0].done, 2);
  const lines = renderPageSlotBarLines(bars, buildRuleWorkerSlots({ done: 2, total: 10 }, 5, 10), { innerWidth: 60 });
  assert.ok(lines.some((l) => l.includes('Slots')));
});

test('countDetProgressOnPage counts ran traces', () => {
  const p = {
    ruleExecution: {
      deterministic: [
        { ruleId: 'DET.A', status: 'ran' },
        { ruleId: 'DET.B', status: 'skipped_no_findings_cache' },
      ],
    },
  };
  const { done } = countDetProgressOnPage(p, 49);
  assert.equal(done, 2);
});

test('buildRuleWorkerSlots splits done across workers', () => {
  const w = buildRuleWorkerSlots({ done: 5, total: 10 }, 5, 10);
  assert.equal(w.length, 5);
  assert.equal(w.reduce((s, x) => s + x.done, 0), 5);
});

test('renderMapStatusLegendLines uses distinct ANSI swatches', () => {
  const prevNoColor = process.env.NO_COLOR;
  delete process.env.NO_COLOR;
  try {
    const lines = renderMapStatusLegendLines({ useColor: true });
    const joined = lines.slice(0, 2).join('\n');
    assert.ok(/\x1b\[38;5;236m/.test(joined), 'unseen dark gray');
    assert.ok(/\x1b\[38;5;240m/.test(joined), 'scored mid gray');
    assert.ok(/\x1b\[94m/.test(joined), 'auditing blue');
    assert.ok(/\x1b\[32m/.test(joined), 'ok green');
    assert.ok(/\x1b\[31m/.test(joined), 'Maj+ red');
    assert.ok(/\x1b\[33m/.test(joined), 'min/warn amber');
    assert.ok(/\x1b\[38;5;28m/.test(joined), 'fixed green');
    assert.equal(renderMapStatusLegendLines({ useColor: false }).slice(0, 2).join('\n'), stripAnsi(joined));
  } finally {
    if (prevNoColor === undefined) delete process.env.NO_COLOR;
    else process.env.NO_COLOR = prevNoColor;
  }
});

test('boxRow preserves map legend colors', () => {
  const prevNoColor = process.env.NO_COLOR;
  delete process.env.NO_COLOR;
  try {
    const legend = renderMapStatusLegendLines({ useColor: true });
    const rowOk = boxRow(100, legend[0]);
    const rowMj = boxRow(100, legend[1]);
    assert.ok(rowOk.includes('\x1b[32m'), 'boxed legend keeps green ok swatch');
    assert.ok(rowMj.includes('\x1b[31m'), 'boxed legend keeps red Maj+ swatch');
  } finally {
    if (prevNoColor === undefined) delete process.env.NO_COLOR;
    else process.env.NO_COLOR = prevNoColor;
  }
});

test('renderMapStatusLegendLines bug note is readable when clipped', () => {
  const note = renderMapStatusLegendLines({ useColor: false })[2];
  assert.ok(note.startsWith(' bug col:'));
  assert.ok(note.includes('sitewide defect'));
  assert.ok(!note.startsWith('│bug'));
});

test('computePageRuleMatrix marks clean deterministic cells', () => {
  const pageSets = [{ url: 'http://x/a', order: 0 }];
  const ruleRows = [{ id: 'DET.TEST', lane: 'deterministic', short: 'TEST' }];
  const pages = [
    {
      url: 'http://x/a',
      findings: [],
      ruleExecution: {
        deterministic: [{ ruleId: 'DET.TEST', status: 'ran', findingsCount: 0 }],
      },
    },
  ];
  const m = computePageRuleMatrix(pageSets, ruleRows, pages, THR);
  assert.equal(m[0][0], 'audited-clean');
});
