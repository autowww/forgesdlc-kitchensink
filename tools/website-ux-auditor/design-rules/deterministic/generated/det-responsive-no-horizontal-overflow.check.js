/**
 * DET.RESPONSIVE.NO_HORIZONTAL_OVERFLOW — no horizontal scroll at common breakpoints.
 */

export const rule = {
  id: 'DET.RESPONSIVE.NO_HORIZONTAL_OVERFLOW',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'first-screen',
  scoreDimension: 'visualRhythmFirstScreen',
  defaultSeverity: 'major',
  priorityWeight: 9,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-responsive-no-horizontal-overflow',
};

/**
 * @param {{ overflowByViewport?: Record<string, { overflowPx?: number, clippedPrimary?: boolean }> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromOverflowReport(report, url = '') {
  const byVp = report?.overflowByViewport || {};
  const findings = [];
  for (const [vp, data] of Object.entries(byVp)) {
    const px = Number(data?.overflowPx || 0);
    if (px > 8) {
      findings.push({
        severity: 'major',
        area: 'first-screen',
        message: `Page content overflows horizontally at the ${vp} viewport.`,
        evidence: `viewport=${vp} overflowPx=${px}${url ? ` url=${url}` : ''}`,
        remediation:
          'Constrain max-width on grids/media, use responsive utilities, and test 390px / 768px / 1280px without document scrollWidth exceeding clientWidth.',
      });
    }
    if (data?.clippedPrimary) {
      findings.push({
        severity: 'warn',
        area: 'first-screen',
        message: `Primary controls appear clipped at the ${vp} viewport.`,
        evidence: `viewport=${vp} clippedPrimary=1${url ? ` url=${url}` : ''}`,
        remediation: 'Reflow hero CTAs and toolbar rows so buttons remain fully visible without horizontal panning.',
      });
    }
  }
  return findings.slice(0, 6);
}

export async function run({ metrics, page, url }) {
  const report = metrics?.genericWebsitePageReport;
  if (report?.overflowByViewport) {
    return findingsFromOverflowReport(report, url || metrics?.url || '');
  }
  if (!page) return [];
  const { collectGenericWebsitePageReport } = await import('../../../lib/generic-website-collectors.js');
  const collected = await collectGenericWebsitePageReport(page);
  return findingsFromOverflowReport(collected, url || metrics?.url || '');
}
