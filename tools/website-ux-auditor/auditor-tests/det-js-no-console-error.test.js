import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findingsFromJsConsoleErrorReport,
  run,
  shouldIgnoreConsoleMessage,
} from '../design-rules/deterministic/generated/det-js-no-console-error.check.js';

test('shouldIgnoreConsoleMessage filters favicon and ResizeObserver noise', () => {
  assert.equal(shouldIgnoreConsoleMessage('Failed to load resource: net::ERR_FILE_NOT_FOUND /favicon.ico'), true);
  assert.equal(shouldIgnoreConsoleMessage('ResizeObserver loop limit exceeded'), true);
  assert.equal(shouldIgnoreConsoleMessage('TypeError: Cannot read properties of undefined'), false);
});

test('findingsFromJsConsoleErrorReport flags console and page errors', () => {
  const findings = findingsFromJsConsoleErrorReport({
    errorCount: 2,
    errors: [
      { kind: 'console', text: 'Chart init failed: missing container', location: 'https://x.test/app.js:12' },
      { kind: 'pageerror', text: 'Uncaught ReferenceError: forgeAmbient is not defined' },
    ],
  }, 'https://example.test/page');
  assert.equal(findings.length, 2);
  assert.ok(findings.some((f) => f.message.includes('console reported')));
  assert.ok(findings.some((f) => f.message.includes('Uncaught script error')));
  assert.ok(findings.every((f) => f.evidence.includes('url=https://example.test/page')));
  assert.equal(findings[0].area, 'interaction');
});

test('findingsFromJsConsoleErrorReport drops ignored messages', () => {
  const findings = findingsFromJsConsoleErrorReport({
    errors: [{ kind: 'console', text: 'ResizeObserver loop limit exceeded' }],
  });
  assert.deepEqual(findings, []);
});

test('run returns empty when no report or page', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses metrics.jsConsoleErrorReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/',
      jsConsoleErrorReport: {
        errorCount: 1,
        errors: [{ kind: 'pageerror', text: 'boom' }],
        smokeSteps: 2,
      },
    },
    url: 'https://example.test/',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('Uncaught script error'));
});
