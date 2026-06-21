import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  finalizeScenarioClientErrorReport,
  shouldIgnoreScenarioConsoleMessage,
} from '../lib/scenario-client-error-capture.mjs';
import { findingsFromClientErrorLogReport } from '../../website-ux-auditor/design-rules/deterministic/generated/det-app-client-error-log-clean.check.js';

describe('scenario-client-error-capture', () => {
  it('shouldIgnoreScenarioConsoleMessage filters benign noise', () => {
    assert.equal(shouldIgnoreScenarioConsoleMessage(''), true);
    assert.equal(shouldIgnoreScenarioConsoleMessage('ResizeObserver loop limit exceeded'), true);
    assert.equal(shouldIgnoreScenarioConsoleMessage('TypeError: boom'), false);
  });

  it('finalizeScenarioClientErrorReport tags errors with step metadata', () => {
    const report = finalizeScenarioClientErrorReport(
      {
        errors: [{ kind: 'console', text: 'Failed to fetch', location: 'app.js:10' }],
        errorCount: 1,
      },
      { scenarioId: 'click-primary-cta', stepsExecuted: 1 },
    );
    assert.equal(report.scenarioId, 'click-primary-cta');
    assert.equal(report.stepsExecuted, 1);
    assert.equal(report.errors[0].scenarioStep, 1);
    assert.equal(report.errors[0].scenarioId, 'click-primary-cta');
  });

  it('findingsFromClientErrorLogReport surfaces post-step console errors', () => {
    const findings = findingsFromClientErrorLogReport({
      scenarioId: 'click-primary-cta',
      stepsExecuted: 1,
      errors: [
        {
          kind: 'console',
          text: 'Uncaught Error: route handler failed',
          scenarioStep: 1,
          scenarioId: 'click-primary-cta',
        },
      ],
    });
    assert.equal(findings.length, 1);
    assert.ok(findings[0].message.includes('after scenario step'));
    assert.ok(findings[0].evidence.includes('scenarioStep=1'));
  });
});
