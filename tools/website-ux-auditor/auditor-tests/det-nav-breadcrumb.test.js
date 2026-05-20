import assert from 'node:assert/strict';
import test from 'node:test';

import {
  breadcrumbHasMeaningfulContent,
  findingsFromNavBreadcrumbReport,
  isHomePathname,
  pageRequiresBreadcrumbFromSignals,
  run,
} from '../design-rules/deterministic/generated/det-nav-breadcrumb.check.js';

test('isHomePathname recognizes home routes', () => {
  assert.equal(isHomePathname('/'), true);
  assert.equal(isHomePathname('/index.html'), true);
  assert.equal(isHomePathname('/docs/chapter/'), false);
});

test('pageRequiresBreadcrumbFromSignals respects layout and home exemptions', () => {
  assert.equal(pageRequiresBreadcrumbFromSignals({ isHome: true, layoutName: 'layout-handbook' }), false);
  assert.equal(pageRequiresBreadcrumbFromSignals({ layoutName: 'layout-handbook' }), true);
  assert.equal(pageRequiresBreadcrumbFromSignals({ layoutName: 'layout-landing' }), false);
  assert.equal(pageRequiresBreadcrumbFromSignals({ hasDocSidebar: true }), true);
  assert.equal(pageRequiresBreadcrumbFromSignals({ hasShowcaseHeader: true }), true);
  assert.equal(pageRequiresBreadcrumbFromSignals({}), false);
});

test('breadcrumbHasMeaningfulContent detects trail text', () => {
  assert.equal(breadcrumbHasMeaningfulContent('Home / Docs / Chapter'), true);
  assert.equal(breadcrumbHasMeaningfulContent('x'), false);
});

test('findingsFromNavBreadcrumbReport maps missing breadcrumb on doc hubs', () => {
  const findings = findingsFromNavBreadcrumbReport({
    requiresBreadcrumb: true,
    breadcrumbPresent: false,
    docHubSignals: ['layout:layout-handbook'],
    breadcrumbHint: '.ks-doc-breadcrumb',
  }, 'https://example.test/handbook/chapter');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
  assert.ok(findings[0].message.includes('breadcrumb'));
  assert.ok(findings[0].evidence.includes('missing_breadcrumb'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/handbook/chapter'));
  assert.ok(findings[0].remediation.includes('Kbc'));
});

test('run returns empty without report, when breadcrumb present, or on non-hub pages', async () => {
  assert.deepEqual(await run({ metrics: {}, url: 'https://example.test/' }), []);

  const clean = await run({
    metrics: {
      navBreadcrumbReport: {
        requiresBreadcrumb: true,
        breadcrumbPresent: true,
        docHubSignals: ['doc-sidebar'],
      },
    },
    url: 'https://example.test/docs',
  });
  assert.deepEqual(clean, []);

  const skipped = await run({
    metrics: {
      navBreadcrumbReport: {
        requiresBreadcrumb: false,
        breadcrumbPresent: false,
      },
    },
    url: 'https://example.test/',
  });
  assert.deepEqual(skipped, []);
});

test('run uses metrics.navBreadcrumbReport when provided', async () => {
  const findings = await run({
    metrics: {
      navBreadcrumbReport: {
        requiresBreadcrumb: true,
        breadcrumbPresent: false,
        docHubSignals: ['showcase-header'],
        breadcrumbHint: '.ks-doc-breadcrumb',
      },
    },
    url: 'https://example.test/showcase/tokens',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].evidence.includes('showcase-header'));
});
