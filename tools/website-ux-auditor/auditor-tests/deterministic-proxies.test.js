import assert from 'node:assert/strict';
import test from 'node:test';

import { analyzeContractSpecificity } from '../../design-catalog/lib/contract-specificity.mjs';
import { runCheck as techDepth } from '../checks/technical-depth.js';
import { runCheck as readability } from '../checks/readability-structure.js';
import { runCheck as productVisual } from '../checks/product-visual.js';
import { runCheck as firstScreen } from '../checks/first-screen-density.js';
import { runCheck as ctaTrust } from '../checks/cta-trust-ecosystem.js';
import { runAllChecks } from '../checks/index.js';

/** Generic mechanism-led site metrics (docs-first / dense context regression shape — not a product profile). */
function mechanismDenseMetrics(overrides = {}) {
  return {
    title: 'Mechanism control plane',
    metaDescription: 'Operator docs for jobs and automation.',
    lang: 'en',
    firstH1: { tag: 'h1', text: 'Fleet control plane', words: 3, fontSize: 28, top: 44 },
    h1Count: 1,
    wordCount: 2200,
    aboveFoldWordCount: 210,
    codeAboveFold: 1,
    tables: 4,
    preBlocks: 5,
    codeBlocks: 14,
    topCtas: [
      { text: 'Run', top: 120 },
      { text: 'View docs', top: 128 },
      { text: 'API reference', top: 135 },
    ],
    navLinks: [],
    links: [],
    technicalHits: [{ term: 'SQLite-backed', aboveFold: true, anywhere: true }],
    outcomeTermCount: 2,
    paragraphs: [{ words: 120, top: 200 }],
    sections: new Array(7).fill(null).map((_, i) => ({ words: 120, top: 400 + i * 120, textStart: 'x' })),
    trustTermCount: 10,
    ecosystemTermCount: 4,
    imagesMissingAlt: 0,
    lowContrast: [],
    homepageShellMetricsPresent: true,
    docVisibleLinkCount: 80,
    sidebarOffcanvasLinkCount: 0,
    navChromeContainerCount: 2,
    preMainFirstH1LinkCount: 18,
    handbookChromeTermHits: 0,
    hasHandbookChromeOnHome: false,
    duplicateNavLinkTextCount: 0,
    firstMainH1Top: 100,
    firstMainContentTop: 120,
    outsideMainHeaderNavLinkCount: 4,
    mainHeroVisualAboveFoldCount: 1,
    heroPrimaryVisual: {
      tag: 'img',
      width: 700,
      height: 200,
      top: 720,
      altLen: 4,
      hasCaption: false,
      decorativeGuess: true,
    },
    earlyMainHeadings: [],
    workflowStorySignalHits: 0,
    aiCapabilityStoryHits: 0,
    genericAiHits: [],
    headingBodyWordRatio: 0.42,
    uniqueAcronymLikeCount: 40,
    aboveFoldAcronymLikeCount: 16,
    apiLikePathHits: 24,
    firstViewportLinkCount: 36,
    secondViewportLinkCount: 50,
    heroMainWordCount: 280,
    sectionMedianGapPx: 24,
    maxParagraphMeasurePx: 980,
    distinctFontFamiliesSampled: 7,
    distinctTextColorsSampled: 20,
    ctaVerticalSpreadPx: 15,
    firstTechnicalBlockTop: 180,
    firstExplainerParagraphTop: 420,
    technicalPrecedesMainExplanation: true,
    proofStorySignalHits: 0,
    cards: 26,
    ksVisualHashes: [],
  };
}

test('technical-depth flags progressive disclosure inversion + endpoint density', () => {
      const m = mechanismDenseMetrics();
      const findings = techDepth(m, 'https://mechanism.example.com/', { siteKind: 'generic' });
      assert.ok(findings.some((f) => f.message.includes('progressive disclosure')));
      assert.ok(findings.some((f) => f.message.includes('API-style path')));
});

test('readability-structure flags acronym + link-wall + heading ratio proxies', () => {
      const m = mechanismDenseMetrics();
      const findings = readability(m, 'https://mechanism.example.com/', { siteKind: 'generic' });
      assert.ok(findings.some((f) => f.message.includes('acronym')));
      assert.ok(findings.some((f) => f.message.includes('first viewport')));
      assert.ok(findings.some((f) => f.message.includes('before the primary in-main H1')));
});

test('first-screen-density flags hero copy + card density', () => {
      const m = mechanismDenseMetrics();
      const findings = firstScreen(m, 'https://mechanism.example.com/', { siteKind: 'generic' });
      assert.ok(findings.some((f) => f.message.includes('Hero band')));
      assert.ok(findings.some((f) => f.message.includes('card/tile')));
});

test('product-visual flags decorative hero visual + weak alt', () => {
      const m = mechanismDenseMetrics();
      const findings = productVisual(m, 'https://mechanism.example.com/', { siteKind: 'generic' });
      assert.ok(findings.some((f) => f.message.includes('decorative')));
      assert.ok(findings.some((f) => f.message.includes('alt')));
      assert.ok(findings.some((f) => f.message.includes('far below the main headline')));
});

test('cta-trust-ecosystem flags clustered CTAs when count ≥3', () => {
      const m = mechanismDenseMetrics();
      const findings = ctaTrust(m, 'https://mechanism.example.com/', { siteKind: 'generic' });
      assert.ok(findings.some((f) => f.message.includes('clustered')));
});

test('runAllChecks aggregates deterministic proxy findings without throwing', () => {
      const findings = runAllChecks(mechanismDenseMetrics(), 'https://mechanism.example.com/', { siteKind: 'generic' });
      assert.ok(findings.length >= 6);
      const ids = new Set(findings.map((f) => f.checkId));
      assert.ok(ids.has('technical-depth'));
      assert.ok(ids.has('readability-structure'));
      assert.ok(ids.has('product-visual'));
});

test('analyzeContractSpecificity errors on thin generic Expected look', () => {
      const md = `## Expected look\n\nClean and modern professional appearance.\n\n## Anatomy\n\n- Root\n`;
      const { errors } = analyzeContractSpecificity(md, 'docs/design/catalog/pages/Xyz-test.md', 'page');
      assert.ok(errors.length >= 1);
});

test('analyzeContractSpecificity warns on missing States for layout contracts', () => {
      const md = '# T\n\n## Expected look\n\n' + `${'Specific rhythm, spacing, and typography roles for this hash. '.repeat(8)}\n`;
      const { warnings } = analyzeContractSpecificity(md, 'docs/design/catalog/layouts/Zzz-test.md', 'layout');
      assert.ok(warnings.some((w) => w.includes('States')));
});
