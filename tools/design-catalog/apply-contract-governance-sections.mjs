#!/usr/bin/env node
/**
 * Insert ## Deterministic checks + ## AI-enabled review cues before ## Forbidden patterns
 * on stateful design contracts (registry types: layout, page, chrome-region, layout-preview).
 *
 * Usage:
 *   node tools/design-catalog/apply-contract-governance-sections.mjs --registry docs/design/catalog/visual-registry.yaml --repo . --dry-run
 *   node tools/design-catalog/apply-contract-governance-sections.mjs --registry docs/design/catalog/visual-registry.yaml --repo . --write
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadRegistry } from './lib/parse-registry.mjs';
import { buildGovernanceSectionsMarkdown } from './lib/contract-governance-blocks.mjs';

const STATEFUL_TYPES = new Set(['layout', 'page', 'chrome-region', 'layout-preview']);

function parseArgs(argv) {
  const o = { repo: process.cwd(), registry: null, dryRun: true, write: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') o.repo = path.resolve(argv[++i] || '');
    else if (a === '--registry') o.registry = path.resolve(argv[++i] || '');
    else if (a === '--dry-run') o.dryRun = true;
    else if (a === '--write') {
      o.write = true;
      o.dryRun = false;
    }
  }
  if (!o.registry) {
    console.error('Usage: apply-contract-governance-sections.mjs --registry <yaml> [--repo .] (--dry-run|--write)');
    process.exit(2);
  }
  return o;
}

function hasDeterministicHeading(txt) {
  return /^#{2,3}[^\n]*\bdeterministic\b/im.test(txt);
}

function hasAiHeading(txt) {
  return (
    /^#{2,3}[^\n]*\bAI\b/im.test(txt)
    || /^#{2,3}[^\n]*\bjudgment\b/im.test(txt)
    || /^#{2,3}[^\n]*\bhuman review\b/im.test(txt)
  );
}

function insertBeforeForbidden(txt, block) {
  const marker = '## Forbidden patterns\n';
  const i = txt.indexOf(marker);
  if (i === -1) throw new Error('Missing ## Forbidden patterns section');
  const before = txt.slice(0, i).replace(/\s*$/, '');
  const after = txt.slice(i);
  const body = block.trimEnd();
  return `${before}\n\n${body}\n\n${after}`;
}

/** @param {string} absPath @param {Record<string, unknown>} entry */
function patchContract(absPath, entry) {
  let txt = fs.readFileSync(absPath, 'utf8');
  if (hasDeterministicHeading(txt) && hasAiHeading(txt)) {
    return { txt, changed: false };
  }
  if (hasDeterministicHeading(txt) || hasAiHeading(txt)) {
    throw new Error(
      `${path.relative(process.cwd(), absPath)}: has only one of Deterministic / AI headings — complete manually`,
    );
  }
  const { combined } = buildGovernanceSectionsMarkdown(entry);
  txt = insertBeforeForbidden(txt, combined);
  return { txt, changed: true };
}

function main() {
  const args = parseArgs(process.argv);
  const { entries } = loadRegistry(args.registry);
  /** @type {Map<string, object>} */
  const byContract = new Map();
  for (const e of entries) {
    const typ = e.type || '';
    const cs = e.contract_status;
    if (!STATEFUL_TYPES.has(typ)) continue;
    if (cs !== 'own') continue;
    const rel = String(e.contract || '').replace(/\\/g, '/');
    if (!rel.endsWith('.md')) continue;
    if (!byContract.has(rel)) byContract.set(rel, e);
  }

  let touched = 0;
  for (const [rel, entry] of byContract) {
    const abs = path.join(args.repo, rel);
    if (!fs.existsSync(abs)) {
      console.warn(`[skip] missing ${rel}`);
      continue;
    }
    const txt0 = fs.readFileSync(abs, 'utf8');
    if (hasDeterministicHeading(txt0) && hasAiHeading(txt0)) {
      continue;
    }
    const { txt, changed } = patchContract(abs, entry);
    if (!changed) continue;
    touched++;
    console.log(`${args.write ? 'write' : 'would write'}: ${rel}`);
    if (args.write) fs.writeFileSync(abs, txt, 'utf8');
  }

  console.log(`Done. ${touched} file(s) ${args.write ? 'updated' : 'pending (dry-run)'}.`);
}

main();
