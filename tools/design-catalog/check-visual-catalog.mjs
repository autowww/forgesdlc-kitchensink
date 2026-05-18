#!/usr/bin/env node
/**
 * Validate visual-registry.yaml, contracts, inventory coverage, optional showcase HTML markers.
 *
 * Usage:
 *   node check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml
 *   node check-visual-catalog.mjs ... --showcase showcase
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadRegistry, normalizeRegistryForJson } from './lib/parse-registry.mjs';
import { isValidHashFormat, lettersDistinct } from './lib/hash-utils.mjs';

function parseArgs(argv) {
  const o = { repo: process.cwd(), registry: null, showcase: null, inventory: null, strictInventory: true };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') o.repo = path.resolve(argv[++i] || '');
    else if (a === '--registry') o.registry = path.resolve(argv[++i] || '');
    else if (a === '--showcase') o.showcase = path.resolve(argv[++i] || '');
    else if (a === '--inventory') o.inventory = path.resolve(argv[++i] || '');
    else if (a === '--no-strict-inventory') o.strictInventory = false;
  }
  if (!o.registry) {
    console.error('Usage: node check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml [--showcase showcase]');
    process.exit(2);
  }
  if (!o.inventory) o.inventory = path.join(o.repo, 'docs/design/catalog/visual-inventory.generated.json');
  return o;
}

function readInv(p) {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/** Hashes referenced as governed DOM markers or primitive literals under showcase/ (HTML + assets/*.js). */
function collectEmittedHashes(showcaseDir) {
  const set = new Set();
  if (!fs.existsSync(showcaseDir)) return set;

  const scanText = (txt, isJs) => {
    const reAttr = /(?:hash|data-ks-hash)=["']([A-Za-z]{3})["']/g;
    let m;
    while ((m = reAttr.exec(txt)) !== null) set.add(m[1]);
    if (isJs) {
      const reLit = /hash:"([A-Za-z]{3})"/g;
      while ((m = reLit.exec(txt)) !== null) set.add(m[1]);
      const reQuoted = /"data-ks-hash":"([A-Za-z]{3})"/g;
      while ((m = reQuoted.exec(txt)) !== null) set.add(m[1]);
    }
  };

  for (const name of fs.readdirSync(showcaseDir)) {
    if (!name.endsWith('.html')) continue;
    const fp = path.join(showcaseDir, name);
    scanText(fs.readFileSync(fp, 'utf8'), false);
  }

  const assetsDir = path.join(showcaseDir, 'assets');
  if (fs.existsSync(assetsDir) && fs.statSync(assetsDir).isDirectory()) {
    for (const name of fs.readdirSync(assetsDir)) {
      if (!name.endsWith('.js')) continue;
      const fp = path.join(assetsDir, name);
      scanText(fs.readFileSync(fp, 'utf8'), true);
    }
  }
  return set;
}

function main() {
  const args = parseArgs(process.argv);
  const { entries } = loadRegistry(args.registry);
  const errors = [];
  const warnings = [];

  const hashesSeen = new Set();
  for (const e of entries) {
    const h = e.hash;
    if (!isValidHashFormat(h)) errors.push(`Invalid hash format: ${h}`);
    if (!lettersDistinct(h) && !e.hash_exception_reason) {
      errors.push(`Hash ${h} repeats letters without hash_exception_reason`);
    }
    if (hashesSeen.has(h)) errors.push(`Duplicate hash: ${h}`);
    hashesSeen.add(h);

    for (const p of e.source_paths || []) {
      const fp = path.join(args.repo, p);
      if (!fs.existsSync(fp)) errors.push(`Missing source path for ${h}: ${p}`);
    }
    const cs = e.contract_status;
    if (cs === 'own' && e.contract) {
      const cp = path.join(args.repo, e.contract);
      if (!fs.existsSync(cp)) errors.push(`Missing contract file for ${h}: ${e.contract}`);
    }
    if (cs === 'family-covered' && e.contract) {
      const cp = path.join(args.repo, e.contract);
      if (!fs.existsSync(cp)) errors.push(`Missing family contract for ${h}: ${e.contract}`);
    }
    if (cs === 'missing') {
      warnings.push(`contract_status missing for hash ${h}`);
    }
  }

  const inv = readInv(args.inventory);
  if (inv?.items && args.strictInventory) {
    const byPath = new Map((entries || []).flatMap((e) => (e.source_paths || []).map((p) => [p, e])));

    const ksc = entries.find((x) => x.hash === 'Ksc');
    const ksj = entries.find((x) => x.hash === 'Ksj');
    const ksv = entries.find((x) => x.hash === 'Ksv');
    const kpr = entries.find((x) => x.hash === 'Kpr');
    const kra = entries.find((x) => x.hash === 'Kra');
    const kdt = entries.find((x) => x.hash === 'Kdt');

    const kscSet = new Set(ksc?.source_paths || []);
    const ksjSet = new Set(ksj?.source_paths || []);
    const ksvSet = new Set(ksv?.source_paths || []);
    const kprSet = new Set(kpr?.source_paths || []);

    for (const it of inv.items) {
      const t = it.proposed_type;
      const p = it.source_path?.replace(/\\/g, '/') || '';
      if (t === 'page-instance') {
        const slug = it.proposed_slug;
        const ok = entries.some((e) => e.type === 'page' && e.slug === slug);
        if (!ok) errors.push(`Unregistered showcase page slug in inventory: ${slug}`);
      } else if (t === 'layout') {
        const sym = it.source_symbol;
        const ok = entries.some((e) => e.type === 'layout' && (e.source_symbols || []).includes(sym));
        if (!ok) errors.push(`Unregistered layout in inventory: ${sym}`);
      } else if (t === 'layout-preview') {
        const slug = it.proposed_slug;
        const ok = entries.some((e) => e.type === 'layout-preview' && e.slug === slug);
        if (!ok) errors.push(`Unregistered layout preview in inventory: ${slug}`);
      } else if (t === 'visual-style') {
        if (p && !kscSet.has(p)) errors.push(`CSS file not in Ksc registry paths: ${p}`);
      } else if (t === 'interaction-module') {
        if (p && !ksjSet.has(p)) errors.push(`JS file not in Ksj registry paths: ${p}`);
      } else if (t === 'diagram-or-asset') {
        if (p && !ksvSet.has(p)) errors.push(`SVG asset not in Ksv registry paths: ${p}`);
      } else if (t === 'primitive' && it.family_group === 'react-primitives') {
        const ok = entries.some(
          (e) =>
            e.type === 'react-primitive' &&
            (e.source_paths || []).some((sp) => sp.endsWith(`${it.source_symbol}.tsx`)),
        );
        if (!ok) errors.push(`Unregistered React primitive in inventory: ${it.source_symbol}`);
      } else if (t === 'component' || t === 'visual-helper') {
        if (p.startsWith('components/') && !p.includes('layouts.py')) {
          const base = p.split('/').pop();
          const modOk = kprSet.has(`components/${base}`);
          if (!modOk) errors.push(`components module not in Kpr paths: ${p}`);
        }
      } else if (t === 'showcase-app-source') {
        const ok = (kra?.source_paths || []).includes(p);
        if (p.startsWith('showcase-react-app/') && !ok) {
          errors.push(`showcase-react-app path not in Kra: ${p}`);
        }
      } else if (t === 'design-terminology') {
        const set = new Set(kdt?.source_paths || []);
        if (!p) {
          // skip
        } else if (p.startsWith('docs/design/catalog/')) {
          /* catalog contracts/README — governed by registry rows, not Kdt */
        } else if (p.startsWith('docs/design/') && !set.has(p)) {
          warnings.push(`Design doc under docs/design/ not listed in Kdt source_paths: ${p}`);
        } else if (!p.startsWith('docs/design/') && !set.has(p)) {
          warnings.push(`Design terminology path not listed in Kdt source_paths: ${p}`);
        }
      } else if (t === 'generated-showcase-page') {
        const okPath = /^showcase\/[^/]+\.html$/i.test(p) && fs.existsSync(path.join(args.repo, p));
        if (!okPath) errors.push(`Invalid or missing generated showcase page path in inventory: ${p}`);
        else {
          const slug = it.proposed_slug;
          const regOk =
            entries.some((e) => e.type === 'page' && e.slug === slug) ||
            entries.some((e) => e.type === 'layout-preview' && e.slug === slug);
          if (!regOk) {
            warnings.push(`Showcase HTML ${p} has no registry page or layout-preview row for slug: ${slug}`);
          }
        }
      } else if (t === 'desktop-interface') {
        const ok = entries.some((e) => e.type === 'desktop-interface' && (e.source_paths || []).includes(p));
        if (!ok) errors.push(`Desktop interface path not registered: ${p}`);
      } else if (t === 'museum-surface-asset') {
        if (p && !p.startsWith('museum/studio/')) {
          errors.push(`Museum studio asset path must be under museum/studio/: ${p}`);
        }
      } else if (t === 'library-consumer') {
        const ok = entries.some(
          (e) => e.type === 'library-consumer' && (e.source_paths || []).includes(p),
        );
        if (!ok) errors.push(`Library consumer path not registered: ${p}`);
      }
    }
  }

  /* Orphan registry rows: each entry should match at least one inventory item when inventory exists */
  if (inv?.items) {
    const skipOrphan = new Set([
      'style-family',
      'script-family',
      'diagram-family',
      'python-renderer-family',
      'docs-family',
      'showcase-app-family',
      'primitive-family',
      'library-consumer',
      'react-primitive',
      'chrome-region',
    ]);
    for (const e of entries) {
      if (skipOrphan.has(e.type)) continue;
      if (e.type === 'layout') {
        const sym = (e.source_symbols || [])[0];
        const ok = inv.items.some((it) => it.proposed_type === 'layout' && it.source_symbol === sym);
        if (!ok) warnings.push(`Registry layout ${e.hash} not found in inventory`);
      } else if (e.type === 'page') {
        const ok = inv.items.some((it) => it.proposed_slug === e.slug && it.proposed_type === 'page-instance');
        if (!ok) warnings.push(`Registry page ${e.hash} slug ${e.slug} not found in inventory`);
      } else if (e.type === 'layout-preview') {
        const ok = inv.items.some((it) => it.proposed_slug === e.slug && it.proposed_type === 'layout-preview');
        if (!ok) warnings.push(`Registry layout-preview ${e.hash} slug ${e.slug} not found in inventory`);
      }
    }
  }

  let showcaseDir = args.showcase;
  if (showcaseDir === null && fs.existsSync(path.join(args.repo, 'showcase'))) {
    showcaseDir = path.join(args.repo, 'showcase');
  }
  if (showcaseDir && fs.existsSync(showcaseDir)) {
    const emittedHashes = collectEmittedHashes(showcaseDir);
    let shwCount = 0;
    let glyCount = 0;
    for (const name of fs.readdirSync(showcaseDir)) {
      if (!name.endsWith('.html')) continue;
      const txt = fs.readFileSync(path.join(showcaseDir, name), 'utf8');
      if (txt.includes('data-ks-hash="Shw"')) shwCount++;
      if (txt.includes('data-ks-hash="Gly"')) glyCount++;
    }
    if (shwCount < 8) errors.push(`layout Shw should appear on many showcase doc shells (found ${shwCount} files)`);
    if (glyCount < 1) errors.push('layout Gly marker missing from gallery pages');

    for (const e of entries) {
      const st = String(e.status || '').toLowerCase();
      if (st !== 'deprecated') continue;
      const h = e.hash;
      if (!emittedHashes.has(h)) continue;
      const aliases = e.aliases;
      if (Array.isArray(aliases) && aliases.length > 0) continue;
      errors.push(
        `Deprecated hash ${h} is still emitted in showcase HTML/JS but registry row has no aliases (add successor hash list)`,
      );
    }

    for (const e of entries) {
      if (!e.emit_marker_in_showcase) continue;
      const h = e.hash;
      let expectedFiles = [];
      if (e.type === 'page') {
        expectedFiles.push(`${e.slug}.html`);
      } else if (e.type === 'layout-preview') {
        const m = (e.showcase_url || '').match(/\/([^/]+\.html)$/);
        if (m) expectedFiles.push(m[1]);
      } else if (e.type === 'layout') {
        const m = (e.showcase_url || '').match(/\/([^/]+\.html)$/);
        if (m) expectedFiles.push(m[1]);
      }
      if (e.type === 'react-primitive') {
        if (!emittedHashes.has(h)) {
          errors.push(
            `React primitive hash ${h} not found in built showcase (build showcase-react-app, then python3 generator/build-showcase.py; expect marker or hash:"${h}" in showcase/assets/*.js)`,
          );
        }
        continue;
      }

      if (expectedFiles.length === 0) continue;
      for (const fn of expectedFiles) {
        const fp = path.join(showcaseDir, fn);
        if (!fs.existsSync(fp)) {
          warnings.push(`Showcase file missing for hash ${h}: ${fn}`);
          continue;
        }
        const txt = fs.readFileSync(fp, 'utf8');
        const has = txt.includes(`hash="${h}"`) && txt.includes(`data-ks-hash="${h}"`);
        if (!has) errors.push(`Missing hash markers ${h} in ${fn}`);
      }
    }
  } else if (entries.some((e) => e.emit_marker_in_showcase)) {
    warnings.push('No showcase dir for HTML marker validation (skip or pass --showcase)');
  }

  for (const w of warnings) console.warn(`[warn] ${w}`);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  const covPath = path.join(args.repo, 'docs/design/catalog/visual-registry-coverage.md');
  const byType = {};
  const byStatus = {};
  const byContract = {};
  const byScreenshot = {};
  for (const e of entries) {
    byType[e.type] = (byType[e.type] || 0) + 1;
    byStatus[e.status] = (byStatus[e.status] || 0) + 1;
    byContract[e.contract_status] = (byContract[e.contract_status] || 0) + 1;
    const ss = e.screenshot_status ?? 'unset';
    byScreenshot[ss] = (byScreenshot[ss] || 0) + 1;
  }
  const covLines = [
    '# Visual registry coverage',
    '',
    `- Entries: ${entries.length}`,
    '',
    '## By type',
    ...Object.entries(byType).map(([k, v]) => `- ${k}: ${v}`),
    '',
    '## By status',
    ...Object.entries(byStatus).map(([k, v]) => `- ${k}: ${v}`),
    '',
    '## By contract_status',
    ...Object.entries(byContract).map(([k, v]) => `- ${k}: ${v}`),
    '',
    '## By screenshot_status',
    ...Object.entries(byScreenshot).map(([k, v]) => `- ${k}: ${v}`),
    '',
  ];

  if (inv?.items?.length) {
    /** @type {Record<string, number>} */
    const invByType = {};
    for (const it of inv.items) {
      const k = it.proposed_type || 'unset';
      invByType[k] = (invByType[k] || 0) + 1;
    }
    covLines.push(
      '## Inventory snapshot (visual-inventory.generated.json)',
      '',
      `- Items: ${inv.items.length}`,
      '',
      '### By proposed_type',
      ...Object.entries(invByType)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `- ${k}: ${v}`),
      '',
      'Family-level registry rows (Ksc, Ksj, Ksv, …) intentionally consolidate many inventory paths.',
      '',
    );
  }

  fs.writeFileSync(covPath, covLines.join('\n') + '\n', 'utf8');

  /* Re-write JSON normalized */
  const jsonOut = path.join(args.repo, 'docs/design/catalog/visual-registry.generated.json');
  fs.writeFileSync(jsonOut, `${JSON.stringify(normalizeRegistryForJson(args.repo, entries), null, 2)}\n`, 'utf8');

  console.log(`check-visual-catalog OK (${entries.length} entries). Wrote ${path.relative(args.repo, covPath)}`);
}

main();
