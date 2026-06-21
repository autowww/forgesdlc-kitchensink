/**
 * DET.APP.BULK_ACTION_SCOPE — bulk/destructive actions show selected count and scope before execution.
 */

export const rule = {
  id: 'DET.APP.BULK_ACTION_SCOPE',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'trustAndEcosystemTruth',
  scoreDimension: 'trustAndEcosystemTruth',
  defaultSeverity: 'major',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-bulk-action-scope',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromBulkActionScopeReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, 8).map((v) => ({
    severity: 'major',
    area: 'trustAndEcosystemTruth',
    message:
      'A bulk or destructive toolbar is visible without stating how many items are selected or the action scope.',
    evidence: `toolbar="${String(v.toolbarHint || '')}" destructive=${Boolean(v.destructive)}`,
    remediation:
      'Show "N selected" (or aria-label with count) adjacent to bulk Delete/Archive actions before execution.',
  })).map((f) => (url ? { ...f, evidence: `${f.evidence} url=${url}` } : f));
}

/** @param {import('playwright').Page} page */
export async function collectBulkActionScopeReport(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const visible = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 4 && rect.height > 4;
    };

    const countRe = /\b\d+\s+selected\b/i;
    const scopeRe = /\b(selected|items?|rows?|records?)\b/i;

    const toolbars = [
      ...document.querySelectorAll(
        '[data-bulk-actions], .bulk-actions, [role="toolbar"][aria-label*="bulk" i], [data-selection-bar]',
      ),
    ].filter(visible);

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];

    for (const bar of toolbars) {
      const text = norm(bar.innerText || bar.textContent || '');
      const aria = norm(bar.getAttribute('aria-label') || '');
      const combined = `${text} ${aria}`;
      const destructive = Boolean(
        bar.querySelector('button.btn-danger, [data-destructive], [data-action="delete"]'),
      );

      if (countRe.test(combined) || (scopeRe.test(combined) && /\d+/.test(combined))) continue;
      if (!destructive && !bar.querySelector('input[type="checkbox"]:checked')) continue;

      violations.push({
        toolbarHint: bar.id ? `#${bar.id}` : 'bulk-toolbar',
        destructive,
      });
    }

    const checked = document.querySelectorAll(
      'table input[type="checkbox"]:checked, [role="row"] [aria-selected="true"]',
    );
    if (checked.length >= 2) {
      const nearbyToolbar = [
        ...document.querySelectorAll('[role="toolbar"], .btn-toolbar, [data-bulk-actions]'),
      ].find((el) => visible(el));
      if (nearbyToolbar) {
        const text = norm(nearbyToolbar.innerText || '');
        if (!countRe.test(text) && !/\d+/.test(text)) {
          violations.push({
            toolbarHint: nearbyToolbar.id ? `#${nearbyToolbar.id}` : 'selection-toolbar',
            destructive: Boolean(nearbyToolbar.querySelector('.btn-danger, [data-destructive]')),
          });
        }
      }
    }

    return { violations: violations.slice(0, 10) };
  });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.bulkActionScopeReport
    ?? (page ? await collectBulkActionScopeReport(page) : null);
  if (!report?.violations?.length) return [];
  return findingsFromBulkActionScopeReport(report, url || metrics?.url || '');
}
