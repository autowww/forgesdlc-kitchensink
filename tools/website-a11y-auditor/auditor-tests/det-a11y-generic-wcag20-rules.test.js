import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { run as focusContextRun } from '../design-rules/deterministic/generated/det-a11y-generic-focus-context-change.check.js';
import { run as inputContextRun } from '../design-rules/deterministic/generated/det-a11y-generic-input-context-change.check.js';
import { run as readingOrderRun } from '../design-rules/deterministic/generated/det-a11y-generic-reading-order.check.js';
import { runSitewide as consistentLabelsSitewide } from '../design-rules/deterministic/generated/det-a11y-generic-consistent-labels.check.js';
import { runSitewide as consistentNavSitewide } from '../design-rules/deterministic/generated/det-a11y-generic-consistent-nav.check.js';
import { run as resizeTextRun } from '../design-rules/deterministic/generated/det-a11y-generic-resize-text.check.js';

describe('WCAG 2.0 gap DET rules', () => {
  it('per-page rules return no findings without Playwright page', async () => {
    assert.equal((await focusContextRun({ url: 'https://example.test/' })).length, 0);
    assert.equal((await inputContextRun({ url: 'https://example.test/' })).length, 0);
    assert.equal((await readingOrderRun({ url: 'https://example.test/' })).length, 0);
  });

  it('CONSISTENT_LABELS flags differing labels for the same key', async () => {
    const findings = await consistentLabelsSitewide({
      pages: [
        {
          url: 'https://example.test/a',
          labelSamples: [{ key: 'link:/nav', label: 'menu' }],
        },
        {
          url: 'https://example.test/b',
          labelSamples: [{ key: 'link:/nav', label: 'navigation' }],
        },
      ],
    });
    assert.equal(findings.length, 1);
    assert.match(findings[0].message, /consistent identification/i);
  });

  it('RESIZE_TEXT flags restrictive viewport meta', async () => {
    const findings = await resizeTextRun({
      metrics: { metaViewport: 'width=device-width, maximum-scale=1, user-scalable=no' },
    });
    assert.equal(findings.length, 1);
    assert.match(findings[0].message, /zoom/i);
  });

  it('CONSISTENT_NAV flags differing nav labels', async () => {
    const findings = await consistentNavSitewide({
      pages: [
        { url: 'https://example.test/a', navSample: { navLabel: 'main', linkPaths: ['/'] } },
        { url: 'https://example.test/b', navSample: { navLabel: 'primary', linkPaths: ['/'] } },
      ],
    });
    assert.equal(findings.length, 1);
    assert.match(findings[0].message, /navigation/i);
  });

  it('CONSISTENT_LABELS passes when labels match', async () => {
    const findings = await consistentLabelsSitewide({
      pages: [
        { url: 'https://example.test/a', labelSamples: [{ key: 'link:/nav', label: 'menu' }] },
        { url: 'https://example.test/b', labelSamples: [{ key: 'link:/nav', label: 'menu' }] },
      ],
    });
    assert.equal(findings.length, 0);
  });
});
