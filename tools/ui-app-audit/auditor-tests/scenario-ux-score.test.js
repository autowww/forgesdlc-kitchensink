import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { makeFinding } from '../../website-ux-auditor/lib/severity.js';
import {
  collectTopScoreDamageContributors,
  compareScenarioUxScores,
  computeScenarioUxScores,
  mapFindingToScenarioDimension,
  resolveScenarioScoreProfileKey,
  uxScoreBandForOverall,
} from '../lib/scenario-ux-score.mjs';

describe('scenario-ux-score', () => {
  it('maps app-shell and DET.APP rules to app dimensions', () => {
    assert.equal(mapFindingToScenarioDimension({ checkId: 'app-shell-inner' }), 'appShellStability');
    assert.equal(
      mapFindingToScenarioDimension({ ruleId: 'DET.APP.PRIMARY_STATE', checkId: 'design-rule-runtime' }),
      'stateFeedbackRecovery',
    );
    assert.equal(
      mapFindingToScenarioDimension({ ruleId: 'DET.APP.TAB_PANEL', checkId: 'design-rule-runtime' }),
      'dataActionability',
    );
  });

  it('resolveScenarioScoreProfileKey maps KS site kinds to forgesdlc profile', () => {
    assert.equal(resolveScenarioScoreProfileKey('lenses'), 'forgesdlc');
    assert.equal(resolveScenarioScoreProfileKey('a11y-studio'), 'a11y-studio');
  });

  it('computeScenarioUxScores: overall 100 with no effective findings on live scenario run', () => {
    const ux = computeScenarioUxScores({
      auditData: {
        auditMode: 'scenario-smoke',
        siteKind: 'a11y-studio',
        crawlSummary: { scenariosTotal: 2, pagesVisited: 2 },
        pages: [{ tier: 'smoke' }, { tier: 'smoke' }],
        findings: [],
      },
      findings: [],
    });
    assert.equal(ux.overall, 100);
    assert.equal(ux.coverage.perfectScoreEligible, true);
    assert.equal(ux.scoreBand.id, 'excellent');
    assert.ok(ux.dimensions.workflowContinuity);
    assert.ok(ux.dimensions.narrativeHero);
  });

  it('computeScenarioUxScores: det findings lower overall but gate can still pass separately', () => {
    const findings = [
      makeFinding({
        ruleId: 'DET.APP.PRIMARY_STATE',
        checkId: 'design-rule-runtime',
        severity: 'warn',
        area: 'conversion',
        message: 'state',
        evidence: '',
        remediation: '',
        lane: 'deterministic',
      }),
      makeFinding({
        ruleId: 'AXE.color-contrast',
        checkId: 'axe-lane',
        severity: 'major',
        area: 'accessibility',
        message: 'contrast',
        evidence: '',
        remediation: '',
      }),
    ];
    const ux = computeScenarioUxScores({
      auditData: { siteKind: 'a11y-studio', auditMode: 'scenario-smoke', pages: [{}] },
      findings,
    });
    assert.ok(ux.overall < 100);
    assert.ok(ux.dimensions.stateFeedbackRecovery.findingCount >= 1);
    assert.ok(ux.dimensions.accessibilitySemanticsMeta.findingCount >= 1);
    assert.ok(ux.topDamageContributors.length >= 1);
  });

  it('excludes AI findings below confidence and deterministic-covered', () => {
    const findings = [
      {
        lane: 'ai',
        principleId: 'AI.PREMIUM.ENTERPRISE_FEEL',
        severity: 'major',
        confidence: 0.4,
        deterministicCoverage: 'not-covered',
        area: 'ai-judgment',
      },
      {
        lane: 'ai',
        principleId: 'AI.VISUAL.HIERARCHY',
        severity: 'major',
        confidence: 0.9,
        deterministicCoverage: 'covered',
        area: 'visual-hierarchy',
      },
      {
        lane: 'ai',
        principleId: 'AI.CONTEXT.COGNITIVE_CLARITY',
        severity: 'warn',
        confidence: 0.85,
        deterministicCoverage: 'partially-covered',
        area: 'context-clarity',
      },
    ];
    const ux = computeScenarioUxScores({
      auditData: { siteKind: 'app-shell', pages: [{}] },
      findings,
    });
    assert.equal(ux.coverage.aiFindings.includedInScore, 1);
    assert.equal(ux.coverage.aiFindings.excludedBelowConfidence, 1);
    assert.equal(ux.coverage.aiFindings.excludedDeterministicCovered, 1);
  });

  it('compareScenarioUxScores reports pillar deltas', () => {
    const prior = computeScenarioUxScores({
      auditData: { siteKind: 'generic' },
      findings: [
        makeFinding({
          ruleId: 'DET.APP.TAB_PANEL',
          severity: 'major',
          area: 'navigation',
          message: '',
          evidence: '',
          remediation: '',
        }),
      ],
    });
    const next = computeScenarioUxScores({
      auditData: { siteKind: 'generic' },
      findings: [],
    });
    const delta = compareScenarioUxScores(prior, next);
    assert.ok(delta.overall.delta > 0);
    assert.ok(delta.dimensions.dataActionability.delta > 0);
  });

  it('uxScoreBandForOverall classifies scores', () => {
    assert.equal(uxScoreBandForOverall(95).id, 'excellent');
    assert.equal(uxScoreBandForOverall(72).id, 'fair');
  });

  it('collectTopScoreDamageContributors sorts by weighted damage', () => {
    const rows = collectTopScoreDamageContributors(
      [
        makeFinding({ ruleId: 'DET.A', severity: 'minor', area: 'hero', message: '', evidence: '', remediation: '' }),
        makeFinding({ ruleId: 'DET.B', severity: 'blocker', area: 'hero', message: '', evidence: '', remediation: '' }),
      ],
      { narrativeHero: 1 },
      5,
    );
    assert.equal(rows[0].label, 'DET.B');
    assert.ok(rows[0].weightedDamage > rows[1].weightedDamage);
  });
});
