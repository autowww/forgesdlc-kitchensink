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

test('platform homepage with handbook-style sidebar emits homepage-shell blocker', () => {
  const m = {
    ...sensibleHomeMetrics(),
    homepageShellMetricsPresent: true,
    sidebarOffcanvasLinkCount: 30,
    handbookChromeTermHits: 0,
    preMainFirstH1LinkCount: 0,
    duplicateNavLinkTextCount: 0,
  };
  const findings = runAllChecks(m, 'https://platform.example.com/', { siteKind: 'platform' });
  assert.ok(findings.some((f) => f.checkId === 'homepage-shell' && f.severity === 'blocker'));
});
