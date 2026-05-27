import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.INPUT_CONTEXT_CHANGE',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'major',
  priorityWeight: 9,
  source:
    'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-input-context-change',
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

    for (const sel of document.querySelectorAll('select')) {
      const oc = norm(sel.getAttribute('onchange') || '');
      if (/\b(submit|location|reload)\b/i.test(oc)) {
        hits.push({ kind: 'select-onchange', tag: 'select', id: sel.id || '', snippet: oc.slice(0, 120) });
      }
    }

    for (const form of document.querySelectorAll('form')) {
      if (form.querySelector('button[type="submit"], input[type="submit"]')) continue;
      const radios = form.querySelectorAll('input[type="radio"]');
      if (radios.length && norm(form.getAttribute('onchange') || '')) {
        hits.push({ kind: 'form-onchange', tag: 'form', id: form.id || '' });
      }
    }

    return { hits: hits.slice(0, 8) };
  });

  const findings = (report.hits || []).map((h) => ({
    severity: 'major',
    area: 'accessibility',
    message:
      'Changing a control may submit the form or navigate without confirmation — double-check WCAG 3.2.2.',
    evidence: `${h.kind} <${h.tag}> id="${h.id}"${h.snippet ? ` snippet="${h.snippet}"` : ''}`,
    remediation:
      'Use an explicit Submit button; do not submit or navigate on select/radio change alone unless users expect it.',
  }));

  return withUrl(findings, ctx.url);
}
