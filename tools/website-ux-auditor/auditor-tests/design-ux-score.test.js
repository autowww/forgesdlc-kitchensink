import assert from 'node:assert/strict';
import test from 'node:test';

import { makeFinding } from '../lib/severity.js';
import {
  computeUxScores,
  findingDamageWeight,
  harmonicMean,
  DESIGN_UX_LOG_K,
  extractUxScoresFromSavedJson,
  compareUxScores,
} from '../lib/design-ux-score.js';

test('findingDamageWeight respects SCORE_WEIGHTS', () => {
  const w = findingDamageWeight(makeFinding({ severity: 'major', area: 'hero', message: '', evidence: '', remediation: '' }));
  assert.equal(w, 20);
});

test('harmonicMean of equal values ≈ that value', () => {
  assert.equal(harmonicMean([80, 80, 80]), 80);
});

test('computeUxScores: overall 100 on clean live crawl with no findings', () => {
  const ux = computeUxScores({
    pages: [{ url: 'http://x/', findings: [] }],
    crawlSummary: { stopReason: 'normal_completion', crawlMode: 'full_budget_within_max_pages' },
    staticOnly: false,
  });
  assert.equal(ux.overall, 100);
  assert.equal(ux.coverage.perfectScoreEligible, true);
});

test('computeUxScores: static-only never grants perfectEligible with zero effective', () => {
  const ux = computeUxScores({
    pages: [{ url: 'repo://static', findings: [] }],
    crawlSummary: { stopReason: 'static_only' },
    staticOnly: true,
  });
  assert.equal(ux.coverage.perfectScoreEligible, false);
  assert.ok(ux.overall <= 99);
});

test('computeUxScores: ancillary findings do not block perfectEligible on live crawl', () => {
  const ux = computeUxScores({
    pages: [
      {
        url: 'http://x/',
        findings: [
          makeFinding({
            checkId: 'x',
            severity: 'critical',
            area: 'inventory',
            message: '',
            evidence: '',
            remediation: '',
          }),
        ],
      },
    ],
    crawlSummary: { stopReason: 'normal_completion' },
    staticOnly: false,
  });
  assert.equal(ux.coverage.effectiveFindingCount, 0);
  assert.equal(ux.overall, 100);
});

test('computeUxScores: hero damage lands in narrativeHero dimension', () => {
  const ux = computeUxScores({
    pages: [
      {
        url: 'http://x/',
        findings: [
          makeFinding({
            checkId: 't',
            severity: 'minor',
            area: 'hero',
            message: 'm',
            evidence: '',
            remediation: '',
          }),
        ],
      },
    ],
    crawlSummary: { stopReason: 'normal_completion' },
    staticOnly: false,
  });
  assert.ok(ux.dimensions.narrativeHero.rawDamage > 0);
  assert.ok(ux.dimensions.informationArchitecture.rawDamage === 0);
  assert.ok(ux.overall < 100);
  const expectedFloor = Math.round(100 - DESIGN_UX_LOG_K * Math.log1p(8));
  assert.ok(ux.dimensions.narrativeHero.score <= Math.min(99, expectedFloor));
});

test('computeUxScores: paused crawl lowers cap when pristine', () => {
  const ux = computeUxScores({
    pages: [{ url: 'http://x/', findings: [] }],
    crawlSummary: { stopReason: 'major_plus_threshold' },
    staticOnly: false,
  });
  assert.equal(ux.coverage.crawlStoppedEarly, true);
  assert.ok(ux.overall <= 98);
});

test('extractUxScoresFromSavedJson reads audit-style envelope', () => {
  const ux = computeUxScores({
    pages: [{ url: 'http://x/', findings: [] }],
    crawlSummary: { stopReason: 'normal_completion' },
    staticOnly: false,
  });
  const wrapped = JSON.parse(JSON.stringify({ schemaVersion: 2, uxScores: ux }));
  const out = extractUxScoresFromSavedJson(wrapped);
  assert.equal(out.overall, ux.overall);
});

test('compareUxScores deltas overall when score improves', () => {
  const worse = computeUxScores({
    pages: [
      {
        url: 'http://x/',
        findings: [
          makeFinding({ checkId: 'h', severity: 'major', area: 'hero', message: 'x', evidence: '', remediation: '' }),
        ],
      },
    ],
    crawlSummary: { stopReason: 'normal_completion' },
    staticOnly: false,
  });
  const better = computeUxScores({
    pages: [{ url: 'http://x/', findings: [] }],
    crawlSummary: { stopReason: 'normal_completion' },
    staticOnly: false,
  });
  const c = compareUxScores(worse, better);
  assert.ok(typeof c.overall.delta === 'number');
  assert.ok(c.overall.delta > 0);
  assert.ok(c.dimensions.narrativeHero.delta > 0);
});
