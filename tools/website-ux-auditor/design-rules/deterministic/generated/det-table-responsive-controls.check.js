/**
 * DET.TABLE.RESPONSIVE_CONTROLS — headers, containment, sort labels, pagination on long tables.
 */

export const rule = {
  id: 'DET.TABLE.RESPONSIVE_CONTROLS',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'major',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-table-responsive-controls',
};

/**
 * @param {{ tableViolations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromTableResponsiveReport(report, url = '') {
  const violations = Array.isArray(report?.tableViolations) ? report.tableViolations : [];
  if (!violations.length) return [];

  const messages = {
    'missing-headers': 'A dense data table lacks header cells.',
    'missing-horizontal-containment': 'A wide table overflows without horizontal scroll containment.',
    'sort-missing-label': 'Table sort controls lack accessible labels.',
    'row-action-unlabeled': 'Table row actions lack visible or accessible names.',
    'missing-pagination': 'A long table lacks pagination or result count.',
  };

  return violations.slice(0, 8).map((v) => ({
    severity: 'major',
    area: 'accessibility',
    message: messages[String(v.issue)] || 'Table responsive control check failed.',
    evidence: `issue=${String(v.issue || '')} rows=${Number(v.rows) || 0}${url ? ` url=${url}` : ''}`,
    remediation:
      'Wrap tables in overflow-x containers, add <th scope>, label sort buttons, name row actions, and paginate beyond ~20 rows.',
  }));
}

export async function run({ metrics, page, url }) {
  const report = metrics?.genericWebsitePageReport;
  if (report) return findingsFromTableResponsiveReport(report, url || metrics?.url || '');
  if (!page) return [];
  const { collectGenericWebsitePageReport } = await import('../../../lib/generic-website-collectors.js');
  const collected = await collectGenericWebsitePageReport(page);
  return findingsFromTableResponsiveReport(collected, url || metrics?.url || '');
}
