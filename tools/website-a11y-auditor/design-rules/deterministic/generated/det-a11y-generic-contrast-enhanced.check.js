import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.CONTRAST_ENHANCED',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-contrast-enhanced',
};

/**
 * WCAG 1.4.6 (AAA) — stricter contrast heuristic than AA CONTRAST rule.
 * @param {{ page?: import('playwright').Page, metrics?: object, url?: string }} ctx
 */
export async function run(ctx) {
  const samples = Array.isArray(ctx.metrics?.lowContrast) ? ctx.metrics.lowContrast : [];
  const strict = samples.filter((s) => Number(s?.ratio) > 0 && Number(s.ratio) < 7);
  const findings = [];
  if (strict.length) {
    findings.push({
      severity: 'warn',
      area: 'accessibility',
      message: `Text samples below 7:1 may fail WCAG 1.4.6 Contrast (Enhanced).`,
      evidence: `${strict.length} samples under enhanced threshold`,
      remediation: 'Target 7:1 for normal text and 4.5:1 for large text at AAA where required.',
    });
  }

  const page = requirePage(ctx);
  if (page) {
    const report = await page.evaluate(() => {
      /** @type {Array<Record<string, unknown>>} */
      const hits = [];
      for (const el of document.querySelectorAll('button,input,select,textarea,[role="button"]')) {
        if (!(el instanceof HTMLElement)) continue;
        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        const color = style.color;
        if (bg && color && bg !== 'rgba(0, 0, 0, 0)') {
          hits.push({ tag: el.tagName.toLowerCase() });
          if (hits.length >= 4) break;
        }
      }
      return { controlCount: hits.length };
    });
    if (report.controlCount > 0 && !strict.length) {
      findings.push({
        severity: 'minor',
        area: 'accessibility',
        message: 'Verify 7:1 contrast for UI components (1.4.6) — DET did not sample low ratios on this page.',
        evidence: `interactive_controls=${report.controlCount}`,
        remediation: 'Manually verify enhanced contrast on controls and icons.',
      });
    }
  }

  return withUrl(findings, ctx.url);
}
