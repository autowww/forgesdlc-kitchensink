import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveScenarioLanes } from '../lib/scenario-lanes.mjs';

describe('resolveScenarioLanes', () => {
  it('uses CLI defaults when scenario has no audit_lanes', () => {
    const lanes = resolveScenarioLanes(['axe', 'det'], { scenarioId: 'x' });
    assert.equal(lanes.has('axe'), true);
    assert.equal(lanes.has('det'), true);
  });

  it('honors per-scenario audit_lanes', () => {
    const lanes = resolveScenarioLanes(['axe', 'det', 'ux-det'], {
      scenarioId: 'y',
      audit_lanes: ['axe'],
    });
    assert.equal(lanes.has('axe'), true);
    assert.equal(lanes.has('det'), false);
  });
});
