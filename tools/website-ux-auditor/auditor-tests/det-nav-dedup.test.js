import assert from 'node:assert/strict';
import test from 'node:test';

import {
  bandsConflict,
  findingsFromNavDedupReport,
  hasConflictingBandPair,
  normalizeNavDestination,
  run,
  violationsFromNavLinkEntries,
} from '../design-rules/deterministic/generated/det-nav-dedup.check.js';

test('normalizeNavDestination resolves same-origin paths', () => {
  assert.equal(normalizeNavDestination('/docs/guide/', 'https://forge.test/'), '/docs/guide');
  assert.equal(normalizeNavDestination('https://forge.test/docs/guide#intro', 'https://forge.test/'), '/docs/guide#intro');
  assert.equal(normalizeNavDestination('mailto:x@y.z', 'https://forge.test/'), null);
  assert.equal(normalizeNavDestination('https://other.test/x', 'https://forge.test/'), null);
});

test('bandsConflict detects peer chrome pairs only', () => {
  assert.equal(bandsConflict('primary', 'sidebar'), true);
  assert.equal(bandsConflict('sidebar', 'offcanvas'), true);
  assert.equal(bandsConflict('primary', 'footer'), false);
  assert.equal(hasConflictingBandPair(['primary', 'sidebar']), true);
  assert.equal(hasConflictingBandPair(['breadcrumb', 'sidebar']), false);
});

test('violationsFromNavLinkEntries flags duplicate destinations across bands', () => {
  const violations = violationsFromNavLinkEntries([
    { pathname: '/docs', band: 'primary', label: 'Docs' },
    { pathname: '/docs', band: 'sidebar', label: 'Documentation' },
  ]);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].kind, 'duplicate-destination');
  assert.deepEqual(violations[0].bands, ['primary', 'sidebar']);
});

test('violationsFromNavLinkEntries exempts breadcrumb hierarchy duplicates', () => {
  const violations = violationsFromNavLinkEntries([
    { pathname: '/docs', band: 'breadcrumb', label: 'Docs' },
    { pathname: '/docs', band: 'sidebar', label: 'Docs' },
  ]);
  assert.equal(violations.length, 0);
});

test('violationsFromNavLinkEntries flags competing primary roots', () => {
  const violations = violationsFromNavLinkEntries([
    { pathname: '/platform', band: 'primary', label: 'Platform', primaryRootId: 'nav:a' },
    { pathname: '/platform', band: 'primary', label: 'Platform', primaryRootId: 'nav:b' },
  ]);
  assert.ok(violations.some((v) => v.kind === 'duplicate-primary-roots'));
});

test('findingsFromNavDedupReport maps violations to findings', () => {
  const findings = findingsFromNavDedupReport({
    violations: [{
      kind: 'duplicate-destination',
      pathname: '/handbook',
      bands: ['primary', 'offcanvas'],
      labels: ['Handbook', 'Handbook'],
      selectorHint: 'primary.nav-link',
    }],
  }, 'https://example.test/');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
  assert.ok(findings[0].message.includes('conflicting chrome'));
  assert.ok(findings[0].evidence.includes('nav_dedup'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/'));
});

test('run returns empty without report and uses metrics.navDedupReport', async () => {
  assert.deepEqual(await run({ metrics: {}, url: 'https://example.test/' }), []);

  const findings = await run({
    metrics: {
      navDedupReport: {
        violations: [{
          kind: 'duplicate-destination',
          pathname: '/docs',
          bands: ['sidebar', 'offcanvas'],
          labels: ['Docs'],
          selectorHint: 'sidebar',
        }],
      },
    },
    url: 'https://example.test/docs',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].evidence.includes('sidebar+offcanvas'));
});
