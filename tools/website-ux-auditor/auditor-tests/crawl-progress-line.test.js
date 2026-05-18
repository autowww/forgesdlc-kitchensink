import assert from 'node:assert/strict';
import test from 'node:test';

import {
  estimateRemainingPagesHeuristic,
  fixedLeft,
  fixedRightTruncate,
  formatElapsedMs,
  formatEtaMs,
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
