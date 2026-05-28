/**
 * DET.APP.PRIMARY_STATE — at most one visible primary state region per studio workspace.
 */

export const rule = {
  id: 'DET.APP.PRIMARY_STATE',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'major',
  priorityWeight: 9,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-primary-state',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromPrimaryStateReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, 6).map((v) => ({
    severity: 'major',
    area: 'informationArchitecture',
    message:
      'More than one primary state is visible in a workspace; show only one of empty, ready, running, completed, or error.',
    evidence: `workspace="${String(v.workspaceHint || '')}" visible_states=${Number(v.visibleCount) || 0}`,
    remediation:
      'Wrap the active state in a single [data-studio-primary-state] region and hide other .studio-state--* panels.',
  })).map((f) => (url ? { ...f, evidence: `${f.evidence} url=${url}` } : f));
}

/** @param {import('playwright').Page} page */
export async function collectPrimaryStateReport(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

    const visible = (el) => {
      if (!el || el.nodeType !== 1) return false;
      if (el.getAttribute('aria-hidden') === 'true') return false;
      if (el.hasAttribute('hidden') || el.hasAttribute('inert')) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 4 && rect.height > 4;
    };

    const workspaceSelector = [
      '[data-studio-workspace]',
      '.studio-page:not([hidden])',
      '.studio-page[aria-hidden="false"]',
    ].join(',');

    const stateSelector = [
      '[data-studio-primary-state]',
      '[class*="studio-state--"]',
    ].join(',');

    const hintFor = (el) => {
      const id = el.id ? `#${el.id}` : '';
      const ws = el.getAttribute('data-studio-workspace') || '';
      return norm(`${el.tagName.toLowerCase()}${id}${ws ? `[workspace=${ws}]` : ''}`);
    };

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];

    for (const ws of document.querySelectorAll(workspaceSelector)) {
      if (!visible(ws)) continue;
      const states = [...ws.querySelectorAll(stateSelector)].filter(visible);
      if (states.length <= 1) continue;
      violations.push({
        workspaceHint: hintFor(ws),
        visibleCount: states.length,
      });
    }

    return { violations: violations.slice(0, 8) };
  });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.primaryStateReport
    ?? (page ? await collectPrimaryStateReport(page) : null);
  if (!report?.violations?.length) return [];
  return findingsFromPrimaryStateReport(report, url || metrics?.url || '');
}
