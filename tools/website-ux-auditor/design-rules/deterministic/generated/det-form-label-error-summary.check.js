/**
 * DET.FORM.LABEL_ERROR_SUMMARY — visible labels, required markers, inline errors, error summary.
 */

export const rule = {
  id: 'DET.FORM.LABEL_ERROR_SUMMARY',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'major',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-form-label-error-summary',
};

/**
 * @param {{ formViolations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromFormReport(report, url = '') {
  const violations = Array.isArray(report?.formViolations) ? report.formViolations : [];
  if (!violations.length) return [];

  const messages = {
    'missing-label': 'A form field lacks a visible label or accessible name.',
    'missing-required-marker': 'Required fields are not marked for sighted users.',
    'missing-inline-error': 'Invalid fields lack associated inline error text.',
    'missing-error-summary': 'Multi-field forms lack a submission error summary region.',
  };

  return violations.slice(0, 8).map((v) => ({
    severity: 'major',
    area: 'accessibility',
    message: messages[String(v.issue)] || 'Form accessibility check failed.',
    evidence: `issue=${String(v.issue || '')} fields=${Number(v.fieldCount) || 0}${url ? ` url=${url}` : ''}`,
    remediation:
      String(v.issue) === 'missing-error-summary'
        ? 'Add a role="alert" error summary listing all field errors above the submit button on failed POST.'
        : 'Associate each control with <label for>, aria-label, required cues, and aria-describedby error text.',
  }));
}

export async function run({ metrics, page, url }) {
  const report = metrics?.genericWebsitePageReport;
  if (report) return findingsFromFormReport(report, url || metrics?.url || '');
  if (!page) return [];
  const { collectGenericWebsitePageReport } = await import('../../../lib/generic-website-collectors.js');
  const collected = await collectGenericWebsitePageReport(page);
  return findingsFromFormReport(collected, url || metrics?.url || '');
}
