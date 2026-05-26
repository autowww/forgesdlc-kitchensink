import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  UX_LOOP_DASHBOARD_SNAPSHOT_FILE,
  uxLoopDashboardFinalBanner,
  writeUxLoopDashboardSnapshotFile,
} from '../lib/ux-loop-dashboard-snapshot-text.js';

test('writeUxLoopDashboardSnapshotFile writes ux-loop-dashboard-snapshot.txt', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-dash-final-'));
  fs.writeFileSync(
    path.join(dir, 'ux-loop-dashboard-state.json'),
    JSON.stringify({ phase: 'watch_exit', loop: { iteration: 3, maxIterations: 20 } }),
  );
  fs.writeFileSync(
    path.join(dir, 'run-meta.json'),
    JSON.stringify({
      website_repo: '/repo',
      site_url: 'http://127.0.0.1/',
      output_directory: dir,
      generatedAt: new Date().toISOString(),
    }),
  );
  const { path: snapPath, text } = writeUxLoopDashboardSnapshotFile(dir, 80);
  assert.equal(snapPath, path.join(dir, UX_LOOP_DASHBOARD_SNAPSHOT_FILE));
  assert.ok(fs.existsSync(snapPath));
  assert.ok(text.includes('Forge UX loop watch') || text.includes('Process'));
  assert.ok(uxLoopDashboardFinalBanner().includes('final'));
});
