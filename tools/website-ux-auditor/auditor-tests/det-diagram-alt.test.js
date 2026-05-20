import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MIN_DIAGRAM_ALT_CHARS,
  findingsFromDiagramAltReport,
  run,
} from '../design-rules/deterministic/generated/det-diagram-alt.check.js';

test('MIN_DIAGRAM_ALT_CHARS requires a non-trivial accessible name', () => {
  assert.equal(MIN_DIAGRAM_ALT_CHARS, 3);
});

test('findingsFromDiagramAltReport flags decorative diagrams with accessible names', () => {
  const findings = findingsFromDiagramAltReport({
    violations: [
      {
        kind: 'diagram-alt-decorative-named',
        selectorHint: 'div.forge-diagram.ks-diagram-tile[key=linear]',
        className: 'forge-diagram ks-diagram-tile',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'major');
  assert.ok(findings[0].message.includes('decorative'));
  assert.ok(findings[0].evidence.includes('diagram-alt-decorative-named'));
});

test('findingsFromDiagramAltReport flags informative diagrams hidden from AT', () => {
  const findings = findingsFromDiagramAltReport({
    violations: [
      {
        kind: 'diagram-alt-informative-hidden',
        selectorHint: 'figure.forge-diagram-ascii[key=linear]',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('aria-hidden'));
});

test('findingsFromDiagramAltReport flags missing diagram summaries', () => {
  const findings = findingsFromDiagramAltReport({
    violations: [
      {
        kind: 'diagram-alt-missing-summary',
        selectorHint: 'div.forge-diagram.ks-diagram-tile[key=roadmap]',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('alt text'));
});

test('findingsFromDiagramAltReport returns empty when no violations', () => {
  const findings = findingsFromDiagramAltReport({ violations: [] });
  assert.deepEqual(findings, []);
});

test('run returns empty when no report or page', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.diagramAltReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/diagrams',
      diagramAltReport: {
        violations: [
          {
            kind: 'diagram-alt-conflicting-role',
            selectorHint: 'svg.forge-diagram-bg',
          },
        ],
      },
    },
    url: 'https://example.test/diagrams',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].evidence.includes('url=https://example.test/diagrams'));
});
