/**
 * DET.SEARCH.FILTER_STATE — result count, active filters, clear-all, empty recovery.
 */

export const rule = {
  id: 'DET.SEARCH.FILTER_STATE',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'navigation',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-search-filter-state',
};

/**
 * @param {{ searchViolations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromSearchFilterReport(report, url = '') {
  const violations = Array.isArray(report?.searchViolations) ? report.searchViolations : [];
  if (!violations.length) return [];

  const messages = {
    'missing-result-count': 'Search or filter results do not show a visible result count.',
    'missing-active-filter-state': 'Active filters are not surfaced to the user.',
    'missing-clear-all': 'Filter UI lacks a clear-all or reset affordance.',
    'missing-empty-recovery': 'Empty search/filter results lack recovery guidance.',
  };

  return violations.slice(0, 6).map((v) => ({
    severity: 'warn',
    area: 'navigation',
    message: messages[String(v.issue)] || 'Search/filter state UX is incomplete.',
    evidence: `issue=${String(v.issue || '')}${url ? ` url=${url}` : ''}`,
    remediation:
      'Show result counts, active filter chips, a clear-all control, and empty-state copy with next steps.',
  }));
}

export async function run({ metrics, page, url }) {
  const report = metrics?.genericWebsitePageReport;
  if (report) return findingsFromSearchFilterReport(report, url || metrics?.url || '');
  if (!page) return [];
  const { collectGenericWebsitePageReport } = await import('../../../lib/generic-website-collectors.js');
  const collected = await collectGenericWebsitePageReport(page);
  return findingsFromSearchFilterReport(collected, url || metrics?.url || '');
}
