/**
 * DET.APP.TAB_PANEL — tablist selected tab wires to a visible panel.
 */

export const rule = {
  id: 'DET.APP.TAB_PANEL',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'accessibility',
  scoreDimension: 'accessibilitySemanticsMeta',
  defaultSeverity: 'major',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-tab-panel',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromTabPanelReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, 6).map((v) => ({
    severity: 'major',
    area: 'accessibility',
    message:
      'A selected tab is missing aria-controls, aria-selected, or its panel is hidden.',
    evidence: `tablist="${String(v.tablistHint || '')}" issue=${String(v.issue || '')}`,
    remediation:
      'Set aria-selected="true" on the active tab, aria-controls pointing at the panel id, and show the panel (not hidden).',
  })).map((f) => (url ? { ...f, evidence: `${f.evidence} url=${url}` } : f));
}

/** @param {import('playwright').Page} page */
export async function collectTabPanelReport(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

    const panelVisible = (panel) => {
      if (!panel) return false;
      if (panel.hasAttribute('hidden')) return false;
      if (panel.getAttribute('aria-hidden') === 'true') return false;
      const style = window.getComputedStyle(panel);
      return style.display !== 'none' && style.visibility !== 'hidden';
    };

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];

    for (const tablist of document.querySelectorAll('[role="tablist"]')) {
      const tabs = [...tablist.querySelectorAll('[role="tab"]')];
      if (!tabs.length) continue;

      const selected = tabs.filter(
        (t) => t.getAttribute('aria-selected') === 'true' || t.classList.contains('active'),
      );
      const tab = selected[0] || tabs[0];
      const tablistHint = tablist.id ? `#${tablist.id}` : 'tablist';

      if (tab.getAttribute('aria-selected') !== 'true' && selected.length) {
        violations.push({ tablistHint, issue: 'aria-selected-missing' });
        continue;
      }

      const controls = tab.getAttribute('aria-controls');
      if (!controls) {
        violations.push({ tablistHint, issue: 'missing-aria-controls' });
        continue;
      }

      const panel = document.getElementById(controls);
      if (!panel || !panelVisible(panel)) {
        violations.push({ tablistHint, issue: 'panel-hidden-or-missing' });
      }
    }

    return { violations: violations.slice(0, 10) };
  });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.tabPanelReport
    ?? (page ? await collectTabPanelReport(page) : null);
  if (!report?.violations?.length) return [];
  return findingsFromTabPanelReport(report, url || metrics?.url || '');
}
