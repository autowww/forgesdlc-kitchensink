#!/usr/bin/env node
/**
 * Rewrite ux-audit-done-crawl-urls.txt to the set of URLs that were **visited in this audit**
 * with no page error and **zero** Blocker/Critical/Major findings (same as Major+ batch).
 *
 * Stale entries from older runs are **not** kept: if a URL was listed before but was not
 * audited in this pass (or now has Major+), it is dropped so the next crawl can revisit it.
 *
 * Usage: node merge-done-crawl-urls-from-audit.mjs <audit-data.json> <done-urls.txt>
 */

import fs from 'node:fs';
import path from 'node:path';

import { normalizeCrawlHref } from './lib/crawl.js';
import { countMajorPlus } from './lib/severity.js';

const auditPath = process.argv[2];
const donePath = process.argv[3];
if (!auditPath || !donePath) {
  console.error('usage: merge-done-crawl-urls-from-audit.mjs <audit-data.json> <done-urls.txt>');
  process.exit(2);
}

let audit;
try {
  audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
} catch (e) {
  console.error(e?.message || String(e));
  process.exit(1);
}

const pages = audit.pages || [];
const fromAudit = new Set();
for (const p of pages) {
  if (!p || p.error) continue;
  const mj = countMajorPlus(p.findings || []);
  if (mj !== 0) continue;
  const u = normalizeCrawlHref(p.url || '');
  if (u) fromAudit.add(u);
}

/** @type {Set<string>} */
const prior = new Set();
if (fs.existsSync(donePath)) {
  const raw = fs.readFileSync(donePath, 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const u = normalizeCrawlHref(t);
    if (u) prior.add(u);
  }
}

const priorSize = prior.size;
let newlyListed = 0;
for (const u of fromAudit) {
  if (!prior.has(u)) newlyListed += 1;
}
let removedStale = 0;
for (const u of prior) {
  if (!fromAudit.has(u)) removedStale += 1;
}

const header = [
  '# Crawl URLs treated as done (visited in last audit with zero Major+ findings).',
  '# Managed by run-website-ux-remediation-loop.sh; passed to analyze-website-ux.mjs --exclude-crawl-urls-file.',
  `# merged_from=${path.basename(auditPath)} at=${new Date().toISOString()} last_run_clean=${fromAudit.size} prior_file=${priorSize} removed_stale=${removedStale} newly_listed=${newlyListed}`,
].join('\n');

const body = [...fromAudit].sort().join('\n');
fs.mkdirSync(path.dirname(donePath), { recursive: true });
fs.writeFileSync(donePath, `${header}\n${body}\n`, 'utf8');
process.stdout.write(
  `${donePath}: total=${fromAudit.size} last_run_major_clean=${fromAudit.size} prior=${priorSize} (+${newlyListed} new vs prior, -${removedStale} stale)\n`,
);
