import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

import { findingsFromOverflowReport } from '../design-rules/deterministic/generated/det-responsive-no-horizontal-overflow.check.js';
import { findingsFromMobileNavReport } from '../design-rules/deterministic/generated/det-mobile-nav-disclosure.check.js';
import { findingsFromMediaAspectReport } from '../design-rules/deterministic/generated/det-media-aspect-ratio.check.js';
import { collectGenericWebsitePageReport } from '../lib/generic-website-collectors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(__dirname, 'fixtures/det-generic-website');

test('findingsFromOverflowReport flags horizontal overflow', () => {
  const findings = findingsFromOverflowReport({
    overflowByViewport: {
      mobile: { overflowPx: 42, clippedPrimary: false },
      desktop: { overflowPx: 0, clippedPrimary: true },
    },
  });
  assert.equal(findings.length, 2);
  assert.ok(findings.some((f) => f.message.includes('mobile')));
});

test('findingsFromMediaAspectReport flags missing aspect hints', () => {
  const findings = findingsFromMediaAspectReport({
    mediaViolations: [{ issue: 'missing-aspect-hint', tag: 'img' }],
  });
  assert.equal(findings.length, 1);
});

test('collectGenericWebsitePageReport pass fixture has no overflow findings', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${path.join(FIXTURE, 'pass-minimal.html')}`);
  const report = await collectGenericWebsitePageReport(page);
  await browser.close();
  const overflowFindings = findingsFromOverflowReport(report);
  assert.equal(overflowFindings.length, 0);
});

test('fail-form fixture triggers overflow and external link findings', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${path.join(FIXTURE, 'fail-form.html')}`);
  const report = await collectGenericWebsitePageReport(page);
  await browser.close();
  const overflowFindings = findingsFromOverflowReport(report);
  assert.ok(overflowFindings.length >= 1);
  const { findingsFromExternalLinkReport } = await import(
    '../design-rules/deterministic/generated/det-external-link-safety.check.js'
  );
  const externalFindings = findingsFromExternalLinkReport(report);
  assert.ok(externalFindings.some((f) => f.message.includes('noopener')));
});

test('findingsFromMobileNavReport maps nav issues', () => {
  const findings = findingsFromMobileNavReport({
    violations: [{ issue: 'missing-close-label' }, { issue: 'nav-does-not-close' }],
  });
  assert.equal(findings.length, 2);
});
