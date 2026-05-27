import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.HOVER_FOCUS_CONTENT',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-hover-focus-content',
};

/**
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    for (const el of document.querySelectorAll('[title],[data-tooltip],[aria-describedby],[popover]')) {
      if (!(el instanceof HTMLElement)) continue;
      const describedby = el.getAttribute('aria-describedby');
      const tip = describedby ? document.getElementById(describedby) : null;
      const dismissible = tip?.querySelector('button,[role="button"]');
      if (!dismissible && (el.getAttribute('title') || el.hasAttribute('data-tooltip'))) {
        hits.push({ tag: el.tagName.toLowerCase(), kind: 'tooltip-no-dismiss' });
      }
      if (hits.length >= 5) break;
    }
    return { hits };
  });

  return withUrl(
    (report.hits || []).map((h) => ({
      severity: 'warn',
      area: 'accessibility',
      message:
        'Additional content on hover/focus may not be dismissible or hoverable (WCAG 1.4.13).',
      evidence: `<${h.tag}> ${h.kind}`,
      remediation: 'Allow Escape to dismiss; keep hover content open when pointer moves to it.',
    })),
    ctx.url,
  );
}
