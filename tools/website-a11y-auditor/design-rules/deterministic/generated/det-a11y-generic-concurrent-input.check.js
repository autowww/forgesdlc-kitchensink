import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.CONCURRENT_INPUT',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-concurrent-input',
};

/**
 * WCAG 2.1 2.5.6 — concurrent input mechanisms (AAA supplemental).
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
      if (/\b(pointerType|TouchEvent|touchonly|mouseonly|disableKeyboard|keyboardDisabled)\b/i.test(code.slice(0, 16000))) {
        hits.push({ kind: 'input-restriction-script' });
        break;
      }
    }
    const bodyStyle = window.getComputedStyle(document.body);
    if (bodyStyle.pointerEvents === 'none' && document.querySelector('canvas, [data-touch-only]')) {
      hits.push({ kind: 'pointer-events-none-with-canvas' });
    }
    for (const el of document.querySelectorAll('[inputmode="none"], [readonly][aria-disabled="true"]')) {
      if (el.matches('input, textarea')) {
        hits.push({ tag: el.tagName.toLowerCase(), kind: 'blocked-text-input' });
        if (hits.length >= 4) break;
      }
    }
    return { hits: hits.slice(0, 4) };
  });

  return withUrl(
    (report.hits || []).map((h) => ({
      severity: 'warn',
      area: 'accessibility',
      message: 'Content may block keyboard or pointer input — verify concurrent mechanisms (2.5.6).',
      evidence: String(h.kind || h.tag),
      remediation: 'Do not restrict operation to a single input modality unless essential.',
    })),
    ctx.url,
  );
}
