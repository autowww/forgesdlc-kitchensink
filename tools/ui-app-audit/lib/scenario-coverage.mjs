import { routeKeysFromScenarios } from './vite-react-smoke-inference.mjs';

/**
 * @typedef {object} ScenarioCoverageReport
 * @property {number} schemaVersion
 * @property {string} planId
 * @property {number} knownRouteCount
 * @property {number} scenariosInPlan
 * @property {number} scenariosAudited
 * @property {number} scenariosCandidate
 * @property {number} scenariosImplemented
 * @property {string[]} missingRouteCandidates
 * @property {Record<string, number>} tiersCovered
 * @property {Record<string, number>} failuresByLane
 * @property {Record<string, Record<string, number>>} failuresByScenario
 */

/**
 * @param {object} params
 * @param {{ planId?: string, scenarios: object[] }} params.plan
 * @param {object} [params.auditData]
 * @param {import('./vite-react-smoke-inference.mjs').InferredRoute[]} [params.inferredRoutes]
 * @param {string[]} [params.auditedScenarioIds]
 */
export function buildScenarioCoverage({
  plan,
  auditData = null,
  inferredRoutes = [],
  auditedScenarioIds = null,
}) {
  const scenarios = plan.scenarios || [];
  const planRouteKeys = routeKeysFromScenarios(scenarios);
  const inferredKeys = new Set(inferredRoutes.map((r) => r.routeKey));
  const knownRouteCount = new Set([...planRouteKeys, ...inferredKeys]).size;

  const missingRouteCandidates = inferredRoutes
    .filter((r) => !planRouteKeys.has(r.routeKey))
    .map((r) => r.routeKey);

  const tiersCovered = {};
  for (const s of scenarios) {
    const tier = String(s.tier || 'smoke').toLowerCase();
    tiersCovered[tier] = (tiersCovered[tier] || 0) + 1;
  }

  let scenariosAudited = 0;
  const failuresByLane = {};
  const failuresByScenario = {};

  const pages = auditData?.pages || [];
  const findings = auditData?.findings || [];
  const auditedSet = new Set(
    auditedScenarioIds ||
      pages.map((p) => p.scenarioId).filter(Boolean) ||
      [],
  );
  scenariosAudited = auditedSet.size;

  for (const f of findings) {
    const lane = String(f.lane || f.source || 'unknown').toLowerCase();
    failuresByLane[lane] = (failuresByLane[lane] || 0) + 1;
    const sid = f.scenarioId || 'unknown';
    if (!failuresByScenario[sid]) failuresByScenario[sid] = {};
    failuresByScenario[sid][lane] = (failuresByScenario[sid][lane] || 0) + 1;
  }

  const scenariosCandidate = scenarios.filter((s) => String(s.status || '').toLowerCase() === 'candidate').length;
  const scenariosImplemented = scenarios.filter((s) => {
    const st = String(s.status || 'implemented').toLowerCase();
    return st === 'implemented' || st === 'reviewed';
  }).length;

  return {
    schemaVersion: 1,
    planId: plan.planId || auditData?.planId || 'default',
    knownRouteCount,
    scenariosInPlan: scenarios.length,
    scenariosAudited,
    scenariosCandidate,
    scenariosImplemented,
    missingRouteCandidates,
    tiersCovered,
    failuresByLane,
    failuresByScenario,
    inferredRouteCount: inferredRoutes.length,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * @param {object[]} scenarios
 * @param {string[]} scenarioIds
 */
export function filterScenariosByIds(scenarios, scenarioIds) {
  if (!scenarioIds?.length) return scenarios;
  const want = new Set(scenarioIds);
  return scenarios.filter((s) => want.has(s.scenarioId));
}

/**
 * @param {object[]} findings
 * @param {string[]} ruleIds
 * @param {string[]} scenarioIds
 */
export function impactedScenarioIdsFromFindings(findings, ruleIds = [], scenarioIds = []) {
  if (scenarioIds.length) return [...new Set(scenarioIds)];
  const rules = new Set(ruleIds.map((r) => r.toUpperCase()));
  const out = new Set();
  for (const f of findings) {
    const rid = String(f.ruleId || f.rule || '').toUpperCase();
    if (rules.size && !rules.has(rid)) continue;
    if (f.scenarioId) out.add(f.scenarioId);
  }
  return [...out];
}

/**
 * @param {object} coverage
 */
export function formatCoverageSummary(coverage) {
  const lines = [
    `plan=${coverage.planId} routes=${coverage.knownRouteCount} inPlan=${coverage.scenariosInPlan} audited=${coverage.scenariosAudited}`,
    `candidate=${coverage.scenariosCandidate} implemented=${coverage.scenariosImplemented} missingCandidates=${coverage.missingRouteCandidates.length}`,
    `tiers=${JSON.stringify(coverage.tiersCovered)}`,
    `failuresByLane=${JSON.stringify(coverage.failuresByLane)}`,
  ];
  return lines.join('\n');
}
