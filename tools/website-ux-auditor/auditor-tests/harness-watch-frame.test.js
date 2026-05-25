import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { buildHarnessWatchSnapshotLines, statusSymbol } from '../lib/harness-watch-frame.js';
import { writeHarnessStateAtomic } from '../lib/harness-watch-state.js';

describe('harness-watch-frame', () => {
  it('statusSymbol maps harness statuses', () => {
    assert.equal(statusSymbol('detection_ok'), 'D');
    assert.equal(statusSymbol('detection_miss'), '!');
    assert.equal(statusSymbol('remediation_ok'), 'R');
  });

  it('buildHarnessWatchSnapshotLines includes rule progress', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-watch-'));
    writeHarnessStateAtomic(dir, {
      phase: 'rule_audit',
      mode: 'check-only',
      fixtureRoot: '/tmp/fixtures',
      rulesTotal: 10,
      rulesDone: 3,
      outcomes: { detection_ok: 2, detection_miss: 1 },
      currentRule: { ruleId: 'DET.HASH.MARKERS', step: 'audit', findingsCount: 2 },
      ruleGrid: 'DD!······',
    });
    const lines = buildHarnessWatchSnapshotLines(dir, { cols: 100, useColor: false });
    const text = lines.join('\n');
    assert.match(text, /DET ruleset harness/);
    assert.match(text, /DET\.HASH\.MARKERS/);
    assert.match(text, /3\/10/);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
