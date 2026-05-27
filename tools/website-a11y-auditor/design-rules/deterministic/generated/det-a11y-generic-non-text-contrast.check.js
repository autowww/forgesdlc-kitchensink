import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.NON_TEXT_CONTRAST',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-non-text-contrast',
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
      'button,svg,input,select,[role="button"],[role="img"]',
    )) {
      if (!(el instanceof HTMLElement)) continue;
      const style = window.getComputedStyle(el);
      const border = style.borderColor;
      const bg = style.backgroundColor;
      if (border === bg && style.borderWidth !== '0px') {
        hits.push({ tag: el.tagName.toLowerCase(), kind: 'border-same-as-bg' });
      }
      if (hits.length >= 6) break;
    }
    return { hits };
  });

  return withUrl(
    (report.hits || []).map((h) => ({
      severity: 'warn',
      area: 'accessibility',
      message: 'UI component border may lack 3:1 contrast against adjacent colors (WCAG 1.4.11).',
      evidence: `<${h.tag}> ${h.kind}`,
      remediation: 'Ensure icons, borders, and focus indicators have sufficient non-text contrast.',
    })),
    ctx.url,
  );
}
