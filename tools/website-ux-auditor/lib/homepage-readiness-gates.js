import { pageContext } from '../checks/context.js';

/** Stable ids for scorer Markdown + JSON consumers */
export const HOMEPAGE_GATE_IDS = {
  shellBlocker: 'homepage_shell_blocker',
  firstScreenCritical: 'first_screen_clarity_critical',
  productVisualBlocker: 'product_visual_blocker',
  productVisualCritical: 'product_visual_critical',
  storylineCritical: 'storyline_flow_critical',
  technicalDisclosureCritical: 'technical_disclosure_critical',
};

const CAP_BY_GATE = {
  [HOMEPAGE_GATE_IDS.shellBlocker]: 52,
  [HOMEPAGE_GATE_IDS.firstScreenCritical]: 62,
  [HOMEPAGE_GATE_IDS.productVisualBlocker]: 55,
  [HOMEPAGE_GATE_IDS.productVisualCritical]: 58,
  [HOMEPAGE_GATE_IDS.storylineCritical]: 60,
  [HOMEPAGE_GATE_IDS.technicalDisclosureCritical]: 58,
};

/**
 * Homepage readiness gates from crawl findings (root `/` only).
 * @param {{ url?: string, pageUrl?: string, findings?: object[] }[]} pages
 * @param {string} siteKind
 * @returns {{ id: string, ok: boolean, cap: number, detail: string }[]}
 */
export function collectHomepageReadinessGates(pages, siteKind = 'generic') {
  /** @type {{ id: string, ok: boolean, cap: number, detail: string }[]} */
  const gates = [];

  /** @type {{ finding: object, isHome: boolean }[]} */
  const tagged = [];
  for (const p of pages || []) {
    const url = p.url || p.pageUrl || '';
    const { isHome } = pageContext(url, siteKind);
    for (const f of p.findings || []) {
      if (f) tagged.push({ finding: f, isHome });
    }
  }

  const onHome = (x) => x.isHome;

  if (tagged.some((x) => onHome(x) && x.finding.checkId === 'homepage-shell' && x.finding.severity === 'blocker')) {
    gates.push({
      id: HOMEPAGE_GATE_IDS.shellBlocker,
      ok: false,
      cap: CAP_BY_GATE[HOMEPAGE_GATE_IDS.shellBlocker],
      detail: '`homepage-shell` blocker on root `/`',
    });
  }

  if (tagged.some((x) => onHome(x) && x.finding.checkId === 'first-screen-density' && x.finding.severity === 'critical')) {
    gates.push({
      id: HOMEPAGE_GATE_IDS.firstScreenCritical,
      ok: false,
      cap: CAP_BY_GATE[HOMEPAGE_GATE_IDS.firstScreenCritical],
      detail: '`first-screen-density` critical on root `/`',
    });
  }

  if (tagged.some((x) => onHome(x) && x.finding.checkId === 'product-visual' && x.finding.severity === 'blocker')) {
    gates.push({
      id: HOMEPAGE_GATE_IDS.productVisualBlocker,
      ok: false,
      cap: CAP_BY_GATE[HOMEPAGE_GATE_IDS.productVisualBlocker],
      detail: '`product-visual` blocker on root `/`',
    });
  }

  if (tagged.some((x) => onHome(x) && x.finding.checkId === 'product-visual' && x.finding.severity === 'critical')) {
    gates.push({
      id: HOMEPAGE_GATE_IDS.productVisualCritical,
      ok: false,
      cap: CAP_BY_GATE[HOMEPAGE_GATE_IDS.productVisualCritical],
      detail: '`product-visual` critical on root `/`',
    });
  }

  if (tagged.some((x) => onHome(x) && x.finding.checkId === 'storyline-flow' && x.finding.severity === 'critical')) {
    gates.push({
      id: HOMEPAGE_GATE_IDS.storylineCritical,
      ok: false,
      cap: CAP_BY_GATE[HOMEPAGE_GATE_IDS.storylineCritical],
      detail: '`storyline-flow` critical on root `/`',
    });
  }

  if (tagged.some((x) => onHome(x) && x.finding.checkId === 'technical-depth' && x.finding.severity === 'critical')) {
    gates.push({
      id: HOMEPAGE_GATE_IDS.technicalDisclosureCritical,
      ok: false,
      cap: CAP_BY_GATE[HOMEPAGE_GATE_IDS.technicalDisclosureCritical],
      detail: '`technical-depth` critical on root `/`',
    });
  }

  return gates;
}

/**
 * @param {{ id: string, ok: boolean, cap: number, detail: string }[]} gates
 * @returns {number|null}
 */
export function minCapFromGates(gates) {
  if (!gates?.length) return null;
  return Math.min(...gates.map((g) => g.cap));
}
