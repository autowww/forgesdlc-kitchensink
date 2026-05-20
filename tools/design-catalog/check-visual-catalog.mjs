#!/usr/bin/env node
/**
 * Validate visual-registry.yaml, contracts, inventory coverage, optional showcase HTML markers,
 * and museum/studio bootstrap sources (museum/studio/*.html|*.svg) for emitted hash pairs.
 *
 * Usage (from repo root):
 *   node tools/design-catalog/inventory-ks-visuals.mjs --repo . --out docs/design/catalog/visual-inventory.generated.json
 *   python3 generator/build-showcase.py
 *   node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase
 *
 * Optional:
 *   --refresh-inventory  Run inventory-ks-visuals.mjs before checks (no network).
 *   --strict-contract-placeholders  Treat stub bullets (TBD/TODO/FIXME) as errors.
 *   --verbose-contract-placeholders List each contract with stub placeholders (default: summarize).
 *   --allow-minimal-showcase  Skip Shw/Gly density guard (for tiny fixture repos).
 *   --strict-contract-governance  Also warn on missing Deterministic/AI review headings (stateful contracts).
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadRegistry, normalizeRegistryForJson } from './lib/parse-registry.mjs';
import { isValidHashFormat, lettersDistinct } from './lib/hash-utils.mjs';
import { analyzeContractPlaceholders } from './lib/contract-placeholders.mjs';
import {
  analyzeContractSpecificity,
  analyzeDuplicateExpectedLookBodies,
  extractExpectedLookBody,
} from './lib/contract-specificity.mjs';

function parseArgs(argv) {
  const o = {
    repo: process.cwd(),
    registry: null,
    showcase: null,
    inventory: null,
    strictInventory: true,
    refreshInventory: false,
    strictContractPlaceholders: false,
    verboseContractPlaceholders: false,
    allowMinimalShowcase: false,
    strictContractGovernance: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') o.repo = path.resolve(argv[++i] || '');
    else if (a === '--registry') o.registry = path.resolve(argv[++i] || '');
    else if (a === '--showcase') o.showcase = path.resolve(argv[++i] || '');
    else if (a === '--inventory') o.inventory = path.resolve(argv[++i] || '');
    else if (a === '--no-strict-inventory') o.strictInventory = false;
    else if (a === '--refresh-inventory') o.refreshInventory = true;
    else if (a === '--strict-contract-placeholders') o.strictContractPlaceholders = true;
    else if (a === '--verbose-contract-placeholders') o.verboseContractPlaceholders = true;
    else if (a === '--allow-minimal-showcase') o.allowMinimalShowcase = true;
    else if (a === '--strict-contract-governance') o.strictContractGovernance = true;
  }
  if (!o.registry) {
    console.error(
      'Usage: node check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml [--showcase showcase] [--refresh-inventory]',
    );
    process.exit(2);
  }
  if (!o.inventory) o.inventory = path.join(o.repo, 'docs/design/catalog/visual-inventory.generated.json');
  return o;
}

function readInv(p) {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/** @param {string} h @param {string} type @param {string|null} src @param {string|null} cPath */
function regMsg(h, type, src, cPath, detail) {
  const bits = [`hash ${h}`, `type ${type}`];
  if (src) bits.push(`source ${src}`);
  if (cPath) bits.push(`contract ${cPath}`);
  return `${bits.join(', ')}: ${detail}`;
}

const SCREENSHOT_STATUSES = new Set(['planned', 'captured', 'missing', 'not-applicable', 'blocked']);

/** Registry rows consolidated into family entries — not expected to map 1:1 to inventory line items. */
const INVENTORY_MATCH_EXEMPT_TYPES = new Set([
  'primitive-family',
  'style-family',
  'script-family',
  'diagram-family',
  'python-renderer-family',
  'docs-family',
  'showcase-app-family',
]);

/**
 * @param {object} e registry entry
 * @param {{ items?: object[] }} inv
 */
function registryEntryMatchesInventory(e, inv) {
  if (!inv?.items?.length) return true;
  if (INVENTORY_MATCH_EXEMPT_TYPES.has(e.type)) return true;
  const items = inv.items;
  const normPath = (p) => String(p || '').replace(/\\/g, '/');
  if (e.type === 'visual-style') {
    const paths = new Set((e.source_paths || []).map(normPath));
    return items.some((it) => it.proposed_type === 'visual-style' && paths.has(normPath(it.source_path)));
  }
  if (e.type === 'interaction-script') {
    const paths = new Set((e.source_paths || []).map(normPath));
    return items.some((it) => it.proposed_type === 'interaction-module' && paths.has(normPath(it.source_path)));
  }
  if (e.type === 'diagram-asset-group') {
    const paths = new Set((e.source_paths || []).map(normPath));
    return items.some((it) => it.proposed_type === 'diagram-or-asset' && paths.has(normPath(it.source_path)));
  }
  if (e.type === 'python-component-module') {
    const paths = [...new Set((e.source_paths || []).map(normPath))].filter(Boolean);
    if (!paths.length) return false;
    return paths.every((pth) =>
      items.some(
        (it) =>
          (it.proposed_type === 'component' ||
            it.proposed_type === 'visual-helper' ||
            it.proposed_type === 'python-component-anchor') &&
          normPath(it.source_path) === pth,
      ),
    );
  }
  if (e.type === 'museum-chrome-asset') {
    const paths = new Set((e.source_paths || []).map(normPath));
    return items.some((it) => it.proposed_type === 'museum-surface-asset' && paths.has(normPath(it.source_path)));
  }
  if (e.type === 'layout') {
    const sym = (e.source_symbols || [])[0];
    return items.some((it) => it.proposed_type === 'layout' && it.source_symbol === sym);
  }
  if (e.type === 'page') {
    return items.some((it) => it.proposed_type === 'page-instance' && it.proposed_slug === e.slug);
  }
  if (e.type === 'layout-preview') {
    return items.some((it) => it.proposed_type === 'layout-preview' && it.proposed_slug === e.slug);
  }
  if (e.type === 'chrome-region') {
    return items.some((it) => it.proposed_type === 'chrome-region' && it.proposed_slug === e.slug);
  }
  if (e.type === 'react-primitive') {
    const p = (e.source_paths || [])[0];
    return items.some(
      (it) =>
        it.proposed_type === 'primitive' &&
        it.family_group === 'react-primitives' &&
        it.source_path === p &&
        it.source_symbol === (e.source_symbols || [])[0],
    );
  }
  if (e.type === 'desktop-interface') {
    return items.some(
      (it) => it.proposed_type === 'desktop-interface' && (e.source_paths || []).includes(it.source_path),
    );
  }
  if (e.type === 'library-consumer') {
    return items.some(
      (it) => it.proposed_type === 'library-consumer' && (e.source_paths || []).includes(it.source_path),
    );
  }
  return true;
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

  if (args.refreshInventory) {
    const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'inventory-ks-visuals.mjs');
    const r = spawnSync(process.execPath, [script, '--repo', args.repo, '--out', args.inventory, '--quiet'], {
      stdio: 'inherit',
    });
    if (r.error) {
      console.error(r.error);
      process.exit(1);
    }
    if (r.status !== 0 && r.status != null) process.exit(r.status);
  }

  const { entries } = loadRegistry(args.registry);
  const errors = [];
  const warnings = [];
  const generatedAt = new Date().toISOString();

  const byHash = new Map();
  for (const e of entries) {
    if (e?.hash) byHash.set(e.hash, e);
  }

  const hashesSeen = new Set();
  for (const e of entries) {
    const h = e.hash;
    const typ = e.type || 'unset';
    const src0 = (e.source_paths || [])[0] ?? null;
    const con = e.contract ?? null;

    if (!isValidHashFormat(h)) {
      errors.push(regMsg(String(h), typ, src0, con, 'invalid hash format (expected /^[A-Za-z]{3}$/)'));
    }
    if (isValidHashFormat(h) && !lettersDistinct(h) && !e.hash_exception_reason) {
      errors.push(regMsg(h, typ, src0, con, 'repeated letters in hash without hash_exception_reason'));
    }
    if (hashesSeen.has(h)) errors.push(regMsg(h, typ, src0, con, 'duplicate hash'));
    if (h) hashesSeen.add(h);

    const cs = e.contract_status;
    if (cs === 'own' && !String(e.contract || '').trim()) {
      errors.push(regMsg(h, typ, src0, null, 'contract_status own but contract path is empty'));
    }
    if (cs === 'family-covered') {
      const cstr = String(e.contract || '').trim();
      if (!cstr) {
        errors.push(regMsg(h, typ, src0, null, 'contract_status family-covered but contract path is empty'));
      } else {
        const base = path.basename(cstr);
        const looksFam = /^FAM-/i.test(base);
        const ph = e.parent_hash;
        const parentOk = ph && byHash.has(ph);
        if (!looksFam && !parentOk) {
          errors.push(
            regMsg(
              h,
              typ,
              src0,
              cstr,
              'contract_status family-covered requires parent_hash → existing registry entry or FAM-* shared contract file',
            ),
          );
        }
      }
    }

    if (e.parent_hash && !byHash.has(e.parent_hash)) {
      errors.push(regMsg(h, typ, src0, con, `parent_hash ${e.parent_hash} not found in registry`));
    }

    if (!String(e.category || '').trim()) {
      errors.push(regMsg(h, typ, src0, con, 'category is required (non-empty string)'));
    }
    if (typeof e.emits_html !== 'boolean') {
      errors.push(regMsg(h, typ, src0, con, 'emits_html is required (boolean true/false)'));
    }

    for (const p of e.source_paths || []) {
      const fp = path.join(args.repo, p);
      if (!fs.existsSync(fp)) errors.push(regMsg(h, typ, p, con, 'missing source file'));
    }

    if (cs === 'own' && e.contract) {
      const cp = path.join(args.repo, e.contract);
      if (!fs.existsSync(cp)) errors.push(regMsg(h, typ, src0, e.contract, 'missing contract file'));
      else {
        const base = path.basename(String(e.contract));
        if (isValidHashFormat(h) && !/^FAM-/i.test(base) && !base.includes(h)) {
          errors.push(
            regMsg(
              h,
              typ,
              src0,
              e.contract,
              'contract filename/path should include the registry hash (registry↔contract drift guard)',
            ),
          );
        }
      }
    }
    if (cs === 'family-covered' && e.contract) {
      const cp = path.join(args.repo, e.contract);
      if (!fs.existsSync(cp)) errors.push(regMsg(h, typ, src0, e.contract, 'missing family contract file'));
    }
    if (cs === 'missing') {
      warnings.push(regMsg(h, typ, src0, con, 'contract_status missing'));
    }

    const ssRaw = e.screenshot_status;
    const ss = ssRaw != null && ssRaw !== '' ? String(ssRaw) : '';
    if (ss && !SCREENSHOT_STATUSES.has(ss)) {
      errors.push(regMsg(h, typ, src0, con, `unknown screenshot_status "${ss}"`));
    }
    if (!ss) {
      warnings.push(regMsg(h, typ, src0, con, 'screenshot_status unset'));
    }
    const su = String(e.screenshot_url || '').trim();
    const note = String(e.notes || '').trim();
    const sr = String(e.screenshot_reason || '').trim();
    if (ss === 'planned' || ss === 'missing' || ss === 'blocked') {
      if (!su && !note && !sr) {
        errors.push(
          regMsg(
            h,
            typ,
            src0,
            con,
            `screenshot_status ${ss} requires screenshot_url, notes, or screenshot_reason`,
          ),
        );
      }
    }
    if (ss === 'captured' && !su) {
      errors.push(regMsg(h, typ, src0, con, 'screenshot_status captured requires screenshot_url'));
    }
  }

  const contractPathsChecked = new Set();
  let stubContractFiles = 0;

  /**
   * @param {Set<string>} seen
   * @param {string} abs
   */
  function markContractSeen(seen, abs) {
    const norm = path.normalize(abs);
    if (seen.has(norm)) return false;
    seen.add(norm);
    return true;
  }

  const placeholderOpts = { strict: args.strictContractPlaceholders };
  for (const e of entries) {
    const cs = e.contract_status;
    if (cs !== 'own' && cs !== 'family-covered') continue;
    if (!e.contract) continue;
    const rel = e.contract.replace(/\\/g, '/');
    if (rel.endsWith('contract-template.md')) continue;
    const cp = path.join(args.repo, e.contract);
    if (!fs.existsSync(cp)) continue;
    if (!markContractSeen(contractPathsChecked, cp)) continue;
    const txt = fs.readFileSync(cp, 'utf8');
    const { errors: phErr, warnings: phWarn } = analyzeContractPlaceholders(txt, rel, placeholderOpts);
    for (const m of phErr) {
      errors.push(regMsg(e.hash, e.type, (e.source_paths || [])[0] ?? null, rel, m));
    }
    const { errors: specErr, warnings: specWarn } = analyzeContractSpecificity(txt, rel, e.type || '', {
      strictGovernanceHeadings: args.strictContractGovernance,
    });
    for (const m of specErr) {
      errors.push(regMsg(e.hash, e.type, (e.source_paths || [])[0] ?? null, rel, m));
    }
    for (const w of specWarn) {
      warnings.push(regMsg(e.hash, e.type, (e.source_paths || [])[0] ?? null, rel, w));
    }
    const isStubWarn = phWarn.some((w) => w.includes('stub bullets'));
    if (isStubWarn) stubContractFiles++;
    if (args.verboseContractPlaceholders) {
      for (const w of phWarn) {
        warnings.push(regMsg(e.hash, e.type, (e.source_paths || [])[0] ?? null, rel, w));
      }
    }
  }
  if (stubContractFiles > 0 && !args.verboseContractPlaceholders) {
    warnings.push(
      `${stubContractFiles} contract file(s) still contain stub bullets (TBD/TODO/FIXME); use --verbose-contract-placeholders to list each or --strict-contract-placeholders to fail`,
    );
  }

  /** Cross-contract duplicate Expected look bodies (layout/page/chrome/layout-preview). */
  const contractPathTypes = new Map();
  for (const e of entries) {
    const cs = e.contract_status;
    if (cs !== 'own' && cs !== 'family-covered') continue;
    if (!e.contract) continue;
    const rel = String(e.contract).replace(/\\/g, '/');
    if (!contractPathTypes.has(rel)) contractPathTypes.set(rel, new Set());
    contractPathTypes.get(rel).add(String(e.type || ''));
  }
  /** @type {{ relPath: string, registryTypes: string[], body: string }[]} */
  const expectedLookSamples = [];
  for (const [rel, types] of contractPathTypes) {
    const cp = path.join(args.repo, rel);
    if (!fs.existsSync(cp)) continue;
    const t = fs.readFileSync(cp, 'utf8');
    expectedLookSamples.push({
      relPath: rel,
      registryTypes: [...types],
      body: extractExpectedLookBody(t),
    });
  }
  for (const m of analyzeDuplicateExpectedLookBodies(expectedLookSamples)) {
    errors.push(m);
  }

  function sourcePathUnionForTypes(typeList) {
    const set = new Set();
    for (const e of entries) {
      if (!typeList.has(e.type)) continue;
      for (const p of e.source_paths || []) set.add(String(p).replace(/\\/g, '/'));
    }
    return set;
  }

  const inv = readInv(args.inventory);
  if (inv?.items && args.strictInventory) {
    const kra = entries.find((x) => x.hash === 'Kra');
    const kdt = entries.find((x) => x.hash === 'Kdt');

    const cssCoverage = sourcePathUnionForTypes(new Set(['style-family', 'visual-style']));
    const jsCoverage = sourcePathUnionForTypes(new Set(['script-family', 'interaction-script']));
    const svgCoverage = sourcePathUnionForTypes(new Set(['diagram-family', 'diagram-asset-group']));
    const kprCoverage = sourcePathUnionForTypes(new Set(['python-renderer-family', 'python-component-module']));

    for (const it of inv.items) {
      const t = it.proposed_type;
      const p = it.source_path?.replace(/\\/g, '/') || '';
      if (t === 'page-instance') {
        const slug = it.proposed_slug;
        const ok = entries.some((e) => e.type === 'page' && e.slug === slug);
        if (!ok) errors.push(`Unregistered showcase page slug in inventory: ${slug} (${p})`);
      } else if (t === 'layout') {
        const sym = it.source_symbol;
        const ok = entries.some((e) => e.type === 'layout' && (e.source_symbols || []).includes(sym));
        if (!ok) errors.push(`Unregistered layout in inventory: ${sym} (${p})`);
      } else if (t === 'layout-preview') {
        const slug = it.proposed_slug;
        const ok = entries.some((e) => e.type === 'layout-preview' && e.slug === slug);
        if (!ok) errors.push(`Unregistered layout preview in inventory: ${slug} (${p})`);
      } else if (t === 'chrome-region') {
        const slug = it.proposed_slug;
        const ok = entries.some((e) => e.type === 'chrome-region' && e.slug === slug);
        if (!ok) errors.push(`Chrome region slug in inventory not registered: ${slug} (${p})`);
      } else if (t === 'visual-style') {
        const pn = p.replace(/\\/g, '/');
        if (p && !cssCoverage.has(pn)) errors.push(`CSS file not covered by style-family/visual-style registry paths: ${p}`);
      } else if (t === 'interaction-module') {
        const pn = p.replace(/\\/g, '/');
        if (p && !jsCoverage.has(pn))
          errors.push(`JS file not covered by script-family/interaction-script registry paths: ${p}`);
      } else if (t === 'diagram-or-asset') {
        const pn = p.replace(/\\/g, '/');
        if (p && !svgCoverage.has(pn))
          errors.push(`SVG asset not covered by diagram-family/diagram-asset-group registry paths: ${p}`);
      } else if (t === 'primitive' && it.family_group === 'react-primitives') {
        const ok = entries.some(
          (e) =>
            e.type === 'react-primitive' &&
            (e.source_paths || []).some((sp) => sp.endsWith(`${it.source_symbol}.tsx`)),
        );
        if (!ok) errors.push(`Unregistered React primitive in inventory: ${it.source_symbol} (${p})`);
      } else if (t === 'component' || t === 'visual-helper' || t === 'python-component-anchor') {
        if (p.startsWith('components/') && !p.includes('layouts.py')) {
          const pn = p.replace(/\\/g, '/');
          if (!kprCoverage.has(pn))
            errors.push(`components module not in Kpr/python-component-module paths: ${p}`);
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

  const registryInventoryGaps = [];
  if (inv?.items?.length) {
    for (const e of entries) {
      if (!registryEntryMatchesInventory(e, inv)) {
        registryInventoryGaps.push({
          hash: e.hash,
          type: e.type,
          slug: e.slug ?? null,
          source_paths: e.source_paths ?? [],
          contract: e.contract ?? null,
        });
      }
    }
  }
  for (const g of registryInventoryGaps) {
    errors.push(
      regMsg(
        g.hash,
        g.type,
        (g.source_paths || [])[0] ?? null,
        g.contract,
        'registry row not found in source-derived inventory (regenerate inventory after source changes)',
      ),
    );
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
    if (shwCount < 8 && !args.allowMinimalShowcase) {
      errors.push(
        `Showcase HTML: layout Shw should appear on many showcase doc shells (found ${shwCount} files under ${path.relative(args.repo, showcaseDir) || '.'})`,
      );
    }
    if (glyCount < 1 && !args.allowMinimalShowcase) {
      errors.push(
        `Showcase HTML: layout Gly marker missing from gallery pages (under ${path.relative(args.repo, showcaseDir) || '.'})`,
      );
    }

    for (const e of entries) {
      const st = String(e.status || '').toLowerCase();
      if (st !== 'deprecated') continue;
      const h = e.hash;
      if (!emittedHashes.has(h)) continue;
      const aliases = e.aliases;
      if (Array.isArray(aliases) && aliases.length > 0) continue;
      errors.push(
        regMsg(
          h,
          e.type,
          (e.source_paths || [])[0] ?? null,
          e.contract ?? null,
          'deprecated hash still emitted in showcase HTML/JS but registry row has no aliases (add successor hash list)',
        ),
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
            regMsg(
              h,
              e.type,
              (e.source_paths || [])[0] ?? null,
              e.contract ?? null,
              `React primitive hash not found in built showcase (build showcase-react-app, then python3 generator/build-showcase.py; expect hash="${h}" and data-ks-hash="${h}" in showcase HTML or hash:"${h}" in showcase/assets/*.js)`,
            ),
          );
        }
        continue;
      }

      if (expectedFiles.length === 0) continue;
      for (const fn of expectedFiles) {
        const fp = path.join(showcaseDir, fn);
        if (!fs.existsSync(fp)) {
          warnings.push(
            regMsg(
              h,
              e.type,
              (e.source_paths || [])[0] ?? null,
              e.contract ?? null,
              `expected showcase file missing: ${fn}`,
            ),
          );
          continue;
        }
        const txt = fs.readFileSync(fp, 'utf8');
        const has = txt.includes(`hash="${h}"`) && txt.includes(`data-ks-hash="${h}"`);
        if (!has) {
          errors.push(
            regMsg(
              h,
              e.type,
              (e.source_paths || [])[0] ?? null,
              e.contract ?? null,
              `missing both hash="${h}" and data-ks-hash="${h}" in showcase/${fn}`,
            ),
          );
        }
      }
    }
  } else if (entries.some((e) => e.emit_marker_in_showcase)) {
    warnings.push('No showcase dir for HTML marker validation (pass --showcase or run from repo with showcase/ after build)');
  }

  // Museum studio bootstrap HTML + co-shipped SVG chrome (paths under museum/studio/, not showcase/).
  for (const e of entries) {
    if (!e.emits_html) continue;
    if (String(e.status || '').toLowerCase() === 'deprecated') continue;
    const h = e.hash;
    for (const rel of e.source_paths || []) {
      if (typeof rel !== 'string') continue;
      const norm = rel.replace(/\\/g, '/');
      if (!norm.startsWith('museum/studio/')) continue;
      if (!norm.endsWith('.html') && !norm.endsWith('.svg')) continue;
      const fp = path.join(args.repo, norm);
      if (!fs.existsSync(fp)) continue;
      const txt = fs.readFileSync(fp, 'utf8');
      const has = txt.includes(`hash="${h}"`) && txt.includes(`data-ks-hash="${h}"`);
      if (!has) {
        errors.push(
          regMsg(
            h,
            e.type,
            norm,
            e.contract ?? null,
            `missing both hash="${h}" and data-ks-hash="${h}" in ${norm}`,
          ),
        );
      }
    }
  }

  for (const w of warnings) console.warn(`[warn] ${w}`);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  const covPath = path.join(args.repo, 'docs/design/catalog/visual-registry-coverage.md');
  const byType = {};
  const byCategory = {};
  const byEmitsHtml = {};
  const byStatus = {};
  const byContract = {};
  const byScreenshot = {};
  for (const e of entries) {
    byType[e.type] = (byType[e.type] || 0) + 1;
    const cat = e.category ?? 'unset';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    const ehKey = typeof e.emits_html === 'boolean' ? String(e.emits_html) : 'unset';
    byEmitsHtml[ehKey] = (byEmitsHtml[ehKey] || 0) + 1;
    byStatus[e.status] = (byStatus[e.status] || 0) + 1;
    byContract[e.contract_status] = (byContract[e.contract_status] || 0) + 1;
    const ss = e.screenshot_status ?? 'unset';
    byScreenshot[ss] = (byScreenshot[ss] || 0) + 1;
  }
  const covLines = [
    '# Visual registry coverage',
    '',
    `Generated: ${generatedAt} (from check-visual-catalog.mjs; counts reflect current registry and inventory inputs)`,
    '',
    `- Registry entries: ${entries.length}`,
    '',
    '## By type',
    ...Object.entries(byType).map(([k, v]) => `- ${k}: ${v}`),
    '',
    '## By category',
    ...Object.entries(byCategory)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `- ${k}: ${v}`),
    '',
    '## By emits_html',
    ...Object.entries(byEmitsHtml)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `- ${k}: ${v}`),
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

  const familyCovered = entries.filter((e) => String(e.contract_status || '') === 'family-covered').sort((a, b) =>
    String(a.hash).localeCompare(String(b.hash)),
  );
  covLines.push(
    '## Intentional family-covered rows',
    '',
    'These entries share a roll-up contract; child hashes and path-level contracts carry per-file specificity. Presence here is expected.',
    '',
    '| Hash | Type | Name | Contract | Parent hash |',
    '|---|---|---|---|---|',
    ...familyCovered.map((e) => {
      const ph = e.parent_hash != null && String(e.parent_hash).trim() !== '' ? `\`${e.parent_hash}\`` : '—';
      const c = String(e.contract ?? '').replace(/\\/g, '/');
      const n = String(e.name ?? '').replace(/\|/g, '\\|');
      return `| ${e.hash ?? ''} | ${String(e.type ?? '').replace(/\|/g, '\\|')} | ${n} | \`${c}\` | ${ph} |`;
    }),
    '',
  );

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
      `- Inventory items: ${inv.items.length}`,
      `- Inventory generatedAt: ${inv.generatedAt ?? 'unknown'}`,
      '',
      '### By proposed_type',
      ...Object.entries(invByType)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `- ${k}: ${v}`),
      '',
      'Family rows (Ksc, Ksj, Ksv, Kpr) retain roll-up contracts; per-file or per-group coverage lives in child rows (visual-style, interaction-script, diagram-asset-group, python-component-module).',
      '',
    );
    if (!registryInventoryGaps.length) {
      covLines.push('## Registry ↔ inventory alignment', '', '- All non-family registry rows matched at least one inventory item.',
        '',
      );
    }

    const regPathSet = new Set();
    for (const e of entries) {
      for (const sp of e.source_paths || []) regPathSet.add(String(sp).replace(/\\/g, '/'));
    }
    const museumDeferred = [];
    const museumUncovered = [];
    for (const it of inv.items) {
      if (it.proposed_type !== 'museum-surface-asset') continue;
      const mp = String(it.source_path || '').replace(/\\/g, '/');
      if (!mp || regPathSet.has(mp)) continue;
      if (mp.startsWith('museum/studio/assets/')) museumDeferred.push(mp);
      else museumUncovered.push(mp);
    }
    covLines.push(
      '## Uncovered or deferred museum inventory paths',
      '',
      '- **Deferred (justified):** Vite bundles under `museum/studio/assets/*` use content-addressed filenames; they are covered at the **Msm** shell family level rather than per-chunk hashes until artifact names stabilize.',
      '',
    );
    if (museumUncovered.length) {
      covLines.push('### Needs registry attention', ...museumUncovered.map((x) => `- \`${x}\``), '');
    } else {
      covLines.push('### Needs registry attention', '', '- (none)', '');
    }
    if (museumDeferred.length) {
      covLines.push(
        `### Deferred bundle files (${museumDeferred.length} current inventory paths)`,
        '',
        '`museum/studio/assets/*` — listed in inventory but not individually registered (see policy above).',
        '',
      );
    }
  }

  fs.writeFileSync(covPath, covLines.join('\n') + '\n', 'utf8');

  const jsonOut = path.join(args.repo, 'docs/design/catalog/visual-registry.generated.json');
  const jsonDoc = normalizeRegistryForJson(args.repo, entries);
  jsonDoc.generatedAt = generatedAt;
  fs.writeFileSync(jsonOut, `${JSON.stringify(jsonDoc, null, 2)}\n`, 'utf8');

  console.log(`check-visual-catalog OK (${entries.length} entries). Wrote ${path.relative(args.repo, covPath)}`);
}

main();
