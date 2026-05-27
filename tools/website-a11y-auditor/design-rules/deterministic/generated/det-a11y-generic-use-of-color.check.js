import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.USE_OF_COLOR',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-use-of-color',
};

/**
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    const colorOnlyRx =
      /\b(red|green|blue|required|optional|error|success|danger|warning)\b/i;

    for (const el of document.querySelectorAll(
      '[class*="text-danger"],[class*="text-success"],[class*="status"],[class*="badge"],[class*="legend"]',
    )) {
      if (!(el instanceof HTMLElement)) continue;
      const text = norm(el.textContent || '');
      const hasIcon = el.querySelector('svg,img,[aria-hidden="true"]');
      if (text.length > 80) continue;
      if (!text && !hasIcon) continue;
      if (text && !colorOnlyRx.test(text) && text.length > 12) continue;
      const style = window.getComputedStyle(el);
      const bg = style.backgroundColor;
      const color = style.color;
      if (bg === color || bg === 'rgba(0, 0, 0, 0)') continue;
      hits.push({
        tag: el.tagName.toLowerCase(),
        className: norm(el.className).slice(0, 60),
        text: text.slice(0, 60),
      });
      if (hits.length >= 6) break;
    }
    return { hits };
  });

  const findings = (report.hits || []).map((h) => ({
    severity: 'warn',
    area: 'accessibility',
    message:
      'Meaning may rely on color alone — verify non-color cue (text, icon, pattern) for WCAG 1.4.1.',
    evidence: `<${h.tag}> class="${h.className}" text="${h.text}"`,
    remediation: 'Add visible text or icon plus color; do not rely on hue alone for status or required fields.',
  }));

  return withUrl(findings, ctx.url);
}
