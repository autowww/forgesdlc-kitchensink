/**
 * DET.APP.SHELL_INTEGRATION — Flag Bootstrap alert/badge metaphors adjacent to ks-fe react roots.
 */

export const MAX_APP_SHELL_INTEGRATION_FINDINGS = 8;

const WORKSPACE_SELECTOR = [
  '[data-studio-workspace]',
  '[data-ks-app-shell]',
  '.studio-page',
  'main[role="main"]',
].join(',');

const PRIMITIVE_NEAR_SELECTOR = [
  '[data-ks-react-root="true"]',
  '[data-ks-type="react-primitive"]',
  '.ks-fe-status-banner',
  '.ks-fe-stagebar',
].join(',');

export const rule = {
  id: 'DET.APP.SHELL_INTEGRATION',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'minor',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-shell_integration',
};

/**
 * @param {{
 *   skipped?: boolean,
 *   violations?: Array<Record<string, unknown>>,
 * } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromAppShellIntegrationReport(report, url = '') {
  if (!report || report.skipped) return [];
  const violations = Array.isArray(report.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = violations.slice(0, MAX_APP_SHELL_INTEGRATION_FINDINGS).map((v) => {
    const kind = String(v.kind || 'mixed-metaphor');
    const tag = String(v.tag || 'element');
    return {
      severity: 'minor',
      area: 'informationArchitecture',
      message:
        kind === 'bootstrap-alert-near-primitive'
          ? 'Bootstrap alert markup sits beside a KS react-primitive — use ForgeStatusBanner or ks-fe primitives.'
          : 'Bootstrap badge markup sits beside a KS react-primitive — align severity with ks-fe state tokens.',
      evidence: `kind=${kind} <${tag}> class=${String(v.className || '').slice(0, 60)}`,
      remediation:
        'Replace ad-hoc Bootstrap alert/badge patterns with governed react primitives (see FAM-react-primitives.md).',
    };
  });

  if (url) {
    for (const f of findings) f.evidence = `${f.evidence} url=${url}`;
  }
  return findings;
}

/** @param {import('playwright').Page} page */
export async function collectAppShellIntegrationReport(page) {
  return page.evaluate(({ WORKSPACE_SELECTOR, PRIMITIVE_NEAR_SELECTOR }) => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

    const workspaces = [...document.querySelectorAll(WORKSPACE_SELECTOR)];
    const scope = workspaces.length ? workspaces : [document.body];

    const isNearPrimitive = (el) => {
      let node = el.parentElement;
      let depth = 0;
      while (node && depth < 4) {
        if (node.querySelector && node.querySelector(PRIMITIVE_NEAR_SELECTOR)) return true;
        if (node.matches && node.matches(PRIMITIVE_NEAR_SELECTOR)) return true;
        node = node.parentElement;
        depth += 1;
      }
      const following = el.nextElementSibling;
      if (following?.matches?.(PRIMITIVE_NEAR_SELECTOR)) return true;
      const prev = el.previousElementSibling;
      if (prev?.matches?.(PRIMITIVE_NEAR_SELECTOR)) return true;
      return false;
    };

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];

    for (const ws of scope) {
      for (const el of ws.querySelectorAll('.alert, [class*=" alert-"]')) {
        if (!isNearPrimitive(el)) continue;
        violations.push({
          kind: 'bootstrap-alert-near-primitive',
          tag: el.tagName.toLowerCase(),
          className: norm(el.className),
        });
      }
      for (const el of ws.querySelectorAll('.badge, [class*=" badge bg-"]')) {
        if (!isNearPrimitive(el)) continue;
        violations.push({
          kind: 'bootstrap-badge-near-primitive',
          tag: el.tagName.toLowerCase(),
          className: norm(el.className),
        });
      }
    }

    if (!violations.length) return { skipped: true, violations: [] };
    return { skipped: false, violations: violations.slice(0, 8) };
  }, { WORKSPACE_SELECTOR, PRIMITIVE_NEAR_SELECTOR });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.appShellIntegrationReport
    ?? (page ? await collectAppShellIntegrationReport(page) : null);
  if (!report || report.skipped || !(report.violations || []).length) return [];
  return findingsFromAppShellIntegrationReport(report, url || metrics?.url || '');
}
