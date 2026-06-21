import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSourceStructure, inferParentUrl } from '../lib/source-structure.js';
import { enrichFindingStructure, enrichPagesFindingsStructure } from '../lib/enrich-findings-structure.js';
import { computeStructureScores } from '../lib/structure-ux-score.js';
import { buildRankedDefectClusters } from '../lib/defect-remediation-plans.js';
import { shouldRunDeterministicRuleForPageType } from '../lib/det-page-type-gate.js';
import { collectPageStructureInBrowser } from '../lib/collect-page-structure.js';

test('inferParentUrl accepts child under parent path', () => {
  const parent = 'https://example.com/docs/';
  const child = 'https://example.com/docs/guide.html';
  assert.equal(inferParentUrl(child, parent), parent);
});

test('buildSourceStructure catalogs KS hash components', () => {
  const pages = [
    {
      url: 'https://example.com/',
      structure: {
        pageType: { id: 'landing', confidence: 'heuristic' },
        layout: { id: 'ks:layout:handbook', hash: 'Hbk' },
        instances: [
          {
            nodeId: 'inst0',
            signatureId: 'cmp:nav:Ksf',
            hash: 'Ksf',
            ksType: 'chrome-region',
            ksName: 'nav',
            taxonomyLevel: 'chrome-regions',
          },
        ],
      },
      findings: [],
    },
    {
      url: 'https://example.com/about/',
      structure: {
        pageType: { id: 'landing', confidence: 'heuristic' },
        layout: { id: 'ks:layout:handbook', hash: 'Hbk' },
        instances: [
          {
            nodeId: 'inst0',
            signatureId: 'cmp:nav:Ksf',
            hash: 'Ksf',
            ksType: 'chrome-region',
            ksName: 'nav',
            taxonomyLevel: 'chrome-regions',
          },
        ],
      },
      findings: [],
    },
  ];
  const structure = buildSourceStructure(pages, {
    origin: 'https://example.com',
    siteKind: 'generic',
  });
  assert.equal(structure.principalCatalog.components.length, 1);
  assert.equal(structure.principalCatalog.components[0].hash, 'Ksf');
  assert.equal(structure.principalCatalog.components[0].pageCount, 2);
  assert.ok(structure.principalCatalog.components[0].principal);
});

test('enrichFindingStructure attaches signature from page structure', () => {
  const finding = { checkId: 'x', area: 'navigation', severity: 'major', hash: 'Ksf' };
  const pageStructure = {
    instances: [{ hash: 'Ksf', signatureId: 'cmp:nav:Ksf', nodeId: 'inst0', taxonomyLevel: 'chrome-regions' }],
  };
  const out = enrichFindingStructure(finding, pageStructure, 'https://example.com/');
  assert.equal(out.signatureId, 'cmp:nav:Ksf');
  assert.equal(out.structureNodeId, 'inst0');
});

test('computeStructureScores rolls up by signature', () => {
  const pages = [
    {
      url: 'https://example.com/a',
      structure: { pageType: { id: 'landing' }, layout: { id: 'L1' } },
      findings: [
        { severity: 'major', area: 'navigation', signatureId: 'cmp:nav:Ksf' },
      ],
    },
    {
      url: 'https://example.com/b',
      structure: { pageType: { id: 'landing' }, layout: { id: 'L1' } },
      findings: [
        { severity: 'warn', area: 'navigation', signatureId: 'cmp:nav:Ksf' },
      ],
    },
  ];
  const scores = computeStructureScores(pages);
  assert.equal(scores.bySignature[0].id, 'cmp:nav:Ksf');
  assert.equal(scores.bySignature[0].findingCount, 2);
});

test('buildRankedDefectClusters groups by signatureId + ruleId', () => {
  const pages = [
    {
      url: 'https://example.com/a',
      structure: {
        pageType: { id: 'landing' },
        layout: { id: 'L1' },
        instances: [{ signatureId: 'cmp:nav:Ksf', hash: 'Ksf' }],
      },
      findings: [
        {
          checkId: 'design-rule-runtime',
          ruleId: 'DET.NAV.BREADCRUMB',
          area: 'navigation',
          severity: 'major',
          signatureId: 'cmp:nav:Ksf',
          hash: 'Ksf',
        },
      ],
    },
    {
      url: 'https://example.com/b',
      structure: {
        pageType: { id: 'landing' },
        layout: { id: 'L1' },
        instances: [{ signatureId: 'cmp:nav:Ksf', hash: 'Ksf' }],
      },
      findings: [
        {
          checkId: 'design-rule-runtime',
          ruleId: 'DET.NAV.BREADCRUMB',
          area: 'navigation',
          severity: 'major',
          signatureId: 'cmp:nav:Ksf',
          hash: 'Ksf',
        },
      ],
    },
  ];
  const ranked = buildRankedDefectClusters({ pages, crawlSummary: {}, siteKind: 'generic' });
  assert.equal(ranked.clusters.length, 1);
  assert.equal(ranked.clusters[0].fixLever, 'component');
  assert.equal(ranked.clusters[0].findingCount, 2);
  assert.equal(ranked.clusters[0].regressionUrls.length >= 1, true);
  assert.ok(ranked.clusters[0].estimatedTokenSavings > 0);
});

test('det page type gate skips homepage-shell on handbook chapter', () => {
  assert.equal(shouldRunDeterministicRuleForPageType('homepage-shell', 'handbook-chapter'), false);
  assert.equal(shouldRunDeterministicRuleForPageType('DET.NAV.BREADCRUMB', 'handbook-chapter'), true);
});

test('collectPageStructureInBrowser is a function', () => {
  assert.equal(typeof collectPageStructureInBrowser, 'function');
});

test('enrichPagesFindingsStructure maps all pages', () => {
  const pages = enrichPagesFindingsStructure([
    { url: 'https://x/', findings: [{ severity: 'minor', area: 'hero', hash: 'Abc' }], structure: { instances: [] } },
  ]);
  assert.equal(pages.length, 1);
  assert.equal(pages[0].findings[0].signatureId, 'cmp:hash:Abc');
});
