import assert from 'node:assert/strict';
import test from 'node:test';

import { findingsFromHttpStatusCanonicalReport } from '../design-rules/deterministic/generated/det-route-http-status-canonical.check.js';
import { findingsFromContentUniquenessReport } from '../design-rules/deterministic/generated/det-route-content-uniqueness.check.js';
import { buildCrawlRouteAuditReport } from '../lib/crawl-route-audit.js';

test('findingsFromHttpStatusCanonicalReport flags broken links and loops', () => {
  const findings = findingsFromHttpStatusCanonicalReport({
    httpViolations: [
      { issue: 'broken-link', href: 'https://example.test/missing', status: 404 },
      { issue: 'redirect-loop', href: 'https://example.test/loop', chain: ['a', 'b', 'a'] },
      { issue: 'spa-blank-shell', href: 'https://example.test/app', wordCount: 5 },
    ],
  });
  assert.equal(findings.length, 3);
  assert.ok(findings.some((f) => f.message.includes('HTTP error')));
  assert.ok(findings.some((f) => f.message.includes('redirect loop')));
});

test('findingsFromContentUniquenessReport flags duplicate signatures', () => {
  const findings = findingsFromContentUniquenessReport({
    uniquenessViolations: [
      {
        issue: 'cloned-placeholder-pages',
        urls: ['https://example.test/a', 'https://example.test/b'],
        title: 'home',
        h1: 'welcome',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('placeholder'));
});

test('buildCrawlRouteAuditReport detects duplicate content signatures', async () => {
  const request = {
    async get() {
      return { status: () => 200, headers: () => ({ 'content-type': 'text/html; charset=utf-8' }) };
    },
  };
  const pages = [
    {
      url: 'https://example.test/a',
      metrics: {
        genericWebsitePageReport: {
          routeFingerprint: {
            url: 'https://example.test/a',
            title: 'Same Page',
            h1: 'Topic',
            metaDescription: 'Shared description',
            canonical: '',
            wordCount: 120,
          },
          internalLinks: [],
        },
      },
    },
    {
      url: 'https://example.test/b',
      metrics: {
        genericWebsitePageReport: {
          routeFingerprint: {
            url: 'https://example.test/b',
            title: 'Same Page',
            h1: 'Topic',
            metaDescription: 'Shared description',
            canonical: '',
            wordCount: 130,
          },
          internalLinks: [],
        },
      },
    },
  ];
  const report = await buildCrawlRouteAuditReport({
    pages,
    origin: 'https://example.test',
    request,
  });
  assert.ok(report.uniquenessViolations.length >= 1);
});
