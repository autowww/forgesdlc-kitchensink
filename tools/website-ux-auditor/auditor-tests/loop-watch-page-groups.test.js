import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  buildPageFragments,
  buildPageFragmentsEven,
  buildPageFragmentsLogical,
  buildPageGroupPlan,
  chapterKeyFromPathname,
  detectPageGroupingStrategy,
  pathnameFromUrl,
  shortCategoryLabel,
} from '../lib/loop-watch-page-groups.js';

test('chapterKeyFromPathname groups fleet handbook filenames', () => {
  assert.equal(chapterKeyFromPathname('/docs-learn-101-02-install.html'), 'docs-learn-101');
  assert.equal(chapterKeyFromPathname('/docs-operate-301-01-security.html'), 'docs-operate-301');
});

test('detectPageGroupingStrategy picks chapter for flat fleet docs', () => {
  const paths = [
    '/docs-learn-101-01-a.html',
    '/docs-learn-101-02-b.html',
    '/docs-build-201-01-c.html',
    '/docs-operate-301-01-d.html',
  ];
  assert.equal(detectPageGroupingStrategy(paths), 'chapter');
});

test('detectPageGroupingStrategy picks depth for deep hierarchy', () => {
  const paths = [];
  for (let i = 0; i < 40; i += 1) {
    paths.push(`/section-${i % 4}/topic-${i % 8}/page-${i}.html`);
  }
  assert.equal(detectPageGroupingStrategy(paths), 'depth');
});

test('buildPageGroupPlan caps other at 20% and categories at 10%', () => {
  const scorePath =
    '/home/lzvyahin/Code/workbench/ux-auditor/ux-audit/forge-fleet-website/20260520T055312Z_00d06d82/ux-quality-score.json';
  if (!fs.existsSync(scorePath)) {
    const urls = [];
    for (let i = 0; i < 80; i += 1) {
      const ch = ['docs-learn-101', 'docs-operate-301', 'docs-build-201'][i % 3];
      urls.push(`http://127.0.0.1/${ch}-${String(i).padStart(2, '0')}.html`);
    }
    const plan = buildPageGroupPlan(urls);
    assert.ok(plan.categories.length <= 12);
    const other = plan.categories.find((c) => c.key === 'other');
    assert.ok(!other || other.count / plan.total <= 0.2 + 0.01);
    for (const c of plan.categories) {
      if (c.key !== 'other') assert.ok(c.count / plan.total <= 0.1 + 0.01);
    }
    return;
  }
  const raw = JSON.parse(fs.readFileSync(scorePath, 'utf8'));
  const urls = (raw.pagesBrief || raw.pages || []).map((r) => r.url || r.href).filter(Boolean);
  const plan = buildPageGroupPlan(urls);
  assert.equal(plan.mode, 'chapter');
  assert.ok(plan.legend.includes('·'));
  assert.ok(plan.categories.length >= 3);
  const other = plan.categories.find((c) => c.key === 'other');
  assert.ok(other);
  assert.ok(other.count / plan.total <= 0.2 + 0.01);
  for (const c of plan.categories) {
    if (c.key !== 'other') assert.ok(c.count / plan.total <= 0.1 + 0.01, c.key);
  }
});

test('buildPageFragmentsLogical uses short labels not index ranges', () => {
  const urls = [];
  for (let i = 0; i < 30; i += 1) {
    urls.push(`http://x/docs-learn-101-${String(i).padStart(2, '0')}.html`);
  }
  for (let i = 0; i < 20; i += 1) {
    urls.push(`http://x/docs-operate-301-${String(i).padStart(2, '0')}.html`);
  }
  for (let i = 0; i < 10; i += 1) {
    urls.push(`http://x/misc-${i}.html`);
  }
  const pageSets = urls.slice(0, 5).map((url) => ({ url }));
  const { fragments, plan } = buildPageFragmentsLogical(pageSets, 60, 12, urls);
  assert.ok(plan);
  assert.ok(fragments.some((f) => f.label && !/^\d+-\d+$/.test(f.label)));
  assert.ok(fragments.every((f) => f.logical));
});

test('buildPageFragments falls back to even slices without scorer urls', () => {
  const frags = buildPageFragments([{ url: 'http://x/a' }], 10, 5);
  assert.equal(frags.length, 5);
  assert.equal(frags[0].label, '');
});

test('buildPageFragmentsEven covers budget', () => {
  const { fragments } = buildPageFragmentsEven([{ url: 'http://x/a' }], 10, 5);
  const covered = fragments.reduce((n, f) => n + (f.endIdx - f.startIdx), 0);
  assert.equal(covered, 10);
});

test('shortCategoryLabel compresses docs chapter keys', () => {
  assert.equal(shortCategoryLabel('docs-learn-101'), 'L101');
  assert.equal(shortCategoryLabel('other'), 'oth');
});
