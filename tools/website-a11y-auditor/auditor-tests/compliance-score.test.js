import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildComplianceReport,
  buildRuleToCriteriaMap,
  computeComplianceScore,
  computeCriteriaResults,
  loadStandardsPack,
  mapFindingsToCriteria,
} from '../lib/compliance-score.js';

describe('compliance-score', () => {
  const pack = {
    packId: 'test',
    label: 'Test pack',
    wcagVersion: '2.0',
    level: 'AA',
    disclaimer: 'test',
    summary: { automationCoveragePercent: 80, totalCriteria: 2 },
    criteria: [
      {
        id: '1.1.1',
        title: 'Non-text Content',
        level: 'A',
        gap: 'covered',
        tooling: ['axe'],
        rules: { axe: ['AXE.image-alt'], det: [], ai: [] },
      },
      {
        id: '3.1.1',
        title: 'Language of Page',
        level: 'A',
        gap: 'covered',
        tooling: ['det'],
        rules: { axe: [], det: ['DET.A11Y.GENERIC.LANG'], ai: [] },
      },
    ],
    rulesIndex: [
      { ruleId: 'AXE.image-alt', lane: 'axe', wcagCriteria: ['1.1.1'], inPack: true },
      { ruleId: 'DET.A11Y.GENERIC.LANG', lane: 'deterministic', wcagCriteria: ['3.1.1'], inPack: true },
    ],
    validation: { uncoveredCriteria: [], untiedRules: [], forgeOnlyRules: [] },
  };

  it('maps findings to criteria via ruleId', () => {
    const map = buildRuleToCriteriaMap(pack);
    const bySc = mapFindingsToCriteria(
      [{ ruleId: 'DET.A11Y.GENERIC.LANG', severity: 'major', message: 'missing lang' }],
      map,
    );
    assert.ok(bySc.get('3.1.1')?.length === 1);
  });

  it('marks criterion fail when major finding on mapped rule', () => {
    const map = buildRuleToCriteriaMap(pack);
    const bySc = mapFindingsToCriteria(
      [{ ruleId: 'AXE.image-alt', severity: 'major', message: 'alt missing' }],
      map,
    );
    const results = computeCriteriaResults(pack, bySc);
    const row = results.find((r) => r.id === '1.1.1');
    assert.equal(row?.status, 'fail');
    const scores = computeComplianceScore(results, pack);
    assert.ok(scores.criteriaFail >= 1);
    assert.ok(scores.complianceScore < 100);
  });

  it('pack-only report has no site compliance score requirement', () => {
    const report = buildComplianceReport(pack, null);
    assert.equal(report.mode, 'pack_only');
    assert.equal(report.automationCoveragePercent, 80);
  });

  it('loads wcag20aa pack when present', () => {
    try {
      const loaded = loadStandardsPack('wcag20aa');
      assert.equal(loaded.packId, 'wcag20aa');
    } catch (err) {
      if (String(err.message).includes('not found')) return;
      throw err;
    }
  });
});
