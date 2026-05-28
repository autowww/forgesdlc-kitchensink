import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.CHANGE_ON_REQUEST',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 6,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-change-on-request',
};

export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    for (const el of document.querySelectorAll('select[onchange],input[type="radio"][onchange]')) {
      const form = el.closest('form');
      if (form && !form.querySelector('button[type="submit"],input[type="submit"]')) {
        hits.push({ tag: el.tagName.toLowerCase(), name: el.getAttribute('name') || '' });
        if (hits.length >= 3) break;
      }
    }
    return { hits };
  });

  const findings = (report.hits || []).map((h) => ({
    severity: 'warn',
    area: 'accessibility',
    message: 'Control may change context on input without explicit submit (3.2.5 supplemental).',
    evidence: `${h.tag} name="${h.name}"`,
    remediation: 'Require an explicit user action (button) before navigation or major context changes.',
  }));

  return withUrl(findings, ctx.url);
}
