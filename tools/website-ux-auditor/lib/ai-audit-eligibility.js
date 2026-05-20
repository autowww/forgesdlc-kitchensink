/**
 * When the remediation loop may start the post-deterministic AI audit pass.
 */

import { evaluateAuditQualityGate, loadQualityGateThresholdsFromEnv } from './quality-gate.js';
import { isPagesCrawlBudgetComplete } from './loop-watch-progress.js';
import {
  isDeterministicRuleSatisfiedStatus,
  rollupRuleExecution,
} from './rule-execution-rollup.js';

export { isDeterministicRuleSatisfiedStatus };

/**
 * @param {object} page
 * @param {string[]} implementedRuleIds
 */
export function pageHasFullDeterministicCoverage(page, implementedRuleIds) {
  if (!implementedRuleIds?.length) return true;
  if (page?.error && !page?.ruleExecution) return false;
  const det = page?.ruleExecution?.deterministic || [];
  const byId = new Map(det.map((r) => [String(r.ruleId || ''), r]));
  for (const id of implementedRuleIds) {
    const row = byId.get(id);
    if (!row || !isDeterministicRuleSatisfiedStatus(row.status)) return false;
  }
  return true;
}

/**
 * Crawl finished within budget with no queued URLs left (not an early governor stop).
 * @param {object} crawlSummary
 */
export function isCrawlCompleteForAiAudit(crawlSummary) {
  if (!crawlSummary || typeof crawlSummary !== 'object') return false;
  const queued = Number(crawlSummary.queuedRemainingAtStop ?? crawlSummary.queuedRemaining ?? NaN);
  if (!Number.isFinite(queued) || queued > 0) return false;
  const captured = Number(crawlSummary.pagesCaptured ?? NaN);
  if (!Number.isFinite(captured) || captured <= 0) return false;

  const stopReason = String(crawlSummary.stopReason || '');
  const blockedStops = new Set([
    'backlog_threshold',
    'major_plus_threshold',
    'incomplete_session',
    'backlog_early_stop',
    'major_plus_early_stop',
  ]);
  if (blockedStops.has(stopReason)) return false;

  return isPagesCrawlBudgetComplete(crawlSummary);
}

/**
 * @param {object|null} audit audit-data.json root
 * @param {{ env?: Record<string, string | undefined> }} [opts]
 */
export function evaluateAiAuditEligibility(audit, opts = {}) {
  const env = opts.env || process.env;
  const forced = String(env.FORGE_UX_FORCE_AI_AUDIT || '') === '1';

  if (!audit || typeof audit !== 'object') {
    return {
      eligible: forced,
      forced,
      reasons: forced ? [] : ['missing audit-data'],
      checks: { qualityGate: false, pagesComplete: false, rulesComplete: false },
    };
  }

  if (audit.staticOnly === true) {
    return {
      eligible: forced,
      forced,
      reasons: forced ? [] : ['static-only audit (no live crawl)'],
      checks: { qualityGate: false, pagesComplete: false, rulesComplete: false },
    };
  }

  let thresholds;
  try {
    thresholds = loadQualityGateThresholdsFromEnv(env);
  } catch {
    thresholds = loadQualityGateThresholdsFromEnv({});
  }

  const gate = evaluateAuditQualityGate(audit, thresholds);
  const crawlSummary = audit.crawlSummary || {};
  const pages = audit.pages || [];
  const implementedIds = crawlSummary.deterministicImplementedRuleIds || [];
  const pagesComplete = isCrawlCompleteForAiAudit(crawlSummary);
  const rulesRollup = rollupRuleExecution(pages, { implementedRuleIds: implementedIds });
  const rulesComplete =
    pages.length > 0
    && implementedIds.length > 0
    && pages.every((p) => pageHasFullDeterministicCoverage(p, implementedIds))
    && rulesRollup.deterministicRanOnAllVisitedPages;

  const reasons = [];
  if (!gate.pass) reasons.push('quality gate not met');
  if (!pagesComplete) reasons.push('crawl not complete (queued pages remain or early stop)');
  if (!rulesComplete) reasons.push('deterministic rules not fully evaluated on all visited pages');

  const eligible = forced || (gate.pass && pagesComplete && rulesComplete);

  return {
    eligible,
    forced,
    reasons,
    checks: {
      qualityGate: gate.pass,
      pagesComplete,
      rulesComplete,
    },
  };
}
