/**
 * DET.PAGE.MODE — page declares one primary mode (marketing, handbook, listing, product,
 * presentation, app) via KS layout metadata or predictable shell signals; no competing modes
 * above the fold (e.g. landing layout + handbook doc sidebar on `/`).
 */

import { pageContext } from '../../../checks/context.js';

/** KS layout slug → canonical page mode (docs/design/ux-audit/deterministic-design-rules.md). */
export const LAYOUT_PAGE_MODES = {
  'layout-landing': 'marketing',
  'layout-marketing': 'marketing',
  'layout-handbook': 'handbook',
  'layout-chapter': 'handbook',
  'layout-listing': 'listing',
  'layout-product': 'product',
  'layout-showcase': 'presentation',
  'layout-gallery': 'presentation',
  'layout-split': 'presentation',
};

/** Layout slugs where a visible doc sidebar is expected (not a competing handbook signal). */
export const HANDBOOK_NATIVE_LAYOUTS = new Set([
  'layout-handbook',
  'layout-chapter',
  'layout-listing',
  'layout-product',
]);

/** Incompatible mode pairs detected above the fold. */
export const INCOMPATIBLE_MODE_PAIRS = [
  ['marketing', 'handbook'],
  ['marketing', 'app'],
  ['marketing', 'dashboard'],
  ['listing', 'app'],
];

/** Sidebar/offcanvas link count that implies handbook chrome on a landing route. */
export const MIN_SIDEBAR_LINKS_HANDBOOK_SIGNAL = 6;

/** Handbook chrome phrase hits (aligns with dom-metrics / homepage-shell). */
export const HANDBOOK_CHROME_TERM_THRESHOLD = 2;

const DOC_SIDEBAR_SELECTOR = [
  '.forge-sidebar',
  '#ks-sidebar-aside',
  '.fs-sidebar',
  'aside[data-ks-hash="Ksr"]',
  'aside[data-ks-name="doc-sidebar"]',
].join(',');

const APP_SHELL_SELECTOR = [
  '[data-shell-region]',
  '[data-ks-name="museum-studio"]',
  '[data-ks-hash="Msm"]',
  '.museum-studio',
].join(',');

export const rule = {
  id: 'DET.PAGE.MODE',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'major',
  priorityWeight: 10,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-page-mode',
};

/**
 * @param {string} pathname
 */
export function isHomePathname(pathname) {
  const p = String(pathname || '').replace(/\/+$/, '') || '/';
  return p === '' || p === '/' || p === '/index.html';
}

/**
 * @param {string} raw
 */
export function normalizePageModeToken(raw) {
  const t = String(raw || '').toLowerCase().trim().replace(/_/g, '-');
  if (!t) return null;
  if (t === 'landing' || t === 'marketing' || t === 'public-landing') return 'marketing';
  if (t === 'handbook' || t === 'docs' || t === 'reference' || t === 'guide') return 'handbook';
  if (t === 'listing' || t === 'list') return 'listing';
  if (t === 'product' || t === 'product-detail') return 'product';
  if (t === 'showcase' || t === 'presentation' || t === 'gallery') return 'presentation';
  if (t === 'app' || t === 'app-shell' || t === 'shell') return 'app';
  if (t === 'dashboard') return 'dashboard';
  if (t === 'wizard') return 'wizard';
  if (t === 'data-report' || t === 'report') return 'data-report';
  return t;
}

/**
 * @param {string} a
 * @param {string} b
 */
export function modesAreIncompatible(a, b) {
  if (!a || !b || a === b) return false;
  return INCOMPATIBLE_MODE_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

/**
 * @param {string[]} modes
 */
export function competingModePairs(modes) {
  const list = [...new Set(modes.filter(Boolean))];
  /** @type {Array<[string, string]>} */
  const pairs = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      if (modesAreIncompatible(list[i], list[j])) pairs.push([list[i], list[j]]);
    }
  }
  return pairs;
}

/**
 * @param {{
 *   layoutName?: string,
 *   metaPageMode?: string,
 *   bodyPageMode?: string,
 *   hasDocSidebar?: boolean,
 *   hasShowcaseHeader?: boolean,
 *   hasAppShell?: boolean,
 *   handbookChromeAboveFold?: boolean,
 *   sidebarLinkCount?: number,
 * }} signals
 */
export function detectPageModes(signals) {
  /** @type {Set<string>} */
  const modes = new Set();
  const layoutName = String(signals?.layoutName || '').trim();

  const layoutMode = layoutName ? LAYOUT_PAGE_MODES[layoutName] : null;
  if (layoutMode) modes.add(layoutMode);

  const meta = normalizePageModeToken(signals?.metaPageMode);
  if (meta) modes.add(meta);
  const body = normalizePageModeToken(signals?.bodyPageMode);
  if (body) modes.add(body);

  if (signals?.hasDocSidebar && !HANDBOOK_NATIVE_LAYOUTS.has(layoutName)) {
    modes.add('handbook');
  }

  if (signals?.hasShowcaseHeader && layoutMode !== 'presentation') {
    modes.add('presentation');
  }

  if (signals?.hasAppShell && layoutMode !== 'app') {
    modes.add('app');
  }

  if (signals?.handbookChromeAboveFold && layoutMode === 'marketing') {
    modes.add('handbook');
  }

  const sidebarLinks = Number(signals?.sidebarLinkCount);
  if (layoutMode === 'marketing' && Number.isFinite(sidebarLinks)
    && sidebarLinks >= MIN_SIDEBAR_LINKS_HANDBOOK_SIGNAL) {
    modes.add('handbook');
  }

  return [...modes];
}

/**
 * @param {{ isHome?: boolean, layoutName?: string }} signals
 */
export function expectedPrimaryMode(signals) {
  if (signals?.isHome) return 'marketing';
  const layoutName = String(signals?.layoutName || '').trim();
  return layoutName ? (LAYOUT_PAGE_MODES[layoutName] || null) : null;
}

/**
 * @param {{
 *   isHome?: boolean,
 *   layoutName?: string,
 *   metaPageMode?: string,
 *   bodyPageMode?: string,
 *   hasDocSidebar?: boolean,
 *   hasShowcaseHeader?: boolean,
 *   hasAppShell?: boolean,
 *   handbookChromeAboveFold?: boolean,
 *   sidebarLinkCount?: number,
 *   hasKsLayoutMarker?: boolean,
 *   mainWordCount?: number,
 * }} signals
 */
export function violationsFromPageModeSignals(signals) {
  const modes = detectPageModes(signals || {});
  const expected = expectedPrimaryMode(signals || {});
  /** @type {Array<Record<string, unknown>>} */
  const violations = [];

  const pairs = competingModePairs(modes);
  if (pairs.length) {
    violations.push({
      kind: 'competing-modes',
      modes,
      pairs,
      expected,
      layoutName: signals?.layoutName || '',
    });
  }

  if (signals?.isHome && modes.includes('handbook') && expected === 'marketing') {
    const alreadyCompeting = pairs.some(([a, b]) =>
      (a === 'marketing' && b === 'handbook') || (a === 'handbook' && b === 'marketing'));
    if (!alreadyCompeting) {
      violations.push({
        kind: 'home-handbook-shell',
        modes,
        expected,
        layoutName: signals?.layoutName || '',
      });
    }
  }

  const mainWords = Number(signals?.mainWordCount);
  const hasContent = Number.isFinite(mainWords) ? mainWords >= 80 : true;
  const ksMarked = signals?.hasKsLayoutMarker !== false;
  if (ksMarked && hasContent && !modes.length && !String(signals?.layoutName || '').trim()) {
    violations.push({
      kind: 'undeclared-mode',
      layoutName: '',
      expected,
    });
  }

  return violations;
}

/**
 * @param {{ violations?: Array<Record<string, unknown>>, modes?: string[], layoutName?: string }} report
 * @param {string} [url]
 */
export function findingsFromPageModeReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 4)) {
    const kind = String(v.kind || 'page-mode');
    if (seen.has(kind)) continue;
    seen.add(kind);

    const modes = Array.isArray(v.modes) ? v.modes.join('+') : '?';
    const layout = String(v.layoutName || report?.layoutName || '').trim();

    if (kind === 'competing-modes') {
      const pairs = Array.isArray(v.pairs)
        ? v.pairs.map(([a, b]) => `${a}↔${b}`).join(',')
        : modes;
      findings.push({
        severity: (v.isHome || report?.isHome) ? 'critical' : 'major',
        area: 'informationArchitecture',
        message:
          'Page exposes competing primary modes above the fold (ambiguous landing vs handbook/docs shell).',
        evidence: `competing_modes=${pairs} detected=${modes}${layout ? ` layout=${layout}` : ''}`,
        remediation:
          'Declare one primary page mode via KS layout metadata (`data-ks-type="layout"` / `data-ks-name`) or `meta name="forge-page-mode"`; remove conflicting chrome (e.g. handbook sidebar on marketing `/`) per docs/design/forge-enterprise-ai-website-standard.md Page mode taxonomy.',
      });
    } else if (kind === 'home-handbook-shell') {
      findings.push({
        severity: 'critical',
        area: 'informationArchitecture',
        message:
          'Homepage reads as handbook/docs mode instead of public landing/marketing mode above the fold.',
        evidence: `home_modes=${modes}${layout ? ` layout=${layout}` : ''} expected=marketing`,
        remediation:
          'Use product/landing shell on `/` (mode 1 — public landing page): curated top nav only; route handbook trees to /docs or /handbook. Fix layout/routing before hero copy edits.',
      });
    } else if (kind === 'undeclared-mode') {
      findings.push({
        severity: 'warn',
        area: 'informationArchitecture',
        message:
          'Page primary mode is not declared via KS layout metadata or forge page-mode metadata.',
        evidence: `undeclared_mode layout=${layout || 'missing'} ks_layout_marker=${report?.hasKsLayoutMarker ? 1 : 0}`,
        remediation:
          'Emit `[data-ks-type="layout"][data-ks-name="layout-*"]` on the layout root or `<meta name="forge-page-mode" content="marketing|handbook|listing|product|presentation|app">` so audits can verify a single intentional mode.',
      });
    }
  }

  if (url) {
    for (const finding of findings) {
      finding.evidence = `${finding.evidence} url=${url}`;
    }
  }

  return findings;
}

/**
 * @param {Record<string, unknown>} report
 * @param {Record<string, unknown>} [metrics]
 */
export function mergePageModeMetrics(report, metrics = {}) {
  const merged = { ...report };
  const layoutName = String(merged.layoutName || '').trim();
  const layoutMode = layoutName ? LAYOUT_PAGE_MODES[layoutName] : null;

  if (layoutMode === 'marketing' || merged.isHome) {
    const hits = Number(metrics.handbookChromeTermHits);
    if (Number.isFinite(hits) && hits >= HANDBOOK_CHROME_TERM_THRESHOLD) {
      merged.handbookChromeAboveFold = true;
    }
    if (metrics.hasHandbookChromeOnHome === true) {
      merged.handbookChromeAboveFold = true;
    }
    const sidebar = Number(metrics.sidebarOffcanvasLinkCount);
    if (Number.isFinite(sidebar)) {
      merged.sidebarLinkCount = sidebar;
    }
  }

  const modes = detectPageModes(merged);
  const violations = violationsFromPageModeSignals(merged);
  return {
    ...merged,
    modes,
    violations,
  };
}

/** @param {import('playwright').Page} page */
export async function collectPageModeReport(page) {
  return page.evaluate(
    ({
      LAYOUT_PAGE_MODES: layoutModes,
      HANDBOOK_NATIVE_LAYOUTS: handbookLayouts,
      DOC_SIDEBAR_SELECTOR: sidebarSelector,
      APP_SHELL_SELECTOR: appSelector,
      MIN_SIDEBAR_LINKS_HANDBOOK_SIGNAL: minSidebarLinks,
    }) => {
      const handbookNative = new Set(handbookLayouts);

      const visible = (el) => {
        if (!el || el.nodeType !== 1) return false;
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 24 && rect.height > 12 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      let pathname = '/';
      try {
        pathname = window.location.pathname || '/';
      } catch {
        pathname = '/';
      }
      const p = String(pathname).replace(/\/+$/, '') || '/';
      const isHome = p === '' || p === '/' || p === '/index.html';

      const layoutEl = document.querySelector('[data-ks-type="layout"]');
      const layoutName = layoutEl?.getAttribute('data-ks-name') || '';
      const hasKsLayoutMarker = Boolean(layoutEl);

      const metaPageMode = document.querySelector('meta[name="forge-page-mode"]')?.getAttribute('content')
        || document.querySelector('meta[property="forge:page-mode"]')?.getAttribute('content')
        || '';
      const bodyPageMode = document.body?.getAttribute('data-page-mode')
        || document.documentElement?.getAttribute('data-page-mode')
        || '';

      let hasDocSidebar = false;
      let sidebarLinkCount = 0;
      const mainEl = document.querySelector('main#main') || document.querySelector('main');
      const isOutsideMain = (el) => {
        if (!mainEl) return true;
        return !mainEl.contains(el);
      };

      for (const el of document.querySelectorAll(sidebarSelector)) {
        if (!visible(el) || !isOutsideMain(el)) continue;
        hasDocSidebar = true;
        sidebarLinkCount += el.querySelectorAll('a[href]').length;
      }

      const headerContent = document.querySelector(
        '.site-header .site-header-content, header.site-header .site-header-content',
      );
      const hasShowcaseHeader = Boolean(headerContent && visible(headerContent));

      let hasAppShell = false;
      for (const el of document.querySelectorAll(appSelector)) {
        if (visible(el)) {
          hasAppShell = true;
          break;
        }
      }

      let mainWordCount = 0;
      if (mainEl) {
        const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
        const words = (s) => norm(s).split(/\s+/).filter(Boolean);
        for (const el of mainEl.querySelectorAll('p, h1, h2, h3, li')) {
          if (!visible(el)) continue;
          mainWordCount += words(el.innerText || el.textContent || '').length;
        }
      }

      const signals = {
        isHome,
        layoutName,
        hasKsLayoutMarker,
        metaPageMode,
        bodyPageMode,
        hasDocSidebar: hasDocSidebar && !handbookNative.has(layoutName),
        hasShowcaseHeader,
        hasAppShell,
        handbookChromeAboveFold: false,
        sidebarLinkCount,
        mainWordCount,
      };

      const modes = [];
      const layoutMode = layoutModes[layoutName];
      if (layoutMode) modes.push(layoutMode);
      if (signals.hasDocSidebar) modes.push('handbook');
      if (signals.hasShowcaseHeader && layoutMode !== 'presentation') modes.push('presentation');
      if (signals.hasAppShell && layoutMode !== 'app') modes.push('app');
      if (layoutMode === 'marketing' && sidebarLinkCount >= minSidebarLinks) modes.push('handbook');

      const violations = [];
      const pairKey = (a, b) => [a, b].sort().join('+');
      const incompatible = new Set(['handbook+marketing', 'app+marketing', 'dashboard+marketing', 'app+listing']);
      const uniqueModes = [...new Set(modes)];
      /** @type {Array<[string, string]>} */
      const pairs = [];
      for (let i = 0; i < uniqueModes.length; i++) {
        for (let j = i + 1; j < uniqueModes.length; j++) {
          if (incompatible.has(pairKey(uniqueModes[i], uniqueModes[j]))) {
            pairs.push([uniqueModes[i], uniqueModes[j]]);
          }
        }
      }
      if (pairs.length) {
        violations.push({
          kind: 'competing-modes',
          modes: uniqueModes,
          pairs,
          expected: isHome ? 'marketing' : (layoutMode || null),
          layoutName,
          isHome,
        });
      }
      if (isHome && uniqueModes.includes('handbook') && !pairs.length) {
        violations.push({
          kind: 'home-handbook-shell',
          modes: uniqueModes,
          expected: 'marketing',
          layoutName,
          isHome,
        });
      }
      if (hasKsLayoutMarker && mainWordCount >= 80 && !layoutName && !uniqueModes.length) {
        violations.push({ kind: 'undeclared-mode', layoutName: '', expected: isHome ? 'marketing' : null });
      }

      return {
        ...signals,
        modes: uniqueModes,
        violations,
      };
    },
    {
      LAYOUT_PAGE_MODES,
      HANDBOOK_NATIVE_LAYOUTS: [...HANDBOOK_NATIVE_LAYOUTS],
      DOC_SIDEBAR_SELECTOR,
      APP_SHELL_SELECTOR,
      MIN_SIDEBAR_LINKS_HANDBOOK_SIGNAL,
    },
  );
}

export async function run({ metrics, page, url, ctx = {} }) {
  const pageUrl = url || String(metrics?.url || '');
  const { isPlatformHandbookInner } = pageContext(pageUrl, ctx.siteKind || 'generic');
  if (isPlatformHandbookInner) return [];

  let report = metrics?.pageModeReport ?? (page ? await collectPageModeReport(page) : null);
  if (!report) return [];

  if (metrics && (metrics.handbookChromeTermHits != null || metrics.sidebarOffcanvasLinkCount != null)) {
    report = mergePageModeMetrics(report, metrics);
  } else if (!report.violations) {
    report = mergePageModeMetrics(report, {});
  }

  return findingsFromPageModeReport(report, pageUrl);
}
