import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.TEXT_SPACING',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-text-spacing',
};

/**
 * WCAG 2.1 1.4.12 — text spacing not overridden in ways that clip content.
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    const blocks = document.querySelectorAll('p, li, [role="paragraph"], article p, main p');
    for (const el of blocks) {
      if (!(el instanceof HTMLElement)) continue;
      const style = window.getComputedStyle(el);
      const overflow = style.overflow + style.overflowY;
      if (!/hidden|clip/.test(overflow)) continue;
      const lh = style.lineHeight;
      const ls = style.letterSpacing;
      const inline = el.getAttribute('style') || '';
      if (
        /line-height\s*:\s*[\d.]+px\s*!important/i.test(inline) ||
        /letter-spacing\s*:\s*[\d.]+px\s*!important/i.test(inline) ||
        (lh && lh.endsWith('px') && parseFloat(lh) > 0 && parseFloat(lh) < 14)
      ) {
        hits.push({ tag: el.tagName.toLowerCase(), lineHeight: lh, overflow: style.overflow });
        if (hits.length >= 4) break;
      }
    }
    return { hits };
  });

  return withUrl(
    (report.hits || []).map((h) => ({
      severity: 'warn',
      area: 'accessibility',
      message: 'Text block may clip when users increase spacing (WCAG 1.4.12).',
      evidence: `line-height=${h.lineHeight} overflow=${h.overflow}`,
      remediation: 'Avoid fixed line-height with overflow:hidden; test with increased letter/line/word spacing.',
    })),
    ctx.url,
  );
}
