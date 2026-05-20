import assert from 'node:assert/strict';
import test from 'node:test';

import {
  allowedNavDepth,
  findingsFromNavDepthReport,
  MAX_GLOBAL_NAV_DEPTH,
  MAX_GLOBAL_NAV_DEPTH_WITH_MEGA,
  run,
  violationsFromNavDepthMetrics,
} from '../design-rules/deterministic/generated/det-nav-depth.check.js';

test('allowedNavDepth caps flat nav and single flyout tier', () => {
  assert.equal(allowedNavDepth(0, false), true);
  assert.equal(allowedNavDepth(1, false), true);
  assert.equal(allowedNavDepth(MAX_GLOBAL_NAV_DEPTH, false), true);
  assert.equal(allowedNavDepth(MAX_GLOBAL_NAV_DEPTH + 1, false), false);
});

test('allowedNavDepth permits deeper trees when mega-menu marker present', () => {
  assert.equal(allowedNavDepth(MAX_GLOBAL_NAV_DEPTH + 1, true), true);
  assert.equal(allowedNavDepth(MAX_GLOBAL_NAV_DEPTH_WITH_MEGA, true), true);
  assert.equal(allowedNavDepth(MAX_GLOBAL_NAV_DEPTH_WITH_MEGA + 1, true), false);
});

test('violationsFromNavDepthMetrics flags nested flyouts without mega-menu', () => {
  const violations = violationsFromNavDepthMetrics(3, false, 'nav.landing-nav');
  assert.equal(violations.length, 1);
  assert.equal(violations[0].kind, 'nested-flyout-depth');
  assert.equal(violations[0].listDepth, 3);
  assert.equal(violations[0].maxAllowed, MAX_GLOBAL_NAV_DEPTH);
});

test('findingsFromNavDepthReport maps violations to findings', () => {
  const findings = findingsFromNavDepthReport({
    violations: [{
      kind: 'nested-flyout-depth',
      listDepth: 3,
      maxAllowed: MAX_GLOBAL_NAV_DEPTH,
      hasMegaMenu: false,
      selectorHint: 'nav.fs-primary-nav-global',
    }],
  }, 'https://example.test/');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
  assert.ok(findings[0].message.includes('flyout'));
  assert.ok(findings[0].evidence.includes('nav_depth'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/'));
});

test('run returns empty without report and uses metrics.navDepthReport', async () => {
  assert.deepEqual(await run({ metrics: {}, url: 'https://example.test/' }), []);

  const findings = await run({
    metrics: {
      navDepthReport: {
        maxListDepth: 4,
        hasMegaMenu: false,
        violations: [{
          kind: 'nested-flyout-depth',
          listDepth: 4,
          maxAllowed: MAX_GLOBAL_NAV_DEPTH,
          hasMegaMenu: false,
          selectorHint: 'nav.landing-nav',
        }],
      },
    },
    url: 'https://example.test/',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].evidence.includes('list_depth=4'));
});
