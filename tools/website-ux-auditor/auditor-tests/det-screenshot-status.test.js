import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  catalogScreenshotPngPath,
  findingsFromScreenshotStatusReport,
  hasScreenshotDocumentation,
  run,
  scanScreenshotStatus,
} from '../design-rules/deterministic/generated/det-screenshot-status.check.js';

test('hasScreenshotDocumentation accepts url, notes, or screenshot_reason', () => {
  assert.equal(hasScreenshotDocumentation({ screenshot_url: 'https://example/x.png' }), true);
  assert.equal(hasScreenshotDocumentation({ notes: 'deferred' }), true);
  assert.equal(hasScreenshotDocumentation({ screenshot_reason: 'SPA not static' }), true);
  assert.equal(hasScreenshotDocumentation({}), false);
});

test('scanScreenshotStatus flags captured without catalog PNG and blocked without docs', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'det-screenshot-status-'));
  const catalogDir = path.join(dir, 'docs/design/catalog');
  const shotsDir = path.join(catalogDir, 'screenshots');
  fs.mkdirSync(shotsDir, { recursive: true });

  fs.writeFileSync(path.join(shotsDir, 'Okk.png'), 'png-bytes', 'utf8');

  fs.writeFileSync(
    path.join(catalogDir, 'visual-registry.generated.json'),
    JSON.stringify({
      schemaVersion: 1,
      entries: [
        {
          hash: 'Cap',
          screenshot_status: 'captured',
          screenshot_url: 'https://ks.example/showcase/screenshots/Cap.png',
        },
        {
          hash: 'Okk',
          screenshot_status: 'captured',
          screenshot_url: 'https://ks.example/showcase/screenshots/Okk.png',
        },
        {
          hash: 'Blk',
          screenshot_status: 'blocked',
        },
        {
          hash: 'Pln',
          screenshot_status: 'planned',
          screenshot_reason: 'awaiting showcase route',
        },
      ],
    }),
    'utf8',
  );

  const report = scanScreenshotStatus(dir);
  assert.equal(report.skipped, false);
  assert.ok(
    report.issues.some((i) => i.kind === 'captured-missing-png' && i.hash === 'Cap'),
  );
  assert.ok(report.issues.some((i) => i.kind === 'undocumented-status' && i.hash === 'Blk'));
  assert.ok(!report.issues.some((i) => i.hash === 'Okk'));
  assert.ok(!report.issues.some((i) => i.hash === 'Pln'));
  assert.equal(catalogScreenshotPngPath(dir, 'Okk'), path.join(shotsDir, 'Okk.png'));
});

test('findingsFromScreenshotStatusReport maps issues to UX findings', () => {
  const findings = findingsFromScreenshotStatusReport({
    skipped: false,
    issues: [
      {
        kind: 'captured-missing-png',
        hash: 'Cap',
        screenshotStatus: 'captured',
        catalogPng: 'docs/design/catalog/screenshots/Cap.png',
        message: 'missing png',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
  assert.equal(findings[0].area, 'visual-catalog');
  assert.equal(findings[0].hash, 'Cap');
});

test('run returns empty without repoRoot', async () => {
  assert.deepEqual(await run({ metrics: {}, repoRoot: '' }), []);
});

test('run uses metrics.screenshotStatusReport when provided', async () => {
  const findings = await run({
    repoRoot: '/tmp/unused',
    metrics: {
      screenshotStatusReport: {
        skipped: false,
        issues: [
          {
            kind: 'undocumented-status',
            hash: 'Blk',
            screenshotStatus: 'blocked',
            message: 'blocked without reason',
          },
        ],
      },
    },
  });
  assert.equal(findings.length, 1);
  assert.match(findings[0].message, /blocked/);
});
