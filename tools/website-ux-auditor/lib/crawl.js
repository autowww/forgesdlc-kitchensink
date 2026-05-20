import path from 'node:path';

import { ensureDir } from './files.js';
import { collectDomMetrics } from './dom-metrics.js';
import { runAllChecksWithTrace } from '../checks/index.js';
import { countMajorPlus } from './severity.js';
import { countBySeverity, evaluateQualityGateCrawlHalt } from './quality-gate.js';
import { scorePage } from './scoring.js';
import { pickHighestPriorityQueueItem } from './audit-priority.js';
import { RulePageTraceStore } from './audit-backlog-trace.js';
import { createDesignRuleRuntime } from './design-rule-runtime.js';
import { rollupRuleExecution } from './rule-execution-rollup.js';

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

/**
 * Whether crawl expansion should halt (quality gate segment, backlog, or Major+ governors).
 * @param {{
 *   findingAccum: number,
 *   majorPlusAccum: number,
 *   stopAfterBacklog?: number | null,
 *   stopAfterMajorPlus?: number | null,
 *   stopDisabled?: boolean,
 *   haltOnQualityGate?: boolean,
 *   severityCounts?: Record<string, number>,
 *   qualityGateThresholds?: Record<string, number>,
 * }} state
 * @returns {{ halt: boolean, reason: 'quality_gate_threshold' | 'backlog_threshold' | 'major_plus_threshold' | null, gateSeverity?: string | null }}
 */
export function evaluateCrawlHalt(state) {
  const {
    findingAccum,
    majorPlusAccum,
    stopAfterBacklog = 10,
    stopAfterMajorPlus,
    stopDisabled = false,
    haltOnQualityGate = true,
    severityCounts,
    qualityGateThresholds,
  } = state;
  if (stopDisabled) return { halt: false, reason: null, gateSeverity: null };

  if (haltOnQualityGate && severityCounts && qualityGateThresholds) {
    const qg = evaluateQualityGateCrawlHalt(severityCounts, qualityGateThresholds);
    if (qg.halt) {
      return {
        halt: true,
        reason: 'quality_gate_threshold',
        gateSeverity: qg.severity,
      };
    }
  }

  const backlogLimit = Number(stopAfterBacklog);
  if (Number.isFinite(backlogLimit) && backlogLimit > 0 && findingAccum > backlogLimit) {
    return { halt: true, reason: 'backlog_threshold', gateSeverity: null };
  }
  const majorLimit = Number(stopAfterMajorPlus);
  if (Number.isFinite(majorLimit) && majorLimit > 0 && majorPlusAccum >= majorLimit) {
    return { halt: true, reason: 'major_plus_threshold', gateSeverity: null };
  }
  return { halt: false, reason: null, gateSeverity: null };
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
 *   majorPlusPage?: number,
 *   majorPlusRunTotal?: number,
 *   findingRunTotal?: number,
 *   crawlHaltMajorPlus?: boolean,
 *   stopAfterMajorPlus?: number | null,
 *   stopDisabled?: boolean,
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
 *   stopAfterBacklog?: number | null,
 *   stopDisabled?: boolean,
 *   haltOnQualityGate?: boolean,
 *   qualityGateThresholds?: Record<string, number>,
 *   deterministicConcurrency?: number,
 *   traceStore?: RulePageTraceStore | null,
 *   priorityRuleIds?: string[],
 *   deprioritizedRuleIds?: string[],
 *   pagePriorityByUrl?: Record<string, number>,
 *   regressionUrls?: string[],
 *   resumeVisitedUrls?: string[],
 *   resumeQueuedUrls?: string[],
 *   excludeCrawlHrefs?: string[],
 *   logger?: { verbose?: (tag: string, message?: string, detail?: string) => void },
 *   onProgress?: (ev: CrawlProgressEvent) => void,
 *   maxLinkDepth?: number | null,
 *   repoRoot?: string | null,
 *   designTheme?: object | null,
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
    stopAfterBacklog = 10,
    stopDisabled = false,
    haltOnQualityGate = true,
    qualityGateThresholds = null,
    deterministicConcurrency,
    traceStore: traceStoreOpt = null,
    priorityRuleIds = [],
    deprioritizedRuleIds = [],
    pagePriorityByUrl = {},
    regressionUrls = [],
    resumeVisitedUrls = [],
    resumeQueuedUrls = [],
    excludeCrawlHrefs = [],
    logger,
    onProgress,
    maxLinkDepth: maxLinkDepthOpt = null,
    repoRoot = null,
    designTheme = null,
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

  /** Treat as already visited: skip analysis and link expansion (frees crawl budget for other URLs). Start URL is never excluded. */
  const excludeSet = new Set(
    (excludeCrawlHrefs || []).map((u) => normalizeCrawlHref(String(u || ''))).filter(Boolean),
  );
  if (startNorm) excludeSet.delete(startNorm);

  /** @type {string[]} */
  const visitedOrder = [];

  /** @type {Set<string>} */
  const seen = new Set();
  for (const raw of resumeVisitedUrls || []) {
    const h = normalizeCrawlHref(raw);
    if (h && isCrawlableUrl(h, origin)) seen.add(h);
  }
  for (const h of excludeSet) {
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
  const traceStore =
    traceStoreOpt ||
    new RulePageTraceStore({
      outDir,
      disabled: false,
    });
  await traceStore.load();

  const designRuleRuntime = await createDesignRuleRuntime({
    deterministicConcurrency,
    traceStore,
    priorityRuleIds,
    deprioritizedRuleIds,
    onDeterministicRuleProgress: (progress) => {
      onProgress?.({
        phase: 'rule_progress',
        href: progress.url,
        auditProgress: {
          pageRuleProgress: {
            url: progress.url,
            done: progress.done,
            total: progress.total,
            ruleId: progress.ruleId || '',
          },
        },
      });
    },
  });
  const detRuleTotal = designRuleRuntime.implementedRuleIds.length;
  if (!traceStore.registryFingerprint && designRuleRuntime.registryFingerprint) {
    traceStore.registryFingerprint = designRuleRuntime.registryFingerprint;
  }

  const screenshotsDir = path.join(outDir, 'screenshots');
  if (screenshots) await ensureDir(screenshotsDir);

  let majorPlusAccum = 0;
  let findingAccum = 0;
  let severityRunTotal = countBySeverity([]);
  /** @type{'quality_gate_threshold'|'major_plus_threshold'|'backlog_threshold'|'normal_completion'} */
  let stopReason = 'normal_completion';
  /** @type {string | null} */
  let qualityGateHaltSeverity = null;

  let mobileShotDone = false;

  function shouldHaltCrawl() {
    return evaluateCrawlHalt({
      findingAccum,
      majorPlusAccum,
      stopAfterBacklog,
      stopAfterMajorPlus,
      stopDisabled,
      haltOnQualityGate,
      severityCounts: severityRunTotal,
      qualityGateThresholds: qualityGateThresholds || undefined,
    });
  }

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
      auditProgress: {
        pageRuleProgress: { url: href, done: 0, total: detRuleTotal },
      },
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
      const ctx = { siteKind, repoRoot, designTheme };
      const { findings: legacyRaw, trace: legacyTrace } = runAllChecksWithTrace(raw, href, ctx);
      const { findings: deterministicRaw, trace: deterministicTrace } =
        await designRuleRuntime.runDeterministicRulesWithTrace({
          metrics: raw,
          url: href,
          page,
          repoRoot,
          ctx,
        });
      const findings = designRuleRuntime.enrichLegacyFindings(legacyRaw).concat(deterministicRaw);
      const score = scorePage(raw, findings);
      analyzed = {
        url: href,
        metrics: raw,
        findings,
        score,
        auditWave: waveLabel,
        ruleExecution: {
          legacy: legacyTrace,
          deterministic: deterministicTrace,
        },
      };
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

    const majorPlusPage = countMajorPlus(analyzed.findings || []);
    pages.push(analyzed);
    majorPlusAccum += majorPlusPage;
    const pageCounts = countBySeverity(analyzed.findings || []);
    for (const [k, v] of Object.entries(pageCounts)) {
      severityRunTotal[k] = (severityRunTotal[k] || 0) + v;
    }
    findingAccum += (analyzed.findings || []).length;

    logger?.verbose?.(
      '[crawl]',
      `${waveLabel} ${href}`,
      `page=${pages.length}/${maxPages} majorPlusAccum=${majorPlusAccum}`,
    );

    const haltEval = shouldHaltCrawl();
    const haltExpand = haltEval.halt;

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
      majorPlusPage,
      majorPlusRunTotal: majorPlusAccum,
      findingRunTotal: findingAccum,
      severityRunTotal: { ...severityRunTotal },
      crawlHaltQualityGate: haltExpand && haltEval.reason === 'quality_gate_threshold',
      crawlHaltGateSeverity: haltEval.gateSeverity || null,
      crawlHaltMajorPlus: haltExpand && haltEval.reason === 'major_plus_threshold',
      crawlHaltBacklog: haltExpand && haltEval.reason === 'backlog_threshold',
      stopAfterMajorPlus: stopDisabled ? null : stopAfterMajorPlus,
      stopAfterBacklog: stopDisabled ? null : stopAfterBacklog,
      stopDisabled,
      auditProgress: {
        findingAccum,
        majorPlusAccum,
        stopAfterBacklog: stopDisabled ? null : stopAfterBacklog,
        stopAfterMajorPlus: stopDisabled ? null : stopAfterMajorPlus,
        pageRuleProgress: {
          url: href,
          done: detRuleTotal,
          total: detRuleTotal,
        },
      },
    });

    if (haltExpand && haltEval.reason === 'quality_gate_threshold') {
      qualityGateHaltSeverity = haltEval.gateSeverity || null;
    }
    return haltExpand ? haltEval.reason : null;
  }

  const cappedRegression = [...new Set((regressionUrls || []).map(normalizeCrawlHref).filter(Boolean))];

  for (const href of cappedRegression) {
    if (!href || !isCrawlableUrl(href, origin)) continue;
    if (seen.has(href)) continue;
    if (pages.length >= maxPages) break;
    seen.add(href);
    visitedOrder.push(href);
    logger?.verbose?.('[incremental]', `regression wave: fetch ${href}`, '');
    const haltReason = await analyzeOne(href, 'regression', false, 0);
    if (haltReason) {
      stopReason = haltReason;
      break;
    }
  }

  const priorityByUrl = pagePriorityByUrl && typeof pagePriorityByUrl === 'object' ? pagePriorityByUrl : {};

  while (
    queue.length &&
    pages.length < maxPages &&
    stopReason !== 'major_plus_threshold' &&
    stopReason !== 'backlog_threshold'
  ) {
    const rawItem =
      Object.keys(priorityByUrl).length > 0
        ? pickHighestPriorityQueueItem(queue, priorityByUrl)
        : queue.shift();
    const item = dequeueItem(rawItem, 0);
    if (!item) continue;
    const { href, depth: pageDepth } = item;
    if (!href || seen.has(href) || !isCrawlableUrl(href, origin)) continue;
    seen.add(href);
    visitedOrder.push(href);
    const haltReason = await analyzeOne(href, 'crawl', true, pageDepth);
    if (haltReason) {
      stopReason = haltReason;
      break;
    }
  }

  await traceStore.save();

  onProgress?.({
    phase: 'browser_close_start',
    pagesCompleted: pages.length,
    queueLen: queue.length,
  });
  await mobileContext.close();
  await context.close();
  await browser.close();

  /** @type {'full_budget_within_max_pages'|'quality_gate_early_stop'|'backlog_early_stop'|'major_plus_early_stop'|'major_plus_governed_complete'} */
  let crawlMode;
  if (stopDisabled) crawlMode = 'full_budget_within_max_pages';
  else if (stopReason === 'quality_gate_threshold') crawlMode = 'quality_gate_early_stop';
  else if (stopReason === 'backlog_threshold') crawlMode = 'backlog_early_stop';
  else if (stopReason === 'major_plus_threshold') crawlMode = 'major_plus_early_stop';
  else crawlMode = 'major_plus_governed_complete';

  const ruleExecutionCoverage = rollupRuleExecution(pages, {
    implementedRuleIds: designRuleRuntime.implementedRuleIds,
  });

  const crawlSummary = {
    crawlMode,
    stopReason,
    majorPlusFindingCountTotal: majorPlusAccum,
    queuedRemainingAtStop: queue.length,
    pagesCaptured: pages.length,
    stopAfterMajorPlus: stopDisabled ? null : stopAfterMajorPlus,
    stopAfterBacklog: stopDisabled ? null : stopAfterBacklog,
    backlogFindingCountTotal: findingAccum,
    pagesPlannedBudget: maxPages,
    stopDisabled,
    haltOnQualityGate: stopDisabled ? false : haltOnQualityGate,
    qualityGateThresholds: qualityGateThresholds || null,
    qualityGateHaltSeverity,
    deterministicConcurrency: designRuleRuntime.deterministicConcurrency,
    maxLinkDepth,
    designTheme: designTheme
      ? {
        id: designTheme.id || null,
        fingerprint: designTheme.fingerprint || null,
        generatedPath: designTheme.generatedPath || null,
      }
      : null,
    excludeCrawlPreseeded: excludeSet.size,
    designRuleRegistryFingerprint: designRuleRuntime.registryFingerprint,
    designRuleRegistryPath: designRuleRuntime.registryPath,
    deterministicImplementedRuleIds: designRuleRuntime.implementedRuleIds,
    ruleExecutionCoverage,
  };

  const visitedUrls = [...visitedOrder];
  const queuedUrlsAtStop = queue
    .map((q) => (q && typeof q === 'object' && 'href' in q ? normalizeCrawlHref(q.href || '') : normalizeCrawlHref(q)))
    .filter(Boolean);

  return { pages, crawlSummary, visitedUrls, queuedUrlsAtStop };
}
