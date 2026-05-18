#!/usr/bin/env node
/**
 * Scan raw HTML (URL, file, or directory tree) for KS visual hash markers and compare
 * against docs/design/catalog/visual-registry.generated.json.
 *
 * Does not invoke analyze-website-ux.mjs or score-website-ux.mjs.
 *
 * Usage (from KS repo root):
 *   node tools/design-catalog/check-consumer-hashes.mjs --url https://forgesdlc.com/
 *   node tools/design-catalog/check-consumer-hashes.mjs --file path/to/index.html
 *   node tools/design-catalog/check-consumer-hashes.mjs --dir showcase/
 *   node tools/design-catalog/check-consumer-hashes.mjs --dir dist/ --repo . --strict
 */

import fs from 'node:fs';
import path from 'node:path';
import { isValidHashFormat, lettersDistinct } from './lib/hash-utils.mjs';

function parseArgs(argv) {
  const o = {
    repo: process.cwd(),
    registry: null,
    url: null,
    file: null,
    dir: null,
    strict: false,
    quiet: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') o.repo = path.resolve(argv[++i] || '');
    else if (a === '--registry') o.registry = path.resolve(argv[++i] || '');
    else if (a === '--url') o.url = argv[++i] || '';
    else if (a === '--file') o.file = path.resolve(argv[++i] || '');
    else if (a === '--dir') o.dir = path.resolve(argv[++i] || '');
    else if (a === '--strict') o.strict = true;
    else if (a === '--quiet') o.quiet = true;
  }
  const modes = [o.url, o.file, o.dir].filter(Boolean).length;
  if (modes !== 1) {
    console.error(
      'Usage: node check-consumer-hashes.mjs (--url <url> | --file <path> | --dir <path>) [--repo <dir>] [--registry <visual-registry.generated.json>] [--strict] [--quiet]',
    );
    process.exit(2);
  }
  if (!o.registry) {
    o.registry = path.join(o.repo, 'docs/design/catalog/visual-registry.generated.json');
  }
  return o;
}

function loadRegistryJson(registryPath) {
  if (!fs.existsSync(registryPath)) {
    throw new Error(`Registry not found: ${registryPath}`);
  }
  const doc = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const entries = Array.isArray(doc?.entries) ? doc.entries : [];
  const known = new Set();
  const exceptionHashes = new Set();
  const byHash = new Map();
  for (const e of entries) {
    if (e?.hash) {
      known.add(e.hash);
      byHash.set(e.hash, e);
      if (e.hash_exception_reason) exceptionHashes.add(e.hash);
    }
  }
  return { known, exceptionHashes, byHash, registryPath };
}

/** @param {string} html */
function extractAllQuoted(html, attr) {
  const vals = [];
  const esc = attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const reD = new RegExp(`(?:^|[\\s])${esc}="([^"]*)"`, 'g');
  const reS = new RegExp(`(?:^|[\\s])${esc}='([^']*)'`, 'g');
  let m;
  while ((m = reD.exec(html)) !== null) vals.push(m[1]);
  while ((m = reS.exec(html)) !== null) vals.push(m[1]);
  return vals;
}

/** @param {string[]} values @param {Set<string>} exceptionHashes */
function classifyValues(values, exceptionHashes) {
  const invalid = [];
  for (const v of values) {
    if (!isValidHashFormat(v)) {
      invalid.push(v);
      continue;
    }
    if (!lettersDistinct(v) && !exceptionHashes.has(v)) invalid.push(v);
  }
  return invalid;
}

/** @param {string} html */
function countPerHashId(html) {
  /** @type {Map<string, { hash: number, data: number }>} */
  const m = new Map();
  const bump = (id, k) => {
    if (!m.has(id)) m.set(id, { hash: 0, data: 0 });
    m.get(id)[k]++;
  };

  const reH = /(?:^|[\s])hash="([A-Za-z]{3})"/g;
  const reH2 = /(?:^|[\s])hash='([A-Za-z]{3})'/g;
  let x;
  while ((x = reH.exec(html)) !== null) bump(x[1], 'hash');
  while ((x = reH2.exec(html)) !== null) bump(x[1], 'hash');

  const reD = /data-ks-hash="([A-Za-z]{3})"/g;
  const reD2 = /data-ks-hash='([A-Za-z]{3})'/g;
  while ((x = reD.exec(html)) !== null) bump(x[1], 'data');
  while ((x = reD2.exec(html)) !== null) bump(x[1], 'data');

  return m;
}

function* walkHtmlFiles(root) {
  if (!fs.existsSync(root)) return;
  for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
    const p = path.join(root, ent.name);
    if (ent.isDirectory()) yield* walkHtmlFiles(p);
    else if (ent.name.endsWith('.html')) yield p;
  }
}

async function readHtmlSource(args) {
  /** @type {string} */
  let label;
  /** @type {string} */
  let html;

  if (args.url) {
    label = args.url;
    const res = await fetch(args.url, {
      redirect: 'follow',
      headers: { 'user-agent': 'ks-check-consumer-hashes/1.0' },
    });
    if (!res.ok) {
      throw new Error(`Fetch ${args.url}: HTTP ${res.status}`);
    }
    html = await res.text();
  } else if (args.file) {
    label = args.file;
    html = fs.readFileSync(args.file, 'utf8');
  } else {
    const parts = [];
    const files = [...walkHtmlFiles(args.dir)];
    if (!files.length) {
      throw new Error(`No .html files under ${args.dir}`);
    }
    label = `${args.dir} (${files.length} html files)`;
    for (const fp of files) {
      parts.push(`<!-- file:${fp} -->\n${fs.readFileSync(fp, 'utf8')}\n`);
    }
    html = parts.join('\n');
  }

  return { label, html };
}

/** Heuristic: handbook-style consumer paths often include Hbk (layout) and/or Hdc (chapter main). */
function handbookShellHeuristic(urlOrLabel, html) {
  if (!urlOrLabel.includes('forgesdlc.com')) return [];
  const warnings = [];
  const low = urlOrLabel.toLowerCase();
  if (/\/handbook\/|\/docs\//.test(low) || /blueprints/.test(low)) {
    if (!html.includes('data-ks-hash="Hbk"') && !html.includes("data-ks-hash='Hbk'")) {
      warnings.push(
        'heuristic: URL/path looks handbook-like but no Hbk data-ks-hash marker seen (layout shell may be stripped, non-KS page, or outdated kitchensink)',
      );
    }
  }
  return warnings;
}

function main() {
  const args = parseArgs(process.argv);

  const run = async () => {
    const reg = loadRegistryJson(args.registry);
    const { label, html } = await readHtmlSource(args);

    const hashBare = extractAllQuoted(html, 'hash').filter((v) => v.length > 0);
    const dataBare = extractAllQuoted(html, 'data-ks-hash');

    const hashThree = hashBare.filter((v) => isValidHashFormat(v));
    const dataThree = dataBare.filter((v) => isValidHashFormat(v));

    const invalidHashAttrs = classifyValues(hashBare, reg.exceptionHashes);
    const invalidDataAttrs = classifyValues(dataBare, reg.exceptionHashes);

    const unknownFromHash = [...new Set(hashThree)].filter((h) => !reg.known.has(h));
    const unknownFromData = [...new Set(dataThree)].filter((h) => !reg.known.has(h));

    const perId = countPerHashId(html);
    const pairMismatches = [];
    for (const [id, c] of perId) {
      if (c.hash !== c.data) {
        pairMismatches.push({ id, hashAttrCount: c.hash, dataKsHashCount: c.data });
      }
    }

    const docWarnings = handbookShellHeuristic(label, html);

    const issues = [];
    if (invalidHashAttrs.length) issues.push(`invalid hash= value(s): ${[...new Set(invalidHashAttrs)].join(', ')}`);
    if (invalidDataAttrs.length)
      issues.push(`invalid data-ks-hash= value(s): ${[...new Set(invalidDataAttrs)].join(', ')}`);
    if (unknownFromHash.length) issues.push(`unknown hash (not in registry): ${unknownFromHash.join(', ')}`);
    if (unknownFromData.length) issues.push(`unknown data-ks-hash (not in registry): ${unknownFromData.join(', ')}`);
    for (const pm of pairMismatches) {
      issues.push(
        `pair count mismatch for "${pm.id}": hash=${pm.hashAttrCount} vs data-ks-hash=${pm.dataKsHashCount}`,
      );
    }

    if (!args.quiet) {
      console.log(`Source: ${label}`);
      console.log(`Registry: ${reg.registryPath}`);
      console.log('');
      console.log(`Occurrences of hash="…" (valid 3-letter): ${hashThree.length}`);
      console.log(`Occurrences of data-ks-hash="…" (valid 3-letter): ${dataThree.length}`);
      console.log(`Distinct 3-letter ids from hash= attr: ${[...new Set(hashThree)].length}`);
      console.log(`Distinct 3-letter ids from data-ks-hash= attr: ${[...new Set(dataThree)].length}`);
      console.log('');
      if (invalidHashAttrs.length) console.log(`Invalid hash= values: ${invalidHashAttrs.length}`);
      if (invalidDataAttrs.length) console.log(`Invalid data-ks-hash= values: ${invalidDataAttrs.length}`);
      if (unknownFromHash.length) console.log(`Unknown hashes (registry): ${unknownFromHash.join(', ') || 'none'}`);
      if (unknownFromData.length)
        console.log(`Unknown data-ks-hash (registry): ${unknownFromData.join(', ') || 'none'}`);
      if (pairMismatches.length) {
        console.log('Pair mismatches (per hash id):');
        for (const pm of pairMismatches) {
          console.log(`  ${pm.id}: hash=${pm.hashAttrCount} data-ks-hash=${pm.dataKsHashCount}`);
        }
      }
      if (docWarnings.length) {
        console.log('Notes:');
        for (const w of docWarnings) console.log(`  - ${w}`);
      }
      console.log('');
      if (issues.length) {
        console.log(`Result: ${issues.length} issue(s)`);
        for (const i of issues) console.log(`  - ${i}`);
      } else {
        console.log('Result: OK (marker counts and registry pairing checks)');
      }
    }

    const exitBad =
      invalidHashAttrs.length > 0 ||
      invalidDataAttrs.length > 0 ||
      unknownFromHash.length > 0 ||
      unknownFromData.length > 0 ||
      pairMismatches.length > 0;

    if (args.strict && exitBad) process.exit(1);
  };

  run().catch((e) => {
    console.error(e.message || e);
    process.exit(1);
  });
}

main();
