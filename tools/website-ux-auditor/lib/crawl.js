import path from 'node:path';

import { ensureDir } from './files.js';
import { collectDomMetrics } from './dom-metrics.js';
import { runAllChecks } from '../checks/index.js';
import { countMajorPlus } from './severity.js';
import { scorePage } from './scoring.js';

function safeSlug(input) {
  return String(input)
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'page';
}

export function isCrawlableUrl(raw, origin) {
  try {
    const url = new URL(raw);
    if (url.origin !== origin) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (/\.(png|jpg|jpeg|gif|webp|svg|pdf|zip|xml|json|ico|css|js|map|txt)$/i.test(url.pathname)) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Browser crawl + per-page DOM metrics + modular checks.
 * @param {{
 *   playwright: typeof import('playwright'),
 *   startUrl: string,
 *   outDir: string,
 *   maxPages: number,
 *   timeoutMs: number,
 *   screenshots: boolean,
 *   siteKind: string,
 *   stopAfterMajorPlus?: number | null,
 *   stopDisabled?: boolean,
 * }} opts
 */
export async function crawlAndAnalyze(opts) {
  const {
    playwright,
    startUrl,
    outDir,
    maxPages,
    timeoutMs,
    screenshots,
    siteKind,
    stopAfterMajorPlus = 10,
    stopDisabled = false,
  } = opts;

  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const origin = new URL(startUrl).origin;
  const queue = [startUrl];
  const seen = new Set();
  const pages = [];
  const screenshotsDir = path.join(outDir, 'screenshots');
  if (screenshots) await ensureDir(screenshotsDir);

  let majorPlusAccum = 0;
  /** @type{'major_plus_threshold'|'normal_completion'} */
  let stopReason = 'normal_completion';

  while (queue.length && pages.length < maxPages) {
    const urlShift = queue.shift();
    const normalized = new URL(urlShift);
    normalized.hash = '';
    const href = normalized.href;
    if (seen.has(href) || !isCrawlableUrl(href, origin)) continue;
    seen.add(href);

    const page = await context.newPage();
    let analyzed;
    let collectedLinks = [];
    try {
      await page.goto(href, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
      try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch {}
      const raw = await collectDomMetrics(page, href);
      const findings = runAllChecks(raw, href, { siteKind });
      const score = scorePage(raw, findings);
      analyzed = { url: href, metrics: raw, findings, score };
      if (screenshots) {
        const shot = path.join(screenshotsDir, `${String(pages.length + 1).padStart(2, '0')}-${safeSlug(href)}.png`);
        await page.screenshot({ path: shot, fullPage: true });
        analyzed.screenshot = path.relative(outDir, shot).replaceAll(path.sep, '/');
      }
      collectedLinks = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map((a) => a.href));
    } catch (error) {
      analyzed = { url: href, error: error.message, metrics: {}, findings: [] };
    } finally {
      await page.close();
    }

    majorPlusAccum += countMajorPlus(analyzed.findings || []);
    const haltExpand = !stopDisabled && stopAfterMajorPlus > 0 && majorPlusAccum >= stopAfterMajorPlus;
    if (!haltExpand && collectedLinks.length) {
      for (const link of collectedLinks) {
        const u = new URL(link, href);
        u.hash = '';
        if (isCrawlableUrl(u.href, origin) && !seen.has(u.href) && queue.length < maxPages * 8) queue.push(u.href);
      }
    }

    if (pages.length === 0 && screenshots) {
      const mobilePage = await mobileContext.newPage();
      try {
        await mobilePage.goto(href, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
        const shot = path.join(screenshotsDir, `00-mobile-${safeSlug(href)}.png`);
        await mobilePage.screenshot({ path: shot, fullPage: true });
        analyzed.mobileScreenshot = path.relative(outDir, shot).replaceAll(path.sep, '/');
      } catch {}
      await mobilePage.close();
    }

    pages.push(analyzed);

    if (haltExpand) {
      stopReason = 'major_plus_threshold';
      break;
    }
  }

  await mobileContext.close();
  await context.close();
  await browser.close();

  /** @type {'full_budget_within_max_pages'|'major_plus_early_stop'|'major_plus_governed_complete'} */
  let crawlMode;
  if (stopDisabled) crawlMode = 'full_budget_within_max_pages';
  else if (stopReason === 'major_plus_threshold') crawlMode = 'major_plus_early_stop';
  else crawlMode = 'major_plus_governed_complete';

  const crawlSummary = {
    crawlMode,
    stopReason,
    majorPlusFindingCountTotal: majorPlusAccum,
    queuedRemainingAtStop: queue.length,
    pagesCaptured: pages.length,
    stopAfterMajorPlus: stopDisabled ? null : stopAfterMajorPlus,
    pagesPlannedBudget: maxPages,
    stopDisabled,
  };

  return { pages, crawlSummary };
}
