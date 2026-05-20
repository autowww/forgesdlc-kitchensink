#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { importPlaywright } from '../website-ux-auditor/lib/playwright-import.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KS_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_OUT_ROOT = path.resolve(KS_ROOT, '../workbench/site-fixtures');

function usage() {
  console.error(
    'usage: node tools/site-fixtures/capture-site-fixture.mjs --url https://example.com --slug example [--max-pages 8] [--out /path/to/site-fixtures]',
  );
}

function parseArgs(argv) {
  const args = {
    url: '',
    slug: '',
    maxPages: 8,
    timeoutMs: 45000,
    out: DEFAULT_OUT_ROOT,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const raw = argv[i];
    if (raw === '--help' || raw === '-h') {
      usage();
      process.exit(0);
    }
    const [flag, inlineValue] = raw.includes('=') ? raw.split(/=(.*)/s, 2) : [raw, null];
    const value = inlineValue ?? argv[i + 1];
    if (inlineValue == null) i += 1;
    if (flag === '--url') args.url = value || '';
    else if (flag === '--slug') args.slug = value || '';
    else if (flag === '--max-pages') args.maxPages = Number(value || '8');
    else if (flag === '--timeout-ms') args.timeoutMs = Number(value || '45000');
    else if (flag === '--out') args.out = value || DEFAULT_OUT_ROOT;
    else throw new Error(`Unknown argument: ${raw}`);
  }
  if (!args.url) throw new Error('Missing --url');
  if (!args.slug) args.slug = safeSlug(new URL(args.url).hostname);
  if (!Number.isFinite(args.maxPages) || args.maxPages < 1) args.maxPages = 8;
  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs < 5000) args.timeoutMs = 45000;
  args.out = path.resolve(args.out);
  return args;
}

function safeSlug(input) {
  return String(input || 'site')
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'site';
}

function shortHash(input) {
  return crypto.createHash('sha1').update(String(input || '')).digest('hex').slice(0, 10);
}

function normalizePageUrl(raw) {
  try {
    const url = new URL(raw);
    url.hash = '';
    return url.href;
  } catch {
    return '';
  }
}

function isPageUrl(raw, origin) {
  try {
    const url = new URL(raw);
    if (url.origin !== origin) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    return !/\.(png|jpe?g|gif|webp|svg|ico|css|js|json|xml|pdf|zip|map|txt|woff2?|ttf|otf)$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function filePathForUrl(root, rawUrl, kind = 'page') {
  const url = new URL(rawUrl);
  const parts = url.pathname.split('/').filter(Boolean).map((p) => safeSegment(p));
  if (kind === 'page') {
    if (!parts.length) return path.join(root, 'index.html');
    const last = parts[parts.length - 1];
    if (/\.[A-Za-z0-9]{1,8}$/.test(last)) return path.join(root, ...parts);
    return path.join(root, ...parts, 'index.html');
  }
  const assetParts = parts.length ? parts : ['asset'];
  const last = assetParts[assetParts.length - 1];
  const q = url.search ? `-${shortHash(url.search)}` : '';
  const ext = path.extname(last);
  if (q && ext) assetParts[assetParts.length - 1] = `${last.slice(0, -ext.length)}${q}${ext}`;
  else if (q) assetParts[assetParts.length - 1] = `${last}${q}`;
  return path.join(root, 'assets', ...assetParts);
}

function safeSegment(segment) {
  let decoded = String(segment || '');
  try {
    decoded = decodeURIComponent(decoded);
  } catch {}
  return decoded.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'path';
}

function relativeUrl(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile).replaceAll(path.sep, '/');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}

async function downloadAsset(assetUrl, assetFile) {
  try {
    const res = await fetch(assetUrl);
    if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}` };
    await fs.mkdir(path.dirname(assetFile), { recursive: true });
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(assetFile, buf);
    return { ok: true, status: res.status, bytes: buf.length };
  } catch (error) {
    return { ok: false, status: null, error: String(error?.message || error) };
  }
}

async function rewriteAndCollect(page, pageUrl, pageFile, wwwDir) {
  const origin = new URL(pageUrl).origin;
  const assets = await page.evaluate(() => {
    const rows = [];
    const push = (el, attr) => {
      const value = el.getAttribute(attr);
      if (value) rows.push({ attr, value, tag: el.tagName.toLowerCase() });
    };
    document.querySelectorAll('link[href], script[src], img[src], source[src], video[poster]').forEach((el) => {
      if (el.hasAttribute('href')) push(el, 'href');
      if (el.hasAttribute('src')) push(el, 'src');
      if (el.hasAttribute('poster')) push(el, 'poster');
    });
    return rows;
  });
  const assetMap = [];
  for (const item of assets) {
    let absolute;
    try {
      absolute = new URL(item.value, pageUrl);
    } catch {
      continue;
    }
    if (absolute.protocol !== 'http:' && absolute.protocol !== 'https:') continue;
    const assetFile = filePathForUrl(wwwDir, absolute.href, 'asset');
    const rel = relativeUrl(pageFile, assetFile);
    const result = await downloadAsset(absolute.href, assetFile);
    assetMap.push({
      url: absolute.href,
      localPath: path.relative(wwwDir, assetFile).replaceAll(path.sep, '/'),
      ok: result.ok,
      status: result.status,
      bytes: result.bytes || 0,
      error: result.error || null,
    });
    if (result.ok) {
      await page.evaluate(({ tag, attr, value, relValue }) => {
        for (const el of document.querySelectorAll(tag)) {
          if (el.getAttribute(attr) === value) el.setAttribute(attr, relValue);
        }
      }, { tag: item.tag, attr: item.attr, value: item.value, relValue: rel });
    }
  }

  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href')).filter(Boolean));
  for (const value of links) {
    let absolute;
    try {
      absolute = new URL(value, pageUrl);
      absolute.hash = '';
    } catch {
      continue;
    }
    if (absolute.origin !== origin) continue;
    const targetFile = filePathForUrl(wwwDir, absolute.href, 'page');
    const rel = relativeUrl(pageFile, targetFile);
    await page.evaluate(({ valueToReplace, relValue }) => {
      for (const a of document.querySelectorAll('a[href]')) {
        if (a.getAttribute('href') === valueToReplace) a.setAttribute('href', relValue);
      }
    }, { valueToReplace: value, relValue: rel });
  }

  return assetMap;
}

async function extractDesignObservation(page, url) {
  return page.evaluate((pageUrl) => {
    const styles = getComputedStyle(document.body);
    const headings = Array.from(document.querySelectorAll('h1,h2,h3')).slice(0, 12).map((el) => ({
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || '').trim().slice(0, 120),
      fontSize: getComputedStyle(el).fontSize,
      fontFamily: getComputedStyle(el).fontFamily,
      lineHeight: getComputedStyle(el).lineHeight,
      color: getComputedStyle(el).color,
    }));
    const buttons = Array.from(document.querySelectorAll('a,button')).filter((el) => {
      const text = (el.textContent || '').trim();
      const cls = el.className || '';
      return text && /btn|button|cta|primary|secondary/i.test(`${cls} ${text}`);
    }).slice(0, 20).map((el) => {
      const cs = getComputedStyle(el);
      return {
        text: (el.textContent || '').trim().slice(0, 80),
        tag: el.tagName.toLowerCase(),
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        borderRadius: cs.borderRadius,
        fontWeight: cs.fontWeight,
      };
    });
    const surfaces = Array.from(document.querySelectorAll('section, article, .card, [class*="card"], [class*="panel"], [class*="surface"]')).slice(0, 30).map((el) => {
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        className: String(el.className || '').slice(0, 120),
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow,
        borderColor: cs.borderColor,
        padding: cs.padding,
        marginBottom: cs.marginBottom,
      };
    });
    return {
      url: pageUrl,
      title: document.title || '',
      body: {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
      },
      headings,
      buttons,
      surfaces,
      navLinkCount: document.querySelectorAll('nav a[href], header a[href]').length,
      imageCount: document.images.length,
    };
  }, url);
}

async function main() {
  const args = parseArgs(process.argv);
  const captureId = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, 'Z');
  const root = path.join(args.out, args.slug, captureId);
  const wwwDir = path.join(root, 'www');
  const screenshotsDir = path.join(root, 'screenshots');
  const extractedDir = path.join(root, 'extracted-design');
  await fs.mkdir(wwwDir, { recursive: true });
  await fs.mkdir(screenshotsDir, { recursive: true });
  await fs.mkdir(extractedDir, { recursive: true });

  const playwright = await importPlaywright();
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const origin = new URL(args.url).origin;
  const queue = [normalizePageUrl(args.url)];
  const seen = new Set();
  const pages = [];
  const assetMap = new Map();
  const observations = [];

  try {
    while (queue.length && pages.length < args.maxPages) {
      const url = queue.shift();
      if (!url || seen.has(url) || !isPageUrl(url, origin)) continue;
      seen.add(url);
      const page = await context.newPage();
      const pageFile = filePathForUrl(wwwDir, url, 'page');
      const screenshotFile = path.join(screenshotsDir, `${String(pages.length + 1).padStart(2, '0')}-${safeSlug(url)}.png`);
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: args.timeoutMs });
        try {
          await page.waitForLoadState('networkidle', { timeout: 5000 });
        } catch {}
        const crawlLinks = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map((a) => a.href));
        const pageAssets = await rewriteAndCollect(page, url, pageFile, wwwDir);
        for (const asset of pageAssets) assetMap.set(asset.url, asset);
        const html = await page.content();
        await fs.mkdir(path.dirname(pageFile), { recursive: true });
        await fs.writeFile(pageFile, html, 'utf8');
        await page.screenshot({ path: screenshotFile, fullPage: true });
        observations.push(await extractDesignObservation(page, url));
        for (const link of crawlLinks) {
          const n = normalizePageUrl(link);
          if (n && isPageUrl(n, origin) && !seen.has(n) && queue.length < args.maxPages * 8) queue.push(n);
        }
        pages.push({
          url,
          localPath: path.relative(root, pageFile).replaceAll(path.sep, '/'),
          screenshot: path.relative(root, screenshotFile).replaceAll(path.sep, '/'),
          ok: true,
        });
      } catch (error) {
        pages.push({ url, localPath: path.relative(root, pageFile).replaceAll(path.sep, '/'), ok: false, error: String(error?.message || error) });
      } finally {
        await page.close();
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  await fs.writeFile(path.join(extractedDir, 'observations.json'), `${JSON.stringify({ schemaVersion: 1, pages: observations }, null, 2)}\n`, 'utf8');
  const manifest = {
    schemaVersion: 1,
    kind: 'ks-site-fixture',
    generatedAt: new Date().toISOString(),
    captureId,
    seedUrl: args.url,
    origin,
    slug: args.slug,
    maxPages: args.maxPages,
    fixtureRoot: root,
    wwwDir: 'www',
    manifestPath: 'manifest.json',
    pages,
    assets: [...assetMap.values()],
    limitations: [
      'Captures same-origin HTML pages only.',
      'JavaScript state is serialized as rendered HTML; app runtime behavior may not replay fully offline.',
      'CSS url() references inside downloaded stylesheets are not recursively rewritten in this first capture pass.',
    ],
  };
  await fs.writeFile(path.join(root, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  process.stdout.write(`${root}\n`);
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
