import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.POINTER_CANCELLATION',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-pointer-cancellation',
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
    for (const el of document.querySelectorAll('[onmousedown],[onclick]')) {
      if (!(el instanceof HTMLElement)) continue;
      const md = el.getAttribute('onmousedown') || '';
      const oc = el.getAttribute('onclick') || '';
      if (md && !oc && /\b(submit|location|click)\b/i.test(md)) {
        hits.push({ tag: el.tagName.toLowerCase(), attr: 'onmousedown' });
      }
    }
    return { hits: hits.slice(0, 5) };
  });

  return withUrl(
    (report.hits || []).map((h) => ({
      severity: 'warn',
      area: 'accessibility',
      message: 'Action may fire on pointer down without cancel on up (WCAG 2.5.2).',
      evidence: `${h.attr} on <${h.tag}>`,
      remediation: 'Activate on click/up-event; allow abort by moving pointer away before release.',
    })),
    ctx.url,
  );
}
