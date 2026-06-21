/**
 * DET.APP.PRIMITIVE_STYLES — Mounted react roots load forge-react-primitives / ks-fe styling.
 */

export const MAX_APP_PRIMITIVE_STYLES_FINDINGS = 8;

const PRIMITIVE_ROOT_SELECTOR = [
  '[data-ks-react-root="true"]',
  '[data-ks-type="react-primitive"][data-ks-hash]',
].join(',');

export const rule = {
  id: 'DET.APP.PRIMITIVE_STYLES',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'minor',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-primitive_styles',
};

/**
 * @param {{
 *   skipped?: boolean,
 *   primitiveRootCount?: number,
 *   violations?: Array<Record<string, unknown>>,
 * } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromAppPrimitiveStylesReport(report, url = '') {
  if (!report || report.skipped) return [];
  const violations = Array.isArray(report.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = violations.slice(0, MAX_APP_PRIMITIVE_STYLES_FINDINGS).map((v) => {
    const hash = String(v.hash || '?');
    const kind = String(v.kind || 'unstyled-root');
    let message = 'A KS React primitive mount appears unstyled (missing forge-react-primitives bundle).';
    if (kind === 'missing-stylesheet') {
      message = 'Page with react-primitive roots does not link forge-react-primitives.css.';
    } else if (kind === 'missing-ks-fe-class') {
      message = 'A visible react-primitive root lacks ks-fe-* styling hooks.';
    }

    return {
      severity: 'minor',
      area: 'visual-catalog',
      hash: hash !== '?' ? hash : undefined,
      message,
      evidence: `kind=${kind} hash=${hash} ksName=${String(v.ksName || '')}`,
      remediation:
        'Link `css/forge-react-primitives.css` (or consumer bundle that includes it) before mounting react roots.',
    };
  });

  if (url) {
    for (const f of findings) f.evidence = `${f.evidence} url=${url}`;
  }
  return findings;
}

/** @param {import('playwright').Page} page */
export async function collectAppPrimitiveStylesReport(page) {
  return page.evaluate(({ PRIMITIVE_ROOT_SELECTOR }) => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

    const visible = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden'
        && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
    };

    const roots = [...document.querySelectorAll(PRIMITIVE_ROOT_SELECTOR)].filter(visible);
    if (!roots.length) return { skipped: true, primitiveRootCount: 0, violations: [] };

    const hasPrimitivesCss = [...document.querySelectorAll('link[rel="stylesheet"]')].some((link) => {
      const href = norm(link.getAttribute('href') || '');
      return href.includes('forge-react-primitives');
    });

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];

    if (!hasPrimitivesCss) {
      violations.push({ kind: 'missing-stylesheet', hash: '?', ksName: '' });
    }

    for (const root of roots) {
      const hash = norm(root.getAttribute('data-ks-hash') || root.getAttribute('hash') || '?');
      const ksName = norm(root.getAttribute('data-ks-name') || '');
      const className = norm(root.className);
      if (!className.split(/\s+/).some((c) => c.startsWith('ks-fe-'))) {
        violations.push({ kind: 'missing-ks-fe-class', hash, ksName });
      }
    }

    return {
      skipped: false,
      primitiveRootCount: roots.length,
      violations: violations.slice(0, 8),
    };
  }, { PRIMITIVE_ROOT_SELECTOR });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.appPrimitiveStylesReport
    ?? (page ? await collectAppPrimitiveStylesReport(page) : null);
  if (!report || report.skipped || !(report.violations || []).length) return [];
  return findingsFromAppPrimitiveStylesReport(report, url || metrics?.url || '');
}
