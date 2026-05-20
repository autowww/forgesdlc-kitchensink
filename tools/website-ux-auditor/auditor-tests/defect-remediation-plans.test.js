import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { buildRankedDefectClusters } from '../lib/defect-remediation-plans.js';
import { makeFinding } from '../lib/severity.js';

const KS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function f(checkId, severity, area, message) {
  return makeFinding({
    checkId,
    severity,
    area,
    message,
    evidence: 'evidence',
    remediation: 'fix',
  });
}

test('defect planner prioritizes homepage-cap defects first', () => {
  const pages = [
    {
      url: 'https://example.com/',
      findings: [
        f('homepage-shell', 'blocker', 'information-architecture', 'root shell broken'),
      ],
    },
    {
      url: 'https://example.com/docs',
      findings: [
        f('metadata-a11y', 'major', 'accessibility', 'low contrast'),
        f('metadata-a11y', 'major', 'accessibility', 'low contrast'),
      ],
    },
  ];
  const out = buildRankedDefectClusters({
    pages,
    crawlSummary: { stopReason: 'normal_completion' },
    siteKind: 'fleet',
    limit: 10,
  });
  assert.equal(out.clusters.length, 2);
  assert.equal(out.clusters[0].checkId, 'homepage-shell');
  assert.equal(out.clusters[0].hasHomepageGate, true);
});

test('defect planner maps area to scorer dimension and respects limit', () => {
  const pages = [
    {
      url: 'https://example.com/',
      findings: [
        f('metadata-a11y', 'major', 'accessibility', 'contrast'),
        f('readability-structure', 'minor', 'readability', 'dense copy'),
      ],
    },
    {
      url: 'https://example.com/other',
      findings: [
        f('metadata-a11y', 'major', 'accessibility', 'contrast'),
      ],
    },
  ];
  const out = buildRankedDefectClusters({
    pages,
    crawlSummary: { stopReason: 'normal_completion' },
    siteKind: 'generic',
    limit: 1,
  });
  assert.equal(out.clusters.length, 1);
  assert.equal(out.clusters[0].mainDimension, 'accessibilitySemanticsMeta');
  assert.ok(Number.isFinite(out.clusters[0].estimatedOverallDelta));
});

test('defect planner resolves visual catalog contracts from DOM ksVisualHashReport when repo has generated registry', () => {
  const pages = [
    {
      url: 'https://fixture.test/',
      metrics: {
        ksVisualHashReport: {
          validUnique: ['Hbk'],
          invalidRaw: [],
          mismatches: [],
          incompleteMarkers: [],
          instanceCountByHash: { Hbk: 1 },
        },
      },
      findings: [
        f('readability-structure', 'minor', 'readability', 'dense'),
      ],
    },
  ];
  const out = buildRankedDefectClusters({
    pages,
    crawlSummary: { stopReason: 'normal_completion' },
    siteKind: 'generic',
    limit: 5,
    repoRoot: KS_ROOT,
  });
  assert.equal(out.clusters.length, 1);
  const c = out.clusters[0];
  assert.deepEqual(c.ksVisualHashes, ['Hbk']);
  assert.equal(c.visualCatalogRefs.length, 1);
  assert.equal(c.visualCatalogRefs[0].hash, 'Hbk');
  assert.match(c.visualCatalogRefs[0].contract || '', /Hbk-layout-handbook\.md$/);
});

