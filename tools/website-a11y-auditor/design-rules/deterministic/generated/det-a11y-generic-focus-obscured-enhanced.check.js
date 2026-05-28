import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.FOCUS_OBSCURED_ENHANCED',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source:
    'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-focus-obscured-enhanced',
};

export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    for (const el of document.querySelectorAll(
      'header[style*="fixed"],nav[style*="fixed"],[class*="sticky"],[class*="fixed-bottom"],dialog[open]',
    )) {
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' || cs.position === 'sticky') {
        const r = el.getBoundingClientRect();
        if (r.height > 40 && r.width > window.innerWidth * 0.5) {
          hits.push({ tag: el.tagName.toLowerCase(), pos: cs.position });
          if (hits.length >= 4) break;
        }
      }
    }
    return { hits };
  });

  const findings = (report.hits || []).map((h) => ({
    severity: 'warn',
    area: 'accessibility',
    message: 'Large fixed/sticky chrome may obscure any part of focused controls (2.4.12 supplemental).',
    evidence: `${h.tag} position=${h.pos}`,
    remediation: 'Ensure no part of the focused component is hidden by author-created content.',
  }));

  return withUrl(findings, ctx.url);
}
