import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findingsFromLayoutGridReport,
  handbookHasDeadGutter,
  isFullBleedProseRiver,
  MAX_PROSE_MEASURE_PX,
  run,
  sectionHasGutterDrift,
} from '../design-rules/deterministic/generated/det-layout-grid-consistency.check.js';

test('isFullBleedProseRiver detects unconstrained wide prose', () => {
  assert.equal(isFullBleedProseRiver({
    wordCount: 40,
    inGridContainer: false,
    excludedRegion: false,
    paragraphWidthPx: 1100,
    mainWidthPx: 1200,
    viewportWidthPx: 1280,
  }), true);

  assert.equal(isFullBleedProseRiver({
    wordCount: 40,
    inGridContainer: true,
    excludedRegion: false,
    paragraphWidthPx: 1100,
    mainWidthPx: 1200,
    viewportWidthPx: 1280,
  }), false);

  assert.equal(isFullBleedProseRiver({
    wordCount: 10,
    inGridContainer: false,
    excludedRegion: false,
    paragraphWidthPx: 1100,
    mainWidthPx: 1200,
    viewportWidthPx: 1280,
  }), false);

  assert.equal(isFullBleedProseRiver({
    wordCount: 50,
    inGridContainer: false,
    excludedRegion: true,
    paragraphWidthPx: 1100,
    mainWidthPx: 1200,
    viewportWidthPx: 1280,
  }), false);
});

test('sectionHasGutterDrift flags inconsistent left edges', () => {
  assert.equal(sectionHasGutterDrift([120, 124, 128]), false);
  assert.equal(sectionHasGutterDrift([120, 200]), true);
});

test('handbookHasDeadGutter flags centered doc-content with large sidebar gap', () => {
  assert.equal(handbookHasDeadGutter({
    hasDocSidebar: true,
    gapSidebarToProsePx: 152,
    docContentUsesMxAuto: true,
    viewportWidthPx: 1440,
  }), true);
  assert.equal(handbookHasDeadGutter({
    hasDocSidebar: true,
    gapSidebarToProsePx: 40,
    docContentUsesMxAuto: true,
    viewportWidthPx: 1440,
  }), false);
});

test('findingsFromLayoutGridReport maps violation kinds', () => {
  const findings = findingsFromLayoutGridReport({
    violations: [
      {
        kind: 'full-bleed-prose',
        selectorHint: 'p.lead',
        paragraphWidthPx: 1180,
        wordCount: 64,
      },
      {
        kind: 'gutter-drift',
        sectionHint: 'section.outcomes',
        leftSpreadPx: 72,
      },
      {
        kind: 'excessive-measure',
        selectorHint: 'p.body',
        paragraphWidthPx: MAX_PROSE_MEASURE_PX + 40,
      },
      {
        kind: 'handbook-dead-gutter',
        gapSidebarToProsePx: 152,
        docContentUsesMxAuto: true,
      },
    ],
  }, 'https://example.test/landing');

  assert.equal(findings.length, 4);
  assert.equal(findings[0].severity, 'warn');
  assert.ok(findings[0].message.includes('text river'));
  assert.ok(findings[1].evidence.includes('gutter_drift'));
  assert.ok(findings[2].evidence.includes('excessive_measure'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/landing'));
});

test('run returns empty without report or violations', async () => {
  assert.deepEqual(await run({ metrics: {}, url: 'https://example.test/' }), []);

  assert.deepEqual(await run({
    metrics: {
      layoutGridConsistencyReport: { proseSampleCount: 2, violations: [] },
    },
    url: 'https://example.test/',
  }), []);
});

test('run uses metrics.layoutGridConsistencyReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/docs',
      layoutGridConsistencyReport: {
        violations: [{
          kind: 'full-bleed-prose',
          selectorHint: 'p.intro',
          paragraphWidthPx: 1050,
          wordCount: 80,
        }],
      },
    },
    url: 'https://example.test/docs',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].remediation.includes('doc-content'));
});
