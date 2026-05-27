import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.TIMING',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-timing',
};

/**
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  const findings = [];

  if (page) {
    const report = await page.evaluate(() => {
      /** @type {Array<Record<string, unknown>>} */
      const hits = [];
      const refresh = document.querySelector('meta[http-equiv="refresh" i]');
      if (refresh) {
        const content = refresh.getAttribute('content') || '';
        if (!/^0\s*;\s*url=/i.test(content)) {
          hits.push({ kind: 'meta-refresh', content: content.slice(0, 80) });
        }
      }
      const bodyHtml = document.body?.innerHTML || '';
      if (/\bsetTimeout\s*\(|\bsetInterval\s*\(/i.test(bodyHtml.slice(0, 50000))) {
        hits.push({ kind: 'timer-scripts' });
      }
      if (document.querySelector('[data-session-timeout],[data-timeout]')) {
        hits.push({ kind: 'session-timeout-attr' });
      }
      return { hits };
    });

    for (const h of report.hits || []) {
      if (h.kind === 'meta-refresh') {
        findings.push({
          severity: 'major',
          area: 'accessibility',
          message: 'Meta refresh may impose a time limit (WCAG 2.2.1 supplemental).',
          evidence: `content="${h.content}"`,
          remediation: 'Remove auto-refresh or let users turn off, extend, or adjust the limit.',
        });
      } else {
        findings.push({
          severity: 'warn',
          area: 'accessibility',
          message: 'Page may use session timers — verify users can extend time (2.2.1).',
          evidence: h.kind,
          remediation: 'Warn before timeout and allow extension where timing is essential.',
        });
      }
    }
  }

  return withUrl(findings, ctx.url);
}
