import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findingsFromLandmarksReport,
  run,
  violationsFromLandmarkSnapshot,
} from '../design-rules/deterministic/generated/det-landmarks-required.check.js';

test('violationsFromLandmarkSnapshot encodes main, nav, and chrome rules', () => {
  assert.deepEqual(violationsFromLandmarkSnapshot({
    mainCount: 1,
    navApplicable: false,
    navLandmarkCount: 0,
    topBannerCount: 1,
    topContentinfoCount: 1,
    hasChromeHeader: true,
    hasChromeFooter: true,
    hasBannerLandmark: true,
    hasContentinfoLandmark: true,
  }), []);

  const missingMain = violationsFromLandmarkSnapshot({ mainCount: 0 });
  assert.ok(missingMain.some((v) => v.kind === 'missing-main'));

  const dupMain = violationsFromLandmarkSnapshot({ mainCount: 2 });
  assert.ok(dupMain.some((v) => v.kind === 'duplicate-main'));

  const missingNav = violationsFromLandmarkSnapshot({
    mainCount: 1,
    navApplicable: true,
    navLandmarkCount: 0,
  });
  assert.ok(missingNav.some((v) => v.kind === 'missing-nav'));

  const dupBanner = violationsFromLandmarkSnapshot({
    mainCount: 1,
    topBannerCount: 2,
    hasBannerLandmark: true,
  });
  assert.ok(dupBanner.some((v) => v.kind === 'duplicate-banner'));
});

test('findingsFromLandmarksReport maps violations to findings', () => {
  const findings = findingsFromLandmarksReport({
    violations: [{ kind: 'missing-main', mainCount: 0 }],
  }, 'https://example.test/page');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'minor');
  assert.ok(findings[0].message.includes('main landmark'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/page'));
});

test('run returns empty without report or violations', async () => {
  const empty = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(empty, []);

  const clean = await run({
    metrics: {
      landmarksReport: {
        mainCount: 1,
        violations: [],
      },
    },
    url: 'https://example.test/',
  });
  assert.deepEqual(clean, []);
});

test('run uses metrics.landmarksReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/handbook',
      landmarksReport: {
        violations: [{ kind: 'missing-nav', navLandmarkCount: 0 }],
      },
    },
    url: 'https://example.test/handbook',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].remediation.includes('<nav'));
});
