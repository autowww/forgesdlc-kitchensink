import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.INTERRUPTIONS',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 6,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-interruptions',
};

export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    const html = document.documentElement.innerHTML.slice(0, 80000);
    if (/\balert\s*\(/i.test(html)) hits.push({ kind: 'alert-call' });
    for (const el of document.querySelectorAll('[role="alert"],[aria-live="assertive"]')) {
      if (el.textContent && el.textContent.trim().length > 20) {
        hits.push({ kind: 'live-assertive', text: el.textContent.trim().slice(0, 80) });
        break;
      }
    }
    for (const d of document.querySelectorAll('dialog[open],[role="dialog"][aria-modal="true"]')) {
      hits.push({ kind: 'modal-open', tag: d.tagName.toLowerCase() });
      break;
    }
    return { hits: hits.slice(0, 4) };
  });

  const findings = (report.hits || []).map((h) => ({
    severity: 'warn',
    area: 'accessibility',
    message: 'Possible interrupting UI — verify users can postpone or suppress (2.2.4 supplemental).',
    evidence: String(h.kind),
    remediation: 'Let users defer non-essential alerts, chat prompts, and modal interruptions.',
  }));

  return withUrl(findings, ctx.url);
}
