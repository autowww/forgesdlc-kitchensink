import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MAX_PRIMARY_ACTIONS_PER_CARD,
  findingsFromCardActionLimitReport,
  run,
} from '../design-rules/deterministic/generated/det-card-action-limit.check.js';

test('MAX_PRIMARY_ACTIONS_PER_CARD is one primary per standard card', () => {
  assert.equal(MAX_PRIMARY_ACTIONS_PER_CARD, 1);
});

test('findingsFromCardActionLimitReport flags cards over the cap', () => {
  const findings = findingsFromCardActionLimitReport({
    maxAllowed: 1,
    violations: [
      {
        kind: 'too-many-primary-actions',
        primaryCount: 3,
        selectorHint: 'div.forge-card',
        labels: ['Start', 'Docs', 'Pricing'],
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'critical');
  assert.ok(findings[0].message.includes('primary action'));
  assert.ok(findings[0].evidence.includes('primary_actions=3'));
});

test('findingsFromCardActionLimitReport returns empty for compliant cards', () => {
  const findings = findingsFromCardActionLimitReport({
    violations: [{ kind: 'too-many-primary-actions', primaryCount: 1, selectorHint: '.card' }],
  });
  assert.deepEqual(findings, []);
});

test('run returns empty when no report or page', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.cardActionLimitReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/cards',
      cardActionLimitReport: {
        maxAllowed: 1,
        violations: [
          {
            kind: 'too-many-primary-actions',
            primaryCount: 2,
            selectorHint: 'article.card',
            labels: ['Buy', 'Learn more'],
          },
        ],
      },
    },
    url: 'https://example.test/cards',
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'major');
  assert.ok(findings[0].evidence.includes('url=https://example.test/cards'));
});
