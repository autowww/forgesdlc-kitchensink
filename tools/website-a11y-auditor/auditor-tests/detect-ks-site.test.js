import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { detectKsFromDomPages, resolveRulesScope, ruleScopeEnabled } from '../lib/detect-ks-site.js';

describe('detect-ks-site', () => {
  it('detects KS from DOM metrics', () => {
    const pages = [
      { metrics: { ksHashNodeCount: 5, hasHandbookChapter: true } },
      { metrics: { ksHashNodeCount: 3 } },
    ];
    const { score } = detectKsFromDomPages(pages);
    assert.ok(score > 0.3);
  });

  it('auto scope enables ks when repo score high', () => {
    const r = resolveRulesScope({ rulesScope: 'auto', repoScore: 0.6, domScore: 0 });
    assert.equal(r.ksDriven, true);
    assert.equal(r.effectiveScope, 'ks');
  });

  it('generic scope disables ks rules', () => {
    const resolved = resolveRulesScope({ rulesScope: 'generic', repoScore: 1, domScore: 1 });
    assert.equal(ruleScopeEnabled('ks', resolved), false);
    assert.equal(ruleScopeEnabled('generic', resolved), true);
  });
});
