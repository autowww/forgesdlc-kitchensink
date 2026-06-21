/**
 * DET.ROUTE.CONTENT_UNIQUENESS — titles/H1/meta descriptions unique across routes.
 */

export const rule = {
  id: 'DET.ROUTE.CONTENT_UNIQUENESS',
  lane: 'deterministic',
  phase: 'crawl',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'major',
  priorityWeight: 9,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-route-content-uniqueness',
};

/**
 * @param {{ uniquenessViolations?: Array<Record<string, unknown>> } | null | undefined} report
 */
export function findingsFromContentUniquenessReport(report) {
  const violations = Array.isArray(report?.uniquenessViolations) ? report.uniquenessViolations : [];
  if (!violations.length) return [];

  return violations.slice(0, 8).map((v) => {
    const issue = String(v.issue || '');
    const urls = Array.isArray(v.urls) ? v.urls : [];
    const isPlaceholder = issue === 'cloned-placeholder-pages';
    return {
      severity: isPlaceholder ? 'major' : 'warn',
      area: 'informationArchitecture',
      message: isPlaceholder
        ? 'Multiple routes share cloned placeholder title/H1/meta text.'
        : 'Multiple routes share identical title, H1, and meta description signatures.',
      evidence: `issue=${issue} routes=${urls.length} sample="${String(urls[0] || '')}" title="${String(v.title || '')}"`,
      remediation:
        'Give each route a distinct <title>, primary H1, and meta description that reflect the page topic; remove scaffold duplicates from generators.',
    };
  });
}

export function run({ metrics }) {
  const report = metrics?.crawlRouteAudit;
  if (!report) return [];
  return findingsFromContentUniquenessReport(report);
}
