import assert from 'node:assert/strict';
import test from 'node:test';

import {
  RulePageTraceStore,
  extractBacklogUrlsAndRulesFromPriorAudit,
  fingerprintPageContent,
  mergeRegressionUrls,
  traceCacheKey,
} from '../lib/audit-backlog-trace.js';

test('fingerprintPageContent is stable for same metrics', () => {
  const metrics = {
    title: 'Hello',
    headings: [{ level: 'h1', text: 'Title' }],
    visibleTextSample: 'alpha beta',
    ksVisualHashReport: { validUnique: ['ABC'] },
  };
  const a = fingerprintPageContent(metrics);
  const b = fingerprintPageContent(metrics);
  assert.equal(a, b);
  assert.equal(a.length, 64);
});

test('trace cache skips only when prior run had zero findings with same fingerprints', () => {
  const store = new RulePageTraceStore({ disabled: false });
  const ruleMeta = { id: 'DET.PAGE.LANG', status: 'implemented', modulePath: 'x.check.js', sourceRule: 'doc' };
  const pageFp = 'pagefp123';
  store.registryFingerprint = 'regfp';
  store.record({
    url: 'https://example.test/',
    ruleMeta,
    pageContentFingerprint: pageFp,
    status: 'ran',
    findingsCount: 0,
    findings: [],
  });
  assert.equal(store.shouldSkipNoFindings('https://example.test/', ruleMeta, pageFp), true);
  assert.equal(store.shouldSkipNoFindings('https://example.test/', ruleMeta, 'pagefp-changed'), false);
});

test('extractBacklogUrlsAndRulesFromPriorAudit prioritizes URLs with findings', () => {
  const prior = {
    pages: [
      {
        url: 'https://a.test/',
        findings: [{ severity: 'major', ruleId: 'DET.NAV.DEDUP', checkId: 'x' }],
      },
      {
        url: 'https://b.test/',
        findings: [{ severity: 'minor', checkId: 'y' }],
      },
    ],
  };
  const { urls, priorityRuleIds } = extractBacklogUrlsAndRulesFromPriorAudit(prior, 10);
  assert.equal(urls[0], 'https://a.test/');
  assert.ok(priorityRuleIds.includes('DET.NAV.DEDUP'));
  const merged = mergeRegressionUrls(urls, ['https://c.test/']);
  assert.deepEqual(merged, ['https://a.test/', 'https://b.test/', 'https://c.test/']);
});

test('traceCacheKey changes when rule or page fingerprint changes', () => {
  const a = traceCacheKey('https://x/', 'DET.A', 'r1', 'm1', 'p1');
  const b = traceCacheKey('https://x/', 'DET.A', 'r1', 'm1', 'p2');
  const c = traceCacheKey('https://x/', 'DET.B', 'r1', 'm1', 'p1');
  assert.notEqual(a, b);
  assert.notEqual(a, c);
});
