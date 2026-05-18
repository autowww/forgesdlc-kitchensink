import assert from 'node:assert/strict';
import test from 'node:test';

import {
  clipPad,
  boxEdgeLine,
  boxRow,
  buildWatchFrameLines,
} from '../lib/loop-watch-dashboard-frame.js';

test('clipPad truncates long strings', () => {
  assert.equal(clipPad('hi', 4), 'hi  ');
  assert.equal(clipPad('hello world', 8).startsWith('hello'), true);
  assert.ok(clipPad('hello world', 8).includes('…'));
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
    crawl: {
      label: '[ux-audit]',
      runDisplay: '2',
      elapsedClock: '10s/~2m',
      pages: '3/120',
      queueLen: 44,
      etaTriple: '1s/30s/—',
      phaseDetail: '/docs/foo.html',
    },
  };
  const lines = buildWatchFrameLines(
    72,
    state,
    ['line-one', 'line-two'],
    {
      websiteRepo: '/repo',
      siteUrl: 'http://127.0.0.1/',
      outDir: '/out',
      scoreOverall: '91',
      deltaVerbal: 'overall +1',
    },
  );
  assert.ok(lines.length > 12);
  assert.ok(lines.some((l) => l.includes('Forge UX loop watch')));
  assert.ok(lines.some((l) => l.includes('auditor_main')));
  assert.ok(lines.some((l) => l.includes('[ux-audit]')));
  assert.ok(lines.every((l) => l.length <= 72));
});

test('boxRow clips to cols', () => {
  const row = boxRow(40, 'x'.repeat(100));
  assert.equal(row.length, 40);
  assert.ok(row.startsWith('│'));
  assert.ok(row.endsWith('│'));
});
