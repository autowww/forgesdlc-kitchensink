import assert from 'node:assert/strict';
import test from 'node:test';

import {
  brokenAnchorFindings,
  findingsFromNavInPageTocReport,
  isInPageHashHref,
  pageRequiresTocFromSignals,
  run,
} from '../design-rules/deterministic/generated/det-nav-in-page-toc.check.js';

test('pageRequiresTocFromSignals requires doc hub and length threshold', () => {
  assert.equal(pageRequiresTocFromSignals({ isHome: true, layoutName: 'layout-handbook', outlineHeadingCount: 8 }), false);
  assert.equal(pageRequiresTocFromSignals({ layoutName: 'layout-landing', outlineHeadingCount: 8 }), false);
  assert.equal(pageRequiresTocFromSignals({ layoutName: 'layout-handbook', outlineHeadingCount: 2, mainWordCount: 200 }), false);
  assert.equal(pageRequiresTocFromSignals({ layoutName: 'layout-handbook', outlineHeadingCount: 5 }), true);
  assert.equal(pageRequiresTocFromSignals({ hasDocSidebar: true, mainWordCount: 1000 }), true);
});

test('isInPageHashHref accepts fragment links only', () => {
  assert.equal(isInPageHashHref('#section-one'), true);
  assert.equal(isInPageHashHref('/docs/page'), false);
  assert.equal(isInPageHashHref('#'), false);
});

test('findingsFromNavInPageTocReport maps missing toc and broken anchors', () => {
  const missing = findingsFromNavInPageTocReport({
    requiresToc: true,
    tocPresent: false,
    docHubSignals: ['layout:layout-chapter'],
    outlineHeadingCount: 6,
    mainWordCount: 1100,
    tocHint: 'nav.forge-toc',
  }, 'https://example.test/chapter');
  assert.equal(missing.length, 1);
  assert.equal(missing[0].severity, 'warn');
  assert.ok(missing[0].message.includes('table of contents'));
  assert.ok(missing[0].evidence.includes('missing_in_page_toc'));
  assert.ok(missing[0].evidence.includes('url=https://example.test/chapter'));

  const broken = findingsFromNavInPageTocReport({
    requiresToc: false,
    tocPresent: true,
    brokenAnchors: [{ href: '#gone', id: 'gone' }],
  }, 'https://example.test/page');
  assert.equal(broken.length, 1);
  assert.equal(broken[0].severity, 'major');
  assert.ok(broken[0].evidence.includes('broken_toc_anchor'));
});

test('brokenAnchorFindings deduplicates entries', () => {
  const findings = brokenAnchorFindings([
    { href: '#x', id: 'x' },
    { href: '#x', id: 'x' },
  ]);
  assert.equal(findings.length, 1);
});

test('run returns empty without report or when toc requirements pass', async () => {
  assert.deepEqual(await run({ metrics: {}, url: 'https://example.test/' }), []);

  const clean = await run({
    metrics: {
      navInPageTocReport: {
        requiresToc: true,
        tocPresent: true,
        brokenAnchors: [],
      },
    },
    url: 'https://example.test/docs',
  });
  assert.deepEqual(clean, []);
});

test('run uses metrics.navInPageTocReport when provided', async () => {
  const findings = await run({
    metrics: {
      navInPageTocReport: {
        requiresToc: true,
        tocPresent: false,
        docHubSignals: ['doc-sidebar'],
        outlineHeadingCount: 5,
        mainWordCount: 950,
      },
    },
    url: 'https://example.test/handbook',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].evidence.includes('doc-sidebar'));
});
