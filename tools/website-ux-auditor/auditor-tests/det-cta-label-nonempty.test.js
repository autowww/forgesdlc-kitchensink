import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MIN_CTA_LABEL_CHARS,
  findingsFromCtaLabelNonemptyReport,
  run,
} from '../design-rules/deterministic/generated/det-cta-label-nonempty.check.js';

test('MIN_CTA_LABEL_CHARS requires at least one non-whitespace character', () => {
  assert.equal(MIN_CTA_LABEL_CHARS, 1);
});

test('findingsFromCtaLabelNonemptyReport flags controls with empty accessible names', () => {
  const findings = findingsFromCtaLabelNonemptyReport({
    violations: [
      {
        kind: 'empty-accessible-name',
        tag: 'a',
        selectorHint: 'a.btn-forge.icon-only',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'major');
  assert.ok(findings[0].message.includes('accessible name'));
  assert.ok(findings[0].evidence.includes('empty_accessible_name'));
});

test('findingsFromCtaLabelNonemptyReport returns empty when no violations', () => {
  const findings = findingsFromCtaLabelNonemptyReport({ violations: [] });
  assert.deepEqual(findings, []);
});

test('run returns empty when no report or page', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.ctaLabelNonemptyReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/cta',
      ctaLabelNonemptyReport: {
        violations: [
          {
            kind: 'empty-accessible-name',
            tag: 'button',
            selectorHint: 'button.btn-primary',
          },
        ],
      },
    },
    url: 'https://example.test/cta',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].evidence.includes('url=https://example.test/cta'));
});
