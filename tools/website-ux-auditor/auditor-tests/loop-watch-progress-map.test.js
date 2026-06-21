import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  aggregateMapStatus,
  buildOrderedPageSets,
  buildPageFragments,
  buildPageSlotBars,
  buildRulesetGroups,
  buildRuleWorkerSlots,
  classifyRulesetPageCell,
  resolveMapCellOverlay,
  isCtxActiveRuleset,
  mergeMapCellProgress,
  mergeAccumulatedRulesetMatrix,
  mergeRulesetMatricesWithPrior,
  readAiAuditedUrlSet,
  computeAuditPhaseBar,
  computePageRuleMatrix,
  computeRulesetPageMatrix,
  computeRulesetFragmentMatrix,
  isAiAuditPhaseComplete,
  mergeCellStatuses,
  countDetProgressOnPage,
  aggregateFragmentMapStatus,
  overlayActiveCellPulse,
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
  buildRulesetGateSegmentRows,
  buildLoopWatchProgressMap,
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
  mapCellChar,
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
    {
      auditProgress: {
        findingAccum: 11,
        majorPlusAccum: 2,
        stopAfterBacklog: 10,
        stopAfterMajorPlus: 10,
        stopAfterGateViolationUnits: 10,
        gateViolationUnits: 14,
      },
    },
    null,
  );
  assert.equal(bar.primary.kind, 'gate_violations');
  assert.equal(bar.primary.cap, 10);
  assert.equal(bar.primary.current, 14);
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

test('overlayActiveCellPulse alternates only fixing on the targeted cell', () => {
  const matrix = [
    ['audited-clean', 'auditing'],
    ['scored', 'fixing'],
  ];
  const a = overlayActiveCellPulse(matrix, 1, 1, 0);
  const b = overlayActiveCellPulse(matrix, 1, 1, 3);
  assert.equal(a[0][1], 'auditing');
  assert.equal(b[0][1], 'auditing');
  assert.equal(a[1][1], 'fixing');
  assert.equal(b[1][1], 'fixing-dim');
});

test('aggregateFragmentMapStatus stays scored until all pages in column are audited', () => {
  assert.equal(
    aggregateFragmentMapStatus(['audited-clean', 'scored', 'scored']),
    'scored',
  );
  assert.equal(
    aggregateFragmentMapStatus(['audited-clean', 'audited-clean']),
    'audited-clean',
  );
});

test('overlayActiveColumnPulse no longer paints whole columns', () => {
  const matrix = [['audited-clean', 'auditing']];
  assert.deepEqual(overlayActiveColumnPulse(matrix, 1, 0), matrix);
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
  const ctx = {
    scoredUrls: new Set(),
    auditedUrls: new Set(['http://x/p']),
    priorPagesByUrl: new Map(),
    auditInFlight: false,
  };
  assert.equal(classifyRulesetPageCell(ctx, rs, 'http://x/other', null, THR), 'unseen');
  assert.equal(classifyRulesetPageCell(ctx, rs, 'http://x/p', page, THR), 'audited-minor');
  const mj = {
    ...page,
    findings: [{ ruleId: 'DET.X', severity: 'major', area: 'conversion' }],
  };
  assert.equal(classifyRulesetPageCell(ctx, rs, 'http://x/p', mj, THR), 'audited-major');
});

test('classifyRulesetPageCell AI lane stays pending-ai until URL is in aiAuditedUrls', () => {
  const rs = { lane: 'ai', label: 'premium', ruleIds: ['AI.PREMIUM.ENTERPRISE_FEEL'] };
  const page = {
    url: 'http://x/p',
    findings: [],
    ruleExecution: { deterministic: [{ ruleId: 'DET.A', status: 'ran' }] },
  };
  const ctxNoAi = {
    scoredUrls: new Set(['http://x/p']),
    priorPagesByUrl: new Map(),
    auditInFlight: false,
    aiAuditComplete: true,
    aiAuditedUrls: new Set(),
    phase: 'auditor_main',
  };
  assert.equal(classifyRulesetPageCell(ctxNoAi, rs, 'http://x/p', page, THR), 'pending-ai');
  const ctxUrlDone = { ...ctxNoAi, aiAuditedUrls: new Set(['http://x/p']) };
  assert.equal(classifyRulesetPageCell(ctxUrlDone, rs, 'http://x/p', page, THR), 'audited-clean');
});

test('mergeMapCellProgress keeps prior audited coverage when current is unseen', () => {
  assert.equal(mergeMapCellProgress('audited-clean', 'unseen'), 'audited-clean');
  assert.equal(mergeMapCellProgress('audited-major', 'scored'), 'audited-major');
  assert.equal(mergeMapCellProgress('unseen', 'pending-ai'), 'pending-ai');
});

test('mergeAccumulatedRulesetMatrix preserves prior fragment labels across rebuild', () => {
  const rulesets = [{ id: 'rs1' }, { id: 'rs2' }];
  const priorFrags = [{ col: 0, label: 'lrn', urls: ['http://x/a'] }];
  const prior = [['audited-clean'], ['pending-ai']];
  const nextFrags = [{ col: 0, label: 'lrn', urls: ['http://x/a'] }];
  const next = [['unseen'], ['unseen']];
  const merged = mergeAccumulatedRulesetMatrix(prior, priorFrags, nextFrags, rulesets, next);
  assert.equal(merged[0][0], 'audited-clean');
  assert.equal(merged[1][0], 'pending-ai');
});

test('mergeRulesetMatricesWithPrior merges by ruleset id and page URL', () => {
  const priorModel = {
    rulesets: [{ id: 'rs-det' }],
    pageFragments: [{ col: 0, label: 'a', urls: ['http://x/one'] }],
    rulesetMatrix: [['audited-major']],
  };
  const rulesets = [{ id: 'rs-det' }];
  const frags = [{ col: 0, label: 'b', urls: ['http://x/one'] }];
  const current = [['unseen']];
  const merged = mergeRulesetMatricesWithPrior(priorModel, rulesets, frags, current);
  assert.equal(merged[0][0], 'audited-major');
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

test('formatRulesetDefectCell AI ruleset pending before aiAuditComplete', () => {
  const cell = formatRulesetDefectCell(
    { lane: 'ai', label: 'premium', ruleIds: ['AI.PREMIUM.ENTERPRISE_FEEL'] },
    [],
    THR,
    { aiAuditComplete: false },
  );
  assert.equal(cell, ' ○');
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
  const layout = computeDefragMapLayout(mapModel, { innerWidth: 72 });
  const gateRegion = (line) => stripAnsi(line).slice(-layout.gateStripW);
  const gateFillCount = (line) => (gateRegion(line).match(/█/g) || []).length;
  const header = lines.find((l) => stripAnsi(l).includes('pg '));
  assert.ok(header);
  assert.ok(stripAnsi(header).includes('bug'));
  assert.ok(gateFillCount(header) > 0, 'header should render sitewide gate strip');
  const dataRows = lines.filter((l) => stripAnsi(l).includes('conversion') || stripAnsi(l).includes('layout'));
  assert.equal(dataRows.length, 2);
  const gateSegs = buildRulesetGateSegmentRows(rulesets, {
    pages: [
      {
        url: 'http://127.0.0.1/p',
        findings: [{ ruleId: 'DET.A', severity: 'warn', area: 'conversion' }],
      },
    ],
  }, THR);
  const mapWithGate = {
    ...mapModel,
    rulesetGateSegmentRows: gateSegs,
    scoringInFlight: false,
    auditInFlight: false,
  };
  const linesWithGate = renderDefragMapLines(mapWithGate, { innerWidth: 72, useColor: false });
  const dataRowsWithGate = linesWithGate.filter(
    (l) => stripAnsi(l).includes('conversion') || stripAnsi(l).includes('layout'),
  );
  assert.equal(dataRowsWithGate.length, 2);
  for (const row of dataRowsWithGate) {
    assert.ok(
      gateFillCount(row) >= 0,
      `each ruleset row should render a gate strip: ${gateRegion(row)}`,
    );
  }
});

test('buildRulesetDefectColumns counts findings per ruleset only', () => {
  const rulesets = [
    { id: 'a11y', lane: 'deterministic', label: 'accessibility', ruleIds: ['DET.A11Y.01'] },
    { id: 'conv', lane: 'deterministic', label: 'conversion', ruleIds: ['DET.CONV.01'] },
  ];
  const audit = {
    pages: [
      {
        url: 'http://127.0.0.1/p',
        findings: [
          { ruleId: 'DET.A11Y.01', severity: 'warn', area: 'accessibility' },
          { ruleId: 'DET.A11Y.01', severity: 'warn', area: 'accessibility' },
        ],
      },
    ],
  };
  const cols = buildRulesetDefectColumns(rulesets, audit, THR);
  assert.ok(cols[0].cell.includes('W'), cols[0].cell);
  assert.equal(cols[1].cell.trim(), '-', cols[1].cell);
});

test('computeRulesetFragmentMatrix shows issue only on matching ruleset row', () => {
  const rulesets = [
    { id: 'a11y', lane: 'deterministic', label: 'accessibility', ruleIds: ['DET.A11Y.01'] },
    { id: 'conv', lane: 'deterministic', label: 'conversion', ruleIds: ['DET.CONV.01'] },
  ];
  const pageSets = [{ url: 'http://127.0.0.1/p' }];
  const pages = [
    {
      url: 'http://127.0.0.1/p',
      findings: [{ ruleId: 'DET.A11Y.01', severity: 'warn', area: 'accessibility' }],
      ruleExecution: {
        deterministic: [
          { ruleId: 'DET.A11Y.01', status: 'ran' },
          { ruleId: 'DET.CONV.01', status: 'ran' },
        ],
      },
    },
  ];
  const ctx = {
    phase: 'auditor',
    auditInFlight: false,
    auditedUrls: new Set(['http://127.0.0.1/p']),
  };
  const pageMatrix = computeRulesetPageMatrix(pageSets, rulesets, pages, THR, ctx);
  const frags = [{ col: 0, label: 'p1', urls: ['http://127.0.0.1/p'] }];
  const fragMatrix = computeRulesetFragmentMatrix(frags, pageSets, pageMatrix);
  assert.equal(fragMatrix[0][0], 'audited-minor');
  assert.equal(fragMatrix[1][0], 'audited-clean');
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

test('buildRulesetGroups app domain splits DET.APP', async () => {
  const registry = await loadDesignRuleRegistry();
  const groups = buildRulesetGroups(registry, { rulesetDomain: 'app' });
  const appRow = groups.deterministic.find((g) => g.id === 'ruleset:det:app');
  assert.ok(appRow, 'expected ruleset:det:app');
  assert.ok(appRow.ruleIds.includes('DET.APP.PRIMARY_STATE'));
  const shared = groups.deterministic.find((g) => g.id === 'ruleset:det:shared');
  assert.ok(shared);
  assert.ok(shared.ruleIds.includes('DET.LANDMARKS.REQUIRED'));
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
    assert.ok(/\x1b\[48;5;236m/.test(joined) || /\x1b\[38;5;240m/.test(joined), 'unseen dark');
    assert.ok(/\x1b\[48;5;238m/.test(joined) || /\x1b\[38;5;252m/.test(joined), 'scored light');
    assert.ok(/\x1b\[38;5;(39|45)m/.test(joined), 'overlay dash blue');
    assert.ok(/\x1b\[48;5;22m/.test(joined) || /\x1b\[32m/.test(joined), 'audited green');
    assert.ok(/\x1b\[38;5;196m/.test(joined) || /\x1b\[31m/.test(joined), 'Maj+ red');
    assert.ok(/\x1b\[38;5;214m/.test(joined) || /\x1b\[33m/.test(joined), 'min/warn amber');
    assert.ok(/\x1b\[38;5;28m/.test(joined) || /\x1b\[32m/.test(joined), 'fixed green');
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
    assert.ok(rowOk.includes('\x1b[48;5;22m') || rowOk.includes('\x1b[32m'), 'boxed legend keeps green ok swatch');
    assert.ok(rowMj.includes('\x1b[38;5;196m') || rowMj.includes('\x1b[31m'), 'boxed legend keeps red Maj+ swatch');
  } finally {
    if (prevNoColor === undefined) delete process.env.NO_COLOR;
    else process.env.NO_COLOR = prevNoColor;
  }
});

test('renderMapStatusLegendLines bug note is readable when clipped', () => {
  const note = renderMapStatusLegendLines({ useColor: false })[2];
  assert.ok(note.startsWith(' bug:'));
  assert.ok(note.includes('per-ruleset'));
  assert.ok(note.includes('per-row gate') || note.includes('LOOP-WATCH'));
  assert.ok(note.includes('rotate'));
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

test('classifyRulesetPageCell AI lane is pending-ai before post-clean AI audit', () => {
  const rs = { lane: 'ai', label: 'ambient', ruleIds: ['AI.AMBIENT.01'] };
  const page = { url: 'http://x/a', findings: [], ruleExecution: { deterministic: [] } };
  const st = classifyRulesetPageCell(
    { phase: 'auditor_begin', auditInFlight: true, aiAuditComplete: false },
    rs,
    'http://x/a',
    page,
    THR,
  );
  assert.equal(st, 'pending-ai');
});

test('classifyRulesetPageCell AI lane ignores DET findings until AI batch runs', () => {
  const rs = { lane: 'ai', label: 'ambient', ruleIds: ['AI.AMBIENT.01'] };
  const page = {
    url: 'http://x/maintainers.html',
    findings: [{ ruleId: 'DET.A11Y.01', severity: 'major', area: 'accessibility' }],
    ruleExecution: { deterministic: [{ ruleId: 'DET.A11Y.01', status: 'ran' }] },
  };
  const st = classifyRulesetPageCell(
    { phase: 'remediation_agent', aiAuditedUrls: new Set() },
    rs,
    'http://x/maintainers.html',
    page,
    THR,
  );
  assert.equal(st, 'pending-ai');
});

test('mergeMapCellProgress downgrades false AI audited-major to pending-ai', () => {
  assert.equal(
    mergeMapCellProgress('audited-major', 'pending-ai', { aiLane: true, urlAiDone: false }),
    'pending-ai',
  );
});

test('classifyRulesetPageCell AI lane is audited-clean when URL completed AI batch', () => {
  const rs = { lane: 'ai', label: 'ambient', ruleIds: ['AI.AMBIENT.01'] };
  const page = { url: 'http://x/a', findings: [], ruleExecution: { deterministic: [] } };
  const st = classifyRulesetPageCell(
    {
      phase: 'ai_audit_done',
      aiAuditComplete: true,
      aiAuditedUrls: new Set(['http://x/a']),
    },
    rs,
    'http://x/a',
    page,
    THR,
  );
  assert.equal(st, 'audited-clean');
});

test('formatRulesetDefectCell AI shows pending marker when audit incomplete', () => {
  const cell = formatRulesetDefectCell({ lane: 'ai', label: 'ambient', ruleIds: [] }, [], THR, {
    aiAuditComplete: false,
  });
  assert.equal(cell.trim(), '○');
});

test('mergeAccumulatedRulesetMatrix keeps prior audited cells when new pass is unseen', () => {
  const rulesets = [{ id: 'det-a', label: 'accessibility' }];
  const priorFrags = [{ col: 0, label: 'dsg1', urls: ['http://x/a'] }];
  const frags = [{ col: 0, label: 'dsg1', urls: ['http://x/a'] }];
  const prior = [['audited-clean']];
  const next = [['unseen']];
  const merged = mergeAccumulatedRulesetMatrix(prior, priorFrags, frags, rulesets, next);
  assert.equal(merged[0][0], 'audited-clean');
});

test('mergeCellStatuses prefers higher-rank coverage', () => {
  assert.equal(mergeCellStatuses('unseen', 'audited-clean'), 'audited-clean');
  assert.equal(mergeCellStatuses('audited-major', 'pending-ai'), 'audited-major');
});

test('isAiAuditPhaseComplete recognizes ai_audit_done', () => {
  assert.equal(isAiAuditPhaseComplete('ai_audit_done'), true);
  assert.equal(isAiAuditPhaseComplete('auditor_begin'), false);
});

test('mapCellChar rotates dash glyphs for in-flight statuses', () => {
  const a = mapCellChar('auditing', 0)[0];
  const b = mapCellChar('auditing', 1)[0];
  assert.notEqual(a, b);
  assert.equal(mapCellChar('scoring', 2)[0], mapCellChar('scoring', 6)[0]);
  assert.equal(mapCellChar('auditing-dim', 3)[0], mapCellChar('auditing-dim', 7)[0]);
});

test('classifyRulesetPageCell marks only active rule auditing on in-flight page', () => {
  const rs = { id: 'rs-a11y', lane: 'deterministic', label: 'accessibility', ruleIds: ['DET.A', 'DET.B'] };
  const page = {
    url: 'http://x/a',
    findings: [],
    ruleExecution: { deterministic: [{ ruleId: 'DET.A', status: 'ran' }] },
  };
  const ctx = {
    activeUrl: 'http://x/a',
    activeRuleId: 'DET.B',
    auditInFlight: true,
    auditMapActive: true,
    scoredUrls: new Set(['http://x/a']),
    auditedUrls: new Set(['http://x/a']),
    rulesets: [rs, { id: 'rs-read', lane: 'deterministic', label: 'readability', ruleIds: ['DET.READ.01'] }],
  };
  assert.equal(classifyRulesetPageCell(ctx, rs, 'http://x/a', page, THR), 'scored');
  assert.equal(resolveMapCellOverlay(ctx, rs, 'http://x/a', page), 'auditing');
  assert.equal(
    classifyRulesetPageCell({ ...ctx, activeRuleId: 'DET.A' }, rs, 'http://x/a', page, THR),
    'scored',
  );
  assert.equal(
    resolveMapCellOverlay({ ...ctx, activeRuleId: 'DET.A' }, rs, 'http://x/a', page),
    'auditing',
  );
  const ctxDone = { ...ctx, activeRuleId: 'DET.B', activeUrl: 'http://x/other' };
  assert.equal(classifyRulesetPageCell(ctxDone, rs, 'http://x/a', page, THR), 'audited-clean');
  const rsOther = { id: 'rs-read', lane: 'deterministic', label: 'readability', ruleIds: ['DET.READ.01'] };
  assert.equal(
    classifyRulesetPageCell({ ...ctx, activeRuleId: 'DET.B' }, rsOther, 'http://x/a', page, THR),
    'scored',
  );
  assert.equal(resolveMapCellOverlay({ ...ctx, activeRuleId: 'DET.B' }, rsOther, 'http://x/a', page), null);
});

test('classifyRulesetPageCell uses gray scored during scorer even for prior-audited URLs', () => {
  const rs = { id: 'rs1', lane: 'deterministic', label: 'conversion', ruleIds: ['DET.X'] };
  const page = {
    url: 'http://x/p',
    findings: [],
    ruleExecution: { deterministic: [{ ruleId: 'DET.X', status: 'ran' }] },
  };
  const ctx = {
    scoringInFlight: true,
    auditMapActive: false,
    scoredUrls: new Set(['http://x/p']),
    auditedUrls: new Set(['http://x/p']),
    auditInFlight: false,
  };
  assert.equal(classifyRulesetPageCell(ctx, rs, 'http://x/p', page, THR), 'scored');
});

test('mergeMapCellProgress downgrades prior audited-clean while scorer runs', () => {
  assert.equal(
    mergeMapCellProgress('audited-clean', 'scored', { scoringInFlight: true }),
    'scored',
  );
  assert.equal(
    mergeMapCellProgress('audited-major', 'unseen', { scoringInFlight: true }),
    'unseen',
  );
});

test('classifyRulesetPageCell does not mark every ruleset scoring on active page', () => {
  const rulesets = [
    { id: 'rs-a', lane: 'deterministic', label: 'accessibility', ruleIds: ['DET.A'] },
    { id: 'rs-b', lane: 'deterministic', label: 'conversion', ruleIds: ['DET.B'] },
    { id: 'rs-c', lane: 'deterministic', label: 'layout', ruleIds: ['DET.C'] },
  ];
  const page = {
    url: 'http://x/a',
    findings: [],
    ruleExecution: { deterministic: [] },
  };
  const ctx = {
    activeUrl: 'http://x/a',
    activeRuleId: 'DET.B',
    auditInFlight: true,
    auditMapActive: true,
    scoredUrls: new Set(['http://x/a']),
    rulesets,
  };
  const statuses = rulesets.map((rs) => classifyRulesetPageCell(ctx, rs, 'http://x/a', page, THR));
  const overlays = rulesets.map((rs) => resolveMapCellOverlay(ctx, rs, 'http://x/a', page));
  assert.deepEqual(statuses, ['scored', 'scored', 'scored']);
  assert.deepEqual(overlays, [null, 'auditing', null]);
});

test('classifyRulesetPageCell AI lane animates only the active ruleset row', () => {
  const rulesets = [
    { id: 'rs-ai-a', lane: 'ai', label: 'premium', ruleIds: ['AI.PREMIUM.01'] },
    { id: 'rs-ai-b', lane: 'ai', label: 'ambient', ruleIds: ['AI.AMBIENT.01'] },
  ];
  const page = { url: 'http://x/a', findings: [], ruleExecution: { deterministic: [] } };
  const ctx = {
    activeUrl: 'http://x/a',
    activeRuleId: 'AI.AMBIENT.01',
    aiAuditInFlight: true,
    rulesets,
    defaultAiRulesetId: 'rs-ai-a',
  };
  assert.equal(classifyRulesetPageCell(ctx, rulesets[0], 'http://x/a', page, THR), 'pending-ai');
  assert.equal(classifyRulesetPageCell(ctx, rulesets[1], 'http://x/a', page, THR), 'pending-ai');
  assert.equal(resolveMapCellOverlay(ctx, rulesets[1], 'http://x/a', page), 'auditing');
  assert.ok(isCtxActiveRuleset(ctx, rulesets[1]));
});

test('computeRulesetFragmentMatrix keeps one in-flight cell on active fragment', () => {
  const rulesets = [
    { id: 'rs-a', lane: 'deterministic', label: 'accessibility', ruleIds: ['DET.A'] },
    { id: 'rs-b', lane: 'deterministic', label: 'conversion', ruleIds: ['DET.B'] },
  ];
  const pageSets = [{ url: 'http://x/a' }];
  const pages = [
    {
      url: 'http://x/a',
      findings: [],
      ruleExecution: { deterministic: [] },
    },
  ];
  const ctx = {
    activeUrl: 'http://x/a',
    activeRuleId: 'DET.B',
    auditInFlight: true,
    auditMapActive: true,
    scoredUrls: new Set(['http://x/a']),
    rulesets,
  };
  const pageMatrix = computeRulesetPageMatrix(pageSets, rulesets, pages, THR, ctx);
  const frags = [{ col: 0, label: 'p1', urls: ['http://x/a'] }];
  const fragMatrix = computeRulesetFragmentMatrix(frags, pageSets, pageMatrix, ctx, rulesets);
  const inFlight = fragMatrix.flat().filter((s) => s === 'auditing' || s === 'scoring');
  assert.equal(inFlight.length, 0);
  assert.equal(fragMatrix[1][0], 'scored');
  assert.equal(resolveMapCellOverlay(ctx, rulesets[1], 'http://x/a', pages[0]), 'auditing');
});

test('buildLoopWatchProgressMap returns matrix during ai_audit phase', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-map-'));
  try {
    fs.writeFileSync(
      path.join(outDir, 'audit-data.json'),
      `${JSON.stringify({
        pages: [
          {
            url: 'http://127.0.0.1:40777/docs/a.html',
            findings: [],
            ruleExecution: { deterministic: [{ ruleId: 'DET.A11Y.01', status: 'ran' }] },
          },
        ],
      })}\n`,
    );
    const state = { phase: 'ai_audit_begin', crawl: { pages: '1/500', label: '[ux-audit]' } };
    const model = buildLoopWatchProgressMap(outDir, state, JSON.parse(fs.readFileSync(path.join(outDir, 'audit-data.json'), 'utf8')), {
      tick: 3,
    });
    assert.ok(model.matrix?.length > 0);
    assert.ok(model.pageFragments?.length > 0);
    assert.ok(model.activeRulesetId !== undefined);
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});

test('buildRulesetDefectColumns shows per-ruleset counts from live pages', () => {
  const registry = loadDesignRuleRegistry();
  const groups = buildRulesetGroups(registry);
  const acc = groups.all.find((g) => g.label === 'accessibility' || g.id === 'accessibility');
  if (!acc) return;
  const pages = [
    {
      url: 'http://x/a',
      findings: [{ ruleId: 'DET.A11Y.01', severity: 'warn', area: 'accessibility' }],
      ruleExecution: {},
    },
  ];
  const cols = buildRulesetDefectColumns(groups.all, { pages }, THR, { aiAuditComplete: true });
  const accCol = cols.find((c) => c.id === acc.id);
  assert.ok(accCol);
  assert.match(accCol.cell, /W\d|warn/i);
});
