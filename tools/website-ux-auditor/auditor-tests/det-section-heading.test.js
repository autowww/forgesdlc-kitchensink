import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findingsFromSectionHeadingReport,
  headingLevelFromTag,
  outlineHeadingsFromMetrics,
  run,
  violationsFromHeadingOutline,
  violationsFromSectionHeadingSnapshot,
} from '../design-rules/deterministic/generated/det-section-heading.check.js';

test('headingLevelFromTag resolves h-tags and aria-level', () => {
  assert.equal(headingLevelFromTag('h2', null), 2);
  assert.equal(headingLevelFromTag('div', '4'), 4);
  assert.equal(headingLevelFromTag('span', null), 2);
});

test('violationsFromHeadingOutline flags skipped ranks', () => {
  const violations = violationsFromHeadingOutline([
    { level: 1, text: 'Page', top: 10 },
    { level: 3, text: 'Jump', top: 200 },
  ]);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].kind, 'skipped-heading-level');
  assert.equal(violations[0].fromLevel, 1);
  assert.equal(violations[0].toLevel, 3);
});

test('violationsFromSectionHeadingSnapshot encodes section heading rules', () => {
  assert.deepEqual(violationsFromSectionHeadingSnapshot({
    sections: [
      { selectorHint: 'section.hero', wordCount: 120, primaryHeadingCount: 1 },
    ],
    outlineHeadings: [
      { level: 2, text: 'Outcomes', top: 100 },
      { level: 3, text: 'Detail', top: 220 },
    ],
  }), []);

  const missing = violationsFromSectionHeadingSnapshot({
    sections: [{ selectorHint: 'section#trust', wordCount: 90, primaryHeadingCount: 0 }],
    outlineHeadings: [{ level: 2, text: 'Intro', top: 50 }],
  });
  assert.ok(missing.some((v) => v.kind === 'missing-section-heading'));

  const duplicate = violationsFromSectionHeadingSnapshot({
    sections: [{ selectorHint: 'section.cards', wordCount: 200, primaryHeadingCount: 2 }],
    outlineHeadings: [{ level: 2, text: 'Cards', top: 80 }],
  });
  assert.ok(duplicate.some((v) => v.kind === 'duplicate-section-heading'));
});

test('findingsFromSectionHeadingReport maps violations to findings', () => {
  const findings = findingsFromSectionHeadingReport({
    violations: [{ kind: 'skipped-heading-level', fromLevel: 2, toLevel: 4, text: 'Trust', top: 400 }],
  }, 'https://example.test/landing');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'major');
  assert.ok(findings[0].message.includes('skip'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/landing'));
});

test('outlineHeadingsFromMetrics derives levels from dom-metrics headings', () => {
  const outline = outlineHeadingsFromMetrics([
    { tag: 'h2', text: 'How it works', top: 300 },
    { tag: 'h1', text: 'Hero', top: 40 },
  ]);
  assert.equal(outline[0].level, 2);
  assert.equal(outline[1].level, 1);
});

test('run returns empty without report and skips platform handbook inner', async () => {
  assert.deepEqual(await run({ metrics: {}, url: 'https://example.test/' }), []);

  const inner = await run({
    metrics: {
      sectionHeadingReport: {
        violations: [{ kind: 'missing-section-heading', selectorHint: 'section', wordCount: 80 }],
      },
    },
    url: 'https://platform.test/docs/guide',
    ctx: { siteKind: 'platform' },
  });
  assert.deepEqual(inner, []);
});

test('run uses metrics.sectionHeadingReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/',
      sectionHeadingReport: {
        sections: [{ selectorHint: 'section.long', wordCount: 120, primaryHeadingCount: 0 }],
        outlineHeadings: [{ level: 2, text: 'Intro', top: 100 }],
      },
    },
    url: 'https://example.test/',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].evidence.includes('missing_section_heading'));
});
