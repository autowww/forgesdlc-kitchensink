import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MAX_PRIMARY_CTAS_PER_REGION,
  findingsFromCtaHierarchyReport,
  run,
} from '../design-rules/deterministic/generated/det-cta-hierarchy.check.js';

test('MAX_PRIMARY_CTAS_PER_REGION is one primary per hero/modal/sticky band', () => {
  assert.equal(MAX_PRIMARY_CTAS_PER_REGION, 1);
});

test('findingsFromCtaHierarchyReport flags regions over the cap', () => {
  const findings = findingsFromCtaHierarchyReport({
    maxAllowed: 1,
    violations: [
      {
        kind: 'too-many-primary-ctas',
        region: 'hero',
        primaryCount: 3,
        selectorHint: 'div.landing-hero',
        labels: ['Get started', 'Start trial', 'Book demo'],
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'critical');
  assert.ok(findings[0].message.includes('hero region'));
  assert.ok(findings[0].evidence.includes('primary_ctas=3'));
});

test('findingsFromCtaHierarchyReport returns empty for compliant regions', () => {
  const findings = findingsFromCtaHierarchyReport({
    violations: [{ kind: 'too-many-primary-ctas', region: 'modal', primaryCount: 1, selectorHint: '.modal' }],
  });
  assert.deepEqual(findings, []);
});

test('run returns empty when no report or page', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.ctaHierarchyReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/hero',
      ctaHierarchyReport: {
        maxAllowed: 1,
        violations: [
          {
            kind: 'too-many-primary-ctas',
            region: 'stickyFooter',
            primaryCount: 2,
            selectorHint: 'div.fixed-bottom',
            labels: ['Subscribe', 'Contact sales'],
          },
        ],
      },
    },
    url: 'https://example.test/hero',
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'major');
  assert.ok(findings[0].message.includes('sticky footer'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/hero'));
});
