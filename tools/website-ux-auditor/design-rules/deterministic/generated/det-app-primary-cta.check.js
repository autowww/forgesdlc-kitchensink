/**
 * DET.APP.PRIMARY_CTA — at most one primary CTA per studio workspace viewport.
 */

export const MAX_PRIMARY_CTAS = 1;

export const rule = {
  id: 'DET.APP.PRIMARY_CTA',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'conversion',
  scoreDimension: 'trustAndEcosystemTruth',
  defaultSeverity: 'major',
  priorityWeight: 9,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-primary-cta',
};

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromPrimaryCtaReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, 6).map((v) => ({
    severity: Number(v.primaryCount) > 2 ? 'critical' : 'major',
    area: 'conversion',
    message:
      'A workspace exposes more than one primary action; keep a single dominant CTA in the primary column.',
    evidence: `workspace="${String(v.workspaceHint || '')}" primary_ctas=${Number(v.primaryCount) || 0}`,
    remediation:
      'Mark one control with [data-studio-primary-cta] or demote extras to secondary button styles.',
  })).map((f) => (url ? { ...f, evidence: `${f.evidence} url=${url}` } : f));
}

/** @param {import('playwright').Page} page */
export async function collectPrimaryCtaReport(page) {
  return page.evaluate(({ maxAllowed }) => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

    const visible = (el) => {
      if (!el || el.nodeType !== 1) return false;
      if (el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('hidden')) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 4 && rect.height > 4;
    };

    const isPrimaryCta = (el) => {
      if (!visible(el)) return false;
      if (el.hasAttribute('data-studio-primary-cta')) return true;
      const tag = el.tagName.toLowerCase();
      if (tag !== 'button' && tag !== 'a') return false;
      const cls = String(el.className || '').toLowerCase();
      if (/\bbtn-primary\b/.test(cls) && !el.disabled && el.getAttribute('aria-disabled') !== 'true') {
        return true;
      }
      return false;
    };

    const workspaceRoots = document.querySelectorAll(
      '[data-studio-workspace], .studio-page:not([hidden])',
    );

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];

    for (const ws of workspaceRoots) {
      if (!visible(ws)) continue;
      const primaries = [...ws.querySelectorAll(
        '[data-studio-primary-cta], .btn-primary, button.btn-primary, a.btn-primary',
      )].filter(isPrimaryCta);
      if (primaries.length <= maxAllowed) continue;
      const id = ws.id ? `#${ws.id}` : ws.tagName.toLowerCase();
      violations.push({
        workspaceHint: norm(id),
        primaryCount: primaries.length,
      });
    }

    return { maxAllowed, violations: violations.slice(0, 8) };
  }, { maxAllowed: MAX_PRIMARY_CTAS });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.primaryCtaReport
    ?? (page ? await collectPrimaryCtaReport(page) : null);
  if (!report?.violations?.length) return [];
  return findingsFromPrimaryCtaReport(report, url || metrics?.url || '');
}
