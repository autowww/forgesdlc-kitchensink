/**
 * DET.APP.EMPTY_LOADING_ERROR_SUCCESS — workspaces expose one primary state with heading and next action.
 */

const STATE_MARKERS = [
  '[data-studio-primary-state]',
  '[data-workspace-state]',
  '.studio-state--empty',
  '.studio-state--loading',
  '.studio-state--error',
  '.studio-state--running',
  '.studio-state--completed',
  '.studio-state--success',
  '[aria-busy="true"]',
];

export const rule = {
  id: 'DET.APP.EMPTY_LOADING_ERROR_SUCCESS',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'major',
  priorityWeight: 9,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-empty-loading-error-success',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromWorkspaceStateReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, 8).map((v) => ({
    severity: 'major',
    area: 'informationArchitecture',
    message:
      v.issue === 'no-primary-state'
        ? 'A data workspace does not expose a single primary empty/loading/error/success/running state region.'
        : v.issue === 'missing-heading'
          ? 'The visible workspace state is missing a heading that explains the current mode.'
          : 'An empty or error workspace state is missing a clear next action (button or link).',
    evidence: `workspace="${String(v.workspaceHint || '')}" issue=${String(v.issue || '')} states=${Number(v.stateCount) || 0}`,
    remediation:
      'Use one visible [data-studio-primary-state] panel per workspace with an h2–h3 heading and a primary next action for empty/error paths.',
  })).map((f) => (url ? { ...f, evidence: `${f.evidence} url=${url}` } : f));
}

/** @param {import('playwright').Page} page */
export async function collectWorkspaceStateReport(page) {
  return page.evaluate((stateSelectorList) => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const visible = (el) => {
      if (!el || el.nodeType !== 1) return false;
      if (el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('hidden')) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 4 && rect.height > 4;
    };

    const stateSelector = stateSelectorList.join(',');
    const needsActionRe = /(empty|error|failed|no data)/i;

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];

    for (const ws of document.querySelectorAll(
      '[data-studio-workspace], .studio-page:not([hidden]), [data-workspace]',
    )) {
      if (!visible(ws)) continue;
      const states = [...ws.querySelectorAll(stateSelector)].filter(visible);
      const dataHeavy =
        ws.querySelector('table tbody tr, [role="grid"] [role="row"], [data-data-panel]')
        || norm(ws.getAttribute('data-workspace') || '').includes('data');

      if (dataHeavy && !states.length) {
        violations.push({ issue: 'no-primary-state', workspaceHint: ws.id || 'workspace', stateCount: 0 });
        continue;
      }
      if (!states.length) continue;

      const primary = states.find((el) => el.hasAttribute('data-studio-primary-state')) || states[0];
      const heading = primary.querySelector('h1,h2,h3,[role="heading"]');
      if (!heading || !visible(heading) || norm(heading.textContent).length < 3) {
        violations.push({
          issue: 'missing-heading',
          workspaceHint: ws.id || 'workspace',
          stateCount: states.length,
        });
      }

      const stateText = norm(primary.innerText || '');
      if (needsActionRe.test(stateText) || primary.matches('.studio-state--empty,.studio-state--error')) {
        const action = primary.querySelector(
          'button:not([disabled]), a[href], [role="button"]:not([aria-disabled="true"])',
        );
        if (!action || !visible(action)) {
          violations.push({
            issue: 'missing-next-action',
            workspaceHint: ws.id || 'workspace',
            stateCount: states.length,
          });
        }
      }
    }

    return { violations: violations.slice(0, 10) };
  }, STATE_MARKERS);
}

export async function run({ metrics, page, url }) {
  const report = metrics?.workspaceStateReport
    ?? (page ? await collectWorkspaceStateReport(page) : null);
  if (!report?.violations?.length) return [];
  return findingsFromWorkspaceStateReport(report, url || metrics?.url || '');
}
