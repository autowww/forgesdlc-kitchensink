import assert from 'node:assert/strict';
import test from 'node:test';

import {
  COL,
  ETA_BLOCK_LEN,
  estimateRemainingPagesHeuristic,
  fixedLeft,
  fixedRightTruncate,
  formatElapsedMs,
  formatEtaMs,
  stripCrawlProgressLineForWatchDisplay,
  stripLooseCrawlTimingForWatch,
} from '../lib/crawl-progress-line.js';

test('fixedLeft width', () => {
  assert.equal(fixedLeft('ab', 5), 'ab   ');
  assert.equal(fixedLeft('hello world', 5), 'hello');
});

test('fixedRightTruncate', () => {
  assert.equal(fixedRightTruncate('short', 8), 'short   ');
  assert.ok(fixedRightTruncate('abcdefghijklmnop', 8).startsWith('…'));
});

test('formatEtaMs', () => {
  assert.equal(formatEtaMs(500), '1s');
  assert.equal(formatEtaMs(59000), '59s');
  assert.equal(formatEtaMs(60000), '1m');
  assert.equal(formatEtaMs(62000), '1m2s');
  assert.equal(formatEtaMs(NaN), 'N/A');
});

test('formatElapsedMs floors like display clock', () => {
  assert.equal(formatElapsedMs(500), '0s');
  assert.equal(formatElapsedMs(1500), '1s');
});

test('estimateRemainingPagesHeuristic', () => {
  assert.equal(estimateRemainingPagesHeuristic({ completed: 0, queueLen: 5, maxPages: 10 }), 6);
  assert.equal(estimateRemainingPagesHeuristic({ completed: 9, queueLen: 5, maxPages: 10 }), 1);
  assert.equal(estimateRemainingPagesHeuristic({ completed: 10, queueLen: 3, maxPages: 10 }), 0);
  assert.equal(estimateRemainingPagesHeuristic({ completed: 3, queueLen: 0, maxPages: 10 }), 2);
  assert.equal(estimateRemainingPagesHeuristic({ completed: 0, queueLen: 0, maxPages: 10 }), 1);
});

test('stripCrawlProgressLineForWatchDisplay removes clock and ETA from grid row', () => {
  const row = [
    fixedLeft('[ux-audit]', COL.LABEL),
    fixedLeft('2', COL.RUN),
    fixedLeft('10s/~2m', COL.CLOCK),
    fixedLeft('3/120', COL.PAGES),
    fixedLeft('q44', COL.QUEUE),
    fixedLeft('1s/30s/—', ETA_BLOCK_LEN),
    '/docs/foo.html',
  ].join(' ');
  const stamped = `2099-01-01T00:00:00.000Z\t${row}`;
  const out = stripCrawlProgressLineForWatchDisplay(stamped);
  assert.ok(!out.includes('10s'));
  assert.ok(!out.includes('30s'));
  assert.ok(out.includes('3/120'));
  assert.ok(out.includes('/docs/foo.html'));
});

test('stripLooseCrawlTimingForWatch strips unpadded grid clock + ETA triple', () => {
  const raw = '[ux-score] 1 6s/~4m42s 5/500 q219 -/4m36s/-';
  const out = stripLooseCrawlTimingForWatch(raw);
  assert.ok(!out.includes('6s'));
  assert.ok(!out.includes('4m36s'));
  assert.ok(out.includes('5/500'));
  assert.ok(out.includes('[ux-score]'));
});

test('stripCrawlProgressLineForWatchDisplay uses loose strip when fixed layout missing', () => {
  assert.ok(!stripCrawlProgressLineForWatchDisplay('[ux-score] 1 9s/~1m 2/10 q3 -/-/—').includes('9s'));
});
