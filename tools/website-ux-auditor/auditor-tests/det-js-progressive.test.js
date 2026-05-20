import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildEnabledProgressiveSnapshot,
  findingsFromJsProgressiveReport,
  MIN_ENABLED_MAIN_WORDS,
  MIN_NOJS_MAIN_WORDS,
  run,
} from '../design-rules/deterministic/generated/det-js-progressive.check.js';

test('buildEnabledProgressiveSnapshot maps crawl metrics', () => {
  const snap = buildEnabledProgressiveSnapshot({
    wordCount: 420,
    h1Count: 1,
    links: [{}, {}, {}],
  });
  assert.equal(snap.mainWordCount, 420);
  assert.equal(snap.h1Count, 1);
  assert.equal(snap.mainLinkCount, 3);
});

test('findingsFromJsProgressiveReport flags critical text collapse without JS', () => {
  const findings = findingsFromJsProgressiveReport({
    enabled: { mainWordCount: 320, h1Count: 1, mainLinkCount: 12 },
    disabled: { mainWordCount: 8, h1Count: 0, mainLinkCount: 0, noscriptWordCount: 0 },
  }, 'https://example.test/page');
  assert.ok(findings.some((f) => f.message.includes('not available when JavaScript is disabled')));
  assert.ok(findings.some((f) => f.message.includes('primary in-main headline')));
  assert.ok(findings.every((f) => f.evidence.includes('url=https://example.test/page')));
  assert.equal(findings[0].area, 'interaction');
});

test('findingsFromJsProgressiveReport passes when no-JS retains enough copy', () => {
  const enabledWords = MIN_ENABLED_MAIN_WORDS + 80;
  const disabledWords = Math.ceil(enabledWords * 0.55);
  const findings = findingsFromJsProgressiveReport({
    enabled: { mainWordCount: enabledWords, h1Count: 1, mainLinkCount: 6 },
    disabled: {
      mainWordCount: disabledWords,
      h1Count: 1,
      mainLinkCount: 4,
      noscriptWordCount: 0,
    },
  });
  assert.deepEqual(findings, []);
});

test('findingsFromJsProgressiveReport skips thin enabled pages', () => {
  const findings = findingsFromJsProgressiveReport({
    enabled: { mainWordCount: MIN_ENABLED_MAIN_WORDS - 10, h1Count: 0, mainLinkCount: 0 },
    disabled: { mainWordCount: 0, h1Count: 0, mainLinkCount: 0, noscriptWordCount: 0 },
  });
  assert.deepEqual(findings, []);
});

test('findingsFromJsProgressiveReport credits noscript fallback words', () => {
  const findings = findingsFromJsProgressiveReport({
    enabled: { mainWordCount: 240, h1Count: 1, mainLinkCount: 4 },
    disabled: {
      mainWordCount: 10,
      h1Count: 1,
      mainLinkCount: 0,
      noscriptWordCount: MIN_NOJS_MAIN_WORDS + 20,
    },
  });
  assert.deepEqual(findings, []);
});

test('run returns empty when no report or disabled snapshot', async () => {
  const empty = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(empty, []);

  const skipped = await run({
    metrics: {
      jsProgressiveReport: {
        enabled: { mainWordCount: 200, h1Count: 1 },
        disabled: null,
        skippedReason: 'timeout',
      },
    },
    url: 'https://example.test/',
  });
  assert.deepEqual(skipped, []);
});

test('run uses metrics.jsProgressiveReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/docs/',
      jsProgressiveReport: {
        enabled: { mainWordCount: 400, h1Count: 1, mainLinkCount: 8 },
        disabled: { mainWordCount: 6, h1Count: 0, mainLinkCount: 0, noscriptWordCount: 0 },
      },
    },
    url: 'https://example.test/docs/',
  });
  assert.ok(findings.length >= 1);
  assert.ok(findings[0].message.includes('JavaScript is disabled'));
});
