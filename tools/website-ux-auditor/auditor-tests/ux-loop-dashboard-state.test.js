import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  mergeDashboardState,
  mergeDashboardStateIfWatching,
  readDashboardStateSafe,
  shallowMergeDashboard,
  dashboardStatePath,
} from '../lib/ux-loop-dashboard-state.js';

test('readDashboardStateSafe: missing → {}', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-dash-'));
  assert.deepEqual(readDashboardStateSafe(dir), {});
});

test('readDashboardStateSafe: corrupt JSON → {}', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-dash-'));
  fs.writeFileSync(path.join(dir, 'ux-loop-dashboard-state.json'), '{not json', 'utf8');
  assert.deepEqual(readDashboardStateSafe(dir), {});
});

test('shallowMergeDashboard merges crawl nested', () => {
  const a = { phase: 'x', crawl: { pages: '1/10', label: '[x]' } };
  const b = { crawl: { queueLen: 3 } };
  const m = shallowMergeDashboard(a, b);
  assert.equal(m.phase, 'x');
  assert.deepEqual(m.crawl, { pages: '1/10', label: '[x]', queueLen: 3 });
});

test('mergeDashboardState atomic round-trip', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-dash-'));
  mergeDashboardState(dir, { phase: 'loop_start', slug: 'z' });
  const st = readDashboardStateSafe(dir);
  assert.equal(st.phase, 'loop_start');
  assert.equal(st.slug, 'z');
  assert.ok(typeof st.updatedAt === 'string');
  assert.ok(fs.existsSync(dashboardStatePath(dir)));
});

test('mergeDashboardStateIfWatching respects env path match', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-dash-'));
  const other = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-dash-'));
  process.env.FORGE_UX_LOOP_WATCH_OUT_DIR = other;
  mergeDashboardStateIfWatching(dir, { phase: 'should_not_apply' });
  assert.deepEqual(readDashboardStateSafe(dir), {});
  process.env.FORGE_UX_LOOP_WATCH_OUT_DIR = dir;
  mergeDashboardStateIfWatching(dir, { phase: 'applied' });
  assert.equal(readDashboardStateSafe(dir).phase, 'applied');
  delete process.env.FORGE_UX_LOOP_WATCH_OUT_DIR;
});
