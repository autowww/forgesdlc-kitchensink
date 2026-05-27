import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.MULTIPLE_WAYS',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 6,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-multiple-ways',
};

/**
 * Per-page heuristic for 2.4.5 — sitewide crawl improves confidence.
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    const hasNav = Boolean(document.querySelector('nav,[role="navigation"]'));
    const hasSearch = Boolean(
      document.querySelector('input[type="search"],[role="search"],form[action*="search" i]'),
    );
    const hasSitemap = Boolean(
      document.querySelector('a[href*="sitemap" i],a[href*="site-map" i]'),
    );
    const footerLinks = document.querySelectorAll('footer a[href]').length;
    return { hasNav, hasSearch, hasSitemap, footerLinks };
  });

  const ways = [
    report.hasNav && 'nav',
    report.hasSearch && 'search',
    report.hasSitemap && 'sitemap',
    report.footerLinks >= 3 && 'footer-links',
  ].filter(Boolean);

  if (ways.length >= 2) return [];

  return withUrl(
    [
      {
        severity: 'warn',
        area: 'accessibility',
        message: `Few navigation mechanisms detected (${ways.join(', ') || 'none'}) — verify multiple ways to find pages (2.4.5).`,
        evidence: JSON.stringify(report),
        remediation: 'Provide at least two of: global nav, search, sitemap, or related links.',
      },
    ],
    ctx.url,
  );
}
