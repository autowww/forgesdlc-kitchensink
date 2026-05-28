import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.GLOSSARY_ABBR',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 6,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-glossary-abbr',
};

export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    for (const abbr of document.querySelectorAll('abbr')) {
      if (!abbr.getAttribute('title') && !abbr.querySelector('[title]')) {
        hits.push({ kind: 'abbr-no-title', text: (abbr.textContent || '').trim().slice(0, 40) });
        if (hits.length >= 5) break;
      }
    }
    const hasGlossary = document.querySelector('a[href*="glossary" i],a[href*="definition" i]');
    if (!hasGlossary && hits.length) hits.push({ kind: 'no-glossary-link' });
    return { hits };
  });

  const findings = (report.hits || []).map((h) => ({
    severity: 'warn',
    area: 'accessibility',
    message:
      h.kind === 'no-glossary-link'
        ? 'Abbreviations without expansion and no glossary link (3.1.3–3.1.6 supplemental).'
        : 'Abbreviation may lack definition (3.1.3–3.1.6 supplemental).',
    evidence: h.kind === 'abbr-no-title' ? `abbr: ${h.text}` : String(h.kind),
    remediation: 'Provide definitions, `title` on abbr, or link to a glossary for unusual terms and abbreviations.',
  }));

  return withUrl(findings, ctx.url);
}
