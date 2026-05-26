import { collectDomMetrics } from '../../website-ux-auditor/lib/dom-metrics.js';
import { collectLandmarksReport } from '../../website-ux-auditor/design-rules/deterministic/generated/det-landmarks-required.check.js';

/**
 * Collect accessibility-oriented DOM metrics for one crawled page.
 * @param {import('playwright').Page} page
 * @param {string} href
 */
export async function collectA11yDomMetrics(page, href) {
  const base = await collectDomMetrics(page, href);
  const landmarksReport = await collectLandmarksReport(page);
  const ksSignals = await page.evaluate(() => {
    const hasHandbookChapter = Boolean(document.querySelector('[data-ks-name="handbook-chapter"]'));
    const hasKsBreadcrumb = Boolean(
      document.querySelector('.ks-doc-breadcrumb, [data-ks-hash="Kbc"]'),
    );
    const ksHashNodes = document.querySelectorAll('[data-ks-hash]').length;
    return { hasHandbookChapter, hasKsBreadcrumb, ksHashNodeCount: ksHashNodes };
  });

  return {
    ...base,
    url: href,
    landmarksReport,
    hasHandbookChapter: ksSignals.hasHandbookChapter,
    hasKsBreadcrumb: ksSignals.hasKsBreadcrumb,
    ksHashNodeCount: ksSignals.ksHashNodeCount,
    ksVisualHashReport: base.ksVisualHashReport || base.ksHashReport || null,
  };
}
