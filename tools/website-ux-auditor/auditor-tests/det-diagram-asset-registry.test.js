import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  analyzeDomDiagramAssets,
  diagramRegistrySvgPaths,
  findingsFromDiagramAssetRegistryReport,
  normalizeShippedSvgPath,
  parseDiagramCatalogKeysFromJs,
  parseDiagramGalleryKeyToSvg,
  run,
  scanRepoDiagramAssetRegistry,
} from '../design-rules/deterministic/generated/det-diagram-asset-registry.check.js';

test('parseDiagramCatalogKeysFromJs extracts top-level catalog keys', () => {
  const keys = parseDiagramCatalogKeysFromJs(`
window.__FORGE_KS_DIAGRAM_CATALOG = {
    linear: { title: 'Linear' },
    loop: { title: 'Loop' },
};
`);
  assert.deepEqual([...keys].sort(), ['linear', 'loop']);
});

test('parseDiagramGalleryKeyToSvg maps gallery items', () => {
  const map = parseDiagramGalleryKeyToSvg(`
{"key": "linear", "svg": "template-linear-flow.svg", "label": "x"},
{"key": "tree", "svg": "template-tree.svg", "label": "y"},
`);
  assert.equal(map.get('linear'), 'template-linear-flow.svg');
  assert.equal(map.get('tree'), 'template-tree.svg');
});

test('normalizeShippedSvgPath resolves site-relative and absolute URLs', () => {
  assert.equal(normalizeShippedSvgPath('/assets/svg/template-tree.svg'), 'assets/svg/template-tree.svg');
  assert.equal(
    normalizeShippedSvgPath('https://example.test/assets/svg/template-tree.svg'),
    'assets/svg/template-tree.svg',
  );
  assert.equal(normalizeShippedSvgPath('data:image/svg+xml,abc'), '');
});

test('diagramRegistrySvgPaths unions active diagram registry rows only', () => {
  const paths = diagramRegistrySvgPaths([
    { status: 'active', type: 'diagram-asset-group', source_paths: ['assets/svg/template-tree.svg'] },
    { status: 'deprecated', type: 'diagram-asset-group', source_paths: ['assets/svg/removed.svg'] },
    { status: 'active', type: 'page', source_paths: ['showcase/index.html'] },
  ]);
  assert.equal(paths.size, 1);
  assert.ok(paths.has('assets/svg/template-tree.svg'));
});

test('scanRepoDiagramAssetRegistry flags missing family and unregistered template SVG', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'det-diagram-asset-'));
  const catalogDir = path.join(dir, 'docs/design/catalog');
  fs.mkdirSync(path.join(dir, 'js'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'generator/pages'), { recursive: true });
  fs.mkdirSync(catalogDir, { recursive: true });

  fs.writeFileSync(
    path.join(dir, 'js/ks-diagram-catalog.js'),
    'window.__FORGE_KS_DIAGRAM_CATALOG = {\n    orphan: { title: "Orphan" },\n};\n',
    'utf8',
  );
  fs.writeFileSync(
    path.join(dir, 'generator/pages/_diagram_gallery.py'),
    '{"key": "orphan", "svg": "template-orphan.svg", "label": "orphan"},\n',
    'utf8',
  );
  fs.writeFileSync(
    path.join(catalogDir, 'visual-registry.generated.json'),
    JSON.stringify({
      schemaVersion: 1,
      entries: [
        {
          hash: 'Zxd',
          status: 'active',
          type: 'diagram-asset-group',
          source_paths: ['assets/svg/template-linear-flow.svg'],
        },
      ],
    }),
    'utf8',
  );

  const report = scanRepoDiagramAssetRegistry(dir);
  assert.equal(report.skipped, false);
  assert.ok(report.issues.some((i) => i.kind === 'missing-diagram-family'));
  assert.ok(report.issues.some((i) => i.kind === 'gallery-svg-not-registered' && i.key === 'orphan'));
});

test('analyzeDomDiagramAssets flags unknown keys and unregistered SVG paths', () => {
  const issues = analyzeDomDiagramAssets(
    { diagramKeys: ['linear', 'bogus'], svgPaths: ['assets/svg/template-tree.svg', 'assets/svg/custom.svg'] },
    {
      validKeys: new Set(['linear']),
      registeredSvgs: new Set(['assets/svg/template-tree.svg']),
    },
  );
  assert.ok(issues.some((i) => i.kind === 'unknown-diagram-key' && i.key === 'bogus'));
  assert.ok(issues.some((i) => i.kind === 'unregistered-diagram-svg' && i.svg === 'assets/svg/custom.svg'));
});

test('findingsFromDiagramAssetRegistryReport maps issues with remediation', () => {
  const findings = findingsFromDiagramAssetRegistryReport({
    issues: [
      {
        kind: 'unknown-diagram-key',
        key: 'bogus',
        message: 'Rendered diagram uses data-diagram-key="bogus" but that key is not in the Kitchen Sink diagram catalog.',
      },
    ],
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
  assert.equal(findings[0].area, 'visual-catalog');
  assert.ok(findings[0].evidence.includes('bogus'));
});

test('run returns empty without repo or DOM signals', async () => {
  const findings = await run({ metrics: {}, url: 'https://example.test/' });
  assert.deepEqual(findings, []);
});

test('run uses precomputed metrics reports', async () => {
  const findings = await run({
    metrics: {
      diagramAssetRegistryRepoReport: {
        issues: [
          {
            kind: 'missing-diagram-family',
            message: 'Visual registry has no active diagram-family row.',
          },
        ],
      },
      diagramAssetRegistryReport: {
        diagramKeys: ['unknown'],
        svgPaths: [],
        pageCatalogKeys: [],
      },
    },
    repoRoot: '/tmp/unused',
    url: 'https://example.test/page',
  });
  assert.ok(findings.some((f) => f.message.includes('diagram-family')));
});
