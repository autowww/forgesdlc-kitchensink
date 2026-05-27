import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.LABEL_IN_NAME',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-label-in-name',
};

function normalizeLabel(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * WCAG 2.1 2.5.3 — label in name for controls with visible text.
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    const controls = document.querySelectorAll(
      'button, a[href], input[type="button"], input[type="submit"], [role="button"], [role="link"]',
    );
    for (const el of controls) {
      if (!(el instanceof HTMLElement)) continue;
      const visible = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!visible || visible.length > 80) continue;
      const acc =
        el.getAttribute('aria-label') ||
        el.getAttribute('aria-labelledby') ||
        el.getAttribute('title') ||
        '';
      if (!acc) continue;
      const accText = acc.startsWith('#')
        ? document.getElementById(acc.slice(1))?.textContent || acc
        : acc;
      hits.push({ visible, accessible: accText.replace(/\s+/g, ' ').trim().slice(0, 80) });
      if (hits.length >= 6) break;
    }
    return { hits };
  });

  const findings = [];
  for (const h of report.hits || []) {
    const vis = normalizeLabel(h.visible);
    const acc = normalizeLabel(h.accessible);
    if (!vis || !acc || acc.includes(vis)) continue;
    findings.push({
      severity: 'warn',
      area: 'accessibility',
      message: 'Accessible name may not include the visible label text (WCAG 2.5.3).',
      evidence: `visible="${h.visible}" accessible="${h.accessible}"`,
      remediation: 'Ensure aria-label (or labelledby text) contains the visible label substring.',
    });
  }

  return withUrl(findings, ctx.url);
}
