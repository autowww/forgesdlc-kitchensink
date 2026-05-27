import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.STATUS_MESSAGES',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-status-messages',
};

/**
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    const statusLike = document.querySelectorAll(
      '.alert,.toast,[role="status"],[role="alert"],[class*="success"],[class*="error"]',
    );
    for (const el of statusLike) {
      if (!(el instanceof HTMLElement)) continue;
      const role = el.getAttribute('role') || '';
      const live = el.getAttribute('aria-live') || '';
      const atomic = el.getAttribute('aria-atomic');
      if (!role && !live) {
        hits.push({ tag: el.tagName.toLowerCase(), className: (el.className || '').toString().slice(0, 40) });
      }
      if (role === 'status' && !live) {
        hits.push({ tag: el.tagName.toLowerCase(), kind: 'status-no-live' });
      }
      if (hits.length >= 5) break;
    }
    return { hits };
  });

  return withUrl(
    (report.hits || []).map((h) => ({
      severity: 'warn',
      area: 'accessibility',
      message: 'Status message may not be exposed to assistive tech (WCAG 4.1.3).',
      evidence: `<${h.tag}> ${h.className || h.kind || ''}`,
      remediation: 'Use role="status" or aria-live="polite" on dynamically inserted status text.',
    })),
    ctx.url,
  );
}
