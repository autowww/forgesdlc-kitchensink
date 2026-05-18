#!/usr/bin/env node
/**
 * Suggest unused three-letter visual hashes for manual allocation.
 * Does not edit visual-registry.yaml. Uniqueness and format are enforced by check-visual-catalog.mjs.
 *
 * Usage:
 *   node allocate-visual-hash.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --suggest 10
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadRegistry } from './lib/parse-registry.mjs';
import { isValidHashFormat, lettersDistinct } from './lib/hash-utils.mjs';

function parseArgs(argv) {
  const o = { repo: process.cwd(), registry: null, n: 8 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') o.repo = path.resolve(argv[++i] || '');
    else if (a === '--registry') o.registry = path.resolve(argv[++i] || '');
    else if (a === '--suggest') o.n = Math.max(1, parseInt(argv[++i] || '8', 10));
  }
  if (!o.registry) o.registry = path.join(o.repo, 'docs/design/catalog/visual-registry.yaml');
  return o;
}

function randomHash(used) {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz'; // skip I,i,l,O,o ambiguous in some fonts
  for (let attempt = 0; attempt < 5000; attempt++) {
    let h = '';
    const pool = letters.split('');
    for (let k = 0; k < 3; k++) {
      const idx = Math.floor(Math.random() * pool.length);
      h += pool[idx];
      pool.splice(idx, 1);
    }
    if (isValidHashFormat(h) && lettersDistinct(h) && !used.has(h)) return h;
  }
  return null;
}

function main() {
  const args = parseArgs(process.argv);
  const { entries } = loadRegistry(args.registry);
  const used = new Set(entries.map((e) => e.hash).filter(Boolean));
  const out = [];
  for (let i = 0; i < args.n; i++) {
    const h = randomHash(used);
    if (!h) break;
    used.add(h);
    out.push(h);
  }
  console.log(out.join('\n'));
  if (!out.length) {
    console.error('Could not allocate hashes');
    process.exit(1);
  }
}

main();
