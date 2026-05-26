#!/usr/bin/env node
/**
 * Bounded DOM metrics for a fixture URL (Playwright chromium).
 * usage: node ux-playwright-evidence.mjs --url URL [--out evidence.json] [--max-chars 12000]
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const argv = process.argv.slice(2);
const args = { url: '', out: '', maxChars: 12000 };
for (let i = 0; i < argv.length; i += 1) {
  const k = argv[i];
  const n = argv[i + 1];
  if (k === '--url') args.url = n || '';
  else if (k === '--out') args.out = n || '';
  else if (k === '--max-chars') args.maxChars = Number(n) || 12000;
}
if (!args.url) {
  console.error('usage: node ux-playwright-evidence.mjs --url URL [--out evidence.json]');
  process.exit(2);
}

let evidence;
try {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(args.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  evidence = await page.evaluate(() => {
    const headings = [...document.querySelectorAll('h1,h2,h3,h4')].slice(0, 20).map((el) => ({
      tag: el.tagName,
      text: (el.textContent || '').trim().slice(0, 120),
    }));
    const buttons = [...document.querySelectorAll('button,a[role="button"],.btn')].slice(0, 30).map((el) => ({
      text: (el.textContent || '').trim().slice(0, 80),
      tag: el.tagName,
    }));
    return {
      title: document.title,
      headingCount: document.querySelectorAll('h1,h2,h3,h4').length,
      linkCount: document.querySelectorAll('a').length,
      buttonCount: document.querySelectorAll('button').length,
      headings,
      primaryButtons: buttons.slice(0, 12),
      bodyTextLength: (document.body?.innerText || '').length,
    };
  });
  await browser.close();
} catch (err) {
  evidence = {
    error: String(err?.message || err),
    fallback: 'playwright-unavailable',
  };
}

let blob = JSON.stringify({ url: args.url, dom: evidence }, null, 2);
if (blob.length > args.maxChars) {
  blob = `${blob.slice(0, args.maxChars)}\n…[truncated]`;
}
if (args.out) {
  await fs.mkdir(path.dirname(path.resolve(args.out)), { recursive: true });
  await fs.writeFile(path.resolve(args.out), `${blob}\n`, 'utf8');
} else {
  process.stdout.write(`${blob}\n`);
}
