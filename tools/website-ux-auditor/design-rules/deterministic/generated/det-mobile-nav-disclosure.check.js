/**
 * DET.MOBILE.NAV_DISCLOSURE — mobile nav opens/closes with accessible close affordance.
 */

export const rule = {
  id: 'DET.MOBILE.NAV_DISCLOSURE',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'major',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-mobile-nav-disclosure',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>>, skipped?: boolean } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromMobileNavReport(report, url = '') {
  if (!report || report.skipped) return [];
  const violations = Array.isArray(report.violations) ? report.violations : [];
  if (!violations.length) return [];

  const messages = {
    'nav-does-not-open': 'Mobile navigation toggle does not open the menu panel.',
    'nav-does-not-close': 'Mobile navigation does not close after activating the close control.',
    'missing-close-label': 'Open mobile navigation lacks a visible Close label or aria-label.',
    'body-scroll-not-locked': 'Background scroll is not locked while mobile navigation is open.',
    'nav-toggle-interaction-failed': 'Mobile navigation toggle could not be exercised automatically.',
  };

  return violations.slice(0, 5).map((v) => ({
    severity: 'major',
    area: 'accessibility',
    message: messages[String(v.issue)] || 'Mobile navigation disclosure failed a deterministic check.',
    evidence: `issue=${String(v.issue || '')}${url ? ` url=${url}` : ''}`,
    remediation:
      'Use a button with aria-expanded, aria-controls, labelled close control, body scroll lock while open, and restore focus on close.',
  }));
}

export async function run({ metrics, page, url }) {
  const report = metrics?.genericWebsitePageReport?.mobileNavReport;
  if (report) return findingsFromMobileNavReport(report, url || metrics?.url || '');
  if (!page) return [];
  const { collectMobileNavInteractionReport } = await import('../../../lib/generic-website-collectors.js');
  const collected = await collectMobileNavInteractionReport(page);
  return findingsFromMobileNavReport(collected, url || metrics?.url || '');
}
