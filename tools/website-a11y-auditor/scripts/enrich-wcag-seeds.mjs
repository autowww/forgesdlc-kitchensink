#!/usr/bin/env node
/**
 * Enrich minimal wcag/seeds/*.yaml with operator notes and rule highlights (idempotent).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KS_ROOT = path.resolve(__dirname, '../../..');
const SEEDS_DIR = path.join(KS_ROOT, 'docs/design/a11y-audit/wcag/seeds');
const CATALOG2 = path.join(KS_ROOT, 'docs/design/a11y-audit/wcag-criteria-catalog.json');
const CATALOG3 = path.join(KS_ROOT, 'docs/design/a11y-audit/wcag3-outcomes-catalog.json');
const REGISTRY = path.join(
  KS_ROOT,
  'tools/website-a11y-auditor/design-rules/registry.generated.json',
);

function rulesForSc(registry, scId) {
  const det = [];
  const ai = [];
  for (const r of registry.deterministicRules || []) {
    if ((r.wcagCriteria || []).includes(scId)) det.push(r.id);
  }
  for (const r of registry.aiRules || []) {
    if ((r.wcagCriteria || []).includes(scId)) ai.push(r.id);
  }
  return { det, ai, all: [...det, ...ai].slice(0, 8) };
}

function isMinimalSummary(summary) {
  if (!summary) return true;
  return /see W3C TR and in-repo reference page for normative text/i.test(summary);
}

function buildOperatorNotes(c, { det, ai }) {
  const lines = [
    `Run axe with a profile that includes SC ${c.id}, then confirm DET/AI mappings below.`,
    'Manual verification: keyboard-only task path + one screen reader spot-check on representative pages.',
  ];
  if (c.defaultCoverage === 'manual_only') {
    lines.push('Catalog marks this SC as manual-only — automation is informative, not sufficient.');
  }
  if (det.length) lines.push(`Primary DET rules: ${det.join(', ')}.`);
  if (ai.length) lines.push(`AI judgment lane: ${ai.join(', ')}.`);
  return lines.join('\n');
}

function buildScSeedBody(c, registry) {
  const { det, ai, all } = rulesForSc(registry, c.id);
  const lines = [
    `id: "${c.id}"`,
    'summary: |',
    `  ${c.title} (Level ${c.level}) — ${c.principle ? `Principle ${c.principle}; ` : ''}verify perceivable, operable, understandable, and robust outcomes for users with disabilities. See the normative W3C TR for legal wording.`,
    'operatorNotes: |',
    ...buildOperatorNotes(c, { det, ai })
      .split('\n')
      .map((l) => `  ${l}`),
  ];
  if (all.length) {
    lines.push('forgeRulesHighlight:');
    for (const h of all) lines.push(`  - ${h}`);
  }
  return `${lines.join('\n')}\n`;
}

function buildWcag3SeedBody(r, registry) {
  const { det, ai, all } = rulesForSc(registry, r.id);
  const maps = (r.mapsToWcag22 || []).join(', ');
  const lines = [
    `id: "${r.id}"`,
    'summary: |',
    `  ${r.title} — WCAG 3.0 draft (${(r.tiers || []).join(', ')}). Guideline: ${r.guideline || '—'}.`,
    'operatorNotes: |',
    `  Bronze/Silver/Gold tier requirement; maps to WCAG 2.2: ${maps || 'none'}.`,
    '  Use draft TR methods plus mapped 2.2 SC automation where crosswalk IDs exist.',
  ];
  if (det.length) lines.push(`  DET: ${det.join(', ')}.`);
  if (ai.length) lines.push(`  AI: ${ai.join(', ')}.`);
  if (all.length) {
    lines.push('forgeRulesHighlight:');
    for (const h of all) lines.push(`  - ${h}`);
  }
  return `${lines.join('\n')}\n`;
}

async function main() {
  const checkOnly = process.argv.includes('--check');
  const catalog2 = JSON.parse(await fs.readFile(CATALOG2, 'utf8'));
  const catalog3 = JSON.parse(await fs.readFile(CATALOG3, 'utf8'));
  const registry = JSON.parse(await fs.readFile(REGISTRY, 'utf8'));

  /** @type {Map<string, object>} */
  const criteriaById = new Map();
  for (const profile of Object.values(catalog2.profiles || {})) {
    for (const c of profile.criteria || []) {
      if (!criteriaById.has(c.id)) criteriaById.set(c.id, c);
    }
  }

  let updated = 0;
  for (const c of criteriaById.values()) {
    const dest = path.join(SEEDS_DIR, `sc-${c.id}.yaml`);
    let raw = '';
    try {
      raw = await fs.readFile(dest, 'utf8');
    } catch {
      continue;
    }
    const summaryMatch = raw.match(/^summary:\s*\|\s*\n([\s\S]*?)(?=^[a-zA-Z]|$)/m);
    const summary = summaryMatch?.[1]?.replace(/^  /gm, '').trim() || '';
    if (!isMinimalSummary(summary)) continue;
    const next = buildScSeedBody(c, registry);
    if (next === raw) continue;
    updated += 1;
    if (!checkOnly) await fs.writeFile(dest, next, 'utf8');
  }

  for (const r of catalog3.requirements || []) {
    const dest = path.join(SEEDS_DIR, `wcag3-${r.id}.yaml`);
    let raw = '';
    try {
      raw = await fs.readFile(dest, 'utf8');
    } catch {
      continue;
    }
    const notesMatch = raw.match(/^operatorNotes:\s*\|\s*\n([\s\S]*?)(?=^[a-zA-Z]|$)/m);
    const notes = notesMatch?.[1]?.replace(/^  /gm, '').trim() || '';
    if (notes && !notes.startsWith('Guideline:') && notes.length > 80) continue;
    const next = buildWcag3SeedBody(r, registry);
    if (next === raw) continue;
    updated += 1;
    if (!checkOnly) await fs.writeFile(dest, next, 'utf8');
  }

  if (checkOnly) {
    if (updated > 0) {
      console.error(`enrich-wcag-seeds --check: ${updated} seeds need enrichment`);
      process.exit(1);
    }
    console.log('enrich-wcag-seeds --check: OK');
    return;
  }
  console.log(`enrich-wcag-seeds: updated ${updated} seed files`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
