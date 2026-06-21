import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSmokeFixPassScenarios } from '../lib/smoke-fix-pass.mjs';
import { resolveFixRoots } from '../../website-ux-auditor/lib/fix-roots.mjs';

test('buildSmokeFixPassScenarios groups by scenario and step', () => {
  const roots = resolveFixRoots('/tmp/app');
  const scenarios = buildSmokeFixPassScenarios(
    {
      pages: [
        {
          scenarioId: 'route-dashboard',
          findings: [
            { stepId: 'land', ruleId: 'DET.APP.PRIMARY_CTA', severity: 'Major', sources: [{ path: 'a.js' }] },
          ],
        },
      ],
    },
    { scenarios: [{ scenarioId: 'route-dashboard' }] },
    roots,
  );
  assert.equal(scenarios.length, 1);
  assert.equal(scenarios[0].scenarioId, 'route-dashboard');
  assert.equal(scenarios[0].stepId, 'land');
  assert.ok(scenarios[0].ruleIds.includes('DET.APP.PRIMARY_CTA'));
});
