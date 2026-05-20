import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MIN_CHART_SUMMARY_CHARS,
  findingsFromChartAltSummaryReport,
  run,
} from '../design-rules/deterministic/generated/det-chart-alt-summary.check.js';

test('MIN_CHART_SUMMARY_CHARS requires a non-trivial summary', () => {
  assert.equal(MIN_CHART_SUMMARY_CHARS, 8);
});

test('findingsFromChartAltSummaryReport flags charts without a summary', () => {
  const findings = findingsFromChartAltSummaryReport({
    violations: [
      {
        kind: 'missing-chart-alt-summary',
        selectorHint: 'div#ks-cw.ks-chart-mount[kind=commit_weekly]',
        className: 'ks-chart-mount mb-3',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'major');
  assert.ok(findings[0].message.includes('text summary'));
  assert.ok(findings[0].evidence.includes('missing_chart_alt_summary'));
});

test('findingsFromChartAltSummaryReport returns empty when no violations', () => {
  const findings = findingsFromChartAltSummaryReport({ violations: [] });
  assert.deepEqual(findings, []);
});

test('run returns empty when no report or page', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.chartAltSummaryReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/charts',
      chartAltSummaryReport: {
        violations: [
          {
            kind: 'missing-chart-alt-summary',
            selectorHint: 'canvas#bare-chart',
            className: 'chart-canvas',
          },
        ],
      },
    },
    url: 'https://example.test/charts',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].evidence.includes('url=https://example.test/charts'));
});
