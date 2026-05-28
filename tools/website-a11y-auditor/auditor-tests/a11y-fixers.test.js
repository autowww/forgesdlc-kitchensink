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

  it('pilot registry covers all implemented DET rules with assigned fixerId', () => {
    const list = registry.rules || [];
    const allowed = new Set([
      'handbook_after',
      'patch_page_lang',
      'patch_page_title',
      'patch_page_viewport',
      'patch_landmarks',
      'patch_diagram_alt',
      'patch_data_table',
      'patch_motion_reduced',
      'patch_motion_flash',
      'patch_app_focus_trap',
      'patch_section_heading',
      'patch_page_mode',
      'patch_cta_label',
      'patch_nav_toc',
      'patch_ambient_z',
      'hash_markers',
      'nav_breadcrumb',
      'repo_production',
    ]);
    assert.equal(list.length, registry.ruleCount);
    assert.ok(list.length >= 68);
    assert.ok(list.every((e) => allowed.has(e.fixerId)));
    assert.ok(list.some((e) => e.fixerId !== 'handbook_after'));
    assert.ok(list.every((e) => String(e.ruleId || '').startsWith('DET.A11Y.')));
  });
});
