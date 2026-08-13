import assert from 'node:assert/strict';
import test from 'node:test';

import { findingsFromRouteDeeplinkReport, run as runRouteDeeplink } from '../design-rules/deterministic/generated/det-app-route-deeplink-state.check.js';
import { findingsFromErrorBoundaryReport } from '../design-rules/deterministic/generated/det-app-error-boundary-recovery.check.js';
import { findingsFromWorkspaceStateReport } from '../design-rules/deterministic/generated/det-app-empty-loading-error-success.check.js';
import { findingsFromDisabledReasonReport } from '../design-rules/deterministic/generated/det-app-disabled-reason.check.js';
import { findingsFromToastLifecycleReport } from '../design-rules/deterministic/generated/det-app-toast-lifecycle.check.js';
import { findingsFromModalDismissalReport } from '../design-rules/deterministic/generated/det-app-modal-dismissal-guard.check.js';
import { findingsFromWizardProgressReport } from '../design-rules/deterministic/generated/det-app-wizard-progress-controls.check.js';
import { findingsFromBulkActionScopeReport } from '../design-rules/deterministic/generated/det-app-bulk-action-scope.check.js';
import { findingsFromDataRefreshReport } from '../design-rules/deterministic/generated/det-app-data-refresh-staleness.check.js';
import { findingsFromWorkStateReport } from '../design-rules/deterministic/generated/det-app-work-state-persistence.check.js';
import { findingsFromAiProvenanceReport } from '../design-rules/deterministic/generated/det-app-ai-provenance.check.js';
import {
  findingsFromClientErrorLogReport,
  run as runClientErrorLog,
} from '../design-rules/deterministic/generated/det-app-client-error-log-clean.check.js';

test('findingsFromRouteDeeplinkReport flags blank main and nav mismatch', () => {
  const findings = findingsFromRouteDeeplinkReport({
    violations: [
      { issue: 'blank-main', pathname: '/runs' },
      { issue: 'nav-mismatch', pathname: '/settings', navHint: 'Runs' },
    ],
  });
  assert.equal(findings.length, 2);
  assert.ok(findings.some((f) => f.message.includes('blank')));
  assert.ok(findings.some((f) => f.message.includes('navigation')));
});

test('findingsFromErrorBoundaryReport flags blank workspace without recovery', () => {
  const findings = findingsFromErrorBoundaryReport({
    violations: [{ issue: 'blank-without-recovery', workspaceHint: '#workspace' }],
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('error boundary'));
});

test('findingsFromWorkspaceStateReport flags missing heading and next action', () => {
  const findings = findingsFromWorkspaceStateReport({
    violations: [
      { issue: 'missing-heading', workspaceHint: 'hub' },
      { issue: 'missing-next-action', workspaceHint: 'hub' },
    ],
  });
  assert.equal(findings.length, 2);
});

test('findingsFromDisabledReasonReport flags controls without reason', () => {
  const findings = findingsFromDisabledReasonReport({
    violations: [{ controlHint: '#run-submit' }],
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('disabled'));
});

test('findingsFromToastLifecycleReport flags live region and dismiss issues', () => {
  const findings = findingsFromToastLifecycleReport({
    violations: [
      { issue: 'missing-live-region', toastHint: '#toast-1' },
      { issue: 'covers-primary-cta', toastHint: '#toast-2' },
    ],
  });
  assert.equal(findings.length, 2);
});

test('findingsFromModalDismissalReport flags close and destructive guard', () => {
  const findings = findingsFromModalDismissalReport({
    violations: [
      { issue: 'missing-close', modalHint: '#confirm' },
      { issue: 'destructive-without-guard', modalHint: '#delete' },
    ],
  });
  assert.equal(findings.length, 2);
});

test('findingsFromWizardProgressReport flags step and disabled next issues', () => {
  const findings = findingsFromWizardProgressReport({
    violations: [{ issue: 'disabled-next-without-reason', wizardHint: '#wizard' }],
  });
  assert.equal(findings.length, 1);
});

test('findingsFromBulkActionScopeReport flags missing selected count', () => {
  const findings = findingsFromBulkActionScopeReport({
    violations: [{ toolbarHint: '#bulk-bar', destructive: true }],
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('selected'));
});

test('findingsFromDataRefreshReport flags missing freshness controls', () => {
  const findings = findingsFromDataRefreshReport({
    violations: [{ panelHint: '#data-panel', rowCount: 12 }],
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
});

test('findingsFromClientErrorLogReport includes scenario step metadata', () => {
  const findings = findingsFromClientErrorLogReport(
    {
      scenarioId: 'open-run-console',
      stepsExecuted: 2,
      errors: [{ kind: 'pageerror', text: 'TypeError: x is not a function', scenarioStep: 2 }],
    },
    'https://studio.test/runs',
  );
  assert.equal(findings.length, 1);
  assert.ok(findings[0].evidence.includes('scenarioStep=2'));
  assert.ok(findings[0].evidence.includes('scenarioId=open-run-console'));
  assert.ok(findings[0].evidence.includes('url=https://studio.test/runs'));
});

test('runClientErrorLog skips without scenarioClientErrorReport', async () => {
  assert.deepEqual(await runClientErrorLog({ metrics: {}, url: 'https://example.test/' }), []);
});

test('runRouteDeeplink returns empty without violations', async () => {
  assert.deepEqual(
    await runRouteDeeplink({
      metrics: { routeDeeplinkReport: { violations: [] } },
      url: 'https://example.test/',
    }),
    [],
  );
});

test('findingsFromWorkStateReport returns empty without violations', () => {
  assert.deepEqual(findingsFromWorkStateReport({ violations: [] }), []);
});

test('findingsFromWorkStateReport flags missing persistence cues', () => {
  const findings = findingsFromWorkStateReport({
    violations: [{ workspaceHint: '#editor' }],
  });
  assert.ok(findings.length >= 1);
  assert.ok(findings[0].remediation.includes('ForgeAutosaveStatus'));
  assert.ok(findings[0].remediation.includes('DET.APP.WORK_STATE_PERSISTENCE'));
});

test('findingsFromAiProvenanceReport returns empty without violations', () => {
  assert.deepEqual(findingsFromAiProvenanceReport({ violations: [] }), []);
});

test('findingsFromAiProvenanceReport flags missing provenance controls', () => {
  const findings = findingsFromAiProvenanceReport({
    violations: [{ surfaceHint: '#ai-panel', missing: 'label,confidence' }],
  });
  assert.ok(findings.length >= 1);
  assert.ok(findings[0].message.includes('provenance'));
});
