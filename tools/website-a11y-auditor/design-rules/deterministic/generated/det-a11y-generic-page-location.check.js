import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.PAGE_LOCATION',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-page-location',
};

/**
 * Generic 2.4.8 location cues (non-KS sites).
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    const hasBreadcrumb = Boolean(
      document.querySelector(
        'nav[aria-label*="breadcrumb" i],[aria-label*="breadcrumb" i],.breadcrumb,ol.breadcrumb',
      ),
    );
    const hasCurrent = Boolean(
      document.querySelector('[aria-current="page"],[aria-current="true"]'),
    );
    const youAreHere = /\byou are here\b/i.test(document.body?.textContent || '');
    return { hasBreadcrumb, hasCurrent, youAreHere };
  });

  if (report.hasBreadcrumb || report.hasCurrent || report.youAreHere) {
    return [];
  }

  return withUrl(
    [
      {
        severity: 'warn',
        area: 'accessibility',
        message:
          'Page may not expose location within the site (WCAG 2.4.8) — no breadcrumb or current-page indicator found.',
        evidence: JSON.stringify(report),
        remediation:
          'Add breadcrumbs, aria-current="page" on the active nav link, or a visible “you are here” trail.',
      },
    ],
    ctx.url,
  );
}
