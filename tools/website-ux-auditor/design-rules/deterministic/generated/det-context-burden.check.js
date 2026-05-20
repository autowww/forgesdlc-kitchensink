/**
 * DET.CONTEXT.BURDEN — quantitative first-screen / chrome caps so navigation and
 * hero controls do not overwhelm the page story (Forge enterprise first-screen budget).
 */

import { pageContext } from '../../../checks/context.js';

/** Max substantive links strictly above the first in-main H1 (standard: 10). */
export const MAX_PRE_MAIN_FIRST_H1_LINKS = 10;

/** Curated top nav band: enterprise standard allows 4–7 visible header/nav choices. */
export const MAX_HEADER_NAV_LINKS = 7;

/** Hero-fold interactive controls inside main (aligns with DET.BUTTON.GROUP.MAX). */
export const MAX_HERO_INTERACTIVE_CONTROLS = 3;

/** First-viewport link cluster before link-wall dominates (homepage). */
export const MAX_FIRST_VIEWPORT_LINKS = 28;

/** Distinct chrome regions outside main (header/nav/sidebar/offcanvas). */
export const MAX_NAV_CHROME_BANDS = 4;

export const rule = {
  id: 'DET.CONTEXT.BURDEN',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'first-screen',
  scoreDimension: 'visualRhythmFirstScreen',
  defaultSeverity: 'major',
  priorityWeight: 12,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-context-burden',
};

/**
 * @param {string} [url]
 * @param {string} [siteKind]
 */
export function pageBurdenContext(url, siteKind = 'generic') {
  return pageContext(url || '', siteKind);
}

/**
 * @param {Record<string, unknown> | null | undefined} metrics
 * @param {number | null | undefined} heroInteractiveCount
 */
export function buildContextBurdenSnapshot(metrics, heroInteractiveCount = null) {
  const m = metrics || {};
  return {
    preMainFirstH1LinkCount: typeof m.preMainFirstH1LinkCount === 'number' ? m.preMainFirstH1LinkCount : null,
    outsideMainHeaderNavLinkCount:
      typeof m.outsideMainHeaderNavLinkCount === 'number' ? m.outsideMainHeaderNavLinkCount : null,
    navChromeContainerCount: typeof m.navChromeContainerCount === 'number' ? m.navChromeContainerCount : null,
    firstViewportLinkCount: typeof m.firstViewportLinkCount === 'number' ? m.firstViewportLinkCount : null,
    heroInteractiveCount: typeof heroInteractiveCount === 'number'
      ? heroInteractiveCount
      : (typeof m.contextBurdenReport?.heroInteractiveCount === 'number'
        ? m.contextBurdenReport.heroInteractiveCount
        : null),
  };
}

/**
 * @param {ReturnType<typeof buildContextBurdenSnapshot>} snapshot
 * @param {string} [url]
 * @param {{ siteKind?: string, isHome?: boolean, isPlatformHandbookInner?: boolean }} [ctx]
 */
export function findingsFromContextBurdenSnapshot(snapshot, url = '', ctx = {}) {
  if (!snapshot) return [];

  const isHome = ctx.isHome === true;
  const findings = [];
  const seen = new Set();

  const push = (kind, severity, message, evidence, remediation) => {
    if (seen.has(kind)) return;
    seen.add(kind);
    findings.push({ severity, area: 'first-screen', message, evidence, remediation });
  };

  const preMain = snapshot.preMainFirstH1LinkCount;
  if (preMain != null && preMain > MAX_PRE_MAIN_FIRST_H1_LINKS) {
    push(
      'pre-main-links',
      preMain > MAX_PRE_MAIN_FIRST_H1_LINKS + 2 ? 'critical' : 'major',
      'Too many navigational links appear before the primary in-main headline (context burden).',
      `pre_main_first_h1_link_count=${preMain} max=${MAX_PRE_MAIN_FIRST_H1_LINKS}`,
      'Reduce pre-hero link walls; keep the first screen story-led and move deep reference links below the hero.',
    );
  }

  const headerNav = snapshot.outsideMainHeaderNavLinkCount;
  if (headerNav != null && headerNav > MAX_HEADER_NAV_LINKS) {
    push(
      'header-nav',
      headerNav > MAX_HEADER_NAV_LINKS + 4 ? 'critical' : 'major',
      'Header/navigation exposes more top-level choices than the first-screen nav budget allows.',
      `outside_main_header_nav_links=${headerNav} max=${MAX_HEADER_NAV_LINKS}`,
      'Curate top navigation to 4–7 primary destinations; move exhaustive trees to docs sidebars or deep routes.',
    );
  }

  const navBands = snapshot.navChromeContainerCount;
  if (navBands != null && navBands > MAX_NAV_CHROME_BANDS) {
    push(
      'nav-bands',
      'major',
      'Multiple competing navigation chrome bands sit outside the main content (context burden).',
      `nav_chrome_container_count=${navBands} max=${MAX_NAV_CHROME_BANDS}`,
      'Consolidate header, sidebar, and offcanvas nav bands; keep handbook trees off landing routes.',
    );
  }

  if (isHome) {
    const fvlc = snapshot.firstViewportLinkCount;
    if (fvlc != null && fvlc > MAX_FIRST_VIEWPORT_LINKS) {
      push(
        'first-viewport-links',
        'critical',
        'The first viewport contains too many navigational links (link-cluster burden).',
        `first_viewport_link_count=${fvlc} max=${MAX_FIRST_VIEWPORT_LINKS}`,
        'Curate hero-adjacent navigation; move exhaustive indexes and trees to docs sidebars or dedicated pages.',
      );
    }
  }

  const heroControls = snapshot.heroInteractiveCount;
  if (isHome && heroControls != null && heroControls > MAX_HERO_INTERACTIVE_CONTROLS) {
    push(
      'hero-controls',
      heroControls > MAX_HERO_INTERACTIVE_CONTROLS + 1 ? 'critical' : 'major',
      'The hero region exposes too many interactive controls for a focused first screen.',
      `hero_interactive_controls=${heroControls} max=${MAX_HERO_INTERACTIVE_CONTROLS}`,
      'Limit the hero to one primary and one secondary action (three only when the third is low-emphasis); demote extras below the fold or into overflow.',
    );
  }

  if (url) {
    for (const finding of findings) {
      finding.evidence = `${finding.evidence} url=${url}`;
    }
  }

  return findings;
}

/** @param {import('playwright').Page} page */
export async function collectContextBurdenReport(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

    const visible = (el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden'
        && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
    };

    const textOf = (el) => norm(
      el.innerText || el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || '',
    );

    const isAction = (el) => {
      if (!el || el.nodeType !== 1 || !visible(el)) return false;
      const tag = el.tagName.toLowerCase();
      if (tag === 'button') return !el.disabled;
      if (tag === 'input') {
        const type = String(el.getAttribute('type') || 'text').toLowerCase();
        return ['button', 'submit', 'reset'].includes(type) && !el.disabled;
      }
      if (el.getAttribute('role') === 'button') return true;
      if (tag === 'a') {
        const cls = String(el.getAttribute('class') || '').toLowerCase();
        return /\bbtn\b/.test(cls);
      }
      return false;
    };

    const main = document.querySelector('main#main') || document.querySelector('main');
    if (!main) return { heroInteractiveCount: 0 };

    const vh = Math.round(window.innerHeight);
    const heroFoldBottom = Math.min(900, Math.max(Math.round(vh * 0.92), 560));

    const actions = new Set();
    for (const el of main.querySelectorAll('button, [role="button"], a.btn, input[type="button"], input[type="submit"]')) {
      if (!isAction(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.top >= heroFoldBottom || r.bottom <= 0) continue;
      if (el.closest('nav, [role="navigation"], .pagination, .dropdown-menu, [role="menu"]')) continue;
      actions.add(el);
    }

    return { heroInteractiveCount: actions.size };
  });
}

/**
 * @param {Record<string, unknown>} [metrics]
 * @param {string} [url]
 * @param {{ siteKind?: string }} [ctx]
 */
export function findingsFromContextBurdenMetrics(metrics, url = '', ctx = {}) {
  const burdenCtx = pageBurdenContext(url || String(metrics?.url || ''), ctx.siteKind || 'generic');
  if (burdenCtx.isPlatformHandbookInner) return [];
  const snapshot = buildContextBurdenSnapshot(metrics);
  return findingsFromContextBurdenSnapshot(snapshot, url || String(metrics?.url || ''), {
    ...ctx,
    isHome: burdenCtx.isHome,
    isPlatformHandbookInner: burdenCtx.isPlatformHandbookInner,
  });
}

export async function run({ metrics, page, url, ctx = {} }) {
  const pageUrl = url || String(metrics?.url || '');
  const burdenCtx = pageBurdenContext(pageUrl, ctx.siteKind || 'generic');
  if (burdenCtx.isPlatformHandbookInner) return [];

  let heroInteractiveCount = metrics?.contextBurdenReport?.heroInteractiveCount;
  if (heroInteractiveCount == null && page) {
    const report = await collectContextBurdenReport(page);
    heroInteractiveCount = report?.heroInteractiveCount;
  }

  const snapshot = buildContextBurdenSnapshot(metrics || {}, heroInteractiveCount);
  const hasSignals = Object.values(snapshot).some((v) => v != null);
  if (!hasSignals) return [];

  return findingsFromContextBurdenSnapshot(snapshot, pageUrl, {
    ...ctx,
    isHome: burdenCtx.isHome,
    isPlatformHandbookInner: burdenCtx.isPlatformHandbookInner,
  });
}
