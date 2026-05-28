import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.VISUAL_PRESENTATION_AAA',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 6,
  source:
    'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-visual-presentation-aaa',
};

export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    const body = document.body;
    if (!body) return { hits: [] };
    const cs = getComputedStyle(body);
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    if (cs.textAlign === 'justify') hits.push({ kind: 'justify-body' });
    const maxW = parseFloat(cs.maxWidth || '0');
    if (maxW > 900) hits.push({ kind: 'wide-max-width', maxW });
    const lineHeight = parseFloat(cs.lineHeight || '0');
    const fontSize = parseFloat(cs.fontSize || '16');
    if (lineHeight > 0 && lineHeight < fontSize * 1.4) hits.push({ kind: 'tight-line-height' });
    return { hits };
  });

  const findings = (report.hits || []).map((h) => ({
    severity: 'warn',
    area: 'accessibility',
    message: `Visual presentation heuristic (${h.kind}) — verify blocks can be resized and restyled (1.4.8 supplemental).`,
    evidence: String(h.kind),
    remediation: 'Allow user control of width, line spacing, and colors without loss of content or function.',
  }));

  return withUrl(findings, ctx.url);
}
