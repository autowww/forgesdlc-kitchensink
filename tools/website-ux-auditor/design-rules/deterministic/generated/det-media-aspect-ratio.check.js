/**
 * DET.MEDIA.ASPECT_RATIO — hero/card media has width/height or aspect-ratio to prevent CLS.
 */

export const rule = {
  id: 'DET.MEDIA.ASPECT_RATIO',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'first-screen',
  scoreDimension: 'visualRhythmFirstScreen',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-media-aspect-ratio',
};

/**
 * @param {{ mediaViolations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromMediaAspectReport(report, url = '') {
  const violations = Array.isArray(report?.mediaViolations) ? report.mediaViolations : [];
  if (!violations.length) return [];

  const messages = {
    'missing-aspect-hint': 'Hero or card media lacks width/height or aspect-ratio hints.',
    'media-overflow': 'Hero or card media overflows the viewport width.',
  };

  return violations.slice(0, 8).map((v) => ({
    severity: 'warn',
    area: 'first-screen',
    message: messages[String(v.issue)] || 'Media aspect ratio check failed.',
    evidence: `issue=${String(v.issue || '')} tag=${String(v.tag || '')}${url ? ` url=${url}` : ''}`,
    remediation:
      'Set width/height attributes or CSS aspect-ratio on images/video in hero and cards; constrain max-width to the layout grid.',
  }));
}

export async function run({ metrics, page, url }) {
  const report = metrics?.genericWebsitePageReport;
  if (report) return findingsFromMediaAspectReport(report, url || metrics?.url || '');
  if (!page) return [];
  const { collectGenericWebsitePageReport } = await import('../../../lib/generic-website-collectors.js');
  const collected = await collectGenericWebsitePageReport(page);
  return findingsFromMediaAspectReport(collected, url || metrics?.url || '');
}
