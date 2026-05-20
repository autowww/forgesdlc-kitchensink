import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  computeWatchCampaignStats,
  formatWatchCampaignStatsLines,
  parseWatchPagesProgress,
} from '../lib/loop-watch-campaign-stats.js';
import { stripAnsi } from '../lib/terminal-ansi.js';

test('parseWatchPagesProgress parses crawl pages string', () => {
  assert.deepEqual(parseWatchPagesProgress('80/500'), { current: 80, budget: 500 });
  assert.equal(parseWatchPagesProgress('n/a'), null);
});

test('computeWatchCampaignStats reads scorer pages and audit findings', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-campaign-'));
  fs.writeFileSync(
    path.join(dir, 'ux-quality-score.json'),
    JSON.stringify({ crawlSummary: { pagesCaptured: 80, pagesPlannedBudget: 500 } }),
  );
  fs.writeFileSync(
    path.join(dir, 'ux-quality-score-loop-delta.json'),
    JSON.stringify({
      delta: { priorEffectiveFindingCount: 100, currentEffectiveFindingCount: 40 },
    }),
  );
  const audit = {
    crawlSummary: { pagesCaptured: 12, pagesPlannedBudget: 500 },
    pages: [{ findings: [{ severity: 'warn' }, { severity: 'warn' }] }],
  };
  const state = {
    phase: 'auditor_main',
    qualityGate: {
      pass: false,
      counts: { blocker: 0, critical: 0, major: 0, warn: 2, minor: 0, trivial: 0, cosmetic: 0 },
      thresholds: { blocker: 0, critical: 0, major: 0, warn: 5, minor: 10, trivial: 15, cosmetic: 100 },
    },
    auditProgress: { findingAccum: 2 },
  };
  const stats = computeWatchCampaignStats(dir, state, audit);
  assert.equal(stats.pagesScored?.current, 80);
  assert.equal(stats.pagesAudited?.current, 12);
  assert.equal(stats.bugsFound, 2);
  assert.equal(stats.bugsFixed, 60);
  assert.equal(stats.gate.pass, false);
});

test('formatWatchCampaignStatsLines includes labels and gate FAIL', () => {
  const lines = formatWatchCampaignStatsLines(
    {
      pagesScored: { current: 10, budget: 100 },
      pagesAudited: { current: 5, budget: 100 },
      ai: { pages: 3, batchesProcessed: 3, batchesPlanned: 10, running: false },
      bugsFound: 11,
      bugsFixed: 4,
      gate: {
        pass: false,
        counts: { warn: 11 },
        thresholds: { warn: 5 },
        slash: 'W11/5',
      },
    },
    { useColor: false, innerWidth: 120 },
  );
  assert.equal(lines.length, 2);
  const plain = lines.map(stripAnsi).join('\n');
  assert.ok(plain.includes('Scored'));
  assert.ok(plain.includes('10/100'));
  assert.ok(plain.includes('Bugs found'));
  assert.ok(plain.includes('11'));
  assert.ok(plain.includes('FAIL'));
  assert.ok(plain.includes('W11/5'));
});
