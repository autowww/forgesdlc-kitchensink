import assert from 'node:assert/strict';
import test from 'node:test';

import {
  classifyPagesForProgress,
  compressBucketsToCells,
  computeExpectedIterations,
  computeViolationUnits,
  isPagesCrawlBudgetComplete,
  isRulesCoverageComplete,
} from '../lib/loop-watch-progress.js';
import { DEFAULT_QUALITY_GATE_THRESHOLDS } from '../lib/quality-gate.js';
import { rollupRuleExecution } from '../lib/rule-execution-rollup.js';

test('computeViolationUnits sums over-threshold severities', () => {
  const counts = { blocker: 0, critical: 0, major: 0, warn: 8, minor: 0, trivial: 0, cosmetic: 0 };
  const vu = computeViolationUnits(counts, DEFAULT_QUALITY_GATE_THRESHOLDS);
  assert.equal(vu, 3);
});

test('computeExpectedIterations caps at max and floors while gate fails', () => {
  const expected = computeExpectedIterations({
    iteration: 2,
    maxIterations: 20,
    violationUnits: 30,
    violationUnitsPrev: 50,
    gatePass: false,
    recomputeEstimate: true,
  });
  assert.ok(expected >= 3);
  assert.ok(expected <= 20);
});

test('computeExpectedIterations equals iteration when gate passes', () => {
  assert.equal(
    computeExpectedIterations({
      iteration: 4,
      maxIterations: 20,
      violationUnits: 0,
      gatePass: true,
    }),
    4,
  );
});

test('classifyPagesForProgress buckets clean vs issues', () => {
  const r = classifyPagesForProgress(
    [
      { findings: [] },
      { findings: [{ severity: 'warn' }, { severity: 'warn' }, { severity: 'warn' }, { severity: 'warn' }, { severity: 'warn' }, { severity: 'warn' }] },
    ],
    DEFAULT_QUALITY_GATE_THRESHOLDS,
  );
  assert.equal(r.clean, 1);
  assert.equal(r.issues, 1);
});

test('compressBucketsToCells prioritizes error over issues', () => {
  const cells = compressBucketsToCells(['clean', 'error', 'issues'], 0, 8);
  assert.ok(cells.includes('error'));
});

test('isPagesCrawlBudgetComplete when queue empty and budget met', () => {
  assert.equal(
    isPagesCrawlBudgetComplete({
      queuedRemainingAtStop: 0,
      pagesCaptured: 100,
      pagesPlannedBudget: 100,
      stopReason: 'normal_completion',
    }),
    true,
  );
});

test('isRulesCoverageComplete requires all rules on all pages', () => {
  const pages = [
    {
      url: 'http://a/',
      ruleExecution: {
        deterministic: [
          { ruleId: 'DET.PAGE.LANG', status: 'ran', findingsCount: 0 },
          { ruleId: 'DET.PAGE.TITLE', status: 'ran', findingsCount: 0 },
        ],
      },
    },
  ];
  const cov = rollupRuleExecution(pages, { implementedRuleIds: ['DET.PAGE.LANG', 'DET.PAGE.TITLE'] });
  assert.equal(isRulesCoverageComplete(cov), true);
});
