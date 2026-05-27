import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { run as orientationRun } from '../design-rules/deterministic/generated/det-a11y-generic-orientation.check.js';
import { run as inputPurposeRun } from '../design-rules/deterministic/generated/det-a11y-generic-input-purpose.check.js';
import { run as concurrentInputRun } from '../design-rules/deterministic/generated/det-a11y-generic-concurrent-input.check.js';

describe('WCAG 2.1 gap DET rules', () => {
  it('per-page rules return no findings without Playwright page', async () => {
    assert.equal((await inputPurposeRun({ url: 'https://example.test/' })).length, 0);
    assert.equal((await concurrentInputRun({ url: 'https://example.test/' })).length, 0);
  });

  it('ORIENTATION flags orientation lock in viewport meta', async () => {
    const findings = await orientationRun({
      metrics: { metaViewport: 'width=device-width, orientation=landscape' },
    });
    assert.equal(findings.length, 1);
    assert.match(findings[0].message, /orientation/i);
  });

});
