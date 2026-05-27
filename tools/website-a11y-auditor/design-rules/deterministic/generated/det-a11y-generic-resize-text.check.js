import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.RESIZE_TEXT',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-resize-text',
};

/**
 * WCAG 2.0 1.4.4 — resize text (viewport + blocking overflow heuristics).
 * @param {{ page?: import('playwright').Page, metrics?: object, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  const findings = [];
  const viewport = String(ctx.metrics?.metaViewport || '').trim().toLowerCase();

  if (!viewport) {
    findings.push({
      severity: 'minor',
      area: 'accessibility',
      message: 'Viewport meta missing — text zoom/reflow may fail (WCAG 1.4.4).',
      evidence: 'no meta viewport',
      remediation: 'Add `<meta name="viewport" content="width=device-width, initial-scale=1">`.',
    });
  } else if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\.0)?\b/i.test(viewport)) {
    findings.push({
      severity: 'major',
      area: 'accessibility',
      message: 'Viewport restricts zoom — may block text resize up to 200% (WCAG 1.4.4).',
      evidence: viewport.slice(0, 120),
      remediation: 'Allow zoom (avoid user-scalable=no and maximum-scale=1).',
    });
  }

  if (!page) return withUrl(findings, ctx.url);

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    for (const sel of ['html', 'body', 'main', '[role="main"]']) {
      const el = document.querySelector(sel);
      if (!(el instanceof HTMLElement)) continue;
      const style = window.getComputedStyle(el);
      if (style.overflow === 'hidden' || style.overflowX === 'hidden') {
        hits.push({ kind: 'overflow-hidden', selector: sel });
      }
      const fs = parseFloat(style.fontSize);
      if (fs > 0 && fs < 10) {
        hits.push({ kind: 'tiny-font', selector: sel, fontSize: style.fontSize });
      }
    }
    return { hits: hits.slice(0, 4) };
  });

  for (const h of report.hits || []) {
    if (h.kind === 'overflow-hidden') {
      findings.push({
        severity: 'warn',
        area: 'accessibility',
        message: `${h.selector} uses overflow:hidden — enlarged text may be clipped (1.4.4).`,
        evidence: `selector=${h.selector}`,
        remediation: 'Avoid clipping main content when users zoom; test at 200% zoom.',
      });
    }
    if (h.kind === 'tiny-font') {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message: `Very small base font on ${h.selector} — verify readability when resized (1.4.4).`,
        evidence: `font-size=${h.fontSize}`,
        remediation: 'Use relative units (rem/em) and allow user agent scaling.',
      });
    }
  }

  return withUrl(findings, ctx.url);
}
