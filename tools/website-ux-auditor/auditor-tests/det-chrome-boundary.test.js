import assert from 'node:assert/strict';
import test from 'node:test';

import {
  backgroundLuminanceDelta,
  borderEdgeVisible,
  boxShadowVisible,
  chromeBoundaryCuesFromStyles,
  findingsFromChromeBoundaryReport,
  parseRgb,
  run,
} from '../design-rules/deterministic/generated/det-chrome-boundary.check.js';

test('borderEdgeVisible and chromeBoundaryCuesFromStyles detect separation cues', () => {
  assert.equal(borderEdgeVisible('1px', 'rgb(30, 40, 50)'), true);
  assert.equal(borderEdgeVisible('0px', 'rgb(30, 40, 50)'), false);

  const mainBg = parseRgb('rgb(10, 14, 23)');
  const withBorder = chromeBoundaryCuesFromStyles({
    borderTopWidth: '0px',
    borderRightWidth: '1px',
    borderBottomWidth: '0px',
    borderLeftWidth: '0px',
    borderTopColor: 'transparent',
    borderRightColor: 'rgb(48, 54, 64)',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    boxShadow: 'none',
    backgroundColor: 'rgb(10, 14, 23)',
  }, mainBg);
  assert.ok(withBorder.includes('border'));

  const withShadow = chromeBoundaryCuesFromStyles({
    borderTopWidth: '0px',
    borderRightWidth: '0px',
    borderBottomWidth: '0px',
    borderLeftWidth: '0px',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
    backgroundColor: 'rgb(10, 14, 23)',
  }, mainBg);
  assert.ok(withShadow.includes('shadow'));

  const lighterChromeBg = parseRgb('rgb(120, 130, 150)');
  const distinctBg = chromeBoundaryCuesFromStyles({
    borderTopWidth: '0px',
    borderRightWidth: '0px',
    borderBottomWidth: '0px',
    borderLeftWidth: '0px',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    boxShadow: 'none',
    backgroundColor: 'rgb(120, 130, 150)',
  }, mainBg);
  assert.ok(distinctBg.includes('background'));
  assert.ok(backgroundLuminanceDelta(lighterChromeBg, mainBg) >= 0.06);
});

test('boxShadowVisible ignores none and zero shadows', () => {
  assert.equal(boxShadowVisible({ boxShadow: 'none' }), false);
  assert.equal(boxShadowVisible({ boxShadow: '0px 0px 0px 0px rgba(0,0,0,0)' }), false);
  assert.equal(boxShadowVisible({ boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }), true);
});

test('findingsFromChromeBoundaryReport maps violations to findings', () => {
  const findings = findingsFromChromeBoundaryReport({
    violations: [
      {
        kind: 'missing-boundary',
        role: 'sidebar',
        selectorHint: 'aside.forge-sidebar[@Ksr]',
        cuesFound: 'none',
      },
    ],
  }, 'https://example.test/docs');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
  assert.ok(findings[0].message.includes('visible boundary'));
  assert.ok(findings[0].evidence.includes('missing_chrome_boundary'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/docs'));
});

test('run returns empty without report or violations', async () => {
  const empty = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(empty, []);

  const clean = await run({
    metrics: {
      chromeBoundaryReport: { chromeRegionCount: 2, violations: [] },
    },
    url: 'https://example.test/',
  });
  assert.deepEqual(clean, []);
});

test('run uses metrics.chromeBoundaryReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/handbook',
      chromeBoundaryReport: {
        chromeRegionCount: 1,
        violations: [
          {
            kind: 'missing-boundary',
            role: 'header',
            selectorHint: 'header.site-header',
            cuesFound: 'none',
          },
        ],
      },
    },
    url: 'https://example.test/handbook',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].remediation.includes('border'));
});
