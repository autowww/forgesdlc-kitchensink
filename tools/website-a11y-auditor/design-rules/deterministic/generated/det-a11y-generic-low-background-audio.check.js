import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.LOW_BACKGROUND_AUDIO',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 6,
  source:
    'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-low-background-audio',
};

export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    for (const v of document.querySelectorAll('video[autoplay],audio[autoplay]')) {
      const hasCtrl = v.controls || v.closest('[class*="player"],[data-player]');
      if (!hasCtrl) hits.push({ tag: v.tagName.toLowerCase(), src: (v.currentSrc || '').slice(0, 60) });
      if (hits.length >= 3) break;
    }
    return { hits };
  });

  const findings = (report.hits || []).map((h) => ({
    severity: 'warn',
    area: 'accessibility',
    message: 'Autoplay media without obvious controls — verify background audio is low or off (1.4.7 supplemental).',
    evidence: `${h.tag} src="${h.src}"`,
    remediation: 'Keep background audio at least 20 dB below foreground speech or provide a mute control.',
  }));

  return withUrl(findings, ctx.url);
}
