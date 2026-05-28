import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.CONTEXT_HELP',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 6,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-context-help',
};

export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    for (const form of document.querySelectorAll('form')) {
      const fields = form.querySelectorAll('input:not([type="hidden"]),textarea,select').length;
      if (fields < 4) continue;
      const help =
        form.querySelector('[aria-describedby],[class*="help"],a[href*="help" i],button[aria-label*="help" i]') ||
        document.querySelector('a[href*="help" i],a[href*="support" i]');
      if (!help) {
        hits.push({ id: form.id || '', fields });
        if (hits.length >= 2) break;
      }
    }
    return { hits };
  });

  const findings = (report.hits || []).map((h) => ({
    severity: 'warn',
    area: 'accessibility',
    message: 'Multi-field form may lack contextual help (3.3.5 supplemental).',
    evidence: `form id="${h.id}" fields=${h.fields}`,
    remediation: 'Provide instructions, help links, or field-level descriptions for complex tasks.',
  }));

  return withUrl(findings, ctx.url);
}
