import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { run } from '../design-rules/deterministic/generated/det-a11y-generic-lang.check.js';

describe('DET.A11Y.GENERIC.LANG', () => {
  it('flags missing lang', () => {
    const findings = run({ metrics: { lang: '' } });
    assert.equal(findings.length, 1);
  });

  it('passes when lang present', () => {
    const findings = run({ metrics: { lang: 'en' } });
    assert.equal(findings.length, 0);
  });
});
