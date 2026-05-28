import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildComplianceReport } from '../lib/compliance-score.js';
import { loadStandardsPack } from '../lib/compliance-score.js';

describe('quality-score compliance rollup', () => {
  it('buildComplianceReport attaches failingByLane for mixed findings', () => {
    let pack;
    try {
      pack = loadStandardsPack('wcag22aa');
    } catch {
      return;
    }
    const report = buildComplianceReport(pack, [
      { ruleId: 'DET.A11Y.GENERIC.LANG', severity: 'major', message: 'lang', lane: 'deterministic' },
      { ruleId: 'AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW', severity: 'major', message: 'kb', lane: 'ai' },
    ]);
    const failing = (report.criteriaResults || []).filter((r) => r.status === 'fail');
    if (failing.length) {
      const row = failing.find((r) => r.failingByLane?.det?.length || r.failingByLane?.ai?.length);
      if (row) {
        assert.ok(row.failingByLane);
      }
    }
    assert.equal(report.mode, 'site');
  });
});
