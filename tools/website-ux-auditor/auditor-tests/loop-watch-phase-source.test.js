import assert from 'node:assert/strict';
import test from 'node:test';

import { computeWatchCampaignStats } from '../lib/loop-watch-campaign-stats.js';
import { computeAuditPhaseBar } from '../lib/loop-watch-progress-map.js';
import {
  buildScorerBacklogPatch,
  isScorerWatchPhase,
  usesAuditIssueControls,
} from '../lib/loop-watch-phase-source.js';
import { shallowMergeDashboard } from '../lib/ux-loop-dashboard-state.js';

test('isScorerWatchPhase detects scorer crawl and ux-score label', () => {
  assert.equal(isScorerWatchPhase('scorer_crawl'), true);
  assert.equal(isScorerWatchPhase('post_scorer'), true);
  assert.equal(usesAuditIssueControls('scorer_crawl'), false);
  assert.equal(usesAuditIssueControls('auditor_main', '[ux-audit]'), true);
  assert.equal(isScorerWatchPhase('auditor_main', '[ux-score]'), true);
});

test('buildScorerBacklogPatch stores counts without qualityGate', () => {
  const patch = buildScorerBacklogPatch({ warn: 12, major: 3 }, { source: 'scorer' });
  assert.equal(patch.scorerBacklog.total, 15);
  assert.equal(patch.scorerBacklog.counts.warn, 12);
  assert.ok(!('qualityGate' in patch));
});

test('computeWatchCampaignStats ignores scorer backlog for bugs and gate', () => {
  const stats = computeWatchCampaignStats(
    '/tmp/unused',
    {
      phase: 'scorer_crawl',
      crawl: { label: '[ux-score]', pages: '40/500' },
      scorerBacklog: { counts: { warn: 99 }, total: 99 },
      qualityGate: {
        pass: false,
        source: 'scorer',
        counts: { warn: 99 },
        thresholds: { warn: 5 },
        total: 99,
      },
      auditProgress: { findingAccum: 50 },
    },
    null,
  );
  assert.equal(stats.bugsFound, null);
  assert.equal(stats.gate.pass, true);
});

test('shallowMergeDashboard merges scorerBacklog', () => {
  const next = shallowMergeDashboard(
    {},
    buildScorerBacklogPatch({ minor: 2 }, { source: 'scorer_crawl' }),
  );
  assert.equal(/** @type {{ total?: number }} */ (next.scorerBacklog).total, 2);
});

test('computeAuditPhaseBar is idle during scorer crawl', () => {
  const bar = computeAuditPhaseBar(
    { phase: 'scorer_crawl', crawl: { label: '[ux-score]' } },
    null,
  );
  assert.equal(bar.gatePass, true);
  assert.equal(bar.primary.current, 0);
  assert.ok(bar.note.includes('scorer'));
});
