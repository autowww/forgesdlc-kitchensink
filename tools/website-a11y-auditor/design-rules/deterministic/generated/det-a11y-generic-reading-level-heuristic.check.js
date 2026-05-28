import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.READING_LEVEL_HEURISTIC',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 5,
  source:
    'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-reading-level-heuristic',
};

export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    if (!main) return { longParagraphs: 0 };
    let longParagraphs = 0;
    for (const p of main.querySelectorAll('p')) {
      const words = (p.textContent || '').trim().split(/\s+/).filter(Boolean);
      if (words.length > 90) longParagraphs += 1;
      if (longParagraphs >= 3) break;
    }
    return { longParagraphs };
  });

  if ((report.longParagraphs || 0) < 2) return withUrl([], ctx.url);

  return withUrl(
    [
      {
        severity: 'warn',
        area: 'accessibility',
        message: 'Very long paragraphs detected — review reading level and plain language (3.1.5 supplemental).',
        evidence: `${report.longParagraphs} paragraph(s) >90 words`,
        remediation: 'Offer simplified summary or supplemental plain-language content where appropriate.',
      },
    ],
    ctx.url,
  );
}
