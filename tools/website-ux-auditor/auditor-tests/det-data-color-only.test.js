import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MIN_COLOR_LABEL_CHARS,
  findingsFromColorOnlyReport,
  run,
} from '../design-rules/deterministic/generated/det-data-color-only.check.js';

test('MIN_COLOR_LABEL_CHARS requires a short but non-trivial label', () => {
  assert.equal(MIN_COLOR_LABEL_CHARS, 2);
});

test('findingsFromColorOnlyReport flags swatches without redundant labels', () => {
  const findings = findingsFromColorOnlyReport({
    violations: [
      {
        kind: 'legend-swatch-without-label',
        region: 'chart or legend row',
        selectorHint: 'span.lenses-overview-donut-swatch',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
  assert.ok(findings[0].message.includes('color alone'));
  assert.ok(findings[0].evidence.includes('color_only_encoding'));
});

test('findingsFromColorOnlyReport elevates ks-swatch missing label to major', () => {
  const findings = findingsFromColorOnlyReport({
    violations: [{ kind: 'ks-swatch-missing-label', selectorHint: 'motion.ks-swatch' }],
  });
  assert.equal(findings[0].severity, 'major');
});

test('findingsFromColorOnlyReport returns empty when no violations', () => {
  const findings = findingsFromColorOnlyReport({ violations: [] });
  assert.deepEqual(findings, []);
});

test('run returns empty when no report or page', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.colorOnlyReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/data',
      colorOnlyReport: {
        violations: [
          {
            kind: 'table-cell-color-only',
            region: 'data table cell',
            selectorHint: 'td.heat-cell',
          },
        ],
      },
    },
    url: 'https://example.test/data',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].evidence.includes('url=https://example.test/data'));
});
