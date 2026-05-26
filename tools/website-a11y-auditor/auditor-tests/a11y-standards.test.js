import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveA11yStandard } from '../lib/a11y-standards.js';

describe('a11y-standards', () => {
  it('resolves wcag22aa preset', () => {
    const s = resolveA11yStandard({ standard: 'wcag22aa' });
    assert.ok(s.axeTags.includes('wcag22aa'));
    assert.ok(s.axeTags.includes('wcag2aa'));
    assert.ok(s.complianceProfile?.id === 'wcag22aa');
    assert.ok(Array.isArray(s.detStandardsTags));
  });

  it('honors explicit axe tags', () => {
    const s = resolveA11yStandard({ axeTags: ['wcag2a', 'best-practice'] });
    assert.equal(s.presetId, 'custom');
    assert.deepEqual(s.axeTags, ['wcag2a', 'best-practice']);
  });

  it('derives level aa tags', () => {
    const s = resolveA11yStandard({ wcagLevel: 'aa' });
    assert.ok(s.axeTags.includes('wcag21aa'));
  });
});
