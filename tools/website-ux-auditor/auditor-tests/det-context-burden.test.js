import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MAX_FIRST_VIEWPORT_LINKS,
  MAX_HANDBOOK_FIRST_VIEWPORT_LINKS,
  MAX_HEADER_NAV_LINKS,
  MAX_HERO_INTERACTIVE_CONTROLS,
  MAX_PRE_MAIN_FIRST_H1_LINKS,
  buildContextBurdenSnapshot,
  findingsFromContextBurdenMetrics,
  findingsFromContextBurdenSnapshot,
  run,
} from '../design-rules/deterministic/generated/det-context-burden.check.js';

test('threshold constants align with Forge first-screen budget', () => {
  assert.equal(MAX_PRE_MAIN_FIRST_H1_LINKS, 10);
  assert.equal(MAX_HEADER_NAV_LINKS, 7);
  assert.equal(MAX_HERO_INTERACTIVE_CONTROLS, 3);
  assert.equal(MAX_FIRST_VIEWPORT_LINKS, 28);
});

test('findingsFromContextBurdenSnapshot flags pre-main link wall', () => {
  const findings = findingsFromContextBurdenSnapshot(
    buildContextBurdenSnapshot({ preMainFirstH1LinkCount: 14 }),
    'https://example.test/',
    { isHome: true },
  );
  assert.ok(findings.some((f) => f.message.includes('before the primary in-main headline')));
  assert.ok(findings[0].evidence.includes(`max=${MAX_PRE_MAIN_FIRST_H1_LINKS}`));
});

test('findingsFromContextBurdenSnapshot flags crowded header nav and hero controls on home', () => {
  const findings = findingsFromContextBurdenSnapshot(
    {
      outsideMainHeaderNavLinkCount: 12,
      heroInteractiveCount: 5,
      firstViewportLinkCount: 30,
    },
    'https://example.test/',
    { isHome: true },
  );
  assert.ok(findings.some((f) => f.message.includes('top-level choices')));
  assert.ok(findings.some((f) => f.message.includes('hero region')));
  assert.ok(findings.some((f) => f.message.includes('first viewport')));
});

test('findingsFromContextBurdenSnapshot skips homepage first-viewport cap when not home', () => {
  const findings = findingsFromContextBurdenSnapshot(
    { firstViewportLinkCount: 40 },
    'https://example.test/docs/guide',
    { isHome: false },
  );
  assert.equal(findings.length, 0);
});

test('findingsFromContextBurdenSnapshot flags handbook inner first-viewport link density', () => {
  const findings = findingsFromContextBurdenSnapshot(
    { firstViewportLinkCount: 27 },
    'https://example.test/docs-learn-101-01-what-is-fleet.html',
    { isHome: false, isPlatformHandbookInner: true },
  );
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('Handbook chapter first viewport'));
  assert.ok(findings[0].evidence.includes(`max=${MAX_HANDBOOK_FIRST_VIEWPORT_LINKS}`));
});

test('findingsFromContextBurdenMetrics returns empty for compliant metrics', () => {
  const findings = findingsFromContextBurdenMetrics(
    {
      preMainFirstH1LinkCount: 4,
      outsideMainHeaderNavLinkCount: 6,
      navChromeContainerCount: 2,
      firstViewportLinkCount: 12,
    },
    'https://example.test/',
    { siteKind: 'generic' },
  );
  assert.deepEqual(findings, []);
});

test('findingsFromContextBurdenMetrics allows compliant fleet handbook inner pages', () => {
  const findings = findingsFromContextBurdenMetrics(
    {
      preMainFirstH1LinkCount: 9,
      outsideMainHeaderNavLinkCount: 7,
      navChromeContainerCount: 3,
      firstViewportLinkCount: 20,
    },
    'https://fleet.example/docs-learn-101-01-what-is-fleet.html',
    { siteKind: 'fleet' },
  );
  assert.deepEqual(findings, []);
});

test('run uses metrics and contextBurdenReport hero count', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/',
      preMainFirstH1LinkCount: 11,
      outsideMainHeaderNavLinkCount: 5,
      contextBurdenReport: { heroInteractiveCount: 4 },
    },
    url: 'https://example.test/',
    ctx: { siteKind: 'generic' },
  });
  assert.ok(findings.some((f) => f.evidence.includes('hero_interactive_controls=4')));
  assert.ok(findings.some((f) => f.evidence.includes('pre_main_first_h1_link_count=11')));
});

test('run returns empty when no metrics or page', async () => {
  const findings = await run({ url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});
