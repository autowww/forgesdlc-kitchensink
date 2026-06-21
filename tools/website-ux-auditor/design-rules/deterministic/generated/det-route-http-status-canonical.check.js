/**
 * DET.ROUTE.HTTP_STATUS_CANONICAL — crawl discovers broken links, redirect loops, SPA blanks, non-HTML pages.
 */

export const rule = {
  id: 'DET.ROUTE.HTTP_STATUS_CANONICAL',
  lane: 'deterministic',
  phase: 'crawl',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'major',
  priorityWeight: 10,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-route-http-status-canonical',
};

/**
 * @param {{ httpViolations?: Array<Record<string, unknown>> } | null | undefined} report
 */
export function findingsFromHttpStatusCanonicalReport(report) {
  const violations = Array.isArray(report?.httpViolations) ? report.httpViolations : [];
  if (!violations.length) return [];

  return violations.slice(0, 12).map((v) => {
    const issue = String(v.issue || '');
    const href = String(v.href || v.canonical || '');
    const messages = {
      'broken-link': 'An internal link returns an HTTP error status.',
      'redirect-loop': 'An internal URL is caught in a redirect loop.',
      'spa-blank-shell': 'A routed page renders like an empty SPA fallback (very little content).',
      'non-html-page': 'A crawled page URL serves non-HTML content but is linked as a normal page.',
      'duplicate-canonical-target': 'Multiple distinct pages declare the same canonical URL.',
      'request-failed': 'An internal URL could not be fetched during crawl verification.',
    };
    return {
      severity: issue === 'request-failed' ? 'warn' : 'major',
      area: 'informationArchitecture',
      message: messages[issue] || 'Route HTTP or canonical check failed.',
      evidence: `issue=${issue} href="${href}"${v.status ? ` status=${v.status}` : ''}${v.contentType ? ` contentType=${v.contentType}` : ''}`,
      remediation:
        issue === 'broken-link'
          ? 'Fix the href target or server routing so internal links return 2xx HTML responses.'
          : issue === 'redirect-loop'
            ? 'Remove circular redirects; keep one canonical redirect chain per URL.'
            : issue === 'spa-blank-shell'
              ? 'Ensure the route renders meaningful main content on direct load (SSR/prerender or shell fallback copy).'
              : issue === 'non-html-page'
                ? 'Link downloads with clear labels, or serve HTML wrapper pages for navigable routes.'
                : issue === 'duplicate-canonical-target'
                  ? 'Give each public URL a unique canonical or consolidate duplicate shells into one route.'
                  : 'Verify hosting, base href, and generator output paths for this internal URL.',
    };
  });
}

/** Crawl-level only — per-page run uses precomputed crawlRouteAudit on metrics when present. */
export function run({ metrics }) {
  const report = metrics?.crawlRouteAudit;
  if (!report) return [];
  return findingsFromHttpStatusCanonicalReport(report);
}
