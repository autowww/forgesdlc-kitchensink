import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildInventoryCrosswalkReport,
  collectEmittedHashes,
  collectShowcaseStrayTokens,
  computeShowcaseHashesNotInRegistry,
  extractQuotedAttrValues,
  findingsFromInventoryCrosswalkReport,
  run,
} from '../design-rules/deterministic/generated/det-inventory-crosswalk.check.js';

test('extractQuotedAttrValues collects hash attribute values', () => {
  const vals = extractQuotedAttrValues('<div hash="Abx" data-ks-hash="Abx">', 'hash');
  assert.deepEqual(vals, ['Abx']);
});

test('collectShowcaseStrayTokens flags non-three-letter markers', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'det-inv-xw-'));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'page.html'),
    '<main hash="ABCD" data-ks-hash="Okx">x</main>',
    'utf8',
  );
  const stray = collectShowcaseStrayTokens(dir);
  assert.deepEqual(stray.hash, ['ABCD']);
  assert.deepEqual(stray.dataKsHash, []);
});

test('collectEmittedHashes ignores invalid tokens', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'det-inv-em-'));
  fs.writeFileSync(
    path.join(dir, 'page.html'),
    '<main hash="ZZZ" data-ks-hash="ZZZ">x</main>',
    'utf8',
  );
  assert.deepEqual([...collectEmittedHashes(dir)], ['ZZZ']);
});

test('buildInventoryCrosswalkReport flags unregistered showcase hash from catalogCrosswalk', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'det-inv-repo-'));
  const catalogDir = path.join(dir, 'docs/design/catalog');
  const showcaseDir = path.join(dir, 'showcase');
  fs.mkdirSync(catalogDir, { recursive: true });
  fs.mkdirSync(showcaseDir, { recursive: true });

  fs.writeFileSync(
    path.join(showcaseDir, 'index.html'),
    '<main hash="Str" data-ks-hash="Str"></main>',
    'utf8',
  );
  fs.writeFileSync(
    path.join(catalogDir, 'visual-registry.generated.json'),
    JSON.stringify({
      schemaVersion: 1,
      entries: [{ hash: 'Reg', status: 'active', type: 'page' }],
    }),
    'utf8',
  );
  fs.writeFileSync(
    path.join(catalogDir, 'visual-inventory.generated.json'),
    JSON.stringify({
      schemaVersion: 1,
      items: [],
      catalogCrosswalk: {
        showcase_dir: 'showcase',
        showcase_hashes_not_in_registry: ['Str'],
        emitted_hashes: ['Str', 'Reg'],
      },
    }),
    'utf8',
  );

  const report = buildInventoryCrosswalkReport(dir);
  assert.equal(report.skipped, false);
  assert.ok(report.issues.some((i) => i.kind === 'unregistered-emitted' && i.hash === 'Str'));
});

test('findingsFromInventoryCrosswalkReport maps issues to UX findings', () => {
  const findings = findingsFromInventoryCrosswalkReport({
    skipped: false,
    inventoryJson: 'docs/design/catalog/visual-inventory.generated.json',
    issues: [
      {
        kind: 'unregistered-emitted',
        hash: 'Str',
        message: 'Showcase emits hash Str but it is not in visual-registry.generated.json.',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
  assert.equal(findings[0].area, 'visual-catalog');
  assert.match(findings[0].message, /Str/);
});

test('run returns empty without repoRoot', async () => {
  assert.deepEqual(await run({ metrics: {}, repoRoot: '' }), []);
});

test('run uses metrics.inventoryCrosswalkReport when provided', async () => {
  const findings = await run({
    repoRoot: '/tmp/unused',
    metrics: {
      inventoryCrosswalkReport: {
        skipped: false,
        issues: [
          {
            kind: 'crosswalk-missing',
            message: 'catalogCrosswalk missing',
          },
        ],
      },
    },
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'minor');
});

test('computeShowcaseHashesNotInRegistry compares live showcase scan to registry', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'det-inv-live-'));
  const catalogDir = path.join(dir, 'docs/design/catalog');
  const showcaseDir = path.join(dir, 'showcase');
  fs.mkdirSync(catalogDir, { recursive: true });
  fs.mkdirSync(showcaseDir, { recursive: true });
  fs.writeFileSync(
    path.join(showcaseDir, 'index.html'),
    '<main hash="Xyz" data-ks-hash="Xyz"></main>',
    'utf8',
  );
  fs.writeFileSync(
    path.join(catalogDir, 'visual-registry.generated.json'),
    JSON.stringify({ entries: [{ hash: 'Aaa', status: 'active' }] }),
    'utf8',
  );
  assert.deepEqual(computeShowcaseHashesNotInRegistry(dir, showcaseDir), ['Xyz']);
});
