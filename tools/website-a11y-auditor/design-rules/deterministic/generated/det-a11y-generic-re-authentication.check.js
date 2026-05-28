import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.RE_AUTHENTICATION',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 6,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-re-authentication',
};

export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    for (const form of document.querySelectorAll('form')) {
      const text = norm(form.textContent || '');
      const hasPassword = form.querySelector('input[type="password"]');
      const sessionLoss = /\b(session expired|log in again|re-?authenticate|sign in again)\b/.test(text);
      if (hasPassword && sessionLoss) {
        hits.push({ id: form.id || '', action: (form.getAttribute('action') || '').slice(0, 60) });
        break;
      }
    }
    return { hits };
  });

  const findings = (report.hits || []).map((h) => ({
    severity: 'warn',
    area: 'accessibility',
    message: 'Re-authentication form detected — verify data is preserved after timeout (2.2.5 supplemental).',
    evidence: `form id="${h.id}"`,
    remediation: 'When sessions expire, preserve user data for at least 20 hours of inactivity unless essential.',
  }));

  return withUrl(findings, ctx.url);
}
