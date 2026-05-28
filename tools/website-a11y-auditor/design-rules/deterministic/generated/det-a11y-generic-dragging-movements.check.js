import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.DRAGGING_MOVEMENTS',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-dragging-movements',
};

export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    const html = document.documentElement.innerHTML.slice(0, 100000);
    if (/\bdraggable\s*=\s*["']true["']/i.test(html)) hits.push({ kind: 'draggable-attr' });
    for (const el of document.querySelectorAll('[class*="drag"],[data-drag],[data-draggable]')) {
      hits.push({ kind: 'drag-hook', tag: el.tagName.toLowerCase() });
      if (hits.length >= 3) break;
    }
    return { hits };
  });

  const findings = (report.hits || []).map((h) => ({
    severity: 'warn',
    area: 'accessibility',
    message: 'Dragging interaction detected — verify a single-pointer alternative exists (2.5.7 supplemental).',
    evidence: String(h.kind),
    remediation: 'Provide click or keyboard path to complete the same action without dragging.',
  }));

  return withUrl(findings, ctx.url);
}
