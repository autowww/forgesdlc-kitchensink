/**
 * DET.EXTERNAL_LINK.SAFETY — target=_blank uses rel=noopener; downloads and contact links labeled.
 */

export const rule = {
  id: 'DET.EXTERNAL_LINK.SAFETY',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'trust',
  scoreDimension: 'trustAndEcosystemTruth',
  defaultSeverity: 'minor',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-external-link-safety',
};

/**
 * @param {{ externalViolations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromExternalLinkReport(report, url = '') {
  const violations = Array.isArray(report?.externalViolations) ? report.externalViolations : [];
  if (!violations.length) return [];

  const messages = {
    'blank-without-noopener': 'Link opens a new tab without rel="noopener" (or noreferrer).',
    'placeholder-contact-link': 'mailto: or tel: link uses placeholder contact values.',
    'unlabeled-download': 'Download link lacks a descriptive label.',
  };

  return violations.slice(0, 10).map((v) => ({
    severity: String(v.issue) === 'blank-without-noopener' ? 'major' : 'minor',
    area: 'trust',
    message: messages[String(v.issue)] || 'External link safety check failed.',
    evidence: `issue=${String(v.issue || '')} href="${String(v.href || '').slice(0, 100)}"${url ? ` url=${url}` : ''}`,
    remediation:
      String(v.issue) === 'blank-without-noopener'
        ? 'Add rel="noopener noreferrer" to every target="_blank" link.'
        : 'Replace placeholder mailto/tel values and label download links with file type or purpose.',
  }));
}

export async function run({ metrics, page, url }) {
  const report = metrics?.genericWebsitePageReport;
  if (report) return findingsFromExternalLinkReport(report, url || metrics?.url || '');
  if (!page) return [];
  const { collectGenericWebsitePageReport } = await import('../../../lib/generic-website-collectors.js');
  const collected = await collectGenericWebsitePageReport(page);
  return findingsFromExternalLinkReport(collected, url || metrics?.url || '');
}
