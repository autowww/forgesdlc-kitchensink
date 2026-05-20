import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MAX_CARD_LIST_ITEMS,
  MAX_PARAGRAPH_WORDS,
  MAX_PROSE_LIST_ITEMS,
  findingsFromListLengthReport,
  findingsFromLongParagraphs,
  findingsFromProseLengthMetrics,
  longParagraphViolations,
  run,
} from '../design-rules/deterministic/generated/det-prose-length.check.js';

test('MAX constants match forge enterprise prose budgets', () => {
  assert.equal(MAX_PARAGRAPH_WORDS, 85);
  assert.equal(MAX_CARD_LIST_ITEMS, 3);
  assert.equal(MAX_PROSE_LIST_ITEMS, 12);
});

test('longParagraphViolations filters paragraphs above threshold', () => {
  const violations = longParagraphViolations([
    { words: 40, top: 100 },
    { words: 90, top: 200, text: 'Dense mechanism paragraph.' },
    { words: 120, top: 300 },
  ]);
  assert.equal(violations.length, 2);
  assert.equal(violations[0].words, 90);
});

test('findingsFromLongParagraphs emits readable prose finding', () => {
  const findings = findingsFromLongParagraphs(
    [{ words: 96, top: 180, text: 'Long copy block.' }],
    MAX_PARAGRAPH_WORDS,
    'https://example.test/',
  );
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'minor');
  assert.ok(findings[0].message.includes('prose length'));
  assert.ok(findings[0].evidence.includes('long_paragraphs count=1'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/'));
});

test('findingsFromListLengthReport flags card and prose lists', () => {
  const findings = findingsFromListLengthReport({
    violations: [
      { kind: 'card-list', itemCount: 5, maxItems: 3, selectorHint: 'ul.card-list' },
      { kind: 'prose-list', itemCount: 14, maxItems: 12, selectorHint: 'ol.steps' },
    ],
  });
  assert.equal(findings.length, 2);
  assert.equal(findings[0].severity, 'major');
  assert.ok(findings[0].message.includes('card list'));
  assert.equal(findings[1].severity, 'minor');
  assert.ok(findings[1].message.includes('main-column list'));
});

test('findingsFromProseLengthMetrics skips platform handbook inner pages', () => {
  const findings = findingsFromProseLengthMetrics(
    { paragraphs: [{ words: 200, top: 100 }] },
    'https://platform.example/docs/chapter/',
    { siteKind: 'platform' },
  );
  assert.deepEqual(findings, []);
});

test('findingsFromProseLengthMetrics aggregates paragraph and list signals', () => {
  const findings = findingsFromProseLengthMetrics(
    {
      paragraphs: [{ words: 100, top: 120 }],
      proseLengthReport: {
        violations: [{ kind: 'card-list', itemCount: 4, maxItems: 3, selectorHint: 'ul.card' }],
      },
    },
    'https://example.test/',
    { siteKind: 'generic' },
  );
  assert.equal(findings.length, 2);
});

test('run returns empty when no metrics signals', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.proseLengthReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/',
      proseLengthReport: {
        violations: [{ kind: 'prose-list', itemCount: 15, maxItems: 12, selectorHint: 'ul.long' }],
      },
    },
    url: 'https://example.test/',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].evidence.includes('prose-list'));
});
