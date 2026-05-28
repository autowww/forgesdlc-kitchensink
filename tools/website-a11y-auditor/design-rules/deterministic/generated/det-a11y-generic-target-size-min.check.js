import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.TARGET_SIZE_MIN',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-target-size-min',
};

export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    const minPx = 24;
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    const candidates = document.querySelectorAll(
      'a,button,input[type="button"],input[type="submit"],input[type="checkbox"],input[type="radio"],[role="button"]',
    );
    for (const el of candidates) {
      if (!(el instanceof HTMLElement)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (r.width < minPx || r.height < minPx) {
        hits.push({
          tag: el.tagName.toLowerCase(),
          w: Math.round(r.width),
          h: Math.round(r.height),
        });
        if (hits.length >= 5) break;
      }
    }
    return { hits };
  });

  const findings = (report.hits || []).map((h) => ({
    severity: 'warn',
    area: 'accessibility',
    message: `Control may be smaller than 24×24 CSS px (2.5.8 supplemental; complements axe).`,
    evidence: `${h.tag} ${h.w}×${h.h}px`,
    remediation: 'Increase target size or spacing so the hit target is at least 24×24 CSS pixels.',
  }));

  return withUrl(findings, ctx.url);
}
