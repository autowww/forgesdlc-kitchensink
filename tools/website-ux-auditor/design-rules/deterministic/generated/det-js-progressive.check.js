/**
 * DET.JS.PROGRESSIVE — critical main content must remain visible without script;
 * enhancements may layer on top. Evidence: DOM snapshot with JavaScript disabled.
 */

/** Minimum words in main (or noscript fallback) when JS is off for a content-heavy page. */
export const MIN_NOJS_MAIN_WORDS = 48;

/** Only compare when the JS-enabled page has substantial main copy. */
export const MIN_ENABLED_MAIN_WORDS = 96;

/** Flag when no-JS retains less than this fraction of enabled main word count. */
export const MIN_WORD_RETENTION_RATIO = 0.38;

/** Meaningful noscript fallback when main collapses without script. */
export const MIN_NOSCRIPT_WORDS = 12;

const NOJS_GOTO_TIMEOUT_MS = 20000;

export const rule = {
  id: 'DET.JS.PROGRESSIVE',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'interaction',
  scoreDimension: 'depthAndTechnicalDisclosure',
  defaultSeverity: 'major',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-js-progressive',
};

/**
 * @param {Record<string, unknown> | null | undefined} metrics
 */
export function buildEnabledProgressiveSnapshot(metrics) {
  const m = metrics || {};
  return {
    mainWordCount: typeof m.wordCount === 'number' ? m.wordCount : null,
    h1Count: typeof m.h1Count === 'number' ? m.h1Count : null,
    mainLinkCount: Array.isArray(m.links) ? m.links.length : null,
  };
}

/**
 * @param {{ enabled?: Record<string, number | null>, disabled?: Record<string, number | null> | null } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromJsProgressiveReport(report, url = '') {
  const enabled = report?.enabled;
  const disabled = report?.disabled;
  if (!enabled || !disabled) return [];

  const enWords = enabled.mainWordCount;
  const disWords = disabled.mainWordCount;
  if (enWords == null || disWords == null) return [];
  if (enWords < MIN_ENABLED_MAIN_WORDS) return [];

  const noscriptWords = Number(disabled.noscriptWordCount) || 0;
  const effectiveDisWords = Math.max(disWords, noscriptWords);
  const retention = enWords > 0 ? effectiveDisWords / enWords : 1;

  const findings = [];
  const seen = new Set();

  const push = (kind, severity, message, evidence, remediation) => {
    if (seen.has(kind)) return;
    seen.add(kind);
    findings.push({ severity, area: 'interaction', message, evidence, remediation });
  };

  if (
    effectiveDisWords < MIN_NOJS_MAIN_WORDS
    && retention < MIN_WORD_RETENTION_RATIO
  ) {
    push(
      'critical-text-collapse',
      retention < 0.18 ? 'critical' : 'major',
      'Critical main content is not available when JavaScript is disabled (progressive enhancement failure).',
      `enabled_main_words=${enWords} nojs_main_words=${disWords} noscript_words=${noscriptWords} retention=${retention.toFixed(2)} min_retention=${MIN_WORD_RETENTION_RATIO}`,
      'Ensure headlines, body copy, and primary navigation render in static HTML; gate charts, modals, and theme polish behind script without hiding the page story.',
    );
  }

  const enH1 = enabled.h1Count;
  const disH1 = disabled.h1Count;
  if (enH1 != null && disH1 != null && enH1 >= 1 && disH1 === 0) {
    push(
      'missing-primary-heading',
      'major',
      'The primary in-main headline is missing when JavaScript is disabled.',
      `enabled_h1=${enH1} nojs_h1=${disH1}`,
      'Emit the page H1 in server-rendered HTML instead of injecting it only after script runs.',
    );
  }

  if (
    effectiveDisWords < MIN_NOJS_MAIN_WORDS
    && noscriptWords < MIN_NOSCRIPT_WORDS
    && !seen.has('critical-text-collapse')
  ) {
    push(
      'noscript-fallback',
      'minor',
      'No meaningful noscript fallback is present while main content depends on script.',
      `nojs_main_words=${disWords} noscript_words=${noscriptWords} min_noscript=${MIN_NOSCRIPT_WORDS}`,
      'Add a concise <noscript> summary or render essential copy in HTML so readers without script still get the page intent.',
    );
  }

  if (url) {
    for (const finding of findings) {
      finding.evidence = `${finding.evidence} url=${url}`;
    }
  }

  return findings;
}

/** @param {import('playwright').Page} page */
export async function snapshotMainContentWithoutJs(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const words = (s) => norm(s).split(/\s+/).filter(Boolean);
    const visible = (el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden'
        && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
    };

    const main = document.querySelector('main#main') || document.querySelector('main');
    const mainText = main ? norm(main.innerText || main.textContent || '') : norm(document.body.innerText || '');
    const mainWordCount = words(mainText).length;
    const h1Scope = main || document;
    const h1Count = [...h1Scope.querySelectorAll('h1')].filter(visible).length;
    const mainLinkCount = main
      ? [...main.querySelectorAll('a[href]')].filter(visible).length
      : 0;
    const noscriptEl = document.querySelector('noscript');
    const noscriptWordCount = noscriptEl ? words(noscriptEl.textContent || '').length : 0;

    return { mainWordCount, h1Count, mainLinkCount, noscriptWordCount };
  });
}

/**
 * @param {import('playwright').Page} page
 * @param {Record<string, unknown>} [enabledMetrics]
 */
export async function collectJsProgressiveReport(page, enabledMetrics = {}) {
  const pageUrl = page.url();
  if (!pageUrl || pageUrl === 'about:blank') return null;

  const enabled = buildEnabledProgressiveSnapshot(enabledMetrics);
  const browser = page.context().browser();
  if (!browser) {
    return { enabled, disabled: null, skippedReason: 'no-browser' };
  }

  const viewport = page.viewportSize() || { width: 1440, height: 1000 };
  const noJsContext = await browser.newContext({
    javaScriptEnabled: false,
    viewport,
  });

  try {
    const noJsPage = await noJsContext.newPage();
    await noJsPage.goto(pageUrl, {
      waitUntil: 'domcontentloaded',
      timeout: NOJS_GOTO_TIMEOUT_MS,
    });
    const disabled = await snapshotMainContentWithoutJs(noJsPage);
    await noJsPage.close();
    return { enabled, disabled, url: pageUrl };
  } catch (error) {
    return {
      enabled,
      disabled: null,
      skippedReason: String(error?.message || error).slice(0, 200),
      url: pageUrl,
    };
  } finally {
    await noJsContext.close();
  }
}

export async function run({ metrics, page, url }) {
  const pageUrl = url || String(metrics?.url || '');
  const report = metrics?.jsProgressiveReport
    ?? (page ? await collectJsProgressiveReport(page, metrics || {}) : null);
  if (!report?.disabled) return [];
  return findingsFromJsProgressiveReport(report, pageUrl);
}
