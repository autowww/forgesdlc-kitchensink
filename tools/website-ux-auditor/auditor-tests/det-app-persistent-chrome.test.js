import assert from 'node:assert/strict';
import test from 'node:test';

import {
  diffPersistentChromeRegions,
  findingsFromAppPersistentChromeReport,
  resetRouteCrawlStateForTests,
  run,
} from '../design-rules/deterministic/generated/det-app-persistent-chrome.check.js';

test('diffPersistentChromeRegions flags missing shell and nav drift', () => {
  const baseline = {
    regions: [
      { role: 'header', id: 'app-header', ksHash: 'Msm', linkSignature: 'home|docs' },
      { role: 'aside', id: 'app-nav', ksHash: 'Msm', linkSignature: 'alpha|beta' },
    ],
  };
  const current = {
    regions: [
      { role: 'header', id: 'app-header', ksHash: 'Msm', linkSignature: 'home|settings' },
    ],
  };
  const violations = diffPersistentChromeRegions(baseline, current);
  assert.ok(violations.some((v) => v.kind === 'missing-region' && v.role === 'aside'));
  assert.ok(violations.some((v) => v.kind === 'nav-drift' && v.role === 'header'));
});

test('findingsFromAppPersistentChromeReport maps violations to findings', () => {
  const findings = findingsFromAppPersistentChromeReport({
    baselineUrl: 'https://app.test/',
    violations: [
      { kind: 'missing-region', role: 'aside', id: 'app-nav', ksHash: 'Msm' },
      { kind: 'nav-drift', role: 'header', id: 'app-header', baselineLinks: 'a|b', currentLinks: 'a|c' },
    ],
  }, 'https://app.test/settings');
  assert.equal(findings.length, 2);
  assert.ok(findings.some((f) => f.message.includes('missing on this route')));
  assert.ok(findings.some((f) => f.message.includes('navigation link set changed')));
  assert.ok(findings[0].evidence.includes('baseline=https://app.test/'));
});

test('run no-ops without persistence contract or report', async () => {
  resetRouteCrawlStateForTests();
  const empty = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(empty, []);

  const noContract = await run({
    metrics: {
      appPersistentChromeReport: {
        promisesPersistence: false,
        regions: [],
        violations: [],
      },
    },
    url: 'https://example.test/',
  });
  assert.deepEqual(noContract, []);
});

test('run compares routes via route-crawl state', async () => {
  resetRouteCrawlStateForTests();

  const baseline = {
    promisesPersistence: true,
    regions: [{ role: 'header', id: 'shell', ksHash: 'Msm', linkSignature: 'home|docs' }],
    violations: [],
  };

  const first = await run({
    metrics: { appPersistentChromeReport: baseline },
    url: 'https://app.test/page-one',
  });
  assert.deepEqual(first, []);

  const second = await run({
    metrics: {
      appPersistentChromeReport: {
        promisesPersistence: true,
        regions: [{ role: 'header', id: 'shell', ksHash: 'Msm', linkSignature: 'home|settings' }],
        violations: [],
      },
    },
    url: 'https://app.test/page-two',
  });
  assert.equal(second.length, 1);
  assert.ok(second[0].message.includes('navigation link set changed'));
  assert.ok(second[0].evidence.includes('url=https://app.test/page-two'));
});
