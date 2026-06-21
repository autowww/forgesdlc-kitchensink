import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getScenarioRenderRoots,
  normalizeScenarioSteps,
  scenarioStepUrl,
} from '../lib/smoke-plan.mjs';

test('normalizeScenarioSteps creates implicit land step', () => {
  const steps = normalizeScenarioSteps({
    scenarioId: 'x',
    navigate: { hash: 'dashboard-section' },
    ready: '#dashboard-heading',
    ownership: [{ path: 'a.js', role: 'behavior' }],
  });
  assert.equal(steps.length, 1);
  assert.equal(steps[0].stepId, 'land');
  assert.equal(steps[0].navigate.hash, 'dashboard-section');
});

test('getScenarioRenderRoots merges step and scenario ownership', () => {
  const roots = getScenarioRenderRoots({
    scenarioId: 'x',
    ownership: [{ path: 'global.js', role: 'behavior' }],
    steps: [
      {
        stepId: 'land',
        render_roots: [{ path: 'step.js', role: 'markup' }],
      },
    ],
  });
  assert.equal(roots.length, 2);
  assert.ok(roots.some((r) => r.path === 'step.js'));
});

test('scenarioStepUrl uses step navigate', () => {
  const url = scenarioStepUrl(
    { scenarioId: 'route-dashboard', navigate: { hash: 'other' } },
    'http://127.0.0.1:8765',
    { stepId: 'land', navigate: { hash: 'dashboard-section' } },
  );
  assert.ok(url.includes('#dashboard-section'), url);
});
