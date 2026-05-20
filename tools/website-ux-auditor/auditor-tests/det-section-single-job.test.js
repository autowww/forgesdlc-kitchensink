import assert from 'node:assert/strict';
import test from 'node:test';

import {
  contentTokens,
  findingsFromSectionSingleJobReport,
  run,
  tokenJaccard,
  topicBucketsInText,
  violationsFromSectionSingleJobSnapshot,
} from '../design-rules/deterministic/generated/det-section-single-job.check.js';

test('contentTokens and tokenJaccard support topic overlap checks', () => {
  const a = contentTokens('Governed workflow from intent to evidence');
  const b = contentTokens('Workflow stages and human review gates');
  assert.ok(tokenJaccard(a, b) > 0.1);
  assert.equal(tokenJaccard(['alpha', 'beta'], ['gamma', 'delta']), 0);
});

test('topicBucketsInText detects multiple intent buckets', () => {
  const buckets = topicBucketsInText(
    'How it works: staged workflow. Trust boundary and audit evidence. Pricing plans.',
  );
  assert.ok(buckets.includes('workflow'));
  assert.ok(buckets.includes('trust'));
  assert.ok(buckets.includes('pricing'));
});

test('violationsFromSectionSingleJobSnapshot encodes single-job rules', () => {
  assert.deepEqual(violationsFromSectionSingleJobSnapshot({
    sections: [
      {
        selectorHint: 'section.hero',
        wordCount: 120,
        primaryHeading: 'Ship with evidence',
        subheadings: ['Outcome one'],
        bodySample: 'Ship with evidence using governed delivery and traceable releases.',
      },
    ],
  }), []);

  const multiBucket = violationsFromSectionSingleJobSnapshot({
    sections: [{
      selectorHint: 'section#kitchen-sink',
      wordCount: 200,
      primaryHeading: 'Platform overview',
      subheadings: [],
      bodySample: [
        'How it works: intent to evidence workflow stages.',
        'Trust boundary, security governance, and audit logs.',
        'Pricing tiers and subscription plans for teams.',
        'ForgeSDLC, Lenses, Fleet, and Blueprints ecosystem map.',
      ].join(' '),
    }],
  });
  assert.ok(multiBucket.some((v) => v.kind === 'multi-topic-buckets'));

  const divergent = violationsFromSectionSingleJobSnapshot({
    sections: [{
      selectorHint: 'section.mixed',
      wordCount: 150,
      primaryHeading: 'Overview',
      subheadings: ['SQLite job store schema', 'Hero marketing outcomes'],
      bodySample: 'Overview text with unrelated topics bundled together for scanning.',
    }],
  });
  assert.ok(divergent.some((v) => v.kind === 'divergent-subheadings'));

  const drift = violationsFromSectionSingleJobSnapshot({
    sections: [{
      selectorHint: 'section.drift',
      wordCount: 120,
      primaryHeading: 'Security posture and boundaries',
      subheadings: [],
      bodySample: 'Card grids, typography rhythm, spacing tokens, and color palettes for marketing tiles.',
    }],
  });
  assert.ok(drift.some((v) => v.kind === 'heading-body-drift'));
});

test('findingsFromSectionSingleJobReport maps violations to findings', () => {
  const findings = findingsFromSectionSingleJobReport({
    violations: [{
      kind: 'multi-topic-buckets',
      selectorHint: 'section#story',
      buckets: ['workflow', 'trust', 'pricing', 'ecosystem'],
      bucketCount: 4,
    }],
  }, 'https://example.test/landing');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'major');
  assert.ok(findings[0].message.includes('one job'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/landing'));
});

test('run returns empty without report and skips platform handbook inner', async () => {
  assert.deepEqual(await run({ metrics: {}, url: 'https://example.test/' }), []);

  const inner = await run({
    metrics: {
      sectionSingleJobReport: {
        sections: [{
          selectorHint: 'section',
          wordCount: 200,
          primaryHeading: 'Trust',
          subheadings: ['Workflow', 'Pricing'],
          bodySample: 'How it works trust pricing ecosystem reference',
        }],
      },
    },
    url: 'https://platform.test/docs/chapter',
    ctx: { siteKind: 'platform' },
  });
  assert.deepEqual(inner, []);
});

test('run uses metrics.sectionSingleJobReport when provided', async () => {
  const findings = await run({
    metrics: {
      sectionSingleJobReport: {
        sections: [{
          selectorHint: 'section#cta',
          wordCount: 90,
          primaryHeading: 'Get started',
          subheadings: ['Install', 'API reference', 'Trust model'],
          bodySample: 'Quickstart install steps and API reference tables with trust boundaries.',
        }],
      },
    },
    url: 'https://example.test/',
  });
  assert.ok(findings.length >= 1);
  assert.equal(findings[0].area, 'informationArchitecture');
});
