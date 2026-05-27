import { requirePage, withUrl } from '../../../lib/det-check-helpers.mjs';

export const rule = {
  id: 'DET.A11Y.GENERIC.MEDIA_TRACKS',
  lane: 'deterministic',
  area: 'accessibility',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-media-tracks',
};

/**
 * Supplemental warning on manual_only media SC — does not assert conformance.
 * @param {{ page?: import('playwright').Page, url?: string }} ctx
 */
export async function run(ctx) {
  const page = requirePage(ctx);
  if (!page) return [];

  const report = await page.evaluate(() => {
    /** @type {Array<Record<string, unknown>>} */
    const hits = [];
    for (const video of document.querySelectorAll('video')) {
      const tracks = video.querySelectorAll('track[kind="captions"],track[kind="subtitles"]');
      if (!tracks.length) {
        hits.push({ kind: 'video-no-captions', src: (video.getAttribute('src') || '').slice(0, 60) });
      }
    }
    for (const iframe of document.querySelectorAll('iframe[src*="youtube"],iframe[src*="vimeo"]')) {
      const title = iframe.getAttribute('title') || '';
      if (!title.trim()) {
        hits.push({ kind: 'embed-no-title', src: (iframe.getAttribute('src') || '').slice(0, 60) });
      }
    }
    for (const audio of document.querySelectorAll('audio')) {
      hits.push({ kind: 'audio-present', src: (audio.getAttribute('src') || '').slice(0, 40) });
    }
    return { hits: hits.slice(0, 6) };
  });

  const findings = (report.hits || []).map((h) => {
    if (h.kind === 'video-no-captions') {
      return {
        severity: 'warn',
        area: 'accessibility',
        message:
          'Video may lack captions or subtitles — manual check required (WCAG 1.2.x supplemental DET).',
        evidence: `video src="${h.src}"`,
        remediation: 'Provide captions, audio description, or transcript per media type.',
      };
    }
    if (h.kind === 'embed-no-title') {
      return {
        severity: 'warn',
        area: 'accessibility',
        message: 'Embedded media iframe lacks title — verify captions/alternatives (1.2.x).',
        evidence: `iframe src="${h.src}"`,
        remediation: 'Add a descriptive title attribute and documented media alternatives.',
      };
    }
    return {
      severity: 'minor',
      area: 'accessibility',
      message: 'Audio element present — verify controls and alternatives (1.2.1 / 1.4.2).',
      evidence: `audio src="${h.src}"`,
      remediation: 'Provide transcript or alternative for audio-only content.',
    };
  });

  return withUrl(findings, ctx.url);
}
