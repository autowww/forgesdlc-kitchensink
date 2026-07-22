/**
 * Baseline renderer tests for forge-data-charts modules.
 * Run: node --test tools/charts/tests/renderers.test.mjs
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '../../..');
const req = createRequire(import.meta.url);

const SCRIPTS = [
  'js/charts/core.js',
  'js/charts/legacy.js',
  'js/charts/comparison.js',
  'js/charts/trend.js',
  'js/charts/part-to-whole.js',
  'js/charts/distribution.js',
  'js/charts/flow.js',
  'js/charts/correlation.js',
  'js/charts/kpi.js',
  'js/charts/table.js',
  'js/charts/slicer.js',
  'js/forge-data-charts.js',
];

function loadCharts() {
  const sandbox = { window: {}, globalThis: {} };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.document = {
    body: { appendChild() {} },
    createElement() {
      return {
        _attrs: {},
        setAttribute(k, v) { this._attrs[k] = v; },
        getAttribute(k) { return this._attrs[k]; },
        innerHTML: '',
      };
    },
    querySelectorAll() { return []; },
  };
  for (const rel of SCRIPTS) {
    const code = readFileSync(join(REPO, rel), 'utf8');
    vm.runInNewContext(code, sandbox);
  }
  return sandbox;
}

const LEGACY_KINDS = [
  'commit_weekly',
  'commit_daily',
  'loc_added_horizontal',
  'loc_total_bars',
  'loc_share_donut',
  'compliance_bars',
  'extension_heatmap',
  'matrix_heatmap',
  'contributors',
  'submodule_layout',
];

test('ForgeDataCharts registry includes legacy kinds', () => {
  const win = loadCharts();
  const r = win.ForgeDataCharts.renderers;
  for (const kind of LEGACY_KINDS) {
    assert.equal(typeof r[kind], 'function', `missing renderer: ${kind}`);
  }
});

test('BI kinds registered', () => {
  const win = loadCharts();
  const r = win.ForgeDataCharts.renderers;
  for (const kind of ['column_clustered', 'line', 'pie', 'slicer_list']) {
    assert.equal(typeof r[kind], 'function', `missing renderer: ${kind}`);
  }
});

test('legacy renderers return non-empty HTML for sample data', () => {
  const win = loadCharts();
  const r = win.ForgeDataCharts.renderers;
  const samples = {
    commit_weekly: { series: [{ week: 'W1', count: 3 }] },
    commit_daily: { series: [{ day: '2025-01-01', count: 1 }] },
    loc_added_horizontal: { rows: [{ name: 'a', value: 10 }] },
    loc_total_bars: { rows: [{ name: 'a', value: 10 }] },
    loc_share_donut: { rows: [{ name: 'a', value: 10 }] },
    compliance_bars: { rows: [['a', 50]] },
    extension_heatmap: { extensions: [['.py', 5]], tracked_files: 10 },
    matrix_heatmap: { rows: ['a'], cols: ['b'], cells: [[1]] },
    contributors: { rows: [['1', 'Ada']] },
    submodule_layout: { svg_fragment: '<svg xmlns="http://www.w3.org/2000/svg"></svg>' },
  };
  for (const kind of LEGACY_KINDS) {
    const html = r[kind](samples[kind], {});
    assert.ok(html && html.length > 10, `empty output for ${kind}`);
  }
});

test('empty commit_weekly returns graceful message', () => {
  const win = loadCharts();
  const html = win.ForgeDataCharts.renderers.commit_weekly({ series: [] }, {});
  assert.match(html, /No commits|forge-support/i);
});

test('SlicerBus applyToData filters rows', () => {
  const win = loadCharts();
  const bus = win.ForgeDataChartsSlicerBus;
  bus.filters = { region: ['North'] };
  const rows = [
    { region: 'North', value: 1 },
    { region: 'South', value: 2 },
  ];
  const out = bus.applyToData(rows);
  assert.equal(out.length, 1);
  bus.filters = {};
});

test('api sample JSON includes matrix_heatmap', () => {
  const json = JSON.parse(readFileSync(join(REPO, 'assets/data-charts-api-sample.json'), 'utf8'));
  assert.equal(json.version, 2);
  assert.ok(json.charts.matrix_heatmap);
});
