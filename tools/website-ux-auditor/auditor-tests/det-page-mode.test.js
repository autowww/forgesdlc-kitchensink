import assert from 'node:assert/strict';
import test from 'node:test';

import {
  competingModePairs,
  detectPageModes,
  expectedPrimaryMode,
  findingsFromPageModeReport,
  isHomePathname,
  mergePageModeMetrics,
  modesAreIncompatible,
  normalizePageModeToken,
  run,
  violationsFromPageModeSignals,
} from '../design-rules/deterministic/generated/det-page-mode.check.js';

test('isHomePathname recognizes home routes', () => {
  assert.equal(isHomePathname('/'), true);
  assert.equal(isHomePathname('/index.html'), true);
  assert.equal(isHomePathname('/docs/guide/'), false);
});

test('normalizePageModeToken maps common aliases', () => {
  assert.equal(normalizePageModeToken('landing'), 'marketing');
  assert.equal(normalizePageModeToken('reference'), 'handbook');
  assert.equal(normalizePageModeToken('app-shell'), 'app');
});

test('modesAreIncompatible flags marketing vs handbook', () => {
  assert.equal(modesAreIncompatible('marketing', 'handbook'), true);
  assert.equal(modesAreIncompatible('handbook', 'product'), false);
});

test('detectPageModes uses layout and structural signals', () => {
  assert.deepEqual(
    detectPageModes({ layoutName: 'layout-marketing' }),
    ['marketing'],
  );
  assert.ok(detectPageModes({
    layoutName: 'layout-marketing',
    hasDocSidebar: true,
  }).includes('handbook'));
  assert.deepEqual(
    detectPageModes({ layoutName: 'layout-handbook', hasDocSidebar: true }),
    ['handbook'],
  );
});

test('competingModePairs finds marketing+handbook conflict', () => {
  const pairs = competingModePairs(['marketing', 'handbook', 'product']);
  assert.ok(pairs.some(([a, b]) => a === 'marketing' && b === 'handbook'));
});

test('violationsFromPageModeSignals flags home handbook shell and undeclared layout', () => {
  const competing = violationsFromPageModeSignals({
    isHome: true,
    layoutName: 'layout-marketing',
    hasDocSidebar: true,
    sidebarLinkCount: 12,
  });
  assert.ok(competing.some((v) => v.kind === 'competing-modes'));

  const undeclared = violationsFromPageModeSignals({
    hasKsLayoutMarker: true,
    mainWordCount: 200,
    layoutName: '',
  });
  assert.ok(undeclared.some((v) => v.kind === 'undeclared-mode'));

  assert.equal(expectedPrimaryMode({ isHome: true }), 'marketing');
});

test('findingsFromPageModeReport maps violations with url evidence', () => {
  const findings = findingsFromPageModeReport({
    layoutName: 'layout-marketing',
    violations: [{
      kind: 'competing-modes',
      modes: ['marketing', 'handbook'],
      pairs: [['marketing', 'handbook']],
      isHome: true,
    }],
  }, 'https://example.test/');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'critical');
  assert.ok(findings[0].message.includes('competing'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/'));
});

test('mergePageModeMetrics enriches marketing home with dom-metrics handbook signals', () => {
  const merged = mergePageModeMetrics(
    { isHome: true, layoutName: 'layout-marketing', hasKsLayoutMarker: true },
    { handbookChromeTermHits: 3, sidebarOffcanvasLinkCount: 10 },
  );
  assert.ok(merged.modes.includes('handbook'));
  assert.ok(merged.violations.some((v) => v.kind === 'competing-modes'));
});

test('run no-ops without report and skips platform handbook inner', async () => {
  assert.deepEqual(await run({ metrics: {}, url: 'https://example.test/' }), []);

  const inner = await run({
    metrics: {
      pageModeReport: {
        violations: [{ kind: 'competing-modes', modes: ['marketing', 'handbook'], pairs: [['marketing', 'handbook']] }],
      },
    },
    url: 'https://platform.test/docs/chapter',
    ctx: { siteKind: 'platform' },
  });
  assert.deepEqual(inner, []);
});

test('run uses metrics.pageModeReport when provided', async () => {
  const findings = await run({
    metrics: {
      pageModeReport: {
        layoutName: 'layout-marketing',
        isHome: true,
        violations: [{
          kind: 'home-handbook-shell',
          modes: ['handbook'],
          expected: 'marketing',
          isHome: true,
        }],
      },
    },
    url: 'https://example.test/',
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'critical');
  assert.ok(findings[0].message.includes('Homepage'));
});
