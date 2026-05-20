#!/usr/bin/env node
/**
 * Replace duplicated Forge "Expected look" / generic Responsive slabs with slug-keyed blurbs.
 *
 *   node tools/design-catalog/apply-element-specific-blurbs.mjs --repo . --registry-json docs/design/catalog/visual-registry.generated.json --dry-run
 *   node tools/design-catalog/apply-element-specific-blurbs.mjs --repo . --registry-json docs/design/catalog/visual-registry.generated.json --write
 */

import fs from 'node:fs';
import path from 'node:path';
import { expectedLookBulletsForEntry, responsiveBulletsForEntry } from './lib/contract-element-blurbs.mjs';

const SLAB =
  /Calm Forge enterprise atmosphere: deep slate backgrounds, disciplined amber\/cyan accents, Proxima display hierarchy, Open Sans body rhythm—consistent with \[forge-enterprise-ai-website-standard\.md\]\([^)]+\)\. Surfaces feel spacious, monitor-grade, and suitable for AI-assisted delivery storytelling without gimmick effects\./;

const GENERIC_RESPONSIVE =
  /^- Breakpoints follow Bootstrap 5 patterns used across KS:[^\n]*\n- Tap targets remain at least 44×44px[^\n]*/m;

function parseArgs(argv) {
  const o = { repo: process.cwd(), registryJson: null, dryRun: true, write: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') o.repo = path.resolve(argv[++i] || '');
    else if (a === '--registry-json') o.registryJson = path.resolve(argv[++i] || '');
    else if (a === '--dry-run') o.dryRun = true;
    else if (a === '--write') {
      o.write = true;
      o.dryRun = false;
    }
  }
  if (!o.registryJson) {
    console.error(
      'Usage: apply-element-specific-blurbs.mjs --registry-json docs/design/catalog/visual-registry.generated.json [--repo .] (--dry-run|--write)',
    );
    process.exit(2);
  }
  return o;
}

function main() {
  const args = parseArgs(process.argv);
  const reg = JSON.parse(fs.readFileSync(args.registryJson, 'utf8'));
  /** @type {Map<string, object>} */
  const byContract = new Map();
  for (const e of reg.entries || []) {
    const cs = e.contract_status;
    if (cs !== 'own' && cs !== 'family-covered') continue;
    const c = e.contract_path || e.contract;
    if (!c) continue;
    const prev = byContract.get(c);
    if (!prev) byContract.set(c, e);
  }

  let touched = 0;
  for (const [rel, entry] of byContract) {
    const abs = path.join(args.repo, rel);
    if (!fs.existsSync(abs)) continue;
    let txt = fs.readFileSync(abs, 'utf8');
    if (!SLAB.test(txt) && !GENERIC_RESPONSIVE.test(txt)) continue;

    const exp = expectedLookBulletsForEntry(entry);
    const resp = responsiveBulletsForEntry(entry);

    const next = txt
      .replace(SLAB, exp)
      .replace(/^## Responsive behavior\s*\n\n([\s\S]*?)(?=^## |\Z)/m, (block, body) => {
        const trimmed = String(body || '').trimEnd();
        if (!GENERIC_RESPONSIVE.test(trimmed)) return block;
        return `## Responsive behavior\n\n${resp}\n\n`;
      });

    if (next === txt) continue;
    touched++;
    if (args.write) fs.writeFileSync(abs, next, 'utf8');
    else console.log(`would update ${rel}`);
  }

  console.log(args.write ? `Updated ${touched} contract file(s).` : `Dry-run: ${touched} contract file(s) would change.`);
}

main();
