/**
 * DET.NAV.BREADCRUMB — product/doc hub pages expose breadcrumb chrome (Kbc contract)
 * when the page uses handbook, showcase, product, or doc-sidebar shells.
 */

/** Registry hash and root selector for Doc breadcrumb (Kbc). */
export const BREADCRUMB_HASH = 'Kbc';
export const BREADCRUMB_ROOT_SELECTOR = '.ks-doc-breadcrumb';

/** Layout slugs that imply doc/product hub IA (breadcrumb expected). */
export const DOC_HUB_LAYOUT_SLUGS = new Set([
  'layout-handbook',
  'layout-chapter',
  'layout-product',
  'layout-showcase',
  'layout-listing',
  'layout-gallery',
  'layout-split',
]);

/** Layout slugs exempt from breadcrumb requirement. */
export const LANDING_LAYOUT_SLUGS = new Set([
  'layout-landing',
  'layout-marketing',
]);

const DOC_SIDEBAR_SELECTOR = [
  '.forge-sidebar',
  '#ks-sidebar-aside',
  '.fs-sidebar',
  'aside[data-ks-hash="Ksr"]',
  'aside[data-ks-name="doc-sidebar"]',
].join(',');

const BREADCRUMB_SELECTOR = [
  BREADCRUMB_ROOT_SELECTOR,
  `[data-ks-hash="${BREADCRUMB_HASH}"]`,
  `[hash="${BREADCRUMB_HASH}"]`,
  'nav[aria-label="breadcrumb"]',
  'nav[aria-label*="breadcrumb" i]',
].join(',');

export const rule = {
  id: 'DET.NAV.BREADCRUMB',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-nav-breadcrumb',
};

/**
 * @param {string} pathname
 */
export function isHomePathname(pathname) {
  const p = String(pathname || '').replace(/\/+$/, '') || '/';
  return p === '' || p === '/' || p === '/index.html';
}

/**
 * @param {{ isHome?: boolean, layoutName?: string, hasDocSidebar?: boolean, hasShowcaseHeader?: boolean }} signals
 */
export function pageRequiresBreadcrumbFromSignals(signals) {
  if (signals?.isHome) return false;
  const layoutName = String(signals?.layoutName || '').trim();
  if (layoutName && LANDING_LAYOUT_SLUGS.has(layoutName)) return false;
  if (layoutName && DOC_HUB_LAYOUT_SLUGS.has(layoutName)) return true;
  if (signals?.hasDocSidebar) return true;
  if (signals?.hasShowcaseHeader) return true;
  return false;
}

/**
 * @param {string} text
 */
export function breadcrumbHasMeaningfulContent(text) {
  const norm = String(text || '').replace(/\s+/g, ' ').trim();
  if (norm.length < 4) return false;
  if (/\b(home|docs|handbook|overview)\b/i.test(norm) && norm.length >= 4) return true;
  if (/[>/›|·→]/.test(norm)) return true;
  return norm.split(' ').filter((w) => w.length > 1).length >= 2;
}

/**
 * @param {{ requiresBreadcrumb?: boolean, breadcrumbPresent?: boolean, docHubSignals?: string[], breadcrumbHint?: string }} report
 * @param {string} [url]
 */
export function findingsFromNavBreadcrumbReport(report, url = '') {
  if (!report?.requiresBreadcrumb || report.breadcrumbPresent) return [];

  const signals = (report.docHubSignals || []).join(',') || 'doc-hub';
  const hint = String(report.breadcrumbHint || BREADCRUMB_ROOT_SELECTOR).slice(0, 120);

  const finding = {
    severity: 'warn',
    area: 'informationArchitecture',
    message:
      'Doc or product hub page is missing visible breadcrumb orientation chrome (Kbc / .ks-doc-breadcrumb).',
    evidence: `missing_breadcrumb signals=${signals} expected="${hint}"`,
    remediation:
      'Emit the Kbc doc-breadcrumb region (.ks-doc-breadcrumb with hash/data-ks-hash="Kbc") or nav[aria-label="breadcrumb"] showing the path to the current page per docs/design/catalog/chrome/Kbc-doc-breadcrumb.md.',
  };

  if (url) finding.evidence += ` url=${url}`;
  return [finding];
}

/** @param {import('playwright').Page} page */
export async function collectNavBreadcrumbReport(page) {
  return page.evaluate(
    ({
      DOC_HUB_LAYOUT_SLUGS: docHubLayouts,
      LANDING_LAYOUT_SLUGS: landingLayouts,
      DOC_SIDEBAR_SELECTOR: sidebarSelector,
      BREADCRUMB_SELECTOR: breadcrumbSelector,
      BREADCRUMB_ROOT_SELECTOR: rootSelector,
    }) => {
      const docHubSet = new Set(docHubLayouts);
      const landingSet = new Set(landingLayouts);
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

      const visible = (el) => {
        if (!el || el.nodeType !== 1) return false;
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 24 && rect.height > 12 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      const hasContent = (el) => {
        const links = el.querySelectorAll('a[href]');
        if (links.length >= 1) return true;
        const items = el.querySelectorAll('.breadcrumb-item, li');
        if (items.length >= 2) return true;
        const text = norm(el.innerText || el.textContent || el.getAttribute('aria-label') || '');
        if (text.length < 4) return false;
        if (/[>/›|·→]/.test(text)) return true;
        return text.split(' ').filter((w) => w.length > 1).length >= 2;
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

      let hasDocSidebar = false;
      for (const el of document.querySelectorAll(sidebarSelector)) {
        if (visible(el)) {
          hasDocSidebar = true;
          break;
        }
      }

      const headerContent = document.querySelector(
        '.site-header .site-header-content, header.site-header .site-header-content',
      );
      const hasShowcaseHeader = Boolean(headerContent && visible(headerContent));

      /** @type {string[]} */
      const docHubSignals = [];
      let requiresBreadcrumb = false;

      if (!isHome) {
        if (layoutName && docHubSet.has(layoutName)) {
          requiresBreadcrumb = true;
          docHubSignals.push(`layout:${layoutName}`);
        }
        if (hasDocSidebar) {
          requiresBreadcrumb = true;
          docHubSignals.push('doc-sidebar');
        }
        if (hasShowcaseHeader) {
          requiresBreadcrumb = true;
          docHubSignals.push('showcase-header');
        }
      }

      if (layoutName && landingSet.has(layoutName)) {
        requiresBreadcrumb = false;
        docHubSignals.push('landing-exempt');
      }

      let breadcrumbPresent = false;
      let breadcrumbHint = rootSelector;

      for (const el of document.querySelectorAll(breadcrumbSelector)) {
        if (!visible(el) || !hasContent(el)) continue;
        breadcrumbPresent = true;
        const id = el.id ? `#${el.id}` : '';
        const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 2).join('.');
        const hash = el.getAttribute('data-ks-hash') || el.getAttribute('hash') || '';
        breadcrumbHint = `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}${hash ? `[@${hash}]` : ''}`;
        break;
      }

      if (!breadcrumbPresent) {
        for (const el of document.querySelectorAll('header .breadcrumb, main .breadcrumb, .breadcrumb')) {
          if (!visible(el) || !hasContent(el)) continue;
          breadcrumbPresent = true;
          breadcrumbHint = '.breadcrumb';
          break;
        }
      }

      return {
        isHome,
        layoutName,
        requiresBreadcrumb,
        breadcrumbPresent,
        docHubSignals,
        breadcrumbHint,
      };
    },
    {
      DOC_HUB_LAYOUT_SLUGS: [...DOC_HUB_LAYOUT_SLUGS],
      LANDING_LAYOUT_SLUGS: [...LANDING_LAYOUT_SLUGS],
      DOC_SIDEBAR_SELECTOR,
      BREADCRUMB_SELECTOR,
      BREADCRUMB_ROOT_SELECTOR,
    },
  );
}

export async function run({ metrics, page, url }) {
  const report = metrics?.navBreadcrumbReport
    ?? (page ? await collectNavBreadcrumbReport(page) : null);
  if (!report || !report.requiresBreadcrumb || report.breadcrumbPresent) return [];
  return findingsFromNavBreadcrumbReport(report, url || metrics?.url || '');
}
