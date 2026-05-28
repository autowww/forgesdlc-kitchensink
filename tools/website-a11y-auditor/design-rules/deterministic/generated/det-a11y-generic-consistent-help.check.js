import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.CONSISTENT_HELP',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 6,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-consistent-help',
};

export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    const help = [
      ...document.querySelectorAll('a[href*="help" i],a[href*="support" i],button[aria-label*="help" i]'),
    ];
    return { count: help.length };
  });

  if ((report.count || 0) > 0) return withUrl([], ctx.url);

  return withUrl(
    [
      {
        severity: 'warn',
        area: 'accessibility',
        message: 'No sitewide help/support entry point found (3.2.6 supplemental).',
        evidence: 'help links=0',
        remediation: 'Place help in a consistent region across pages (header, footer, or nav).',
      },
    ],
    ctx.url,
  );
}
