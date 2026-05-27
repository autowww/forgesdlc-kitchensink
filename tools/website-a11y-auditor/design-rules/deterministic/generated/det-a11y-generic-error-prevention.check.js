import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.ERROR_PREVENTION',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-error-prevention',
};

/**
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    for (const form of document.querySelectorAll('form')) {
      const text = norm(form.textContent || '');
      const sensitive =
        /\b(payment|card|checkout|purchase|submit order|wire transfer|legal|contract)\b/.test(text);
      if (!sensitive) continue;
      const hasReview =
        form.querySelector('[type="button"],button') &&
        /\b(review|confirm|verify)\b/i.test(form.innerHTML);
      const hasConfirmStep = form.querySelector('[name*="confirm" i],[id*="confirm" i]');
      if (!hasReview && !hasConfirmStep) {
        hits.push({ id: form.id || '', action: (form.getAttribute('action') || '').slice(0, 60) });
        if (hits.length >= 3) break;
      }
    }
    return { hits };
  });

  const findings = (report.hits || []).map((h) => ({
    severity: 'warn',
    area: 'accessibility',
    message:
      'Financial or legal form may lack review/confirmation step (WCAG 3.3.4 supplemental).',
    evidence: `form id="${h.id}" action="${h.action}"`,
    remediation: 'Let users review, confirm, or reverse submissions that bind the user.',
  }));

  return withUrl(findings, ctx.url);
}
