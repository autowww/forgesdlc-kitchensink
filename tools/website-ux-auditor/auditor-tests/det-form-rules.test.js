import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

import { findingsFromFormReport } from '../design-rules/deterministic/generated/det-form-label-error-summary.check.js';
import { findingsFromSearchFilterReport } from '../design-rules/deterministic/generated/det-search-filter-state.check.js';
import { findingsFromTableResponsiveReport } from '../design-rules/deterministic/generated/det-table-responsive-controls.check.js';
import { findingsFromLoadingStateReport } from '../design-rules/deterministic/generated/det-loading-empty-error-states.check.js';
import { findingsFromStatusFeedbackReport } from '../design-rules/deterministic/generated/det-status-feedback-region.check.js';
import { findingsFromSocialPreviewReport } from '../design-rules/deterministic/generated/det-metadata-social-preview.check.js';
import { collectGenericWebsitePageReport } from '../lib/generic-website-collectors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(__dirname, 'fixtures/det-generic-website');

test('findingsFromFormReport flags missing labels and error summary', () => {
  const findings = findingsFromFormReport({
    formViolations: [
      { issue: 'missing-label', fieldCount: 2 },
      { issue: 'missing-error-summary', fieldCount: 3 },
    ],
  });
  assert.equal(findings.length, 2);
  assert.ok(findings.some((f) => f.message.includes('label')));
});

test('findingsFromSearchFilterReport flags incomplete filter UI', () => {
  const findings = findingsFromSearchFilterReport({
    searchViolations: [{ issue: 'missing-result-count' }, { issue: 'missing-clear-all' }],
  });
  assert.equal(findings.length, 2);
});

test('findingsFromTableResponsiveReport flags dense table issues', () => {
  const findings = findingsFromTableResponsiveReport({
    tableViolations: [{ issue: 'missing-headers', rows: 12 }],
  });
  assert.equal(findings.length, 1);
});

test('findingsFromLoadingStateReport flags overlapping states', () => {
  const findings = findingsFromLoadingStateReport({
    loadingViolations: [{ issue: 'overlapping-states', states: 'loading+empty' }],
  });
  assert.equal(findings.length, 1);
});

test('findingsFromStatusFeedbackReport flags missing live region', () => {
  const findings = findingsFromStatusFeedbackReport({
    statusViolations: [{ issue: 'submit-without-live-region' }],
  });
  assert.equal(findings.length, 1);
});

test('fail-form fixture triggers form and metadata findings', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${path.join(FIXTURE, 'fail-form.html')}`);
  const report = await collectGenericWebsitePageReport(page);
  await browser.close();

  const formFindings = findingsFromFormReport(report);
  assert.ok(formFindings.length >= 1);

  const socialFindings = findingsFromSocialPreviewReport(report);
  assert.ok(socialFindings.length >= 1);

  const statusFindings = findingsFromStatusFeedbackReport(report);
  assert.ok(statusFindings.length >= 1);
});

test('pass-minimal fixture passes form checks', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${path.join(FIXTURE, 'pass-minimal.html')}`);
  const report = await collectGenericWebsitePageReport(page);
  await browser.close();
  assert.equal(findingsFromFormReport(report).length, 0);
});
