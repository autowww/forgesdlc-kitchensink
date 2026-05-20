#!/usr/bin/env node
/**
 * Source-derived inventory for KS visuals. Does not require visual-registry.yaml.
 * Optionally crosswalks `docs/design/catalog/visual-registry.generated.json` (JSON only)
 * with local showcase emitted hashes, contract files, and screenshot PNGs.
 *
 * Usage:
 *   node inventory-ks-visuals.mjs --repo . --out docs/design/catalog/visual-inventory.generated.json
 *
 * Optional:
 *   --showcase <dir>     Showcase output directory (default: showcase)
 *   --registry-json <p>  Registry JSON (default: docs/design/catalog/visual-registry.generated.json if present)
 *   --no-registry        Skip registry crosswalk even if JSON exists
 */

import fs from 'node:fs';
import path from 'node:path';
import { analyzeContractPlaceholders } from './lib/contract-placeholders.mjs';

function parseArgs(argv) {
  const out = {
    repo: process.cwd(),
    outJson: null,
    quiet: false,
    showcaseRel: 'showcase',
    registryJson: null,
    noRegistry: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') out.repo = path.resolve(argv[++i] || '');
    else if (a === '--out') out.outJson = path.resolve(argv[++i] || '');
    else if (a === '--quiet') out.quiet = true;
    else if (a === '--showcase') out.showcaseRel = argv[++i] || 'showcase';
    else if (a === '--registry-json') out.registryJson = path.resolve(argv[++i] || '');
    else if (a === '--no-registry') out.noRegistry = true;
  }
  if (!out.outJson) {
    console.error(
      'Usage: node inventory-ks-visuals.mjs --repo <root> --out <visual-inventory.generated.json> [--showcase <dir>] [--registry-json <path> --no-registry]',
    );
    process.exit(2);
  }
  return out;
}

function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function walkDir(dir, pred) {
  const out = [];
  if (!exists(dir)) return out;
  const st = fs.statSync(dir);
  if (!st.isDirectory()) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const s = fs.statSync(full);
    if (s.isDirectory()) out.push(...walkDir(full, pred));
    else if (pred(full)) out.push(full);
  }
  return out;
}

/** @param {string} content */
function extractPythonPageSlug(content) {
  const m = content.match(/\bPAGE\s*=\s*\{[\s\S]*?"slug"\s*:\s*"([^"]+)"/);
  return m ? m[1] : null;
}

/** Public defs: not starting with _ */
function extractPythonPublicDefs(content) {
  const defs = [];
  const re = /^def\s+([a-zA-Z][a-zA-Z0-9_]*)\s*\(/gm;
  let m;
  while ((m = re.exec(content)) !== null) {
    const name = m[1];
    if (!name.startsWith('_')) defs.push(name);
  }
  return defs;
}

function extractTsxExports(content, filename) {
  const exports = [];
  const re = /export\s+(?:default\s+)?function\s+([A-Z][a-zA-Z0-9_]*)/g;
  let m;
  while ((m = re.exec(content)) !== null) exports.push(m[1]);
  const re2 = /export\s+const\s+([A-Z][a-zA-Z0-9_]*)\s*[:=]/g;
  while ((m = re2.exec(content)) !== null) exports.push(m[1]);
  return [...new Set(exports)];
}

function classifyCss(rel) {
  const b = path.basename(rel);
  if (b.includes('pack')) return 'theme-pack';
  if (b.includes('ambient')) return 'ambient-style';
  if (b.includes('fleet') || b.includes('wizard') || b.includes('lens')) return 'desktop-app-style';
  if (b.includes('forge-theme') || b.includes('docs-theme') || b.includes('forgesdlc-theme')) return 'core-theme';
  return 'component-or-surface-style';
}

function classifySvg(rel) {
  const b = path.basename(rel);
  if (b.startsWith('template-')) return 'diagram-template';
  if (b.startsWith('layout-schematic')) return 'layout-schematic';
  return 'svg-asset';
}

function classifyJs(rel) {
  const b = path.basename(rel);
  if (b.includes('modal') || b.includes('expand') || b.includes('dropdown') || b.includes('zoom')) return 'interaction-module';
  if (b.includes('chart') || b.includes('diagram-catalog')) return 'interaction-module';
  return 'interaction-module';
}

/** Same scan semantics as check-visual-catalog.mjs `collectEmittedHashes`. */
function collectEmittedHashes(showcaseDir) {
  const set = new Set();
  if (!exists(showcaseDir)) return set;

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
  if (exists(assetsDir) && fs.statSync(assetsDir).isDirectory()) {
    for (const name of fs.readdirSync(assetsDir)) {
      if (!name.endsWith('.js')) continue;
      const fp = path.join(assetsDir, name);
      scanText(fs.readFileSync(fp, 'utf8'), true);
    }
  }
  return set;
}

/**
 * @param {string} repo
 * @param {object|null} registryDoc
 * @param {string} showcaseDir
 * @param {object[]} inventoryItems
 */
function buildCatalogCrosswalk(repo, registryDoc, showcaseDir, inventoryItems) {
  const entries = Array.isArray(registryDoc?.entries) ? registryDoc.entries : [];
  const emitted = collectEmittedHashes(showcaseDir);
  const registryHashes = new Set(entries.map((e) => e.hash).filter(Boolean));
  const byType = {};
  for (const e of entries) {
    const t = e.type || '(none)';
    byType[t] = (byType[t] || 0) + 1;
  }

  const screenshotCatalogDir = path.join(repo, 'docs/design/catalog/screenshots');
  const screenshotShowcaseDir = path.join(showcaseDir, 'screenshots');

  /** @type {{ hash: string, name?: string, slug?: string, contract?: string }[]} */
  const missingContracts = [];
  /** @type {{ contractPath: string, hashes: string[], stubWarnings: string[] }[]} */
  const contractWarnings = [];
  const contractWarnMap = new Map();

  for (const e of entries) {
    const c = e.contract ? String(e.contract).replace(/\\/g, '/') : null;
    if (!c) {
      missingContracts.push({
        hash: e.hash,
        name: e.name,
        slug: e.slug,
        contract: null,
        reason: 'no contract path',
      });
      continue;
    }
    const abs = path.join(repo, c);
    if (!exists(abs)) {
      missingContracts.push({
        hash: e.hash,
        name: e.name,
        slug: e.slug,
        contract: c,
        reason: 'file missing',
      });
      continue;
    }
    const { warnings } = analyzeContractPlaceholders(fs.readFileSync(abs, 'utf8'), c, { strict: false });
    if (warnings.length) {
      if (!contractWarnMap.has(c)) contractWarnMap.set(c, { contractPath: c, hashes: [], stubWarnings: warnings });
      contractWarnMap.get(c).hashes.push(e.hash);
    }
  }
  for (const v of contractWarnMap.values()) contractWarnings.push(v);

  /** @type {{ hash: string, name?: string, showcaseRel?: string }[]} */
  const showcaseMarkerGaps = [];
  for (const e of entries) {
    if (!e.emit_marker_in_showcase || !e.hash) continue;
    if (!emitted.has(e.hash)) {
      showcaseMarkerGaps.push({
        hash: e.hash,
        name: e.name,
        slug: e.slug,
      });
    }
  }

  const emittedNotInRegistry = [...emitted].filter((h) => !registryHashes.has(h)).sort();

  const screenshotRows = [];
  for (const e of entries) {
    if (!e.hash) continue;
    const catPng = path.join(screenshotCatalogDir, `${e.hash}.png`);
    const shwPng = path.join(screenshotShowcaseDir, `${e.hash}.png`);
    const expectFile =
      e.screenshot_status === 'captured' ||
      e.screenshot_status === 'planned' ||
      e.screenshot_status === 'missing';
    screenshotRows.push({
      hash: e.hash,
      registry_status: e.screenshot_status ?? null,
      catalog_png: exists(catPng),
      showcase_png: exists(shwPng),
      expect_committed_png: expectFile && e.screenshot_status !== 'not-applicable',
    });
  }

  const gapsWhereExpected = screenshotRows.filter(
    (r) => r.expect_committed_png && !r.catalog_png && !r.showcase_png,
  );

  const byHash = new Map(entries.map((e) => [e.hash, e]));

  const familyParents = entries
    .filter((e) => Array.isArray(e.child_hashes) && e.child_hashes.length > 0)
    .map((e) => ({
      hash: e.hash,
      name: e.name,
      type: e.type,
      slug: e.slug,
      child_hashes: [...e.child_hashes],
      child_labels: e.child_hashes.map((h) => {
        const ch = byHash.get(h);
        return ch ? `${ch.name} (${h})` : h;
      }),
      contract: e.contract,
    }));

  const familyCovered = entries
    .filter((e) => e.contract_status === 'family-covered')
    .map((e) => ({
      hash: e.hash,
      name: e.name,
      type: e.type,
      family: e.family,
      parent_hash: e.parent_hash,
      contract: e.contract,
    }));

  /** Broad roll-up rows: explicit *-family types or many children. */
  const broadFamily = familyParents
    .map((p) => ({
      ...p,
      child_count: p.child_hashes.length,
      risk:
        p.child_hashes.length >= 8
          ? 'high'
          : p.child_hashes.length >= 5
            ? 'medium'
            : String(p.type || '').endsWith('-family')
              ? 'medium'
              : 'low',
    }))
    .filter((x) => x.risk === 'high' || x.risk === 'medium')
    .sort((a, b) => b.child_count - a.child_count);

  const contractShare = new Map();
  for (const e of entries) {
    if (!e.contract || !e.hash) continue;
    const c = String(e.contract).replace(/\\/g, '/');
    if (!contractShare.has(c)) contractShare.set(c, []);
    contractShare.get(c).push(e.hash);
  }
  const sharedContracts = [...contractShare.entries()]
    .map(([contractPath, hashes]) => ({
      contractPath,
      member_count: hashes.length,
      hashes: hashes.sort(),
    }))
    .filter((x) => x.member_count >= 4)
    .sort((a, b) => b.member_count - a.member_count);

  const sourcePathItems = new Set(
    inventoryItems
      .filter((it) => it.source_path && !String(it.source_path).includes('n/a'))
      .map((it) => String(it.source_path).replace(/\\/g, '/')),
  );

  return {
    registry: {
      row_count: entries.length,
      generatedAt: registryDoc?.generatedAt ?? null,
      by_type: byType,
      active_rows: entries.filter((e) => e.status === 'active').length,
    },
    showcase_dir: path.relative(repo, showcaseDir).replace(/\\/g, '/'),
    emitted_hash_count: emitted.size,
    emitted_hashes: [...emitted].sort(),
    registry_hash_count: registryHashes.size,
    registry_hashes_not_in_showcase_scan: [...registryHashes].filter((h) => !emitted.has(h)).sort(),
    showcase_hashes_not_in_registry: emittedNotInRegistry,
    emit_marker_gaps: showcaseMarkerGaps,
    contracts: {
      missing_or_empty: missingContracts,
      stub_warnings_by_contract: contractWarnings,
    },
    screenshots: {
      catalog_dir: path.relative(repo, screenshotCatalogDir).replace(/\\/g, '/'),
      showcase_dir_rel: path.relative(repo, screenshotShowcaseDir).replace(/\\/g, '/'),
      rows_Expecting_png_but_no_local_file: gapsWhereExpected,
      summary: {
        registry_rows_with_hash: screenshotRows.length,
        with_catalog_png: screenshotRows.filter((r) => r.catalog_png).length,
        with_showcase_png: screenshotRows.filter((r) => r.showcase_png).length,
        expecting_but_missing_both: gapsWhereExpected.length,
      },
    },
    family: {
      parents_with_children: familyParents,
      family_covered_rows: familyCovered,
      broad_family_candidates: broadFamily,
    },
    governance: {
      contracts_covering_many_hashes: sharedContracts,
    },
    source_inventory: {
      distinct_source_paths_in_inventory: sourcePathItems.size,
    },
  };
}

function main() {
  const { repo, outJson, quiet, showcaseRel, registryJson, noRegistry } = parseArgs(process.argv);
  const items = [];
  const now = new Date().toISOString().slice(0, 10);

  function collectChromeSlugsFromPy(repoRoot) {
    const slugs = new Set();
    const relFiles = ['components/layouts.py', 'components/components.py'];
    for (const rel of relFiles) {
      const fp = path.join(repoRoot, rel);
      if (!exists(fp)) continue;
      const txt = readText(fp);
      for (const m of txt.matchAll(/chrome_region_attrs\(\s*["']([^"']+)["']/g)) {
        slugs.add(m[1]);
      }
      for (const m of txt.matchAll(/_chrome_space\(\s*["']([^"']+)["']/g)) {
        slugs.add(m[1]);
      }
    }
    return slugs;
  }

  const layoutsPath = path.join(repo, 'components', 'layouts.py');
  if (exists(layoutsPath)) {
    const txt = readText(layoutsPath);
    for (const def of extractPythonPublicDefs(txt)) {
      if (def.endsWith('_page')) {
        items.push({
          proposed_name: def,
          proposed_slug: `layout-${def.replace(/_/g, '-')}`,
          proposed_type: 'layout',
          source_path: path.relative(repo, layoutsPath).replace(/\\/g, '/'),
          source_symbol: def,
          visual_root_selector: 'main, .container-fluid',
          showcase_path_guess: 'showcase/preview-*.html or consumer sites',
          needs_own_contract: false,
          family_group: 'layouts',
          confidence: 'high',
          notes: 'Full-page layout shell in layouts.py',
        });
      }
    }
  }

  for (const slug of collectChromeSlugsFromPy(repo)) {
    items.push({
      proposed_name: `Chrome region: ${slug}`,
      proposed_slug: slug,
      proposed_type: 'chrome-region',
      source_path: 'components/layouts.py',
      source_symbol: slug,
      visual_root_selector: 'layout chrome root (region-specific)',
      showcase_path_guess: 'consumer layouts',
      needs_own_contract: true,
      family_group: 'chrome-regions',
      confidence: 'high',
      notes: 'Detected via chrome_region_attrs("…") in Python sources',
    });
  }

  const pagesDir = path.join(repo, 'generator', 'pages');
  for (const py of walkDir(pagesDir, (f) => f.endsWith('.py') && !path.basename(f).startsWith('_'))) {
    const txt = readText(py);
    const slug = extractPythonPageSlug(txt);
    if (!slug) continue;
    const mod = path.basename(py, '.py');
    items.push({
      proposed_name: `Showcase page: ${slug}`,
      proposed_slug: slug,
      proposed_type: 'page-instance',
      source_path: path.relative(repo, py).replace(/\\/g, '/'),
      source_symbol: mod,
      visual_root_selector: 'main#main or main',
      showcase_path_guess: `showcase/${slug}.html`,
      needs_own_contract: false,
      family_group: 'showcase-pages',
      confidence: 'high',
      notes: 'PAGE slug from generator/pages module',
    });
  }

  const layoutPrev = path.join(repo, 'generator', 'layout_previews.py');
  if (exists(layoutPrev)) {
    const txt = readText(layoutPrev);
    const names = [...txt.matchAll(/out_dir\s*\/\s*"([^"]+\.html)"/g)].map((m) => m[1]);
    for (const html of new Set(names)) {
      items.push({
        proposed_name: `Layout preview ${html}`,
        proposed_slug: html.replace('.html', ''),
        proposed_type: 'layout-preview',
        source_path: path.relative(repo, layoutPrev).replace(/\\/g, '/'),
        source_symbol: 'write_layout_preview_pages',
        visual_root_selector: 'main',
        showcase_path_guess: `showcase/${html}`,
        needs_own_contract: false,
        family_group: 'layout-previews',
        confidence: 'high',
        notes: '',
      });
    }
  }

  const compDir = path.join(repo, 'components');
  for (const py of walkDir(compDir, (f) => f.endsWith('.py'))) {
    if (path.basename(py) === 'layouts.py') continue;
    const rel = path.relative(repo, py).replace(/\\/g, '/');
    const txt = readText(py);
    for (const def of extractPythonPublicDefs(txt)) {
      if (!def.startsWith('render_') && !def.endsWith('_page') && def !== 'get_nested_roadmap_demo_config') continue;
      if (def === 'e' || def === 'e_content') continue;
      items.push({
        proposed_name: `${rel}:${def}`,
        proposed_slug: `${path.basename(py, '.py')}-${def.replace(/_/g, '-')}`,
        proposed_type: def.startsWith('render_') ? 'component' : 'visual-helper',
        source_path: rel,
        source_symbol: def,
        visual_root_selector: 'section, div, figure (caller-dependent)',
        showcase_path_guess: 'showcase/*.html',
        needs_own_contract: false,
        family_group: 'python-components',
        confidence: def.startsWith('render_') ? 'medium' : 'low',
        notes: '',
      });
    }
  }

  const compPathsWithSymbols = new Set(
    items
      .filter(
        (it) =>
          String(it.source_path || '').startsWith('components/') &&
          !String(it.source_path || '').includes('layouts.py'),
      )
      .map((it) => String(it.source_path || '').replace(/\\/g, '/')),
  );
  for (const py of walkDir(compDir, (f) => f.endsWith('.py'))) {
    if (path.basename(py) === 'layouts.py') continue;
    if (path.basename(py) === '__init__.py') continue;
    const rel = path.relative(repo, py).replace(/\\/g, '/');
    if (compPathsWithSymbols.has(rel)) continue;
    items.push({
      proposed_name: `Python components module (helpers-only): ${rel}`,
      proposed_slug: `${path.basename(py, '.py')}-module-anchor`,
      proposed_type: 'python-component-anchor',
      source_path: rel,
      source_symbol: null,
      visual_root_selector: 'n/a',
      showcase_path_guess: 'internal helpers',
      needs_own_contract: false,
      family_group: 'python-components',
      confidence: 'high',
      notes: 'No public render_* or _page symbol surfaced by main inventory pass; anchor for registry ↔ module mapping',
    });
  }

  const reactDir = path.join(repo, 'react');
  for (const tsx of walkDir(reactDir, (f) => f.endsWith('.tsx'))) {
    const txt = readText(tsx);
    const rel = path.relative(repo, tsx).replace(/\\/g, '/');
    for (const ex of extractTsxExports(txt)) {
      items.push({
        proposed_name: `React ${ex}`,
        proposed_slug: `${ex}`,
        proposed_type: 'primitive',
        source_path: rel,
        source_symbol: ex,
        visual_root_selector: 'component root',
        showcase_path_guess: 'showcase (embed) or forge-react-primitives',
        needs_own_contract: false,
        family_group: 'react-primitives',
        confidence: 'high',
        notes: '',
      });
    }
  }

  const srSrc = path.join(repo, 'showcase-react-app', 'src');
  for (const f of walkDir(srSrc, (x) => /\.(tsx|ts|css)$/.test(x))) {
    items.push({
      proposed_name: `showcase-react-app ${path.basename(f)}`,
      proposed_slug: path.basename(f),
      proposed_type: 'showcase-app-source',
      source_path: path.relative(repo, f).replace(/\\/g, '/'),
      source_symbol: path.basename(f, path.extname(f)),
      visual_root_selector: 'n/a',
      showcase_path_guess: 'showcase-react-app build output',
      needs_own_contract: false,
      family_group: 'showcase-react-app',
      confidence: 'medium',
      notes: '',
    });
  }

  for (const css of walkDir(path.join(repo, 'css'), (f) => f.endsWith('.css'))) {
    const rel = path.relative(repo, css).replace(/\\/g, '/');
    items.push({
      proposed_name: rel,
      proposed_slug: path.basename(css, '.css'),
      proposed_type: 'visual-style',
      source_path: rel,
      source_symbol: null,
      visual_root_selector: 'n/a',
      showcase_path_guess: 'various',
      needs_own_contract: false,
      family_group: 'css-styles',
      confidence: 'high',
      notes: `class: ${classifyCss(rel)}`,
    });
  }

  for (const js of walkDir(path.join(repo, 'js'), (f) => f.endsWith('.js'))) {
    const rel = path.relative(repo, js).replace(/\\/g, '/');
    items.push({
      proposed_name: rel,
      proposed_slug: path.basename(js, '.js'),
      proposed_type: 'interaction-module',
      source_path: rel,
      source_symbol: null,
      visual_root_selector: 'n/a',
      showcase_path_guess: 'various',
      needs_own_contract: false,
      family_group: 'js-modules',
      confidence: 'medium',
      notes: classifyJs(rel),
    });
  }

  for (const svg of walkDir(path.join(repo, 'assets', 'svg'), (f) => f.endsWith('.svg'))) {
    const rel = path.relative(repo, svg).replace(/\\/g, '/');
    items.push({
      proposed_name: rel,
      proposed_slug: path.basename(svg, '.svg'),
      proposed_type: 'diagram-or-asset',
      source_path: rel,
      source_symbol: null,
      visual_root_selector: 'img, object',
      showcase_path_guess: 'diagram pages',
      needs_own_contract: false,
      family_group: 'svg-assets',
      confidence: 'high',
      notes: classifySvg(rel),
    });
  }

  for (const md of walkDir(path.join(repo, 'docs', 'design'), (f) => f.endsWith('.md'))) {
    const rel = path.relative(repo, md).replace(/\\/g, '/');
    items.push({
      proposed_name: `Design doc ${rel}`,
      proposed_slug: path.basename(md, '.md'),
      proposed_type: 'design-terminology',
      source_path: rel,
      source_symbol: null,
      visual_root_selector: 'n/a',
      showcase_path_guess: 'n/a',
      needs_own_contract: false,
      family_group: 'docs-terminology',
      confidence: 'medium',
      notes: 'Reference for ontology',
    });
  }

  const tax = path.join(repo, 'docs', 'PAGE-LAYOUT-TAXONOMY.md');
  if (exists(tax)) {
    items.push({
      proposed_name: 'PAGE-LAYOUT-TAXONOMY',
      proposed_slug: 'page-layout-taxonomy',
      proposed_type: 'design-terminology',
      source_path: path.relative(repo, tax).replace(/\\/g, '/'),
      source_symbol: null,
      visual_root_selector: 'n/a',
      showcase_path_guess: 'n/a',
      needs_own_contract: false,
      family_group: 'docs-terminology',
      confidence: 'high',
      notes: '',
    });
  }

  const showcaseDir = path.join(repo, 'showcase');
  if (exists(showcaseDir) && fs.statSync(showcaseDir).isDirectory()) {
    for (const name of fs.readdirSync(showcaseDir)) {
      if (!name.endsWith('.html')) continue;
      const full = path.join(showcaseDir, name);
      const rel = path.relative(repo, full).replace(/\\/g, '/');
      const baseSlug = name.replace(/\.html$/i, '');
      items.push({
        proposed_name: `Generated showcase HTML: ${name}`,
        proposed_slug: baseSlug,
        proposed_type: 'generated-showcase-page',
        source_path: rel,
        source_symbol: null,
        visual_root_selector: 'main, body',
        showcase_path_guess: rel,
        needs_own_contract: false,
        family_group: 'showcase-output',
        confidence: 'high',
        notes: 'Static output from generator/build-showcase.py (regenerate after source changes)',
      });
    }
  }

  const museumRoot = path.join(repo, 'museum', 'studio');
  if (exists(museumRoot)) {
    const st = fs.statSync(museumRoot);
    if (st.isDirectory()) {
      for (const f of walkDir(museumRoot, (fp) => /\.(html|js|css|svg)$/i.test(fp))) {
        const rel = path.relative(repo, f).replace(/\\/g, '/');
        const under = path.relative(museumRoot, f).replace(/\\/g, '/');
        if (rel === 'museum/studio/index.html') {
          items.push({
            proposed_name: 'Museum studio shell',
            proposed_slug: 'museum-studio',
            proposed_type: 'desktop-interface',
            source_path: rel,
            source_symbol: null,
            visual_root_selector: '#root or body',
            showcase_path_guess: 'museum/studio/index.html',
            needs_own_contract: true,
            family_group: 'museum',
            confidence: 'medium',
            notes: 'Bundled static studio surface entry',
          });
          continue;
        }
        items.push({
          proposed_name: `Museum studio asset: ${under}`,
          proposed_slug: `museum-studio-${path.basename(f, path.extname(f)).replace(/[^a-z0-9]+/gi, '-')}`,
          proposed_type: 'museum-surface-asset',
          source_path: rel,
          source_symbol: null,
          visual_root_selector: 'varies',
          showcase_path_guess: rel,
          needs_own_contract: false,
          family_group: 'museum-studio',
          confidence: 'high',
          notes: 'Bundled static studio file under museum/studio/',
        });
      }
    }
  }

  const autodocPage = path.join(repo, 'forge-autodoc', 'forge_autodoc', 'page.py');
  if (exists(autodocPage)) {
    items.push({
      proposed_name: 'Forge autodoc handbook assembler',
      proposed_slug: 'forge-autodoc',
      proposed_type: 'library-consumer',
      source_path: path.relative(repo, autodocPage).replace(/\\/g, '/'),
      source_symbol: 'forge_autodoc.page',
      visual_root_selector: 'main',
      showcase_path_guess: 'consumer handbooks',
      needs_own_contract: true,
      family_group: 'forge-autodoc',
      confidence: 'high',
      notes: 'Consumes handbook_page and related layouts',
    });
    items.push({
      proposed_name: 'Handbook chapter main (autodoc handbook_page <main>)',
      proposed_slug: 'handbook-chapter',
      proposed_type: 'page-instance',
      source_path: path.relative(repo, autodocPage).replace(/\\/g, '/'),
      source_symbol: 'assemble_handbook_page',
      visual_root_selector: 'main#main',
      showcase_path_guess: 'consumer handbooks',
      needs_own_contract: true,
      family_group: 'forge-autodoc',
      confidence: 'high',
      notes: 'Registry slug handbook-chapter; ks_page_attrs from page_main_attrs',
    });
  }

  const doc = {
    schemaVersion: 1,
    generatedAt: now,
    repoRoot: repo,
    summary: {
      total: items.length,
      byType: {},
    },
    items,
    catalogCrosswalk: null,
  };

  for (const it of items) {
    doc.summary.byType[it.proposed_type] = (doc.summary.byType[it.proposed_type] || 0) + 1;
  }

  if (!noRegistry) {
    const regPath =
      registryJson || path.join(repo, 'docs/design/catalog/visual-registry.generated.json');
    if (exists(regPath)) {
      try {
        const registryDoc = JSON.parse(readText(regPath));
        const showcaseDir = path.join(repo, showcaseRel);
        doc.catalogCrosswalk = buildCatalogCrosswalk(repo, registryDoc, showcaseDir, items);
      } catch (e) {
        doc.catalogCrosswalk = { error: String(e?.message || e) };
      }
    }
  }

  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  fs.writeFileSync(outJson, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');

  const mdOut = outJson.replace(/\.json$/i, '.md');
  const mdLines = [
    `# Visual inventory (generated)`,
    ``,
    `- Generated: ${now}`,
    `- Total items: ${items.length}`,
    ``,
    `## By type`,
    ...Object.entries(doc.summary.byType)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `- **${k}:** ${v}`),
    ``,
    `## Items (abbrev)`,
    ...items.slice(0, 500).map((it) => `- [${it.proposed_type}] \`${it.source_path}\` — ${it.proposed_name}`),
  ];
  if (items.length > 500) mdLines.push(`\n… ${items.length - 500} more rows in JSON …`);

  const xw = doc.catalogCrosswalk;
  if (xw && !xw.error) {
    mdLines.push(
      ``,
      `## Catalog crosswalk (registry JSON + showcase scan)`,
      ``,
      `- Registry rows: ${xw.registry.row_count} (active: ${xw.registry.active_rows})`,
      `- Distinct hashes in registry: ${xw.registry_hash_count}`,
      `- Distinct hashes in showcase HTML/JS scan: ${xw.emitted_hash_count}`,
      `- Emit-marker gaps (expected in showcase, not seen in scan): ${xw.emit_marker_gaps?.length ?? 0}`,
      `- Contract path missing on disk: ${xw.contracts.missing_or_empty.filter((m) => m.reason === 'file missing').length}`,
      `- Contracts with TBD/TODO/FIXME (non-strict): ${xw.contracts.stub_warnings_by_contract.length}`,
      `- Screenshot PNGs present (catalog dir): ${xw.screenshots.summary.with_catalog_png} / ${xw.screenshots.summary.registry_rows_with_hash}`,
      `- Screenshot PNGs present (showcase dir): ${xw.screenshots.summary.with_showcase_png} / ${xw.screenshots.summary.registry_rows_with_hash}`,
      `- Registry expects PNG but neither path exists: ${xw.screenshots.summary.expecting_but_missing_both}`,
      `- \`family-covered\` rows: ${xw.family.family_covered_rows.length}`,
      `- Parent rows listing children: ${xw.family.parents_with_children.length}`,
      `- Broad-family candidates (medium+ risk): ${xw.family.broad_family_candidates.length}`,
      ``,
    );
  } else if (xw?.error) {
    mdLines.push('', '## Catalog crosswalk', '', `Error: ${xw.error}`, '');
  }

  fs.writeFileSync(mdOut, mdLines.join('\n') + '\n', 'utf8');

  if (!quiet) {
    let extra = '';
    if (doc.catalogCrosswalk && !doc.catalogCrosswalk.error) {
      const c = doc.catalogCrosswalk;
      extra = ` | registry_rows=${c.registry.row_count} emitted_hashes=${c.emitted_hash_count}`;
      if (c.emit_marker_gaps?.length)
        extra += ` emit_marker_gaps=${c.emit_marker_gaps.length}`;
      if (c.contracts?.missing_or_empty?.length)
        extra += ` contract_gaps=${c.contracts.missing_or_empty.length}`;
    } else if (doc.catalogCrosswalk?.error) {
      extra = ` | catalog_crosswalk_error`;
    }
    console.log(`Wrote ${path.relative(repo, outJson)} and ${path.relative(repo, mdOut)} (${items.length} items)${extra}`);
  }
}

main();
