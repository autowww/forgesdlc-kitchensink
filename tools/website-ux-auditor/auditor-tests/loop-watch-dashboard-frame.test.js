import assert from 'node:assert/strict';
import test from 'node:test';

import {
  clipPad,
  boxEdgeLine,
  boxRow,
  buildWatchFrameLines,
  formatWatchNowLine,
  formatWatchRunLine,
  isWatchMajorMilestoneLine,
  partitionWatchActivityTail,
  stripDashboardLogDisplayLine,
} from '../lib/loop-watch-dashboard-frame.js';
import { stripAnsi } from '../lib/terminal-ansi.js';
import { renderProgressBarLines } from '../lib/loop-watch-ansi-bars.js';

test('clipPad truncates long strings', () => {
  assert.equal(clipPad('hi', 4), 'hi  ');
  assert.equal(clipPad('hello world', 8).startsWith('hello'), true);
  assert.ok(clipPad('hello world', 8).includes('…'));
});

test('clipPad ignores ANSI when measuring width', () => {
  const colored = `\x1b[32m${'Pages'.padEnd(40, '█')}\x1b[0m`;
  const clipped = clipPad(colored, 12);
  assert.equal(clipped.length, 12);
  assert.ok(clipped.startsWith('Pages'));
});

test('boxEdgeLine top length matches cols', () => {
  const line = boxEdgeLine(60, 'Title', 'top');
  assert.equal(line.length, 60);
  assert.ok(line.startsWith('┌'));
  assert.ok(line.endsWith('┐'));
});

test('buildWatchFrameLines stable pane labels', () => {
  const state = {
    phase: 'auditor_main',
    updatedAt: '2026-01-01T00:00:00.000Z',
    qualityGate: {
      counts: { blocker: 0, critical: 0, major: 0, warn: 2, minor: 1, trivial: 0, cosmetic: 0 },
      thresholds: { blocker: 0, critical: 0, major: 0, warn: 5, minor: 10, trivial: 15, cosmetic: 100 },
    },
    crawl: {
      label: '[ux-audit]',
      runDisplay: '2',
      elapsedClock: '10s/~2m',
      pages: '3/120',
      queueLen: 44,
      etaTriple: '1s/30s/—',
      crawlPhase: 'page',
      severityCounts: { blocker: 0, critical: 0, major: 1, warn: 2, minor: 1, trivial: 0, cosmetic: 0 },
      phaseDetail: '/docs/foo.html',
    },
  };
  const lines = buildWatchFrameLines(
    120,
    state,
    [
      '[2026-01-01T00:00:00Z] phase=scorer_begin',
      '[2026-01-01T00:00:01Z] [ux-audit] phase=run · x=1',
      '[2026-01-01T00:00:02Z] [ux-audit] phase=diag · crawl=1',
      '[2026-01-01T00:00:03Z] [ux-audit] phase=diag · crawl=2',
      '[2026-01-01T00:00:04Z] [ux-audit] phase=diag · crawl=3',
    ],
    [
      '2026-01-01T00:00:00Z\t[ux-audit] crawl detail url=/docs/foo.html',
    ],
    {
      websiteRepo: '/repo',
      siteUrl: 'http://127.0.0.1/',
      outDir: '/out',
      scoreOverall: '91',
      deltaVerbal: 'overall +1',
      campaignElapsedSec: 12,
      campaignStatsLines: [
        ' Scored 10/100  │  Audited 3/120  │  Bugs found 0',
        ' Gate FAIL  W2/5',
      ],
    },
  );
  assert.ok(lines.length > 12);
  assert.ok(lines.some((l) => l.includes('Forge UX loop watch')));
  assert.ok(lines.some((l) => l.includes('Auditor crawl')));
  assert.ok(lines.some((l) => l.includes('[ux-audit]')));
  assert.ok(lines.some((l) => stripAnsi(l).includes('█')));
  assert.ok(lines.some((l) => l.includes('Scored 10/100')));
  assert.ok(lines.some((l) => l.includes('Gate FAIL')));
  assert.ok(lines.some((l) => l.includes('Now     : Analyzing')));
  assert.ok(lines.some((l) => l.includes('/docs/foo.html')));
  assert.ok(lines.some((l) => l.includes('Log · milestones')));
  assert.ok(lines.some((l) => l.includes('Log · recent crawl')));
  assert.ok(lines.some((l) => l.includes('Process :') && l.includes('Gate B0/0')));
  assert.ok(!lines.some((l) => l.includes('Run     :') && l.includes('Gate ')));
  assert.ok(!lines.some((l) => l.startsWith('│ Scores  :')));
  const progressLines = renderProgressBarLines(
    {
      barWidth: 20,
      runs: { iteration: 1, expectedIterations: 3, maxIterations: 20, cycleLights: 'Sar', complete: false, expectedIterationsNote: 'est' },
      pages: { budget: 10, captured: 2, clean: 1, issues: 1, error: 0, unvisited: 8, cells: ['clean', 'issues', 'unvisited', 'unvisited'], complete: false, queuedRemaining: 5 },
      gate: {
        pass: false,
        complete: false,
        segments: [
          { id: 'blocker', count: 0, threshold: 0, status: 'ok' },
          { id: 'critical', count: 0, threshold: 0, status: 'ok' },
          { id: 'major', count: 1, threshold: 0, status: 'over' },
          { id: 'warn', count: 0, threshold: 5, status: 'ok' },
          { id: 'minor', count: 0, threshold: 10, status: 'ok' },
          { id: 'trivial', count: 0, threshold: 15, status: 'ok' },
          { id: 'cosmetic', count: 0, threshold: 100, status: 'ok' },
        ],
      },
      rules: { pagesVisited: 2, pagesFull: 1, pagesPartial: 1, pagesError: 0, implementedCount: 2, cells: ['full', 'partial'], complete: false, missingRules: [] },
    },
    { useColor: false },
  );
  const frameWithProgress = buildWatchFrameLines(80, state, [], [], { progressLines, websiteRepo: '/r', siteUrl: 'http://x/', outDir: '/o' });
  assert.ok(frameWithProgress.some((l) => stripAnsi(l).includes('Runs')));
  assert.ok(frameWithProgress.some((l) => stripAnsi(l).includes('Pages')));
  assert.ok(!lines.some((l) => l.includes('Run     :') && l.includes('/docs/foo.html')));
  assert.ok(lines.every((l) => stripAnsi(l).length <= 120));
});

test('formatWatchNowLine shows current page URL during crawl', () => {
  const line = formatWatchNowLine(
    { crawlPhase: 'page', phaseDetail: '/docs/foo.html', pages: '3/120', queueLen: 4 },
    'auditor_main',
  );
  assert.ok(line.includes('Analyzing'));
  assert.ok(line.includes('/docs/foo.html'));
  assert.ok(line.includes('3/120'));
});

test('buildWatchFrameLines uses glyph header without legacy Scores row', () => {
  const state = { phase: 'auditor_main', crawl: {} };
  const lines = buildWatchFrameLines(100, state, [], [], {
    websiteRepo: '/r',
    siteUrl: 'http://x/',
    outDir: '/o',
    scoreOverall: '',
    deltaVerbal: '   ',
    campaignElapsedSec: 1,
  });
  assert.ok(!lines.some((l) => l.includes('Scores  :')));
  assert.ok(lines.some((l) => l.includes('Repo : /r')));
  const plain = lines.map(stripAnsi).join('\n');
  assert.ok(!plain.includes('0,0'));
});

test('formatWatchRunLine uses AI-audit summary when dashboard phase is ai_audit', () => {
  const line = formatWatchRunLine(
    { pages: '80/500', severityCounts: { blocker: 0, critical: 0, major: 0, warn: 0, minor: 0, trivial: 0, cosmetic: 0 } },
    'ai_audit',
  );
  assert.ok(line.includes('AI audit'));
  assert.ok(line.includes('crawl finished'));
  assert.ok(line.includes('pg 80/500'));
});

test('partitionWatchActivityTail: last three non-major lines after last milestone', () => {
  const tail = [
    '[t0] phase=loop_start',
    '[t1] [ux-audit] phase=run · id=1',
    '[t2] [ux-audit] phase=main_crawl · maxPages=10',
    '[t3] [ux-audit] phase=diag · a=1',
    '[t4] [ux-audit] phase=diag · a=2',
    '[t5] [ux-audit] phase=diag · a=3',
    '[t6] [ux-audit] phase=diag · a=4',
  ];
  const { historyLines, liveLines } = partitionWatchActivityTail(tail);
  assert.equal(liveLines.length, 3);
  assert.ok(liveLines.every((l) => l.includes('diag')));
  assert.ok(liveLines[2].includes('a=4'));
  assert.ok(historyLines.some((l) => l.includes('main_crawl')));
});

test('isWatchMajorMilestoneLine matches stamped shell phase line', () => {
  assert.equal(isWatchMajorMilestoneLine('[2026-05-19T04:00:00Z] phase=auditor_begin'), true);
  assert.equal(isWatchMajorMilestoneLine('phase=auditor_begin'), true);
  assert.equal(isWatchMajorMilestoneLine('[ux-score] 1 6s/~4m42s 5/500 q219 -/4m36s/-'), false);
  assert.equal(isWatchMajorMilestoneLine('[2026-05-19T04:00:00Z] [ux-audit] phase=diag · x'), false);
});

test('stripDashboardLogDisplayLine removes legacy ISO prefix', () => {
  assert.equal(
    stripDashboardLogDisplayLine('[2026-05-19T04:00:00Z] phase=auditor_begin'),
    'phase=auditor_begin',
  );
});

test('boxRow clips to cols', () => {
  const row = boxRow(40, 'x'.repeat(100));
  assert.equal(row.length, 40);
  assert.ok(row.startsWith('│'));
  assert.ok(row.endsWith('│'));
});
