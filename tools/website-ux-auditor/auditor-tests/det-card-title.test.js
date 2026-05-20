import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MIN_CARD_TITLE_CHARS,
  findingsFromCardTitleReport,
  run,
} from '../design-rules/deterministic/generated/det-card-title.check.js';

test('MIN_CARD_TITLE_CHARS requires a non-trivial accessible name', () => {
  assert.equal(MIN_CARD_TITLE_CHARS, 2);
});

test('findingsFromCardTitleReport flags cards without a title', () => {
  const findings = findingsFromCardTitleReport({
    violations: [
      {
        kind: 'missing-card-title',
        selectorHint: 'div.forge-card',
        className: 'forge-card breathe-static',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'major');
  assert.ok(findings[0].message.includes('visible title'));
  assert.ok(findings[0].evidence.includes('missing_card_title'));
});

test('findingsFromCardTitleReport returns empty when no violations', () => {
  const findings = findingsFromCardTitleReport({ violations: [] });
  assert.deepEqual(findings, []);
});

test('run returns empty when no report or page', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.cardTitleReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/cards',
      cardTitleReport: {
        violations: [
          {
            kind: 'missing-card-title',
            selectorHint: 'div.card',
            className: 'card',
          },
        ],
      },
    },
    url: 'https://example.test/cards',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].evidence.includes('url=https://example.test/cards'));
});
