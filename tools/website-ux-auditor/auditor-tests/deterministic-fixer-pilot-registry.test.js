import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getPilotEntry, isPilotRule, listPilotRuleIds } from '../lib/ux-deterministic-fixers/registry.mjs';

describe('pilot registry (auditor-tests)', () => {
  it('lists pilot rules including DET.HASH.MARKERS', () => {
    const ids = listPilotRuleIds();
    assert.ok(ids.includes('DET.HASH.MARKERS'));
    assert.ok(ids.includes('DET.APP.DEMO_DISCLOSURE'));
    assert.ok(ids.length >= 87, `expected expanded DET pilot set, got ${ids.length}`);
  });

  it('marks plan_only rules in pilot registry', () => {
    const e = getPilotEntry('DET.APP.ROUTE_DEEPLINK_STATE');
    assert.ok(e, 'pending registry rule should be in pilot set');
    assert.equal(e.fixerId, 'plan_only');
    assert.equal(e.planOnly, true);
  });

  it('wires app_primitive_source for DET.APP.PRIMITIVE_SOURCE', () => {
    const e = getPilotEntry('DET.APP.PRIMITIVE_SOURCE');
    assert.ok(e);
    assert.equal(e.fixerId, 'app_primitive_source');
    assert.ok(isPilotRule('DET.APP.PRIMITIVE_SOURCE'));
  });
});
