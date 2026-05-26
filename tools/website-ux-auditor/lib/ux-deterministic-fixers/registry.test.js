import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getPilotEntry, isPilotRule, listPilotRuleIds } from './registry.mjs';

describe('pilot registry', () => {
  it('lists pilot rules including DET.HASH.MARKERS', () => {
    const ids = listPilotRuleIds();
    assert.ok(ids.includes('DET.HASH.MARKERS'));
    assert.ok(ids.length >= 50, `expected full DET pilot set, got ${ids.length}`);
  });

  it('resolves handbook_after for DET.PAGE.TITLE', () => {
    const e = getPilotEntry('DET.PAGE.TITLE');
    assert.ok(e);
    assert.equal(e.fixerId, 'handbook_after');
    assert.ok(isPilotRule('DET.PAGE.TITLE'));
  });
});
