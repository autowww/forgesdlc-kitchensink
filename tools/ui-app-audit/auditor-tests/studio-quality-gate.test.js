import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  evaluateStudioQualityGates,
  filterFindingsForStudioGate,
  filterFindingsForStudioUxGate,
  isGateableStudioFinding,
  isGateableUxFinding,
  resolveStudioGateMode,
} from '../lib/studio-quality-gate.mjs';
import { A11Y_STUDIO_UX_DET_EXCLUDED } from '../lib/studio-ux-det-policy.mjs';

describe('studio-quality-gate', () => {
  it('gateable includes axe and a11y DET only', () => {
    assert.equal(isGateableStudioFinding({ checkId: 'axe-lane', ruleId: 'AXE.foo' }), true);
    assert.equal(isGateableStudioFinding({ ruleId: 'DET.A11Y.GENERIC.CONTRAST' }), true);
    assert.equal(isGateableStudioFinding({ checkId: 'app-shell-inner' }), true);
    assert.equal(isGateableStudioFinding({ ruleId: 'DET.CONTEXT.BURDEN' }), false);
  });

  it('ux gateable includes UX DET only', () => {
    assert.equal(isGateableUxFinding({ ruleId: 'DET.CARD.TITLE', checkId: 'design-rule-runtime' }), true);
    assert.equal(isGateableUxFinding({ ruleId: 'DET.A11Y.GENERIC.CONTRAST' }), false);
    assert.equal(isGateableUxFinding({ checkId: 'app-shell-inner' }), false);
    assert.equal(isGateableUxFinding({ ruleId: 'AXE.color-contrast' }), false);
  });

  it('ux filter excludes a11y DET', () => {
    const findings = [
      { ruleId: 'DET.CARD.TITLE', severity: 'major' },
      { ruleId: 'DET.A11Y.GENERIC.CONTRAST', severity: 'major' },
    ];
    const out = filterFindingsForStudioUxGate(findings);
    assert.equal(out.length, 1);
    assert.equal(out[0].ruleId, 'DET.CARD.TITLE');
  });

  it('evaluateStudioQualityGates ux mode passes when only UX clean', async () => {
    const findings = [
      { ruleId: 'AXE.color-contrast', severity: 'major' },
      { ruleId: 'DET.SECTION.HEADING', severity: 'warn', checkId: 'design-rule-runtime' },
    ];
    const gates = await evaluateStudioQualityGates(findings, {
      env: { FORGE_STUDIO_GATE_MODE: 'ux' },
      waiversPath: '/nonexistent/waivers.yaml',
    });
    assert.equal(gates.mode, 'ux');
    assert.equal(gates.uxQualityGate.pass, true);
    assert.equal(gates.qualityGate.pass, false);
    assert.equal(gates.pass, true);
  });

  it('resolveStudioGateMode defaults to a11y', () => {
    assert.equal(resolveStudioGateMode({}), 'a11y');
    assert.equal(resolveStudioGateMode({ FORGE_STUDIO_GATE_MODE: 'ux' }), 'ux');
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
