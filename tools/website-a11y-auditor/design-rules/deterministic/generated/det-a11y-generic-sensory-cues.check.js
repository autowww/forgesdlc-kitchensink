import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.SENSORY_CUES',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 6,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-sensory-cues',
};

const SENSORY_RX =
  /\b(red|green|blue|round|square|left|right)\s+(button|box|icon|link)\b|\bclick the (red|green|round)\b/i;

/**
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate((rxSource) => {
    const rx = new RegExp(rxSource, 'i');
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    for (const el of document.querySelectorAll('p,li,label,legend,span,.help,.hint')) {
      const text = norm(el.textContent || '');
      if (text.length < 8 || text.length > 200) continue;
      if (rx.test(text)) {
        hits.push({ tag: el.tagName.toLowerCase(), snippet: text.slice(0, 100) });
        if (hits.length >= 4) break;
      }
    }
    return { hits };
  }, SENSORY_RX.source);

  const findings = (report.hits || []).map((h) => ({
    severity: 'warn',
    area: 'accessibility',
    message:
      'Instructions may rely on sensory characteristics (shape/color/position) — verify WCAG 1.3.3.',
    evidence: `<${h.tag}> "${h.snippet}"`,
    remediation: 'Describe controls by name and function, not only color or shape.',
  }));

  return withUrl(findings, ctx.url);
}
