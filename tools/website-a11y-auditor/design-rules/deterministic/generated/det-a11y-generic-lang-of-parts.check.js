import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.LANG_OF_PARTS',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-lang-of-parts',
};

/**
 * @param {{ page?: import('playwright').Page, metrics?: object, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const docLang = String(ctx.metrics?.lang || '').toLowerCase().split('-')[0];

  const report = await page.evaluate((rootLang) => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const latinRx = /[A-Za-z\u00C0-\u024F]{3,}/;
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];

    for (const el of document.querySelectorAll('blockquote,p,li,span,div')) {
      if (!(el instanceof HTMLElement)) continue;
      if (el.closest('[lang],[xml\\:lang]')) continue;
      const text = norm(el.textContent || '');
      if (text.length < 24 || !latinRx.test(text)) continue;
      const childLang = el.querySelector('[lang],[xml\\:lang]');
      if (childLang) continue;
      if (el.children.length > 8) continue;
      hits.push({ tag: el.tagName.toLowerCase(), snippet: text.slice(0, 80) });
      if (hits.length >= 5) break;
    }

    for (const el of document.querySelectorAll('[lang=""],[xml\\:lang=""]')) {
      hits.push({ kind: 'empty-lang', tag: el.tagName.toLowerCase() });
    }

    return { hits, rootLang };
  }, docLang);

  const findings = (report.hits || [])
    .filter((h) => h.kind !== 'empty-lang')
    .map((h) => ({
      severity: 'warn',
      area: 'accessibility',
      message:
        'A text block may be in a different language without a lang attribute (WCAG 3.1.2 heuristic).',
      evidence: `<${h.tag}> "${h.snippet}"`,
      remediation: 'Add lang (or xml:lang) on the element when language differs from the page.',
    }));

  for (const h of report.hits || []) {
    if (h.kind === 'empty-lang') {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message: 'Empty lang attribute on an element (3.1.2).',
        evidence: `<${h.tag}>`,
        remediation: 'Set a valid BCP 47 language tag or remove the attribute.',
      });
    }
  }

  return withUrl(findings.slice(0, 6), ctx.url);
}
