/**
 * DET.NAV.DEPTH — global primary nav nesting stays within configured max;
 * nested flyouts beyond one tier require an explicit mega-menu pattern (Kpn contract).
 */

/** Max nested list tiers in global nav without a mega-menu (top + one flyout). */
export const MAX_GLOBAL_NAV_DEPTH = 2;

/** Hard cap even when a mega-menu marker is present. */
export const MAX_GLOBAL_NAV_DEPTH_WITH_MEGA = 4;

const GLOBAL_NAV_ROOT_SELECTOR = [
  'nav.fs-primary-nav-global',
  '[data-ks-hash="Kpn"]',
  'nav.landing-nav',
  '.landing-header nav[aria-label*="Site navigation" i]',
  'header.landing-header .landing-nav',
  'header.site-header nav[aria-label*="Site navigation" i]',
].join(',');

const MEGA_MENU_SELECTOR = [
  '.fs-mega-menu',
  '.fs-mega-nav',
  '.mega-menu',
  '.megamenu',
  '[data-fs-mega-menu]',
  '.dropdown-mega',
  '[class*="mega-menu"]',
  '[class*="megamenu"]',
].join(',');

const EXCLUDED_SUBTREE_SELECTOR = [
  '.forge-theme-dropdown',
  '.forge-theme-menu',
  '[data-forge-pref]',
  '.dropdown-menu.forge-theme-menu',
].join(',');

export const rule = {
  id: 'DET.NAV.DEPTH',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-nav-depth',
};

/**
 * @param {number} listDepth
 * @param {boolean} hasMegaMenu
 */
export function allowedNavDepth(listDepth, hasMegaMenu) {
  const cap = hasMegaMenu ? MAX_GLOBAL_NAV_DEPTH_WITH_MEGA : MAX_GLOBAL_NAV_DEPTH;
  return listDepth <= cap;
}

/**
 * @param {number} listDepth
 * @param {boolean} hasMegaMenu
 */
export function violationsFromNavDepthMetrics(listDepth, hasMegaMenu, hint = 'global-nav') {
  if (listDepth == null || !Number.isFinite(listDepth)) return [];
  if (allowedNavDepth(listDepth, hasMegaMenu)) return [];

  const cap = hasMegaMenu ? MAX_GLOBAL_NAV_DEPTH_WITH_MEGA : MAX_GLOBAL_NAV_DEPTH;
  return [{
    kind: hasMegaMenu ? 'mega-depth-exceeded' : 'nested-flyout-depth',
    listDepth,
    maxAllowed: cap,
    hasMegaMenu,
    selectorHint: hint,
  }];
}

/**
 * @param {{ violations?: Array<Record<string, unknown>>, maxListDepth?: number } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromNavDepthReport(report, url = '') {
  const violations = Array.isArray(report?.violations)
    ? report.violations
    : violationsFromNavDepthMetrics(
      report?.maxListDepth,
      report?.hasMegaMenu === true,
      report?.selectorHint || 'global-nav',
    );
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 6)) {
    const hint = String(v.selectorHint || 'global-nav').slice(0, 120);
    const depth = v.listDepth;
    const cap = v.maxAllowed ?? MAX_GLOBAL_NAV_DEPTH;
    const key = `${v.kind || 'depth'}:${hint}:${depth}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const nestedFlyout = v.kind === 'nested-flyout-depth' || !v.hasMegaMenu;
    findings.push({
      severity: depth > cap + 1 ? 'major' : 'warn',
      area: 'informationArchitecture',
      message: nestedFlyout
        ? 'Global navigation nests flyout menus deeper than the configured primary-nav budget (top level + one tier).'
        : 'Global navigation list depth exceeds the mega-menu ceiling.',
      evidence:
        `nav_depth list_depth=${depth} max=${cap} mega=${v.hasMegaMenu ? 'yes' : 'no'} kind=${v.kind || 'depth'} hint="${hint}"`,
      remediation: nestedFlyout
        ? 'Flatten global nav to one flyout tier (fs-nav-dropdown or a single dropdown-menu) or adopt an explicit mega-menu pattern per Kpn; move handbook trees to sidebar/offcanvas doc bands only.'
        : 'Reduce mega-menu column depth or split deep trees into doc sidebar routes; keep global chrome curated.',
    });
  }

  if (url) {
    for (const finding of findings) {
      finding.evidence = `${finding.evidence} url=${url}`;
    }
  }

  return findings;
}

/** @param {import('playwright').Page} page */
export async function collectNavDepthReport(page) {
  return page.evaluate(
    ({
      GLOBAL_NAV_ROOT_SELECTOR,
      MEGA_MENU_SELECTOR,
      EXCLUDED_SUBTREE_SELECTOR,
      MAX_GLOBAL_NAV_DEPTH,
      MAX_GLOBAL_NAV_DEPTH_WITH_MEGA,
    }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

      const visible = (el) => {
        if (!el || el.nodeType !== 1) return false;
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 8 && rect.height > 8 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      const mainEl = document.querySelector('main#main') || document.querySelector('main');
      const isOutsideMain = (el) => !mainEl || !mainEl.contains(el);

      const isExcluded = (el) => !!el.closest(EXCLUDED_SUBTREE_SELECTOR);

      const listDepthOf = (listEl, root) => {
        let d = 0;
        let p = listEl;
        while (p && p !== root) {
          if (p.matches('ul, ol, [role="menu"]')) d += 1;
          p = p.parentElement;
        }
        return d;
      };

      const maxListDepthInRoot = (root) => {
        let max = 0;
        const lists = root.querySelectorAll('ul, ol, [role="menu"]');
        for (const list of lists) {
          if (isExcluded(list)) continue;
          if (!list.querySelector('a[href]')) continue;
          max = Math.max(max, listDepthOf(list, root));
        }

        const dropdownPanels = root.querySelectorAll(
          '.fs-nav-dropdown__panel-inner a[href], .dropdown-menu a[href], [role="menu"] a[href]',
        );
        if (dropdownPanels.length) {
          const hasTopLinks = root.querySelector(
            ':scope a[href], :scope > * a[href], .fs-nav-dropdown__trigger, .dropdown-toggle',
          );
          if (hasTopLinks) max = Math.max(max, 2);
        }

        const flatLinks = root.querySelectorAll(':scope > a[href], :scope > * > a[href]');
        if (flatLinks.length && max === 0) max = 1;

        return max;
      };

      const hasMegaMenu = (root) => !!root.querySelector(MEGA_MENU_SELECTOR);

      /** @type {Map<string, Element>} */
      const roots = new Map();
      for (const el of document.querySelectorAll(GLOBAL_NAV_ROOT_SELECTOR)) {
        if (!(el instanceof HTMLElement) || !isOutsideMain(el) || isExcluded(el)) continue;
        if (!visible(el) && el.querySelectorAll('a[href]').length < 2) continue;
        const key = `${el.tagName}:${el.id || ''}:${norm(el.className).slice(0, 40)}`;
        if (!roots.has(key)) roots.set(key, el);
      }

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];
      let overallMax = 0;
      let anyMega = false;

      for (const root of roots.values()) {
        const listDepth = maxListDepthInRoot(root);
        overallMax = Math.max(overallMax, listDepth);
        const mega = hasMegaMenu(root);
        if (mega) anyMega = true;
        const cap = mega ? MAX_GLOBAL_NAV_DEPTH_WITH_MEGA : MAX_GLOBAL_NAV_DEPTH;
        if (listDepth > cap) {
          const hint = root.id
            ? `#${root.id}`
            : `${root.tagName.toLowerCase()}.${norm(root.className).split(' ').filter(Boolean).slice(0, 2).join('.')}`;
          violations.push({
            kind: mega ? 'mega-depth-exceeded' : 'nested-flyout-depth',
            listDepth,
            maxAllowed: cap,
            hasMegaMenu: mega,
            selectorHint: hint,
          });
        }
      }

      return {
        navRootCount: roots.size,
        maxListDepth: overallMax,
        hasMegaMenu: anyMega,
        violations: violations.slice(0, 6),
      };
    },
    {
      GLOBAL_NAV_ROOT_SELECTOR,
      MEGA_MENU_SELECTOR,
      EXCLUDED_SUBTREE_SELECTOR,
      MAX_GLOBAL_NAV_DEPTH,
      MAX_GLOBAL_NAV_DEPTH_WITH_MEGA,
    },
  );
}

export async function run({ metrics, page, url }) {
  let report = metrics?.navDepthReport ?? null;
  if (!report && page) {
    report = await collectNavDepthReport(page);
  }
  if (!report) return [];

  const resolved = {
    ...report,
    violations: Array.isArray(report.violations) && report.violations.length
      ? report.violations
      : violationsFromNavDepthMetrics(
        report.maxListDepth,
        report.hasMegaMenu === true,
        report.selectorHint || 'global-nav',
      ),
  };

  if (!(resolved.violations || []).length) return [];
  return findingsFromNavDepthReport(resolved, url || metrics?.url || '');
}
