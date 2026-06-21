/**
 * DET.APP.ERROR_BOUNDARY_RECOVERY — runtime failures expose a recovery region instead of a blank shell.
 */

export const rule = {
  id: 'DET.APP.ERROR_BOUNDARY_RECOVERY',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'major',
  priorityWeight: 9,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-error-boundary-recovery',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromErrorBoundaryReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, 6).map((v) => ({
    severity: 'major',
    area: 'informationArchitecture',
    message:
      'A route or workspace appears failed without a visible error boundary, alert, or retry path.',
    evidence: `issue=${String(v.issue || '')} workspace="${String(v.workspaceHint || '')}"`,
    remediation:
      'Wrap route outlets in an error boundary with role="alert" or [data-error-boundary], visible message, and a retry/back action.',
  })).map((f) => (url ? { ...f, evidence: `${f.evidence} url=${url}` } : f));
}

/** @param {import('playwright').Page} page */
export async function collectErrorBoundaryReport(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const visible = (el) => {
      if (!el || el.nodeType !== 1) return false;
      if (el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('hidden')) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 4 && rect.height > 4;
    };

    const hasRecoveryChrome = (root) => {
      if (!root) return false;
      const selectors = [
        '[data-error-boundary]',
        '[data-studio-error-recovery]',
        '.studio-state--error',
        '[role="alert"]',
      ];
      for (const sel of selectors) {
        for (const el of root.querySelectorAll(sel)) {
          if (!visible(el)) continue;
          const text = norm(el.innerText || el.textContent || '');
          const hasAction = el.querySelector(
            'button, a[href], [role="button"], [data-retry], [data-action="retry"]',
          );
          if (text.length >= 12 || hasAction) return true;
        }
      }
      return false;
    };

    const workspaceSelector = '[data-studio-workspace], .studio-page:not([hidden]), main#main, main';
    /** @type {Array<Record<string, unknown>>} */
    const violations = [];

    for (const ws of document.querySelectorAll(workspaceSelector)) {
      if (!visible(ws)) continue;
      const text = norm(ws.innerText || '');
      const hasContent =
        text.length >= 32
        || ws.querySelector('h1,h2,table tbody tr,form,[data-studio-primary-state]');
      if (hasContent || hasRecoveryChrome(ws)) continue;

      const reactOverlay = document.querySelector(
        '[data-reactroot] ~ div, vite-error-overlay, #webpack-dev-server-client-overlay',
      );
      if (reactOverlay && visible(reactOverlay)) {
        violations.push({
          issue: 'dev-overlay-only',
          workspaceHint: ws.id ? `#${ws.id}` : ws.tagName.toLowerCase(),
        });
        continue;
      }

      violations.push({
        issue: 'blank-without-recovery',
        workspaceHint: ws.id ? `#${ws.id}` : ws.tagName.toLowerCase(),
      });
    }

    return { violations: violations.slice(0, 8) };
  });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.errorBoundaryReport
    ?? (page ? await collectErrorBoundaryReport(page) : null);
  if (!report?.violations?.length) return [];
  return findingsFromErrorBoundaryReport(report, url || metrics?.url || '');
}
