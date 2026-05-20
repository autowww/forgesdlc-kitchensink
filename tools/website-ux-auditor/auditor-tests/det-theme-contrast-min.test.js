import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findingsFromContrastSamples,
  isLowContrastSample,
  lowContrastSamplesFromMetrics,
  requiredContrastRatio,
  run,
  WCAG_AA_LARGE_MIN,
  WCAG_AA_NORMAL_MIN,
} from '../design-rules/deterministic/generated/det-theme-contrast-min.check.js';

test('requiredContrastRatio uses WCAG AA thresholds by font size', () => {
  assert.equal(requiredContrastRatio(16), WCAG_AA_NORMAL_MIN);
  assert.equal(requiredContrastRatio(23.9), WCAG_AA_NORMAL_MIN);
  assert.equal(requiredContrastRatio(24), WCAG_AA_LARGE_MIN);
  assert.equal(requiredContrastRatio(32), WCAG_AA_LARGE_MIN);
});

test('isLowContrastSample flags samples below threshold', () => {
  assert.equal(isLowContrastSample({ ratio: 4.4, size: 16 }), true);
  assert.equal(isLowContrastSample({ ratio: 4.5, size: 16 }), false);
  assert.equal(isLowContrastSample({ ratio: 2.9, size: 28 }), true);
  assert.equal(isLowContrastSample({ ratio: 3, size: 28 }), false);
});

test('findingsFromContrastSamples maps low-contrast samples to findings', () => {
  const findings = findingsFromContrastSamples([
    {
      tag: 'p',
      ratio: 3.2,
      size: 16,
      text: 'Muted helper copy',
    },
  ], 'https://example.test/page');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'major');
  assert.equal(findings[0].area, 'accessibility');
  assert.ok(findings[0].message.includes('3.2:1'));
  assert.ok(findings[0].evidence.includes('low_contrast'));
  assert.ok(findings[0].evidence.includes('threshold=4.5'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/page'));
});

test('findingsFromContrastSamples returns empty when all samples pass', () => {
  const findings = findingsFromContrastSamples([
    { tag: 'h1', ratio: 8.1, size: 32, text: 'Hero title' },
  ]);
  assert.deepEqual(findings, []);
});

test('lowContrastSamplesFromMetrics prefers contrastReport then metrics.lowContrast', () => {
  const fromReport = lowContrastSamplesFromMetrics({
    contrastReport: { lowContrast: [{ tag: 'a', ratio: 2.1, size: 16, text: 'link' }] },
    lowContrast: [{ tag: 'p', ratio: 1.5, size: 16, text: 'body' }],
  });
  assert.equal(fromReport.length, 1);
  assert.equal(fromReport[0].tag, 'a');

  const fromMetrics = lowContrastSamplesFromMetrics({
    lowContrast: [{ tag: 'p', ratio: 1.5, size: 16, text: 'body' }],
  });
  assert.equal(fromMetrics.length, 1);
  assert.equal(fromMetrics[0].tag, 'p');
});

test('run returns empty when no low-contrast samples', async () => {
  const findings = await run({ metrics: { lowContrast: [] }, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.lowContrast when provided', async () => {
  const findings = await run({
    metrics: {
      lowContrast: [{ tag: 'button', ratio: 2.5, size: 14, text: 'Submit' }],
    },
    url: 'https://example.test/form',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].evidence.includes('tag=button'));
});
