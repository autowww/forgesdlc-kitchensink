import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.POINTER_GESTURES',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-pointer-gestures',
};

/**
 * WCAG 2.1 2.5.1 — pointer gestures (supplemental warn; catalog may stay manual_only).
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    for (const script of document.querySelectorAll('script:not([src])')) {
      const code = script.textContent || '';
      if (/\b(touchmove|touchstart|gesturechange|pinch|swipe|panstart|hammer\.)/i.test(code.slice(0, 16000))) {
        if (!/\b(click|pointerdown|mousedown)\b/i.test(code.slice(0, 16000))) {
          hits.push({ kind: 'touch-only-script' });
          break;
        }
      }
    }
    for (const el of document.querySelectorAll('[ontouchstart], [ongesturestart]')) {
      const hasClick = el.hasAttribute('onclick') || el.getAttribute('role') === 'button';
      if (!hasClick) hits.push({ tag: el.tagName.toLowerCase(), kind: 'inline-touch-handler' });
      if (hits.length >= 4) break;
    }
    return { hits: hits.slice(0, 4) };
  });

  return withUrl(
    (report.hits || []).map((h) => ({
      severity: 'warn',
      area: 'accessibility',
      message: 'Path-based or touch-only interaction detected — verify a single-pointer alternative (2.5.1).',
      evidence: h.kind === 'touch-only-script' ? 'inline script' : `element=${h.tag}`,
      remediation: 'Provide click or keyboard alternatives for drag, swipe, or multipoint gestures.',
    })),
    ctx.url,
  );
}
