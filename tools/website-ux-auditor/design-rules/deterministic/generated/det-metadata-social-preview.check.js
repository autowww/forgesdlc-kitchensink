/**
 * DET.METADATA.SOCIAL_PREVIEW — description, canonical, favicon, OpenGraph/Twitter basics.
 */

export const rule = {
  id: 'DET.METADATA.SOCIAL_PREVIEW',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'metadata',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'minor',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-metadata-social-preview',
};

/**
 * @param {{ socialViolations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromSocialPreviewReport(report, url = '') {
  const violations = Array.isArray(report?.socialViolations) ? report.socialViolations : [];
  if (!violations.length) return [];

  const messages = {
    'placeholder-meta-description': 'Meta description is missing or uses placeholder text.',
    'missing-open-graph': 'Page lacks basic Open Graph title/description tags.',
    'missing-twitter-preview': 'Page lacks Twitter card or og tags for link previews.',
    'missing-favicon': 'Page lacks favicon or app icon link.',
    'missing-canonical': 'Substantive public page lacks a canonical link.',
  };

  return violations.slice(0, 6).map((v) => ({
    severity: String(v.issue) === 'placeholder-meta-description' ? 'major' : 'minor',
    area: 'metadata',
    message: messages[String(v.issue)] || 'Social/metadata preview check failed.',
    evidence: `issue=${String(v.issue || '')}${url ? ` url=${url}` : ''}`,
    remediation:
      'Add descriptive meta[name=description], link rel=canonical, favicon, og:title/description, and twitter:card for public pages.',
  }));
}

export async function run({ metrics, page, url }) {
  const report = metrics?.genericWebsitePageReport;
  if (report) return findingsFromSocialPreviewReport(report, url || metrics?.url || '');
  if (!page) return [];
  const { collectGenericWebsitePageReport } = await import('../../../lib/generic-website-collectors.js');
  const collected = await collectGenericWebsitePageReport(page);
  return findingsFromSocialPreviewReport(collected, url || metrics?.url || '');
}
