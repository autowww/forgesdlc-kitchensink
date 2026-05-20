import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { evaluateLoopCompletion } from '../lib/loop-watch-completion.js';
import { mergeDashboardState } from '../lib/ux-loop-dashboard-state.js';

function writeAudit(outDir, pages, crawlSummary) {
  fs.writeFileSync(
    path.join(outDir, 'audit-data.json'),
    JSON.stringify({ pages, crawlSummary }, null, 2),
    'utf8',
  );
}

test('evaluateLoopCompletion gate_only when FORGE_UX_LOOP_ALL_BARS=0', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'loop-comp-'));
  writeAudit(
    tmp,
    [{ url: 'http://x/', findings: Array.from({ length: 6 }, () => ({ severity: 'warn' })) }],
    { pagesCaptured: 1, pagesPlannedBudget: 500, queuedRemainingAtStop: 400 },
  );
  mergeDashboardState(tmp, { loop: { iteration: 1, maxIterations: 20 } });
  const r = evaluateLoopCompletion(tmp, { env: { FORGE_UX_LOOP_ALL_BARS: '0' } });
  assert.equal(r.mode, 'gate_only');
  assert.equal(r.pass, false);
});

test('evaluateLoopCompletion all_bars requires pages budget and rules', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'loop-comp-'));
  const pages = [
    {
      url: 'http://x/',
      findings: [],
      ruleExecution: {
        deterministic: [{ ruleId: 'DET.PAGE.LANG', status: 'ran', findingsCount: 0 }],
      },
    },
  ];
  writeAudit(tmp, pages, {
    pagesCaptured: 500,
    pagesPlannedBudget: 500,
    queuedRemainingAtStop: 0,
    stopReason: 'normal_completion',
    deterministicImplementedRuleIds: ['DET.PAGE.LANG'],
  });
  mergeDashboardState(tmp, {
    loop: { iteration: 1, maxIterations: 20, expectedIterations: 1 },
    cyclePhase: 'build_done',
  });
  const r = evaluateLoopCompletion(tmp, { env: { FORGE_UX_LOOP_ALL_BARS: '1' }, allBarsMode: true });
  assert.equal(r.mode, 'all_bars');
  assert.equal(r.bars.gate, true);
  assert.equal(r.bars.pages, true);
  assert.equal(r.pass, true);
});
