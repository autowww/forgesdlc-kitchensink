/**
 * DET.APP.DATA_REFRESH_STALENESS — data-heavy screens show freshness, stale/error state, and refresh action.
 */

export const rule = {
  id: 'DET.APP.DATA_REFRESH_STALENESS',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-data-refresh-staleness',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromDataRefreshReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, 8).map((v) => ({
    severity: 'warn',
    area: 'informationArchitecture',
    message:
      'A data-heavy workspace is missing last-updated/stale indicators or a refresh/retry action.',
    evidence: `panel="${String(v.panelHint || '')}" rows=${Number(v.rowCount) || 0}`,
    remediation:
      'Expose [data-last-updated] or visible "Last updated" copy plus Refresh/Retry when fetch may fail or go stale.',
  })).map((f) => (url ? { ...f, evidence: `${f.evidence} url=${url}` } : f));
}

/** @param {import('playwright').Page} page */
export async function collectDataRefreshReport(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const visible = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 4 && rect.height > 4;
    };

    const freshnessRe = /(last updated|updated:|refreshed|stale|as of|fetched)/i;
    const refreshControlRe = /(refresh|reload|retry|sync)/i;

    const panels = [
      ...document.querySelectorAll('[data-data-panel], [data-studio-workspace], .studio-page, main'),
    ].filter(visible);

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];

    for (const panel of panels) {
      const rows = panel.querySelectorAll('table tbody tr, [role="row"]:not([role="columnheader"])').length;
      const dataHeavy = rows >= 5 || panel.hasAttribute('data-data-panel');
      if (!dataHeavy) continue;

      const text = norm(panel.innerText || '');
      const hasFreshness =
        freshnessRe.test(text)
        || panel.querySelector('[data-last-updated], time[datetime], [data-stale], [data-fetch-state]');
      const hasRefresh = panel.querySelector(
        'button, a[href], [role="button"]',
      )
        && [...panel.querySelectorAll('button, a[href], [role="button"]')].some((el) => {
          if (!visible(el)) return false;
          const label = norm(
            el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || '',
          );
          return refreshControlRe.test(label) || el.hasAttribute('data-refresh');
        });

      if (!hasFreshness || !hasRefresh) {
        violations.push({
          panelHint: panel.id ? `#${panel.id}` : 'data-panel',
          rowCount: rows,
        });
      }
    }

    return { violations: violations.slice(0, 8) };
  });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.dataRefreshReport
    ?? (page ? await collectDataRefreshReport(page) : null);
  if (!report?.violations?.length) return [];
  return findingsFromDataRefreshReport(report, url || metrics?.url || '');
}
