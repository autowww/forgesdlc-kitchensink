import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { applies } from '../../website-ux-auditor/checks/app-shell-inner.js';
import { runAllChecksWithTrace } from '../../website-ux-auditor/checks/index.js';

describe('a11y-studio app shell legacy checks', () => {
  it('uses app-shell-inner instead of marketing checks', () => {
    const ctx = { siteKind: 'a11y-studio' };
    const url = 'http://127.0.0.1:9999/#dashboard-section';
    assert.equal(applies(ctx, url), true);
    const metrics = {
      firstH1: 'Dashboard',
      lang: 'en',
      pageTitle: 'Forge A11y Studio',
      imagesMissingAlt: 0,
      lowContrast: [],
      sidebarOffcanvasLinks: 20,
      preMainFirstH1Links: 15,
    };
    const { findings, trace } = runAllChecksWithTrace(metrics, url, ctx);
    assert.equal(trace[0]?.checkId, 'app-shell-inner');
    const ids = findings.map((f) => f.checkId);
    assert.ok(!ids.includes('homepage-shell'));
    assert.ok(!ids.includes('product-visual'));
    assert.ok(!ids.includes('cta-trust-ecosystem'));
  });
});
