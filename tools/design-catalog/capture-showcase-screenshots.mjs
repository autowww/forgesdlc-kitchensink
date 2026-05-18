#!/usr/bin/env node
/**
 * Capture KS showcase screenshots keyed by registry hashes (`hash` / `data-ks-hash`).
 *
 * Uses loopback HTTP only when `--serve-showcase` or `--base-url` targets localhost —
 * no remote catalog fetches for capture logic.
 *
 * From repo root (recommended):
 *   python3 generator/build-showcase.py
 *   cd tools/design-catalog && npm ci && npx playwright install chromium
 *   node capture-showcase-screenshots.mjs --repo ../.. --serve-showcase --update-registry
 *
 * Or serve showcase yourself:
 *   npx http-server ../../showcase -p 4173
 *   node capture-showcase-screenshots.mjs --repo ../.. --base-url http://127.0.0.1:4173/
 */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadRegistry } from './lib/parse-registry.mjs';
import YAML from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HOSTED_SCREENSHOT_BASE = 'https://ks.forgesdlc.com/showcase/screenshots';

/** When `showcase_url` is null but the layout appears on a known showcase page. */
const SHOWCASE_HTML_FALLBACK_BY_HASH = {
  Shw: 'layouts.html',
  Gly: 'diagrams.html',
};

const FREEZE_CSS = `*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;scroll-behavior:auto!important;}`;

function parseArgs(argv) {
  const o = {
    repo: process.cwd(),
    registry: null,
    registryJson: null,
    /** Public site root that serves `/showcase/*.html` — trailing slash optional */
    baseUrl: null,
    showcaseUrl: null,
    outDir: null,
    showcaseDir: null,
    max: Number.POSITIVE_INFINITY,
    serveShowcase: false,
    serveHost: '127.0.0.1',
    updateRegistry: false,
    skipMobile: false,
    skipLight: false,
    /** Explicit duplicate dark baseline (same pixels as default dark when theme is dark-first) */
    writeDarkAlias: false,
    settleMs: 200,
    mirrorToShowcase: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') o.repo = path.resolve(argv[++i] || '');
    else if (a === '--registry') o.registry = path.resolve(argv[++i] || '');
    else if (a === '--registry-json') o.registryJson = path.resolve(argv[++i] || '');
    else if (a === '--base-url') o.baseUrl = argv[++i] || '';
    else if (a === '--showcase-url') o.showcaseUrl = argv[++i] || '';
    else if (a === '--out') o.outDir = path.resolve(argv[++i] || '');
    else if (a === '--showcase-dir') o.showcaseDir = path.resolve(argv[++i] || '');
    else if (a === '--max') o.max = Math.max(1, parseInt(argv[++i] || '1', 10));
    else if (a === '--serve-showcase') o.serveShowcase = true;
    else if (a === '--serve-host') o.serveHost = argv[++i] || o.serveHost;
    else if (a === '--update-registry') o.updateRegistry = true;
    else if (a === '--skip-mobile') o.skipMobile = true;
    else if (a === '--skip-light') o.skipLight = true;
    else if (a === '--write-dark-alias') o.writeDarkAlias = true;
    else if (a === '--settle-ms') o.settleMs = Math.max(0, parseInt(argv[++i] || '0', 10));
    else if (a === '--mirror-to-showcase') o.mirrorToShowcase = true;
  }
  if (!o.registry) o.registry = path.join(o.repo, 'docs/design/catalog/visual-registry.yaml');
  if (!o.outDir) o.outDir = path.join(o.repo, 'docs/design/catalog/screenshots');
  if (!o.showcaseDir) o.showcaseDir = path.join(o.repo, 'showcase');
  return o;
}

function loadEntries(registryPath, registryJsonPath) {
  if (registryJsonPath && fs.existsSync(registryJsonPath)) {
    const j = JSON.parse(fs.readFileSync(registryJsonPath, 'utf8'));
    const entries = Array.isArray(j.entries) ? j.entries : [];
    return { entries, fromJson: true };
  }
  const { entries } = loadRegistry(registryPath);
  return { entries, fromJson: false };
}

function showcaseHtmlRel(entry) {
  const su = String(entry.showcase_url || '').trim();
  if (su) {
    try {
      const u = new URL(su);
      const pathname = u.pathname.replace(/^\/+/, '');
      const marker = 'showcase/';
      const idx = pathname.indexOf(marker);
      const tail = idx >= 0 ? pathname.slice(idx + marker.length) : path.basename(pathname);
      return tail && tail.endsWith('.html') ? tail : null;
    } catch {
      return null;
    }
  }
  return SHOWCASE_HTML_FALLBACK_BY_HASH[entry.hash] || null;
}

function captureCandidates(entries) {
  const skipStatus = new Set(['not-applicable', 'blocked']);
  const list = [];
  for (const e of entries) {
    if (!e.emit_marker_in_showcase) continue;
    const ss = String(e.screenshot_status || '');
    if (skipStatus.has(ss)) continue;
    const rel = showcaseHtmlRel(e);
    if (!rel) continue;
    list.push({ hash: e.hash, htmlRel: rel, type: e.type, slug: e.slug });
  }
  return list;
}

function groupByHtml(candidates) {
  /** @type {Map<string, string[]>} */
  const m = new Map();
  for (const c of candidates) {
    if (!m.has(c.htmlRel)) m.set(c.htmlRel, []);
    const arr = m.get(c.htmlRel);
    if (!arr.includes(c.hash)) arr.push(c.hash);
  }
  return m;
}

function mimeFor(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.ico')) return 'image/x-icon';
  if (filePath.endsWith('.json')) return 'application/json';
  return 'application/octet-stream';
}

/**
 * @param {string} showcaseRoot
 * @param {string} host
 * @returns {Promise<{ server: import('node:http').Server, baseUrl: string, port: number }>}
 */
function startShowcaseServer(showcaseRoot, host) {
  const root = path.resolve(showcaseRoot);
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const raw = req.url || '/';
        const url = new URL(raw, 'http://127.0.0.1');
        let rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
        if (!rel || rel.endsWith('/')) rel = rel.replace(/\/?$/, '/index.html');
        const abs = path.normalize(path.join(root, rel));
        if (!abs.startsWith(root + path.sep) && abs !== root) {
          res.writeHead(403).end();
          return;
        }
        fs.readFile(abs, (err, data) => {
          if (err) {
            res.writeHead(404).end('Not found');
            return;
          }
          res.writeHead(200, { 'Content-Type': mimeFor(abs) });
          res.end(data);
        });
      } catch {
        res.writeHead(500).end();
      }
    });
    server.listen(0, host, () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      const baseUrl = `http://${host}:${port}/`;
      resolve({ server, baseUrl, port });
    });
    server.on('error', reject);
  });
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * @param {import('playwright').Page} page
 * @param {string} hash
 * @param {string} outDir
 * @param {{ skipMobile: boolean; skipLight: boolean; writeDarkAlias: boolean; settleMs: number }} opts
 */
async function captureOneHash(page, hash, outDir, opts) {
  const sel = `[hash="${hash}"], [data-ks-hash="${hash}"]`;
  const loc = page.locator(sel).first();
  const count = await loc.count();
  const target = count ? loc : page.locator('body');

  await target.scrollIntoViewIfNeeded().catch(() => {});
  await sleep(opts.settleMs);

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await target.screenshot({ path: path.join(outDir, `${hash}.png`) });

  if (opts.writeDarkAlias) {
    await target.screenshot({ path: path.join(outDir, `${hash}.dark.png`) });
  }

  if (!opts.skipLight) {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await sleep(Math.min(opts.settleMs, 120));
    await target.screenshot({ path: path.join(outDir, `${hash}.light.png`) });
  }

  if (!opts.skipMobile) {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await sleep(Math.min(opts.settleMs, 120));
    await target.scrollIntoViewIfNeeded().catch(() => {});
    await target.screenshot({ path: path.join(outDir, `${hash}.mobile.png`) });
  }

  return { hash, usedLocator: count > 0 };
}

async function run() {
  const args = parseArgs(process.argv);
  const baseArg = args.baseUrl || args.showcaseUrl;
  let baseUrl = baseArg ? baseArg.replace(/\/?$/, '/') : null;
  /** @type {import('node:http').Server | null} */
  let server = null;

  if (args.serveShowcase) {
    if (baseUrl) {
      console.warn('[warn] --serve-showcase ignores --base-url/--showcase-url');
    }
    const { server: srv, baseUrl: bu } = await startShowcaseServer(args.showcaseDir, args.serveHost);
    server = srv;
    baseUrl = bu;
    console.log(`Serving ${path.relative(args.repo, args.showcaseDir)} at ${baseUrl}`);
  }

  if (!baseUrl) {
    console.error(
      'Set --base-url http://127.0.0.1:<port>/ (or --showcase-url) or pass --serve-showcase.\nExample: node capture-showcase-screenshots.mjs --repo . --serve-showcase',
    );
    process.exit(2);
  }

  let pageBase;
  try {
    pageBase = new URL(baseUrl);
  } catch {
    console.error(`Invalid base URL: ${baseUrl}`);
    process.exit(2);
  }

  const host = (pageBase.hostname || '').toLowerCase();
  const localLoopback = host === '127.0.0.1' || host === 'localhost' || baseUrl.startsWith('file:');
  if (!localLoopback) {
    console.warn('[warn] Base URL is not loopback or file:// — proceeding (ensure this is intentional).');
  }

  const { entries, fromJson } = loadEntries(args.registry, args.registryJson);
  let candidates = captureCandidates(entries);
  if (Number.isFinite(args.max)) candidates = candidates.slice(0, args.max);
  const byPage = groupByHtml(candidates);

  fs.mkdirSync(args.outDir, { recursive: true });

  const chromium = await loadPlaywright();
  const browser = await chromium.launch({ headless: true });

  /** @type {{ hash: string; html: string; ok: boolean; detail?: string; usedLocator?: boolean }[]} */
  const rows = [];

  const optsShot = {
    skipMobile: args.skipMobile,
    skipLight: args.skipLight,
    writeDarkAlias: args.writeDarkAlias,
    settleMs: args.settleMs,
  };

  try {
    for (const [htmlRel, hashes] of byPage) {
      const pageUrl =
        baseUrl.startsWith('file:') ?
          pathToFileURL(path.join(args.showcaseDir, htmlRel)).href
        : new URL(htmlRel, baseUrl).href;

      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        colorScheme: 'dark',
        reducedMotion: 'reduce',
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      try {
        await page.goto(pageUrl, { waitUntil: 'load', timeout: 90000 });
        await page.addStyleTag({ content: FREEZE_CSS }).catch(() => {});
        for (const h of hashes) {
          try {
            const r = await captureOneHash(page, h, args.outDir, optsShot);
            rows.push({ hash: h, html: htmlRel, ok: true, usedLocator: r.usedLocator });
          } catch (err) {
            rows.push({
              hash: h,
              html: htmlRel,
              ok: false,
              detail: err instanceof Error ? err.message : String(err),
            });
          }
        }
      } catch (err) {
        for (const h of hashes) {
          rows.push({
            hash: h,
            html: htmlRel,
            ok: false,
            detail: err instanceof Error ? err.message : String(err),
          });
        }
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
    if (server) server.close();
  }

  const okHashes = new Set(rows.filter((r) => r.ok).map((r) => r.hash));
  const failed = rows.filter((r) => !r.ok);

  const generatedAt = new Date().toISOString();
  const report = {
    schemaVersion: 1,
    generatedAt,
    baseUrl,
    outDir: path.relative(args.repo, args.outDir),
    rows,
    summary: {
      attempted: rows.length,
      captured: okHashes.size,
      failed: failed.length,
    },
  };

  const reportJson = path.join(args.outDir, 'screenshot-capture-report.json');
  fs.writeFileSync(reportJson, JSON.stringify(report, null, 2), 'utf8');

  const mdLines = [
    '# Screenshot capture report',
    '',
    `Generated: ${generatedAt}`,
    '',
    `- Base: \`${baseUrl}\``,
    `- Output: \`${path.relative(args.repo, args.outDir)}\``,
    `- Captured hashes: ${okHashes.size}`,
    `- Failed operations: ${failed.length}`,
    '',
    '## Results',
    '',
    '| Hash | Page | OK | Notes |',
    '|------|------|----|-------|',
    ...rows.map((r) => {
      const note =
        r.detail ? r.detail.replace(/\|/g, '\\|') : r.usedLocator === false ? 'fallback body' : '';
      return `| ${r.hash} | ${r.html} | ${r.ok ? 'yes' : 'no'} | ${note} |`;
    }),
    '',
  ];
  fs.writeFileSync(path.join(args.outDir, 'screenshot-capture-report.md'), mdLines.join('\n'), 'utf8');

  if (args.updateRegistry) {
    if (fromJson) {
      console.error('[error] --update-registry requires YAML registry (omit --registry-json).');
      process.exit(1);
    }
    const yamlRaw = fs.readFileSync(args.registry, 'utf8');
    const doc = YAML.parse(yamlRaw);
    for (const e of doc.entries || []) {
      if (!okHashes.has(e.hash)) continue;
      const png = path.join(args.outDir, `${e.hash}.png`);
      if (!fs.existsSync(png)) continue;
      e.screenshot_status = 'captured';
      e.screenshot_url = `${HOSTED_SCREENSHOT_BASE}/${e.hash}.png`;
    }
    fs.writeFileSync(args.registry, YAML.stringify(doc, { lineWidth: 120, sortMapEntries: false }), 'utf8');
    console.log(`Updated registry captured rows: ${args.registry}`);
  }

  console.log(
    `Captured ${okHashes.size} hash(es); ${failed.length} failed ops. Reports under ${path.relative(args.repo, args.outDir)}`,
  );

  if (args.mirrorToShowcase) {
    const dest = path.join(args.repo, 'showcase', 'screenshots');
    fs.mkdirSync(dest, { recursive: true });
    let n = 0;
    for (const name of fs.readdirSync(args.outDir)) {
      if (!name.endsWith('.png')) continue;
      fs.copyFileSync(path.join(args.outDir, name), path.join(dest, name));
      n++;
    }
    console.log(`Mirrored ${n} PNG(s) to ${path.relative(args.repo, dest)} (hosted path segment /showcase/screenshots/).`);
  }

  if (failed.length) {
    console.error('Some captures failed (see screenshot-capture-report.json).');
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
