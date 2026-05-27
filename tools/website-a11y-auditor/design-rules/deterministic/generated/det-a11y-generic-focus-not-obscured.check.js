import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.FOCUS_NOT_OBSCURED',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-focus-not-obscured',
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
    for (const el of document.querySelectorAll(
      'header,[role="banner"],.sticky-top,.fixed-top,[style*="position: fixed"],[style*="position:sticky"]',
    )) {
      if (!(el instanceof HTMLElement)) continue;
      const style = window.getComputedStyle(el);
      if (style.position === 'fixed' || style.position === 'sticky') {
        const z = Number.parseInt(style.zIndex, 10);
        if (!Number.isFinite(z) || z >= 10) {
          hits.push({ tag: el.tagName.toLowerCase(), position: style.position });
        }
      }
      if (hits.length >= 4) break;
    }
    return { hits };
  });

  return withUrl(
    (report.hits || []).map((h) => ({
      severity: 'warn',
      area: 'accessibility',
      message: `Sticky/fixed ${h.tag} may obscure focused elements (WCAG 2.4.11).`,
      evidence: `position=${h.position}`,
      remediation: 'Ensure focused controls scroll into view and are not hidden behind sticky chrome.',
    })),
    ctx.url,
  );
}
