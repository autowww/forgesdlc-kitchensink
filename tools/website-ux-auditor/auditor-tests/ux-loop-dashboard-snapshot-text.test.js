import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { buildUxLoopDashboardSnapshotLines, tailLogLines, pickActiveCrawlProgressLogPath } from '../lib/ux-loop-dashboard-snapshot-text.js';

test('tailLogLines reads last non-empty lines', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-snap-'));
  const f = path.join(dir, 't.log');
  fs.writeFileSync(f, 'a\n\nb\nc\n', 'utf8');
  const t = tailLogLines(f, 10, 8192);
  assert.deepEqual(t, ['a', 'b', 'c']);
});

test('buildUxLoopDashboardSnapshotLines returns boxed frame', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-snap-'));
  fs.writeFileSync(
    path.join(dir, 'run-meta.json'),
    JSON.stringify({
      website_repo: '/r',
      site_url: 'http://x/',
      output_directory: dir,
      generatedAt: '2026-01-01T00:00:00.000Z',
    }),
    'utf8',
  );
  fs.writeFileSync(path.join(dir, 'ux-loop-dashboard-state.json'), JSON.stringify({ phase: 'auditor_main', updatedAt: 't' }), 'utf8');
  fs.writeFileSync(path.join(dir, 'ux-loop-dashboard.log'), 'phase=auditor_begin\n', 'utf8');
  fs.writeFileSync(path.join(dir, 'auditor-crawl-progress.log'), '2026-01-01T01:00:00Z\t[ux-audit] tail-line\n', 'utf8');
  const lines = buildUxLoopDashboardSnapshotLines(dir, 80);
  assert.ok(lines.length > 5);
  assert.ok(lines[0].includes('Forge UX loop watch'));
  assert.ok(lines.some((l) => l.includes('tail-line')));
});

test('pickActiveCrawlProgressLogPath prefers scorer vs auditor by phase', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-pick-'));
  fs.writeFileSync(path.join(dir, 'scorer-crawl-progress.log'), 's\n', 'utf8');
  fs.writeFileSync(path.join(dir, 'auditor-crawl-progress.log'), 'a\n', 'utf8');
  assert.ok(pickActiveCrawlProgressLogPath(dir, 'scorer_crawl').endsWith('scorer-crawl-progress.log'));
  assert.ok(pickActiveCrawlProgressLogPath(dir, 'auditor_main').endsWith('auditor-crawl-progress.log'));
});
