import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findingsFromAppFocusTrapReport,
  run,
} from '../design-rules/deterministic/generated/det-app-focus-trap.check.js';

test('findingsFromAppFocusTrapReport flags trap escape and missing dismiss', () => {
  const findings = findingsFromAppFocusTrapReport({
    overlayShellCount: 2,
    violations: [
      { kind: 'no-dismiss', id: 'orphanPanel', className: 'custom-panel', shellKind: 'dialog' },
      {
        kind: 'trap-escape',
        id: 'docNavOffcanvas',
        activeTag: 'a',
        activeClass: 'nav-link',
      },
      { kind: 'background-tabbable', id: 'diagramModal', className: 'diagram-modal-backdrop' },
    ],
  });
  assert.equal(findings.length, 3);
  assert.ok(findings.some((f) => f.message.includes('dismiss control')));
  assert.ok(findings.some((f) => f.message.includes('focus moved outside')));
  assert.ok(findings.some((f) => f.message.includes('Main content remained keyboard-focusable')));
  assert.equal(findings[0].area, 'accessibility');
});

test('run returns empty when no focus-trap report or page', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.appFocusTrapReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/',
      appFocusTrapReport: {
        overlayShellCount: 1,
        violations: [{ kind: 'missing-aria-modal', id: 'topicPreviewModal' }],
      },
    },
    url: 'https://example.test/',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('aria-modal'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/'));
});
