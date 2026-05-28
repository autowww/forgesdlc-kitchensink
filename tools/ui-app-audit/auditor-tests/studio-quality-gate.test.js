import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  filterFindingsForStudioGate,
  isGateableStudioFinding,
} from '../lib/studio-quality-gate.mjs';
import { A11Y_STUDIO_UX_DET_EXCLUDED } from '../lib/studio-ux-det-policy.mjs';

describe('studio-quality-gate', () => {
  it('gateable includes axe and a11y DET only', () => {
    assert.equal(isGateableStudioFinding({ checkId: 'axe-lane', ruleId: 'AXE.foo' }), true);
    assert.equal(isGateableStudioFinding({ ruleId: 'DET.A11Y.GENERIC.CONTRAST' }), true);
    assert.equal(isGateableStudioFinding({ checkId: 'app-shell-inner' }), true);
    assert.equal(isGateableStudioFinding({ ruleId: 'DET.CONTEXT.BURDEN' }), false);
  });

  it('filter respects waivers', () => {
    const findings = [
      { ruleId: 'AXE.color-contrast', severity: 'major' },
      { ruleId: 'DET.A11Y.GENERIC.CONTRAST', severity: 'major' },
    ];
    const out = filterFindingsForStudioGate(findings, new Set(['AXE.color-contrast']));
    assert.equal(out.length, 1);
    assert.equal(out[0].ruleId, 'DET.A11Y.GENERIC.CONTRAST');
  });
});

describe('studio-ux-det-policy', () => {
  it('excludes handbook-heavy UX DET for a11y-studio', () => {
    assert.ok(A11Y_STUDIO_UX_DET_EXCLUDED.includes('DET.CONTEXT.BURDEN'));
    assert.ok(A11Y_STUDIO_UX_DET_EXCLUDED.includes('DET.THEME.CONTRAST_MIN'));
  });
});
