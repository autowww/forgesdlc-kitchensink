import path from 'node:path';

import { ensureDir } from '../../website-ux-auditor/lib/files.js';
import { importPlaywright } from '../../website-ux-auditor/lib/playwright-import.js';
import { countMajorPlus } from '../../website-ux-auditor/lib/severity.js';
import {
  isCrawlableUrl,
  normalizeCrawlHref,
} from '../../website-ux-auditor/lib/crawl.js';

import { collectA11yDomMetrics } from './a11y-dom-metrics.js';
import { runAxeOnPage, findingsFromAxeResult } from './axe-lane.js';
import { createA11yRuleRuntime } from './a11y-rule-runtime.js';

/**
 * @param {{
 *   siteUrl: string,
 *   repoRoot: string,
 *   maxPages: number,
 *   timeoutMs: number,
 *   lanes: Set<string>,
 *   axeTags: string[],
 *   standardsProfile: string,
 *   rulesScopeResolved: object,
 *   runtime: Awaited<ReturnType<typeof createA11yRuleRuntime>>,
 *   stopAfterMajorPlus: number,
 *   stopDisabled?: boolean,
 *   verbose?: boolean,
 * }} opts
 */
export async function crawlAndAuditA11y(opts) {
  const playwright = await importPlaywright();
  const origin = new URL(opts.siteUrl).origin;
  const visited = new Set();
  const queue = [normalizeCrawlHref(opts.siteUrl)].filter(Boolean);
  /** @type {Array<Record<string, unknown>>} */
  const pages = [];
  /** @type {object[]} */
  const allFindings = [];
  let majorPlusAccum = 0;

  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(opts.timeoutMs);

  const log = (msg) => {
    if (opts.verbose) console.error(`[a11y-crawl] ${msg}`);
  };

  try {
    while (queue.length && visited.size < opts.maxPages) {
      const href = queue.shift();
      if (!href || visited.has(href)) continue;
      visited.add(href);
      log(`page ${visited.size}/${opts.maxPages} ${href}`);

      let metrics = null;
      /** @type {object[]} */
      const pageFindings = [];

      try {
        await page.goto(href, { waitUntil: 'domcontentloaded', timeout: opts.timeoutMs });
        metrics = await collectA11yDomMetrics(page, href);

        if (opts.lanes.has('axe')) {
          const axeResult = await runAxeOnPage(page, opts.axeTags, opts.standardsProfile);
          pageFindings.push(...findingsFromAxeResult(axeResult, href));
        }

        if (opts.lanes.has('det')) {
          const det = await opts.runtime.runDeterministicRules({
            metrics,
            url: href,
            page,
            repoRoot: opts.repoRoot,
          });
          pageFindings.push(...det.findings);
        }
      } catch (error) {
        pageFindings.push({
          checkId: 'a11y-crawl',
          severity: 'major',
          area: 'accessibility',
          message: 'Page failed to load during accessibility crawl.',
          evidence: `${href} ${String(error?.message || error)}`,
          remediation: 'Fix navigation errors or increase --timeout-ms.',
        });
      }

      allFindings.push(...pageFindings);
      pages.push({ url: href, metrics, findingsCount: pageFindings.length });
      majorPlusAccum += countMajorPlus(pageFindings);

      if (!opts.stopDisabled && majorPlusAccum >= opts.stopAfterMajorPlus) {
        log(`halt major_plus_threshold=${majorPlusAccum}`);
        break;
      }

      if (visited.size < opts.maxPages) {
        try {
          const links = await page.evaluate((originIn) => {
            return Array.from(document.querySelectorAll('a[href]'))
              .map((a) => {
                try {
                  return new URL(a.getAttribute('href') || '', window.location.href).href;
                } catch {
                  return null;
                }
              })
              .filter((h) => h && h.startsWith(originIn));
          }, origin);
          for (const link of links) {
            const n = normalizeCrawlHref(link);
            if (n && isCrawlableUrl(n, origin) && !visited.has(n) && !queue.includes(n)) {
              queue.push(n);
            }
          }
        } catch {
          /* ignore link harvest errors */
        }
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  return {
    pages,
    findings: allFindings,
    crawlSummary: {
      origin,
      pagesVisited: visited.size,
      maxPages: opts.maxPages,
      majorPlusAccum,
      crawlMode: opts.stopDisabled ? 'full_budget' : 'major_plus_governed',
    },
  };
}

export { normalizeCrawlHref, isCrawlableUrl };
