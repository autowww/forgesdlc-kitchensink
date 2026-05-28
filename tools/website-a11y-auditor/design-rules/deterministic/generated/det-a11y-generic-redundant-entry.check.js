import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.REDUNDANT_ENTRY',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 6,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-redundant-entry',
};

export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    const names = new Map();
    for (const el of document.querySelectorAll('input[name],textarea[name]')) {
      const name = el.getAttribute('name') || '';
      if (!name || /csrf|token|nonce/i.test(name)) continue;
      names.set(name, (names.get(name) || 0) + 1);
    }
    for (const [name, count] of names) {
      if (count >= 2) hits.push({ name, count });
      if (hits.length >= 3) break;
    }
    return { hits };
  });

  const findings = (report.hits || []).map((h) => ({
    severity: 'warn',
    area: 'accessibility',
    message: 'Repeated form field names may require redundant-entry handling (3.3.7 supplemental).',
    evidence: `name="${h.name}" ×${h.count}`,
    remediation: 'Auto-fill or offer to reuse data the user already entered in the session.',
  }));

  return withUrl(findings, ctx.url);
}
