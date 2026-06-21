import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildScenarioCoverage,
  impactedScenarioIdsFromFindings,
} from '../lib/scenario-coverage.mjs';

test('buildScenarioCoverage aggregates tiers and lane failures', () => {
  const coverage = buildScenarioCoverage({
    plan: {
      planId: 'p1',
      scenarios: [
        { scenarioId: 'a', tier: 'smoke', status: 'implemented' },
        { scenarioId: 'b', tier: 'demo', status: 'candidate' },
      ],
    },
    auditData: {
      pages: [{ scenarioId: 'a' }],
      findings: [
        { scenarioId: 'a', lane: 'axe', severity: 'major' },
        { scenarioId: 'a', lane: 'ux-det', severity: 'minor' },
        { scenarioId: 'b', lane: 'det', severity: 'critical' },
      ],
    },
    inferredRoutes: [{ routeKey: 'path:/new', navigate: { path: '/new' } }],
  });
  assert.equal(coverage.scenariosInPlan, 2);
  assert.equal(coverage.scenariosAudited, 1);
  assert.equal(coverage.scenariosCandidate, 1);
  assert.equal(coverage.failuresByLane.axe, 1);
  assert.equal(coverage.failuresByScenario.a.axe, 1);
  assert.ok(coverage.missingRouteCandidates.includes('path:/new'));
});

test('impactedScenarioIdsFromFindings filters by ruleId', () => {
  const ids = impactedScenarioIdsFromFindings(
    [
      { scenarioId: 'home-shell', ruleId: 'DET.APP.PRIMARY_STATE' },
      { scenarioId: 'other', ruleId: 'DET.CARD.TITLE' },
    ],
    ['DET.APP.PRIMARY_STATE'],
    [],
  );
  assert.deepEqual(ids, ['home-shell']);
});
