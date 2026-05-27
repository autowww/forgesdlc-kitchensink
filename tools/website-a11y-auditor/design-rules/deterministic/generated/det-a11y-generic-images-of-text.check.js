import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.IMAGES_OF_TEXT',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-images-of-text',
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

    for (const img of document.querySelectorAll('img')) {
      const alt = norm(img.getAttribute('alt') || '');
      const src = norm(img.getAttribute('src') || '');
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      if (w >= 200 && h >= 40) {
        if (!alt || /logo|banner|header|text|title|wordmark/i.test(src + alt)) {
          hits.push({ kind: 'large-image-text-like', src: src.slice(0, 80), alt: alt.slice(0, 80), w, h });
        }
      }
    }

    for (const svg of document.querySelectorAll('svg[role="img"],svg[aria-label]')) {
      const label = norm(svg.getAttribute('aria-label') || '');
      const textNodes = svg.querySelectorAll('text');
      if (textNodes.length > 2 && label.length < 8) {
        hits.push({ kind: 'svg-text-no-label', tag: 'svg' });
      }
    }

    for (const el of document.querySelectorAll('body *')) {
      if (!(el instanceof HTMLElement)) continue;
      const style = window.getComputedStyle(el);
      if (!style.backgroundImage || style.backgroundImage === 'none') continue;
      const text = norm(el.textContent || '');
      const indent = style.textIndent;
      if (text.length < 2 && (indent === '-9999px' || indent === '-10000px')) {
        hits.push({ kind: 'background-replaced-text', tag: el.tagName.toLowerCase(), id: el.id || '' });
      }
    }

    return { hits: hits.slice(0, 6) };
  });

  const findings = (report.hits || []).map((h) => {
    if (h.kind === 'svg-text-no-label') {
      return {
        severity: 'warn',
        area: 'accessibility',
        message: 'SVG contains text paths with weak labeling — may be images of text (1.4.5 / 1.4.9).',
        evidence: '<svg> with <text> children',
        remediation: 'Prefer HTML text or provide aria-label matching visible SVG text.',
      };
    }
    if (h.kind === 'background-replaced-text') {
      return {
        severity: 'warn',
        area: 'accessibility',
        message:
          'Text may be presented as a background image (images of text) — verify real text or sufficient alt (1.4.5 / 1.4.9).',
        evidence: `<${h.tag}> id="${h.id}"`,
        remediation: 'Use styled text or provide a text alternative; avoid image-only logos when text is required.',
      };
    }
    return {
      severity: 'warn',
      area: 'accessibility',
      message:
        'Large image may contain text (images of text) — confirm alt text conveys the same information (1.4.5 / 1.4.9).',
      evidence: `src="${h.src}" alt="${h.alt}" size=${h.w}x${h.h}`,
      remediation: 'Replace with HTML text where possible, or provide descriptive alt matching visible text.',
    };
  });

  return withUrl(findings, ctx.url);
}
