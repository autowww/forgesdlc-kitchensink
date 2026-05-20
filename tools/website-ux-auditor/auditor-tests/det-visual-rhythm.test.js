import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildVisualRhythmSnapshot,
  buildVisualRhythmViolations,
  findingsFromVisualRhythmReport,
  hasInconsistentSectionGaps,
  isCrampedSectionRhythm,
  isTokenizedSpacingValue,
  MIN_MEDIAN_GAP_PX,
  run,
} from '../design-rules/deterministic/generated/det-visual-rhythm.check.js';

test('isTokenizedSpacingValue accepts vars, rem, and 8px grid px', () => {
  assert.equal(isTokenizedSpacingValue('var(--bs-gutter-y)'), true);
  assert.equal(isTokenizedSpacingValue('2rem'), true);
  assert.equal(isTokenizedSpacingValue('32px'), true);
  assert.equal(isTokenizedSpacingValue('33px'), false);
  assert.equal(isTokenizedSpacingValue('0px'), true);
});

test('isCrampedSectionRhythm requires enough sections and low median gap', () => {
  assert.equal(isCrampedSectionRhythm(MIN_MEDIAN_GAP_PX - 1, 6), true);
  assert.equal(isCrampedSectionRhythm(MIN_MEDIAN_GAP_PX, 6), false);
  assert.equal(isCrampedSectionRhythm(20, 2), false);
});

test('hasInconsistentSectionGaps flags wide spread relative to median', () => {
  assert.equal(hasInconsistentSectionGaps([48, 52, 50], 50), false);
  assert.equal(hasInconsistentSectionGaps([32, 120, 40], 48), true);
});

test('buildVisualRhythmViolations maps cramped, spread, and adhoc kinds', () => {
  const violations = buildVisualRhythmViolations({
    sectionCount: 8,
    sectionMedianGapPx: 24,
    sectionGapsPx: [24, 28, 110, 26],
    sectionGapSpreadPx: 86,
    adhocSpacingHints: ['section.tight[@abc]'],
  });

  assert.ok(violations.some((v) => v.kind === 'cramped-median-gap'));
  assert.ok(violations.some((v) => v.kind === 'gap-inconsistency'));
  assert.ok(violations.some((v) => v.kind === 'adhoc-section-spacing'));
});

test('findingsFromVisualRhythmReport maps violation kinds with url', () => {
  const findings = findingsFromVisualRhythmReport({
    violations: [
      { kind: 'cramped-median-gap', sectionMedianGapPx: 22, sectionCount: 7 },
      { kind: 'gap-inconsistency', sectionMedianGapPx: 40, sectionGapSpreadPx: 80 },
      { kind: 'adhoc-section-spacing', selectorHint: 'section.foo' },
    ],
  }, 'https://example.test/');

  assert.equal(findings.length, 3);
  assert.equal(findings[0].severity, 'major');
  assert.ok(findings[0].message.includes('cramped'));
  assert.ok(findings[1].evidence.includes('gap_inconsistency'));
  assert.ok(findings[2].evidence.includes('adhoc_section_spacing'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/'));
});

test('buildVisualRhythmSnapshot reuses dom-metrics sectionMedianGapPx', () => {
  const snap = buildVisualRhythmSnapshot({
    sections: new Array(6).fill({ top: 0 }),
    sectionMedianGapPx: 28,
  });
  assert.equal(snap.sectionCount, 6);
  assert.equal(snap.sectionMedianGapPx, 28);
});

test('run returns empty without rhythm violations', async () => {
  assert.deepEqual(await run({ metrics: { sections: [{}, {}] }, url: 'https://example.test/' }), []);

  assert.deepEqual(await run({
    metrics: {
      url: 'https://example.test/',
      sections: new Array(6).fill({ top: 0 }),
      sectionMedianGapPx: 48,
    },
  }), []);
});

test('run uses metrics for cramped rhythm without page', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/home',
      sections: new Array(7).fill({ top: 0 }),
      sectionMedianGapPx: 26,
    },
  });

  assert.equal(findings.length, 1);
  assert.ok(findings[0].evidence.includes('cramped_median_gap'));
});
