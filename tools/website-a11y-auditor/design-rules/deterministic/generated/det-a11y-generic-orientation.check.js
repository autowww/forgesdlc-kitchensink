import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.ORIENTATION',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-orientation',
};

/**
 * WCAG 2.1 1.3.4 — orientation not restricted.
 * @param {{ page?: import('playwright').Page, metrics?: object, url?: string }} ctx
 */
export async function run(ctx) {
  const findings = [];
  const viewport = String(ctx.metrics?.metaViewport || '').trim().toLowerCase();

  if (/orientation\s*=\s*landscape|orientation\s*=\s*portrait/i.test(viewport)) {
    findings.push({
      severity: 'major',
      area: 'accessibility',
      message: 'Viewport meta locks orientation (WCAG 1.3.4).',
      evidence: viewport.slice(0, 120),
      remediation: 'Remove orientation locks from the viewport meta tag.',
    });
  }

  const page = requirePage(ctx);
  if (!page) return withUrl(findings, ctx.url);

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    for (const styleEl of document.querySelectorAll('style')) {
      const text = styleEl.textContent || '';
      if (/@media[^{]*orientation\s*:\s*(landscape|portrait)/i.test(text)) {
        hits.push({ kind: 'css-orientation-lock' });
        break;
      }
    }
    if (typeof screen !== 'undefined' && screen.orientation && typeof screen.orientation.lock === 'function') {
      hits.push({ kind: 'orientation-lock-api' });
    }
    return { hits: hits.slice(0, 3) };
  });

  for (const h of report.hits || []) {
    findings.push({
      severity: h.kind === 'orientation-lock-api' ? 'major' : 'warn',
      area: 'accessibility',
      message:
        h.kind === 'orientation-lock-api'
          ? 'Page may call screen.orientation.lock() — verify content works in all orientations (1.3.4).'
          : 'CSS restricts display to one orientation (1.3.4).',
      evidence: String(h.kind),
      remediation: 'Do not restrict orientation unless essential; support portrait and landscape.',
    });
  }

  return withUrl(findings, ctx.url);
}
