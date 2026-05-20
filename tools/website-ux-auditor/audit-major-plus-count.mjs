#!/usr/bin/env node
/**
 * Print the count of Blocker + Critical + Major findings on visited pages
 * (flattened from audit-data.json `pages[].findings`), matching crawl governor semantics.
 *
 * Remediation loop sign-off uses **audit-quality-gate.mjs** (per-severity thresholds).
 * This script remains for crawl governors and legacy tooling.
 *
 * Usage: node audit-major-plus-count.mjs <audit-data.json>
 * Exit: 0 (stdout is a decimal integer). Exit 2 if args/path wrong; exit 1 if read/parse fails.
 */

import fs from 'fs';
import { countMajorPlus } from './lib/severity.js';

const path = process.argv[2];
if (!path) {
  console.error('usage: audit-major-plus-count.mjs <audit-data.json>');
  process.exit(2);
}

let raw;
try {
  raw = JSON.parse(fs.readFileSync(path, 'utf8'));
} catch (e) {
  console.error(e?.message || String(e));
  process.exit(1);
}

const pages = raw.pages || [];
const flat = pages.flatMap((p) => p.findings || []);
const n = countMajorPlus(flat);
process.stdout.write(`${n}\n`);
