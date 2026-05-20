import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MIN_DIAGRAM_LABEL_CHARS,
  MIN_LEGEND_NODE_MATCHES,
  analyzeLegendLabelCoverage,
  countLegendNodeMatches,
  extractLegendNodesForKey,
  extractSvgTextNodes,
  findingsFromDiagramLabelsReport,
  requiredLegendMatches,
  run,
} from '../design-rules/deterministic/generated/det-diagram-labels.check.js';

const SAMPLE_SVG = `
<text x="84" y="54">Step A</text>
<text x="224" y="54">Step B</text>
<text x="364" y="54">Step C</text>
<text x="504" y="54">Step D</text>
`;

const SAMPLE_CATALOG = `
window.__FORGE_KS_DIAGRAM_CATALOG = {
    linear: {
      title: 'Linear Flow',
      items: [
        { node: 'Step A', color: 'cyan', desc: 'First' },
        { node: 'Step B', color: 'cyan', desc: 'Second' },
        { node: 'Step C', color: 'amber', desc: 'Third' },
        { node: 'Step D', color: 'amber', desc: 'Fourth' }
      ]
    },
};
`;

test('extractSvgTextNodes collects text and tspan content', () => {
  const labels = extractSvgTextNodes(SAMPLE_SVG);
  assert.deepEqual(labels, ['Step A', 'Step B', 'Step C', 'Step D']);
});

test('extractLegendNodesForKey reads catalog node fields', () => {
  const nodes = extractLegendNodesForKey(SAMPLE_CATALOG, 'linear');
  assert.deepEqual(nodes, ['Step A', 'Step B', 'Step C', 'Step D']);
});

test('analyzeLegendLabelCoverage passes when legend nodes appear in SVG', () => {
  const legend = extractLegendNodesForKey(SAMPLE_CATALOG, 'linear');
  const labels = extractSvgTextNodes(SAMPLE_SVG);
  const result = analyzeLegendLabelCoverage(legend, labels);
  assert.equal(result.ok, true);
  assert.equal(countLegendNodeMatches(legend, labels), 4);
});

test('analyzeLegendLabelCoverage flags missing readable labels', () => {
  const legend = ['Step A', 'Step B', 'Step C', 'Step D'];
  const result = analyzeLegendLabelCoverage(legend, ['[subtitle]']);
  assert.equal(result.ok, false);
  assert.equal(result.kind, 'diagram-labels-no-readable-text');
});

test('analyzeLegendLabelCoverage flags legend gaps', () => {
  const legend = ['Step A', 'Step B', 'Step C', 'Step D'];
  const result = analyzeLegendLabelCoverage(legend, ['Step A']);
  assert.equal(result.ok, false);
  assert.equal(result.kind, 'diagram-labels-legend-gap');
  assert.equal(result.matched, 1);
  assert.equal(result.required, requiredLegendMatches(legend.length));
});

test('requiredLegendMatches enforces minimum coverage threshold', () => {
  assert.equal(MIN_DIAGRAM_LABEL_CHARS, 2);
  assert.equal(MIN_LEGEND_NODE_MATCHES, 2);
  assert.equal(requiredLegendMatches(4), 2);
  assert.equal(requiredLegendMatches(10), 5);
});

test('findingsFromDiagramLabelsReport maps violations to findings', () => {
  const findings = findingsFromDiagramLabelsReport({
    violations: [
      {
        kind: 'diagram-labels-legend-gap',
        key: 'linear',
        selectorHint: 'motion.div.forge-diagram[key=linear]',
        message: 'Diagram "linear" shows 1/2 required catalog legend node labels (4 legend entries).',
        matched: 1,
        required: 2,
      },
    ],
  }, { url: 'https://example.test/diagrams' });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
  assert.equal(findings[0].area, 'visual-catalog');
  assert.ok(findings[0].evidence.includes('key=linear'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/diagrams'));
});

test('run returns empty when no report data', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.diagramLabelsReport when provided', async () => {
  const findings = await run({
    metrics: {
      diagramLabelsReport: {
        violations: [
          {
            kind: 'diagram-labels-no-readable-text',
            key: 'roadmap',
            selectorHint: 'motion.div.forge-diagram[key=roadmap]',
            message: 'Diagram "roadmap" has no readable labels.',
          },
        ],
      },
    },
    url: 'https://example.test/',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('readable'));
});
