import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findingsFromAppControlA11yReport,
  run,
} from '../design-rules/deterministic/generated/det-app-control-a11y.check.js';

test('findingsFromAppControlA11yReport flags role/state violations on react primitives', () => {
  const findings = findingsFromAppControlA11yReport({
    primitiveRootCount: 3,
    violations: [
      { kind: 'missing-accessible-name', hash: 'Tdc', tag: 'button', id: 'tile-trigger' },
      { kind: 'missing-aria-expanded', hash: 'Wlc', id: 'lens-trigger', haspopup: 'listbox' },
      { kind: 'option-missing-selected', hash: 'Tdc', id: 'opt-1' },
      { kind: 'toolbar-missing-label', hash: 'Fda', id: 'run-actions' },
      { kind: 'banner-missing-live-role', hash: 'Fsb', ksName: 'forge-status-banner' },
      { kind: 'focusable-without-role', hash: 'Fkg', tag: 'div', tabindex: 0, id: 'bad-cell' },
    ],
  });
  assert.equal(findings.length, 6);
  assert.ok(findings.some((f) => f.message.includes('accessible name')));
  assert.ok(findings.some((f) => f.message.includes('aria-expanded')));
  assert.ok(findings.some((f) => f.message.includes('aria-selected')));
  assert.ok(findings.some((f) => f.message.includes('toolbar')));
  assert.ok(findings.some((f) => f.message.includes('role="status"')));
  assert.ok(findings.some((f) => f.message.includes('focusable div/span')));
  assert.equal(findings[0].area, 'accessibility');
});

test('run returns empty when no react a11y report or page', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.appControlA11yReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/showcase/forge-react-primitives.html',
      appControlA11yReport: {
        primitiveRootCount: 1,
        violations: [{ kind: 'listbox-missing-label', hash: 'Tdc', id: 'tile-panel' }],
      },
    },
    url: 'https://example.test/showcase/forge-react-primitives.html',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('listbox'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/showcase/forge-react-primitives.html'));
});
