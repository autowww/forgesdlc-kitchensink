#!/usr/bin/env node
/**
 * Capture showcase screenshots by [hash="XYZ"], [data-ks-hash="XYZ"].
 * Optional devDependency: playwright (same pattern as website-ux-auditor).
 *
 * Usage:
 *   npx http-server showcase -p 4173   # or any static server
 *   node capture-showcase-screenshots.mjs --showcase-url http://127.0.0.1:4173/
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadRegistry } from './lib/parse-registry.mjs';

function parseArgs(argv) {
  const o = {
    repo: process.cwd(),
    registry: null,
    showcaseUrl: 'http://127.0.0.1:4173/',
    out: null,
    max: 50,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') o.repo = path.resolve(argv[++i] || '');
    else if (a === '--registry') o.registry = path.resolve(argv[++i] || '');
    else if (a === '--showcase-url') o.showcaseUrl = argv[++i] || o.showcaseUrl;
    else if (a === '--out') o.out = path.resolve(argv[++i] || '');
    else if (a === '--max') o.max = parseInt(argv[++i] || '50', 10);
  }
  if (!o.registry) o.registry = path.join(o.repo, 'docs/design/catalog/visual-registry.yaml');
  if (!o.out) o.out = path.join(o.repo, 'docs/design/catalog/screenshots');
  return o;
}

async function loadPlaywright() {
  try {
    const mod = await import('playwright');
    return mod.chromium;
  } catch {
    console.error(
      'Install playwright:\n  cd tools/design-catalog && npm install playwright@^1.56.0 --save-dev && npx playwright install chromium',
    );
    process.exit(2);
  }
}

async function run() {
  const args = parseArgs(process.argv);
  const { entries } = loadRegistry(args.registry);
  const toCapture = entries
    .filter((e) => e.emit_marker_in_showcase && e.screenshot_status !== 'not-applicable')
    .slice(0, args.max);

  const chromium = await loadPlaywright();
  fs.mkdirSync(args.out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });

  let ok = 0;
  for (const e of toCapture) {
    const h = e.hash;
    let rel = '';
    if (e.type === 'page') rel = `${e.slug}.html`;
    else {
      const m = (e.showcase_url || '').match(/\/([^/]+\.html)$/);
      if (m) rel = m[1];
    }
    if (!rel) continue;
    const pageUrl = new URL(rel, args.showcaseUrl).href;
    const page = await ctx.newPage();
    try {
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const sel = `[hash="${h}"], [data-ks-hash="${h}"]`;
      const loc = page.locator(sel).first();
      if ((await loc.count()) === 0) {
        await page.screenshot({ path: path.join(args.out, `${h}.png`) });
      } else {
        await loc.screenshot({ path: path.join(args.out, `${h}.png`) });
      }
      ok++;
    } catch (err) {
      console.warn(`[skip ${h}] ${err.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log(`Captured ${ok} screenshot(s) under ${path.relative(args.repo, args.out)}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
