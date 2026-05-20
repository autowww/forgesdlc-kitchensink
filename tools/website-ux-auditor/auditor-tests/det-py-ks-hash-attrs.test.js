import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ksRepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

import {
  BASE_MARKER_EMITTER_PY_PATHS,
  collectMarkerEmitterPyPaths,
  findingsFromPyKsHashAttrsReport,
  firstManualMarkerPattern,
  run,
  scanPyKsHashAttrs,
  usesKsHashHelper,
} from '../design-rules/deterministic/generated/det-py-ks-hash-attrs.check.js';

test('usesKsHashHelper accepts ks_hash_attrs and catalog wrappers', () => {
  assert.equal(usesKsHashHelper('return ks_hash_attrs("Abc", "layout", "x")'), true);
  assert.equal(usesKsHashHelper('from ks_catalog_hashes import page_main_attrs'), true);
  assert.equal(usesKsHashHelper('x = layout_shell_attrs("handbook_page")'), true);
  assert.equal(usesKsHashHelper('print("hello")'), false);
});

test('firstManualMarkerPattern detects inline governed markers', () => {
  assert.ok(firstManualMarkerPattern('<div data-ks-hash="Abc">'));
  assert.equal(firstManualMarkerPattern('ks_hash_attrs("Abc", "t", "n")'), null);
});

test('scanPyKsHashAttrs flags missing helper and manual literals', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'det-py-ks-hash-attrs-'));
  fs.mkdirSync(path.join(dir, 'components'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'docs/design/catalog'), { recursive: true });

  fs.writeFileSync(
    path.join(dir, 'docs/design/catalog/visual-registry.generated.json'),
    JSON.stringify({
      schemaVersion: 1,
      entries: [
        {
          hash: 'Hbk',
          status: 'active',
          type: 'layout',
          source_paths: ['components/layouts.py'],
        },
      ],
    }),
    'utf8',
  );

  fs.writeFileSync(
    path.join(dir, 'components/layouts.py'),
    'def handbook_page():\n    return "<main hash=\\"Bad\\" data-ks-hash=\\"Bad\\">"\n',
    'utf8',
  );

  for (const rel of BASE_MARKER_EMITTER_PY_PATHS) {
    if (rel === 'components/layouts.py') continue;
    const abs = path.join(dir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    const body =
      rel === 'components/ks_catalog_hashes.py'
        ? 'def page_main_attrs(slug):\n    return ks_hash_attrs("Abc", "page", slug)\n'
        : 'from ks_catalog_hashes import page_main_attrs\n';
    fs.writeFileSync(abs, body, 'utf8');
  }

  const report = scanPyKsHashAttrs(dir);
  assert.equal(report.skipped, false);
  assert.ok(report.issues.some((i) => i.kind === 'missing-helper' && i.path === 'components/layouts.py'));
  assert.ok(report.issues.some((i) => i.kind === 'manual-literal' && i.path === 'components/layouts.py'));
});

test('findingsFromPyKsHashAttrsReport maps issues to visual-catalog findings', () => {
  const findings = findingsFromPyKsHashAttrsReport({
    issues: [
      {
        kind: 'missing-helper',
        path: 'components/layouts.py',
        message: 'components/layouts.py emits governed visual roots but does not call ks_hash_attrs or ks_catalog_hashes helpers.',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'minor');
  assert.equal(findings[0].area, 'visual-catalog');
  assert.ok(findings[0].evidence.includes('components/layouts.py'));
  assert.ok(findings[0].remediation.includes('ks_hash_attrs'));
});

test('run uses metrics.pyKsHashAttrsReport when provided', async () => {
  const findings = await run({
    repoRoot: '/tmp/unused',
    metrics: {
      pyKsHashAttrsReport: {
        issues: [
          {
            kind: 'manual-literal',
            path: 'components/bad.py',
            message: 'components/bad.py inlines governed KS hash attributes.',
          },
        ],
      },
    },
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].message.includes('inlines'));
});

test('scanPyKsHashAttrs passes on kitchensink repo', () => {
  if (!fs.existsSync(path.join(ksRepoRoot, 'components/ks_hash_attrs.py'))) return;
  const report = scanPyKsHashAttrs(ksRepoRoot);
  assert.equal(report.skipped, false);
  assert.equal(report.issues.length, 0, report.issues.map((i) => i.message).join('; '));
});

test('collectMarkerEmitterPyPaths includes registry layout sources', () => {
  const paths = collectMarkerEmitterPyPaths([
    { status: 'active', type: 'layout', source_paths: ['components/layouts.py'] },
    { status: 'active', type: 'page', source_paths: ['generator/pages/index.py'] },
  ]);
  assert.ok(paths.includes('components/layouts.py'));
  assert.ok(paths.includes('generator/build-showcase.py'));
  assert.equal(paths.includes('generator/pages/index.py'), false);
});
