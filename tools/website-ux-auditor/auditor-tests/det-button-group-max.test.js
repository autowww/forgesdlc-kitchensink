import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MAX_VISIBLE_HORIZONTAL_ACTIONS,
  findingsFromButtonGroupMaxReport,
  run,
} from '../design-rules/deterministic/generated/det-button-group-max.check.js';

test('MAX_VISIBLE_HORIZONTAL_ACTIONS matches Forge hero CTA budget', () => {
  assert.equal(MAX_VISIBLE_HORIZONTAL_ACTIONS, 3);
});

test('findingsFromButtonGroupMaxReport flags groups over the cap', () => {
  const findings = findingsFromButtonGroupMaxReport({
    maxAllowed: 3,
    violations: [
      {
        kind: 'too-many-actions',
        actionCount: 5,
        selectorHint: 'motion.div.landing-hero-actions__buttons',
        labels: ['Start', 'Docs', 'API', 'Pricing', 'Contact'],
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'critical');
  assert.ok(findings[0].message.includes('horizontal button group'));
  assert.ok(findings[0].evidence.includes('visible_actions=5'));
});

test('findingsFromButtonGroupMaxReport returns empty for compliant groups', () => {
  const findings = findingsFromButtonGroupMaxReport({
    violations: [{ kind: 'too-many-actions', actionCount: 2, selectorHint: '.btn-group' }],
  });
  assert.deepEqual(findings, []);
});

test('run returns empty when no report or page', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.buttonGroupMaxReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/hero',
      buttonGroupMaxReport: {
        maxAllowed: 3,
        violations: [
          {
            kind: 'too-many-actions',
            actionCount: 4,
            selectorHint: '.landing-hero-actions__buttons',
            labels: ['A', 'B', 'C', 'D'],
          },
        ],
      },
    },
    url: 'https://example.test/hero',
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'major');
  assert.ok(findings[0].evidence.includes('url=https://example.test/hero'));
});
