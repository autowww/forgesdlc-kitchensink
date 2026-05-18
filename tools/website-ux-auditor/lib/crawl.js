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

/** @param {string} raw */
export function normalizeCrawlHref(raw) {
  try {
    const url = new URL(raw);
    url.hash = '';
    return url.href;
  } catch {
    return null;
  }
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

function dedupeHrefQueue(items, origin) {
  const out = [];
  const seenQ = new Set();
  for (const raw of items || []) {
    const h = normalizeCrawlHref(raw);
    if (!h || !isCrawlableUrl(h, origin) || seenQ.has(h)) continue;
    seenQ.add(h);
    out.push(h);
  }
  return out;
}

/**
 * @param {unknown} raw
 * @param {number} [fallbackDepth]
 * @returns {{ href: string, depth: number } | null}
 */
function dequeueItem(raw, fallbackDepth = 0) {
  if (raw && typeof raw === 'object' && 'href' in raw) {
    const href = normalizeCrawlHref(/** @type {{ href?: string }} */ (raw).href || '');
    if (!href) return null;
    const d = /** @type {{ depth?: unknown }} */ (raw).depth;
    const depth =
      typeof d === 'number' && Number.isFinite(d) ? Math.max(0, Math.floor(d)) : fallbackDepth;
    return { href, depth };
  }
  const href = normalizeCrawlHref(String(raw || ''));
  return href ? { href, depth: fallbackDepth } : null;
}

/**
 * @typedef {{
 *   phase: 'launch_start'|'launch_end'|'page_begin'|'page_end'|'browser_close_start',
 *   href?: string,
 *   waveLabel?: string,
 *   durationMs?: number,
 *   pagesCompletedBefore?: number,
 *   pagesCompletedAfter?: number,
 *   pagesCompleted?: number,
 *   queueLen?: number,
 *   budget?: number,
 * }} CrawlProgressEvent
 */

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
 *   regressionUrls?: string[],
 *   resumeVisitedUrls?: string[],
 *   resumeQueuedUrls?: string[],
 *   logger?: { verbose?: (tag: string, message?: string, detail?: string) => void },
 *   onProgress?: (ev: CrawlProgressEvent) => void,
 *   maxLinkDepth?: number | null,
 *   repoRoot?: string | null,
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
    regressionUrls = [],
    resumeVisitedUrls = [],
    resumeQueuedUrls = [],
    logger,
    onProgress,
    maxLinkDepth: maxLinkDepthOpt = null,
    repoRoot = null,
  } = opts;

  const maxLinkDepth =
    maxLinkDepthOpt != null && Number.isFinite(Number(maxLinkDepthOpt))
      ? Math.max(0, Math.floor(Number(maxLinkDepthOpt)))
      : null;

  const launchT0 = Date.now();
  onProgress?.({ phase: 'launch_start', queueLen: 0 });
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const origin = new URL(startUrl).origin;
  const startNorm = normalizeCrawlHref(startUrl);

  /** @type {string[]} */
  const visitedOrder = [];

  /** @type {Set<string>} */
  const seen = new Set();
  for (const raw of resumeVisitedUrls || []) {
    const h = normalizeCrawlHref(raw);
    if (h && isCrawlableUrl(h, origin)) seen.add(h);
  }

  /** @type {{ href: string, depth: number }[]} */
  let queue = [];
  if ((resumeVisitedUrls && resumeVisitedUrls.length) || (resumeQueuedUrls && resumeQueuedUrls.length)) {
    const deduped = dedupeHrefQueue(resumeQueuedUrls, origin);
    queue = deduped.map((href) => ({ href, depth: 0 }));
    if (startNorm && isCrawlableUrl(startNorm, origin) && !seen.has(startNorm)) {
      const rest = queue.filter((item) => item.href !== startNorm);
      queue = [{ href: startNorm, depth: 0 }, ...rest];
    }
  } else if (startNorm && isCrawlableUrl(startNorm, origin)) {
    queue = [{ href: startNorm, depth: 0 }];
  }

  onProgress?.({
    phase: 'launch_end',
    durationMs: Date.now() - launchT0,
    queueLen: queue.length,
  });

  const pages = [];
  const screenshotsDir = path.join(outDir, 'screenshots');
  if (screenshots) await ensureDir(screenshotsDir);

  let majorPlusAccum = 0;
  /** @type{'major_plus_threshold'|'normal_completion'} */
  let stopReason = 'normal_completion';

  let mobileShotDone = false;

  /**
   * @param {string} href
   * @param {'regression'|'crawl'} waveLabel
   * @param {boolean} expandLinks
   * @param {number} pageDepth link hops from startUrl (start page = 0)
   * @returns {Promise<boolean>} haltExpand — stop crawl entirely
   */
  async function analyzeOne(href, waveLabel, expandLinks, pageDepth) {
    onProgress?.({
      phase: 'page_begin',
      href,
      waveLabel,
      pagesCompletedBefore: pages.length,
      queueLen: queue.length,
      budget: maxPages,
    });
    const tPage = Date.now();
    const page = await context.newPage();
    let analyzed;
    let collectedLinks = [];
    try {
      await page.goto(href, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
      try {
        await page.waitForLoadState('networkidle', { timeout: 5000 });
      } catch {}
      const raw = await collectDomMetrics(page, href);
      const findings = runAllChecks(raw, href, { siteKind, repoRoot });
      const score = scorePage(raw, findings);
      analyzed = { url: href, metrics: raw, findings, score, auditWave: waveLabel };
      if (screenshots) {
        const shot = path.join(screenshotsDir, `${String(pages.length + 1).padStart(2, '0')}-${safeSlug(href)}.png`);
        await page.screenshot({ path: shot, fullPage: true });
        analyzed.screenshot = path.relative(outDir, shot).replaceAll(path.sep, '/');
      }
      collectedLinks = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map((a) => a.href));
    } catch (error) {
      analyzed = { url: href, error: error.message, metrics: {}, findings: [], auditWave: waveLabel };
    } finally {
      await page.close();
    }

    if (!mobileShotDone && screenshots) {
      mobileShotDone = true;
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
    majorPlusAccum += countMajorPlus(analyzed.findings || []);

    logger?.verbose?.(
      '[crawl]',
      `${waveLabel} ${href}`,
      `page=${pages.length}/${maxPages} majorPlusAccum=${majorPlusAccum}`,
    );

    const haltExpand = !stopDisabled && stopAfterMajorPlus > 0 && majorPlusAccum >= stopAfterMajorPlus;

    if (!haltExpand && expandLinks && collectedLinks.length) {
      const childDepth = pageDepth + 1;
      const depthOk = maxLinkDepth == null || childDepth <= maxLinkDepth;
      if (depthOk) {
        for (const link of collectedLinks) {
          const u = new URL(link, href);
          u.hash = '';
          const next = u.href;
          if (isCrawlableUrl(next, origin) && !seen.has(next) && queue.length < maxPages * 8) {
            queue.push({ href: next, depth: childDepth });
          }
        }
      }
    }

    onProgress?.({
      phase: 'page_end',
      href,
      waveLabel,
      durationMs: Date.now() - tPage,
      pagesCompletedAfter: pages.length,
      queueLen: queue.length,
      budget: maxPages,
    });

    return haltExpand;
  }

  const cappedRegression = [...new Set((regressionUrls || []).map(normalizeCrawlHref).filter(Boolean))];

  for (const href of cappedRegression) {
    if (!href || !isCrawlableUrl(href, origin)) continue;
    if (seen.has(href)) continue;
    if (pages.length >= maxPages) break;
    seen.add(href);
    visitedOrder.push(href);
    logger?.verbose?.('[incremental]', `regression wave: fetch ${href}`, '');
    const halt = await analyzeOne(href, 'regression', false, 0);
    if (halt) {
      stopReason = 'major_plus_threshold';
      break;
    }
  }

  while (queue.length && pages.length < maxPages && stopReason !== 'major_plus_threshold') {
    const rawItem = queue.shift();
    const item = dequeueItem(rawItem, 0);
    if (!item) continue;
    const { href, depth: pageDepth } = item;
    if (!href || seen.has(href) || !isCrawlableUrl(href, origin)) continue;
    seen.add(href);
    visitedOrder.push(href);
    const halt = await analyzeOne(href, 'crawl', true, pageDepth);
    if (halt) {
      stopReason = 'major_plus_threshold';
      break;
    }
  }

  onProgress?.({
    phase: 'browser_close_start',
    pagesCompleted: pages.length,
    queueLen: queue.length,
  });
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
    maxLinkDepth,
  };

  const visitedUrls = [...visitedOrder];
  const queuedUrlsAtStop = queue
    .map((q) => (q && typeof q === 'object' && 'href' in q ? normalizeCrawlHref(q.href || '') : normalizeCrawlHref(q)))
    .filter(Boolean);

  return { pages, crawlSummary, visitedUrls, queuedUrlsAtStop };
}
