import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluateAiAuditEligibility,
  isCrawlCompleteForAiAudit,
  pageHasFullDeterministicCoverage,
} from '../lib/ai-audit-eligibility.js';
import { DEFAULT_QUALITY_GATE_THRESHOLDS } from '../lib/quality-gate.js';

const RULES = ['DET.PAGE.LANG', 'DET.PAGE.TITLE'];

function detTrace(ruleIds, status = 'ran') {
  return ruleIds.map((ruleId) => ({ ruleId, status, findingsCount: 0 }));
}

function baseAudit(overrides = {}) {
  return {
    staticOnly: false,
    pages: [
      {
        url: 'https://example.test/',
        findings: [],
        ruleExecution: { deterministic: detTrace(RULES) },
      },
      {
        url: 'https://example.test/second',
        findings: [],
        ruleExecution: { deterministic: detTrace(RULES) },
      },
    ],
    crawlSummary: {
      stopReason: 'normal_completion',
      queuedRemainingAtStop: 0,
      pagesCaptured: 2,
      pagesPlannedBudget: 2,
      deterministicImplementedRuleIds: RULES,
    },
    ...overrides,
  };
}

test('evaluateAiAuditEligibility passes when gate, crawl, and rules are complete', () => {
  const r = evaluateAiAuditEligibility(baseAudit(), {
    env: { FORGE_UX_QUALITY_GATE_JSON: JSON.stringify(DEFAULT_QUALITY_GATE_THRESHOLDS) },
  });
  assert.equal(r.eligible, true);
  assert.equal(r.forced, false);
  assert.equal(r.checks.qualityGate, true);
  assert.equal(r.checks.pagesComplete, true);
  assert.equal(r.checks.rulesComplete, true);
});

test('evaluateAiAuditEligibility fails on early crawl stop', () => {
  const audit = baseAudit({
    crawlSummary: {
      stopReason: 'backlog_threshold',
      queuedRemainingAtStop: 3,
      pagesCaptured: 2,
      pagesPlannedBudget: 10,
      deterministicImplementedRuleIds: RULES,
    },
  });
  const r = evaluateAiAuditEligibility(audit);
  assert.equal(r.eligible, false);
  assert.ok(r.reasons.some((x) => x.includes('crawl')));
});

test('FORGE_UX_FORCE_AI_AUDIT bypasses incomplete deterministic pass', () => {
  const audit = baseAudit({
    pages: [{ url: 'https://x/', findings: [{ severity: 'blocker' }] }],
    crawlSummary: { stopReason: 'backlog_threshold', queuedRemainingAtStop: 5 },
  });
  const r = evaluateAiAuditEligibility(audit, { env: { FORGE_UX_FORCE_AI_AUDIT: '1' } });
  assert.equal(r.eligible, true);
  assert.equal(r.forced, true);
});

test('pageHasFullDeterministicCoverage accepts cache skips', () => {
  const page = {
    ruleExecution: {
      deterministic: [
        { ruleId: 'DET.PAGE.LANG', status: 'ran', findingsCount: 0 },
        { ruleId: 'DET.PAGE.TITLE', status: 'skipped_no_findings_cache', findingsCount: 0 },
      ],
    },
  };
  assert.equal(pageHasFullDeterministicCoverage(page, RULES), true);
});

test('isCrawlCompleteForAiAudit rejects major_plus early stop with queued URLs', () => {
  assert.equal(
    isCrawlCompleteForAiAudit({
      stopReason: 'major_plus_threshold',
      queuedRemainingAtStop: 2,
      pagesCaptured: 3,
      pagesPlannedBudget: 10,
    }),
    false,
  );
});
