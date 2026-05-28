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

  it('pilot registry has 12 handbook_after DET rules', () => {
    const list = registry.rules || [];
    assert.equal(list.length, 12);
    assert.ok(list.every((e) => e.fixerId === 'handbook_after'));
  });
});
