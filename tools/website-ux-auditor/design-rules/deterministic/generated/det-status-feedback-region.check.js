/**
 * DET.STATUS.FEEDBACK_REGION — user actions surface aria-live / status feedback.
 */

export const rule = {
  id: 'DET.STATUS.FEEDBACK_REGION',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-status-feedback-region',
};

/**
 * @param {{ statusViolations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromStatusFeedbackReport(report, url = '') {
  const violations = Array.isArray(report?.statusViolations) ? report.statusViolations : [];
  if (!violations.length) return [];

  const messages = {
    'submit-without-live-region': 'Forms with submit actions lack an aria-live or status feedback region.',
    'actions-without-feedback-region': 'Interactive actions lack visible status or live-region feedback.',
  };

  return violations.slice(0, 4).map((v) => ({
    severity: 'warn',
    area: 'accessibility',
    message: messages[String(v.issue)] || 'Status feedback region is missing.',
    evidence: `issue=${String(v.issue || '')}${url ? ` url=${url}` : ''}`,
    remediation:
      'Add role="status" or aria-live="polite" regions updated after submit/async actions; pair with visible confirmation text.',
  }));
}

export async function run({ metrics, page, url }) {
  const report = metrics?.genericWebsitePageReport;
  if (report) return findingsFromStatusFeedbackReport(report, url || metrics?.url || '');
  if (!page) return [];
  const { collectGenericWebsitePageReport } = await import('../../../lib/generic-website-collectors.js');
  const collected = await collectGenericWebsitePageReport(page);
  return findingsFromStatusFeedbackReport(collected, url || metrics?.url || '');
}
