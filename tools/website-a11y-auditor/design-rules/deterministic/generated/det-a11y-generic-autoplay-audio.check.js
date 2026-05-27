import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.AUTOPLAY_AUDIO',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-autoplay-audio',
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
    for (const el of document.querySelectorAll('video[autoplay],audio[autoplay]')) {
      const muted = el.hasAttribute('muted') || el.getAttribute('muted') === '';
      if (!muted) {
        hits.push({ tag: el.tagName.toLowerCase(), muted: false });
      }
    }
    return { hits };
  });

  const findings = (report.hits || []).map((h) => ({
    severity: 'major',
    area: 'accessibility',
    message: 'Autoplaying media with sound may violate WCAG 1.4.2 — verify mute or user control.',
    evidence: `<${h.tag}> autoplay unmuted`,
    remediation: 'Mute autoplay by default or provide a prominent control to stop audio within 3 seconds.',
  }));

  return withUrl(findings, ctx.url);
}
