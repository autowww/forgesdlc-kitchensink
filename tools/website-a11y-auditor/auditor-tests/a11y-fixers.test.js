import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveFixerRuleId } from '../lib/a11y-deterministic-fixers/load-audit-findings.mjs';
import registry from '../lib/a11y-deterministic-fixers/pilot-registry.json' with { type: 'json' };

describe('a11y-deterministic-fixers', () => {
  it('resolveFixerRuleId prefers candidateDeterministicRule over checkId', () => {
    assert.equal(
      resolveFixerRuleId({
        checkId: 'DET.A11Y.GENERIC.TITLE',
        candidateDeterministicRule: 'DET.A11Y.GENERIC.LANG',
      }),
      'DET.A11Y.GENERIC.LANG',
    );
  });

  it('pilot registry covers all implemented DET rules with handbook_after', () => {
    const list = registry.rules || [];
    assert.equal(list.length, registry.ruleCount);
    assert.ok(list.length >= 68);
    assert.ok(list.every((e) => e.fixerId === 'handbook_after'));
    assert.ok(list.every((e) => String(e.ruleId || '').startsWith('DET.A11Y.')));
  });
});
