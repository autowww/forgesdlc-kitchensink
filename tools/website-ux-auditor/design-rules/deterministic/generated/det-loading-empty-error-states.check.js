/**
 * DET.LOADING.EMPTY_ERROR_STATES — mutually exclusive states with recovery copy.
 */

export const rule = {
  id: 'DET.LOADING.EMPTY_ERROR_STATES',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'major',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-loading-empty-error-states',
};

/**
 * @param {{ loadingViolations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromLoadingStateReport(report, url = '') {
  const violations = Array.isArray(report?.loadingViolations) ? report.loadingViolations : [];
  if (!violations.length) return [];

  const messages = {
    'overlapping-states': 'Loading, empty, error, and success states appear visible at the same time.',
    'empty-missing-recovery': 'Empty state copy lacks a clear next step or recovery action.',
    'error-missing-recovery': 'Error state copy lacks retry or recovery guidance.',
  };

  return violations.slice(0, 8).map((v) => ({
    severity: 'major',
    area: 'informationArchitecture',
    message: messages[String(v.issue)] || 'Loading/empty/error state machine is incomplete.',
    evidence: `issue=${String(v.issue || '')}${v.states ? ` states=${v.states}` : ''}${url ? ` url=${url}` : ''}`,
    remediation:
      'Show one primary state at a time and include actionable recovery copy (retry, create, contact support).',
  }));
}

export async function run({ metrics, page, url }) {
  const report = metrics?.genericWebsitePageReport;
  if (report) return findingsFromLoadingStateReport(report, url || metrics?.url || '');
  if (!page) return [];
  const { collectGenericWebsitePageReport } = await import('../../../lib/generic-website-collectors.js');
  const collected = await collectGenericWebsitePageReport(page);
  return findingsFromLoadingStateReport(collected, url || metrics?.url || '');
}
