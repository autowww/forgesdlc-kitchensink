#!/usr/bin/env node
/**
 * Create minimal wcag/seeds/*.yaml for every WCAG 2.x SC and WCAG 3 requirement in catalogs.
 * Does not overwrite existing seed files (preserves editorial content).
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

function scSeedName(id) {
  return `sc-${id}.yaml`;
}

function wcag3SeedName(id) {
  return `wcag3-${id}.yaml`;
}

/**
 * @param {object} registry
 * @param {string} scId
 */
function rulesForSc(registry, scId) {
  const det = [];
  const ai = [];
  for (const r of registry.deterministicRules || []) {
    if ((r.wcagCriteria || []).includes(scId)) det.push(r.id);
  }
  for (const r of registry.aiRules || []) {
    if ((r.wcagCriteria || []).includes(scId)) ai.push(r.id);
  }
  return [...det, ...ai].slice(0, 6);
}

function buildScSeed(c, registry) {
  const highlights = rulesForSc(registry, c.id);
  const lines = [
    `id: "${c.id}"`,
    'summary: |',
    `  ${c.title} (Level ${c.level}) — see W3C TR and in-repo reference page for normative text.`,
  ];
  if (c.defaultCoverage === 'manual_only') {
    lines.push('operatorNotes: |', '  Manual testing expected; automation is informative only.');
  }
  if (highlights.length) {
    lines.push('forgeRulesHighlight:');
    for (const h of highlights) lines.push(`  - ${h}`);
  }
  return `${lines.join('\n')}\n`;
}

function buildWcag3Seed(r) {
  const maps = (r.mapsToWcag22 || []).join(', ');
  const lines = [
    `id: "${r.id}"`,
    'summary: |',
    `  ${r.title} — WCAG 3.0 draft requirement (${(r.tiers || []).join(', ')}).`,
    'operatorNotes: |',
    `  Guideline: ${r.guideline || '—'}. Maps to WCAG 2.2: ${maps || 'none'}.`,
  ];
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

  await fs.mkdir(SEEDS_DIR, { recursive: true });
  let created = 0;

  for (const c of criteriaById.values()) {
    const name = scSeedName(c.id);
    const dest = path.join(SEEDS_DIR, name);
    try {
      await fs.access(dest);
    } catch {
      if (!checkOnly) await fs.writeFile(dest, buildScSeed(c, registry), 'utf8');
      created += 1;
    }
  }

  for (const r of catalog3.requirements || []) {
    const name = wcag3SeedName(r.id);
    const dest = path.join(SEEDS_DIR, name);
    try {
      await fs.access(dest);
    } catch {
      if (!checkOnly) await fs.writeFile(dest, buildWcag3Seed(r), 'utf8');
      created += 1;
    }
  }

  const existing = (await fs.readdir(SEEDS_DIR)).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
  const expectedSc = criteriaById.size;
  const expected3 = (catalog3.requirements || []).length;
  const expectedMin = expectedSc + expected3;

  if (checkOnly) {
    if (existing.length < expectedMin) {
      console.error(
        `bootstrap-wcag-seeds --check: need at least ${expectedMin} seeds, have ${existing.length}`,
      );
      process.exit(1);
    }
    console.log(`bootstrap-wcag-seeds --check: OK (${existing.length} seed files)`);
    return;
  }

  console.log(
    `bootstrap-wcag-seeds: created ${created} new seeds (${existing.length + created} total; expect ≥${expectedMin})`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
