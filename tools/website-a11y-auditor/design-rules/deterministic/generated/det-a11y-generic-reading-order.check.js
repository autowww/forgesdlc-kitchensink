import {
  collectNavFocusOrderReport,
  findingsFromNavFocusOrderReport,
} from '../../../../website-ux-auditor/design-rules/deterministic/generated/det-nav-focus-order.check.js';
import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.READING_ORDER',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-reading-order',
};

/**
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const navReport = await collectNavFocusOrderReport(page);
  const navFindings = findingsFromNavFocusOrderReport(navReport, ctx.url).filter((f) =>
    /positive tabindex|tab order jumps upward|right-to-left/i.test(f.message || ''),
  );

  const extra = await page.evaluate(() => {
    const main = document.querySelector('main,[role="main"]');
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    if (main) {
      let node = main.parentElement;
      while (node && node !== document.body) {
        if (node.getAttribute('aria-hidden') === 'true') {
          hits.push({ kind: 'main-ancestor-hidden', tag: node.tagName.toLowerCase() });
          break;
        }
        node = node.parentElement;
      }
    }
    const positiveCount = [...document.querySelectorAll('[tabindex]')].filter(
      (el) => el instanceof HTMLElement && el.tabIndex > 0,
    ).length;
    if (positiveCount > 3) {
      hits.push({ kind: 'many-positive-tabindex', count: positiveCount });
    }
    const mainEl = main || document.body;
    if (mainEl) {
      const style = window.getComputedStyle(mainEl);
      if (style.display.includes('flex') && style.flexDirection === 'row-reverse') {
        hits.push({ kind: 'flex-reverse-main' });
      }
      let ordered = 0;
      for (const el of mainEl.querySelectorAll('[style*="order"]')) {
        if (el instanceof HTMLElement && el.style.order && el.style.order !== '0') ordered += 1;
      }
      if (ordered > 2) {
        hits.push({ kind: 'css-order-overrides', count: ordered });
      }
    }
    return { hits };
  });

  const findings = navFindings.map((f) => ({
    ...f,
    message: f.message.replace('Keyboard tab order', 'Meaningful sequence / keyboard order'),
    remediation: `${f.remediation || ''} Manual review: confirm reading order matches visual layout (WCAG 1.3.2).`.trim(),
  }));

  for (const h of extra.hits || []) {
    if (h.kind === 'main-ancestor-hidden') {
      findings.push({
        severity: 'major',
        area: 'accessibility',
        message: 'Main content may be hidden from assistive tech via aria-hidden on an ancestor (1.3.2).',
        evidence: `ancestor <${h.tag}>`,
        remediation: 'Remove aria-hidden from ancestors of main content unless intentionally off-screen.',
      });
    }
    if (h.kind === 'many-positive-tabindex') {
      findings.push({
        severity: 'warn',
        area: 'accessibility',
        message: `Many elements use positive tabindex (${h.count}) — reading sequence may not match visual order (1.3.2).`,
        evidence: `positive_tabindex_count=${h.count}`,
        remediation: 'Use DOM order for sequence; remove positive tabindex except rare exceptions.',
      });
    }
    if (h.kind === 'flex-reverse-main') {
      findings.push({
        severity: 'warn',
        area: 'accessibility',
        message: 'Main content uses row-reverse flex — verify reading order matches meaningful sequence (1.3.2).',
        evidence: 'flex-direction: row-reverse on main',
        remediation: 'Prefer DOM order; avoid reversing visual vs assistive order without testing.',
      });
    }
    if (h.kind === 'css-order-overrides') {
      findings.push({
        severity: 'warn',
        area: 'accessibility',
        message: `Multiple CSS order overrides (${h.count}) in main — manual reading-order check advised (1.3.2).`,
        evidence: `order_override_count=${h.count}`,
        remediation: 'Align visual layout with DOM sequence or document the intentional order.',
      });
    }
  }

  return withUrl(findings, ctx.url);
}
