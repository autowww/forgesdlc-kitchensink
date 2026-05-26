import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveA11yStandard } from '../lib/a11y-standards.js';
import {
  getComplianceProfile,
  ruleMatchesComplianceProfile,
  buildComplianceProfilesCrosswalk,
  partitionRulesByComplianceProfile,
} from '../lib/compliance-profiles.js';

describe('compliance-profiles', () => {
  it('ada-title-ii resolves same axe tags as wcag21aa', () => {
    const ada = resolveA11yStandard({ standard: 'ada-title-ii-wcag21aa' });
    const wcag = resolveA11yStandard({ standard: 'wcag21aa' });
    assert.deepEqual(ada.axeTags, wcag.axeTags);
    assert.equal(ada.complianceProfile.id, 'ada-title-ii-wcag21aa');
    assert.deepEqual(ada.detStandardsTags, wcag.detStandardsTags);
  });

  it('wcag22aaa preset includes wcag22aaa axe tag', () => {
    const s = resolveA11yStandard({ standard: 'wcag22aaa' });
    assert.ok(s.axeTags.includes('wcag22aaa'));
    assert.ok(s.detStandardsTags.includes('wcag22aaa'));
  });

  it('filters DET rules by standards overlap', () => {
    const rules = [
      { id: 'DET.A11Y.GENERIC.MOTION_REDUCED', standards: ['wcag21aa', 'wcag22aa'] },
      { id: 'DET.A11Y.GENERIC.LANG', standards: ['wcag2aa', 'wcag21aa'] },
    ];
    const { inScope, excluded } = partitionRulesByComplianceProfile(rules, ['wcag2aa']);
    assert.equal(inScope.length, 1);
    assert.equal(inScope[0].id, 'DET.A11Y.GENERIC.LANG');
    assert.equal(excluded.length, 1);
    assert.equal(excluded[0].id, 'DET.A11Y.GENERIC.MOTION_REDUCED');
  });

  it('includes rules with empty standards (fail-safe)', () => {
    assert.ok(ruleMatchesComplianceProfile({ standards: [] }, ['wcag2aa']));
  });

  it('builds crosswalk with axe tags', () => {
    const crosswalk = buildComplianceProfilesCrosswalk({
      wcag21aa: ['wcag2a', 'wcag21aa'],
    });
    const row = crosswalk.profiles.find((p) => p.id === 'wcag21aa');
    assert.ok(row);
    assert.deepEqual(row.axeTags, ['wcag2a', 'wcag21aa']);
  });

  it('lists ADA profiles', () => {
    assert.ok(getComplianceProfile('ada-title-iii-wcag21aa'));
  });
});
