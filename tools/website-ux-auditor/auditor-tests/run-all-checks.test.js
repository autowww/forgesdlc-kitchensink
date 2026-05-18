import assert from 'node:assert/strict';
import test from 'node:test';

import { runAllChecks } from '../checks/index.js';

/** DOM-shaped metrics safe for generic landing checks (homepage). */
function sensibleHomeMetrics() {
  return {
    title: 'Product',
    metaDescription: `${'Clear product description '.repeat(3)}.`,
    lang: 'en',
    metaTitle: '',
    firstH1: { tag: 'h1', text: 'Ship with governed delivery', words: 4, fontSize: 32, top: 40 },
    h1Count: 1,
    wordCount: 600,
    aboveFoldWordCount: 120,
    codeAboveFold: 0,
    tables: 0,
    preBlocks: 0,
    codeBlocks: 0,
    topCtas: [{ text: 'Get started', top: 200 }],
    navLinks: ['Overview', 'Docs', 'Trust'],
    links: [],
    technicalHits: [],
    outcomeTermCount: 12,
    paragraphs: [],
    sections: [],
    trustTermCount: 12,
    ecosystemTermCount: 4,
    imagesMissingAlt: 0,
    lowContrast: [],
    homepageShellMetricsPresent: undefined,
    sidebarOffcanvasLinkCount: 0,
    handbookChromeTermHits: 0,
    preMainFirstH1LinkCount: 0,
    duplicateNavLinkTextCount: 0,
    mainHeroVisualAboveFoldCount: 1,
    earlyMainHeadings: [
      { tag: 'h2', text: 'How it works', top: 220 },
      { tag: 'h2', text: 'Trust and boundaries', top: 520 },
    ],
    workflowStorySignalHits: 4,
    aiCapabilityStoryHits: 4,
    genericAiHits: [],
  };
}

test('runAllChecks returns array of findings with severity strings', () => {
  const m = sensibleHomeMetrics();
  const findings = runAllChecks(m, 'https://example.com/', { siteKind: 'generic' });
  assert.ok(Array.isArray(findings));
  for (const f of findings) {
    assert.ok(f && typeof f === 'object', 'expected object finding');
    assert.ok(typeof f.severity === 'string');
    assert.ok(typeof f.legacySeverity === 'string');
  }
});

test('cta-trust-ecosystem always returns findings array (never undefined concat)', () => {
  const m = {
    ...sensibleHomeMetrics(),
    topCtas: [{ text: 'Run' }],
    trustTermCount: 1,
    ecosystemTermCount: 0,
  };
  const findings = runAllChecks(m, 'https://example.com/', { siteKind: 'generic' });
  assert.ok(Array.isArray(findings));
});

test('platform handbook inner uses dedicated check bundle', () => {
  const m = {
    title: '',
    metaDescription: '',
    lang: '',
    firstH1: { text: 'Doc', words: 1, tag: 'h1', fontSize: 14, top: 20 },
    h1Count: 1,
    wordCount: 8000,
    imagesMissingAlt: 2,
    lowContrast: [],
    metaTitle: '',
  };
  const findings = runAllChecks(m, 'https://docs.example.com/deep/page', { siteKind: 'platform' });
  assert.ok(findings.length >= 1);
  assert.ok(findings.every((f) => f.checkId === 'platform-handbook-inner'));
});

test('lenses handbook inner matches platform handbook check bundle', () => {
  const m = {
    title: '',
    metaDescription: '',
    lang: '',
    firstH1: { text: 'Doc', words: 1, tag: 'h1', fontSize: 14, top: 20 },
    h1Count: 1,
    wordCount: 8000,
    imagesMissingAlt: 2,
    lowContrast: [],
    metaTitle: '',
  };
  const findings = runAllChecks(m, 'https://lenses.example.com/05-studio-101.html', { siteKind: 'lenses' });
  assert.ok(findings.length >= 1);
  assert.ok(findings.every((f) => f.checkId === 'platform-handbook-inner'));
});

test('non-platform homepage with sidebar plus handbook chrome emits homepage-shell blocker', () => {
  const m = {
    ...sensibleHomeMetrics(),
    homepageShellMetricsPresent: true,
    sidebarOffcanvasLinkCount: 30,
    handbookChromeTermHits: 4,
    preMainFirstH1LinkCount: 2,
    duplicateNavLinkTextCount: 0,
    mainHeroVisualAboveFoldCount: 1,
  };
  const findings = runAllChecks(m, 'https://lcdl.example.com/', { siteKind: 'lcdl' });
  assert.ok(findings.some((f) => f.checkId === 'homepage-shell' && f.severity === 'blocker'));
});

test('platform homepage with handbook-style sidebar emits homepage-shell blocker', () => {
  const m = {
    ...sensibleHomeMetrics(),
    homepageShellMetricsPresent: true,
    sidebarOffcanvasLinkCount: 30,
    handbookChromeTermHits: 0,
    preMainFirstH1LinkCount: 0,
    duplicateNavLinkTextCount: 0,
    mainHeroVisualAboveFoldCount: 1,
  };
  const findings = runAllChecks(m, 'https://platform.example.com/', { siteKind: 'platform' });
  assert.ok(findings.some((f) => f.checkId === 'homepage-shell' && f.severity === 'blocker'));
});

test('docs-heavy early H2 triggers storyline-flow critical', () => {
  const m = {
    ...sensibleHomeMetrics(),
    earlyMainHeadings: [
      { tag: 'h2', text: 'API reference appendix', top: 120 },
      { tag: 'h2', text: 'How it works', top: 400 },
    ],
    workflowStorySignalHits: 1,
    wordCount: 900,
  };
  const findings = runAllChecks(m, 'https://example.com/', { siteKind: 'generic' });
  assert.ok(findings.some((f) => f.checkId === 'storyline-flow' && f.severity === 'critical'));
});

test('no hero-scale visual triggers product-visual blocker', () => {
  const m = {
    ...sensibleHomeMetrics(),
    mainHeroVisualAboveFoldCount: 0,
  };
  const findings = runAllChecks(m, 'https://example.com/', { siteKind: 'generic' });
  assert.ok(findings.some((f) => f.checkId === 'product-visual' && f.severity === 'blocker'));
});

test('linear-like headings avoid storyline-flow critical', () => {
  const m = {
    ...sensibleHomeMetrics(),
    earlyMainHeadings: [
      { tag: 'h2', text: 'How it works', top: 180 },
      { tag: 'h2', text: 'Agents with review gates', top: 360 },
      { tag: 'h2', text: 'Designed for governed adoption', top: 520 },
    ],
    workflowStorySignalHits: 5,
    aiCapabilityStoryHits: 4,
    wordCount: 700,
    genericAiHits: [],
  };
  const findings = runAllChecks(m, 'https://example.com/', { siteKind: 'generic' });
  assert.ok(!findings.some((f) => f.checkId === 'storyline-flow' && f.severity === 'critical'));
});
