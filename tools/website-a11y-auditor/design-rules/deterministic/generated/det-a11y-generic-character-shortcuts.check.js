import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.CHARACTER_SHORTCUTS',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-character-shortcuts',
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
    for (const script of document.querySelectorAll('script:not([src])')) {
      const code = script.textContent || '';
      if (/\b(accesskey|single.?letter|keydown.*===.*['"][a-z]['"])/i.test(code.slice(0, 12000))) {
        hits.push({ kind: 'script-shortcut' });
        break;
      }
    }
    for (const el of document.querySelectorAll('[accesskey]')) {
      hits.push({ tag: el.tagName.toLowerCase(), key: el.getAttribute('accesskey') || '' });
      if (hits.length >= 4) break;
    }
    return { hits: hits.slice(0, 4) };
  });

  return withUrl(
    (report.hits || []).map((h) => ({
      severity: 'warn',
      area: 'accessibility',
      message: 'Single-character shortcut may be active (WCAG 2.1.4) — verify remapping or disable.',
      evidence: h.kind === 'script-shortcut' ? 'inline script' : `accesskey=${h.key}`,
      remediation: 'Allow users to turn off or remap single-key shortcuts.',
    })),
    ctx.url,
  );
}
