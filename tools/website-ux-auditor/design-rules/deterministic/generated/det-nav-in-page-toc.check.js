/**
 * DET.NAV.IN_PAGE_TOC — handbook/doc pages expose in-page TOC when content length
 * exceeds threshold; TOC hash links must resolve to heading targets inside main.
 */

/** Registry hash and root selector for Doc ToC sidebar (Ktx). */
export const TOC_HASH = 'Ktx';
export const TOC_ROOT_SELECTOR = '.col-lg-4.col-xl-3.order-1.order-lg-2';

/** Layout slugs where long-form doc reading expects an optional Ktx ToC column. */
export const DOC_TOC_LAYOUT_SLUGS = new Set([
  'layout-handbook',
  'layout-chapter',
  'layout-product',
  'layout-showcase',
  'layout-listing',
  'layout-gallery',
  'layout-split',
]);

/** Layout slugs exempt from in-page TOC requirement. */
export const LANDING_LAYOUT_SLUGS = new Set([
  'layout-landing',
  'layout-marketing',
]);

/** Minimum h2/h3 outline entries in main before TOC is required. */
export const MIN_TOC_OUTLINE_HEADINGS = 4;

/** Minimum main-body words before TOC is required (sparse-heading fallback). */
export const MIN_TOC_MAIN_WORDS = 900;

const DOC_SIDEBAR_SELECTOR = [
  '.forge-sidebar',
  '#ks-sidebar-aside',
  '.fs-sidebar',
  'aside[data-ks-hash="Ksr"]',
  'aside[data-ks-name="doc-sidebar"]',
].join(',');

const TOC_SELECTOR = [
  TOC_ROOT_SELECTOR,
  `[data-ks-hash="${TOC_HASH}"]`,
  `[hash="${TOC_HASH}"]`,
  'nav.forge-toc',
  'nav[aria-label="On this page"]',
  'nav[aria-label*="on this page" i]',
  '.ks-doc-toc',
  'aside.doc-toc',
].join(',');

export const rule = {
  id: 'DET.NAV.IN_PAGE_TOC',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-nav-in_page_toc',
};

/**
 * @param {string} pathname
 */
export function isHomePathname(pathname) {
  const p = String(pathname || '').replace(/\/+$/, '') || '/';
  return p === '' || p === '/' || p === '/index.html';
}

/**
 * @param {{ isHome?: boolean, layoutName?: string, hasDocSidebar?: boolean, hasShowcaseHeader?: boolean, outlineHeadingCount?: number, mainWordCount?: number }} signals
 */
export function pageRequiresTocFromSignals(signals) {
  if (signals?.isHome) return false;
  const layoutName = String(signals?.layoutName || '').trim();
  if (layoutName && LANDING_LAYOUT_SLUGS.has(layoutName)) return false;

  const docHub = (layoutName && DOC_TOC_LAYOUT_SLUGS.has(layoutName))
    || Boolean(signals?.hasDocSidebar)
    || Boolean(signals?.hasShowcaseHeader);
  if (!docHub) return false;

  const outline = Number(signals?.outlineHeadingCount ?? 0);
  const words = Number(signals?.mainWordCount ?? 0);
  return outline >= MIN_TOC_OUTLINE_HEADINGS || words >= MIN_TOC_MAIN_WORDS;
}

/**
 * @param {string} href
 */
export function isInPageHashHref(href) {
  const raw = String(href || '').trim();
  return raw.startsWith('#') && raw.length > 1 && !raw.startsWith('#/');
}

/**
 * @param {Array<{ href?: string, id?: string }>} brokenAnchors
 */
export function brokenAnchorFindings(brokenAnchors, url = '') {
  if (!Array.isArray(brokenAnchors) || !brokenAnchors.length) return [];

  const findings = [];
  const seen = new Set();

  for (const item of brokenAnchors.slice(0, 6)) {
    const href = String(item.href || '').slice(0, 80);
    const id = String(item.id || href.replace(/^#/, '')).slice(0, 80);
    const key = `${href}:${id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    findings.push({
      severity: 'major',
      area: 'informationArchitecture',
      message: 'In-page TOC link points to a missing or out-of-main heading target.',
      evidence: `broken_toc_anchor href="${href}" target_id="${id}"`,
      remediation:
        'Ensure each .forge-toc / Ktx nav-link href="#..." resolves to an id inside main; regenerate heading ids when titles change per docs/design/catalog/chrome/Ktx-doc-toc-sidebar.md.',
    });
  }

  if (url) {
    for (const finding of findings) {
      finding.evidence = `${finding.evidence} url=${url}`;
    }
  }

  return findings;
}

/**
 * @param {{ requiresToc?: boolean, tocPresent?: boolean, brokenAnchors?: Array<Record<string, unknown>>, docHubSignals?: string[], tocHint?: string, outlineHeadingCount?: number, mainWordCount?: number }} report
 * @param {string} [url]
 */
export function findingsFromNavInPageTocReport(report, url = '') {
  if (!report) return [];

  /** @type {Array<Record<string, unknown>>} */
  const findings = [];

  if (report.requiresToc && !report.tocPresent) {
    const signals = (report.docHubSignals || []).join(',') || 'doc-hub';
    const hint = String(report.tocHint || 'nav.forge-toc').slice(0, 120);
    const outline = Number(report.outlineHeadingCount ?? 0);
    const words = Number(report.mainWordCount ?? 0);
    const finding = {
      severity: 'warn',
      area: 'informationArchitecture',
      message:
        'Long handbook or doc page is missing a visible in-page table of contents (Ktx / .forge-toc).',
      evidence:
        `missing_in_page_toc signals=${signals} outline_h=${outline} main_words=${words} expected="${hint}"`,
      remediation:
        'Emit the Ktx doc-toc-sidebar region (.forge-toc inside .col-lg-4.col-xl-3 with hash/data-ks-hash="Ktx") listing main h2/h3 anchors when content exceeds the configured length threshold.',
    };
    if (url) finding.evidence += ` url=${url}`;
    findings.push(finding);
  }

  findings.push(...brokenAnchorFindings(report.brokenAnchors, url));
  return findings;
}

/** @param {import('playwright').Page} page */
export async function collectNavInPageTocReport(page) {
  return page.evaluate(
    ({
      DOC_TOC_LAYOUT_SLUGS: docTocLayouts,
      LANDING_LAYOUT_SLUGS: landingLayouts,
      DOC_SIDEBAR_SELECTOR: sidebarSelector,
      TOC_SELECTOR: tocSelector,
      TOC_ROOT_SELECTOR: rootSelector,
      MIN_TOC_OUTLINE_HEADINGS: minHeadings,
      MIN_TOC_MAIN_WORDS: minWords,
    }) => {
      const docTocSet = new Set(docTocLayouts);
      const landingSet = new Set(landingLayouts);
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

      const visible = (el) => {
        if (!el || el.nodeType !== 1) return false;
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 24 && rect.height > 12 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      const words = (text) => norm(text).split(/\s+/).filter(Boolean).length;

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

      const mainEl = document.querySelector('main#main') || document.querySelector('main');
      const mainRoot = mainEl || document.body;

      const outlineHeadingCount = mainEl
        ? mainEl.querySelectorAll('h2, h3').length
        : document.querySelectorAll('main h2, main h3').length;
      const mainWordCount = words(mainRoot.innerText || mainRoot.textContent || '');

      /** @type {string[]} */
      const docHubSignals = [];
      let requiresToc = false;

      if (!isHome) {
        if (layoutName && docTocSet.has(layoutName)) {
          requiresToc = true;
          docHubSignals.push(`layout:${layoutName}`);
        }
        if (hasDocSidebar) {
          requiresToc = true;
          docHubSignals.push('doc-sidebar');
        }
        if (hasShowcaseHeader) {
          requiresToc = true;
          docHubSignals.push('showcase-header');
        }
      }

      if (layoutName && landingSet.has(layoutName)) {
        requiresToc = false;
        docHubSignals.push('landing-exempt');
      }

      const lengthExceeded = outlineHeadingCount >= minHeadings || mainWordCount >= minWords;
      requiresToc = requiresToc && lengthExceeded;

      const tocHasLinks = (el) => {
        const links = el.querySelectorAll('a[href^="#"]');
        if (links.length >= 2) return true;
        const items = el.querySelectorAll('.nav-link, li a[href^="#"]');
        return items.length >= 2;
      };

      let tocPresent = false;
      let tocHint = rootSelector;
      /** @type {Element | null} */
      let tocRoot = null;

      for (const el of document.querySelectorAll(tocSelector)) {
        if (!visible(el) || !tocHasLinks(el)) continue;
        tocPresent = true;
        tocRoot = el;
        const id = el.id ? `#${el.id}` : '';
        const cls = norm(el.className).split(' ').filter(Boolean).slice(0, 2).join('.');
        const hash = el.getAttribute('data-ks-hash') || el.getAttribute('hash') || '';
        tocHint = `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ''}${hash ? `[@${hash}]` : ''}`;
        break;
      }

      if (!tocPresent) {
        for (const el of document.querySelectorAll('nav.forge-toc, [class*="toc"] nav')) {
          if (!visible(el) || !tocHasLinks(el)) continue;
          tocPresent = true;
          tocRoot = el;
          tocHint = 'nav.forge-toc';
          break;
        }
      }

      /** @type {Array<{ href: string, id: string }>} */
      const brokenAnchors = [];
      const resolveTarget = (hashHref) => {
        const id = String(hashHref || '').replace(/^#/, '').trim();
        if (!id) return null;
        let el = null;
        try {
          el = document.getElementById(id);
        } catch {
          el = null;
        }
        if (!el) {
          try {
            el = document.querySelector(`[id="${CSS.escape(id)}"]`);
          } catch {
            el = document.querySelector(`[id="${id.replace(/"/g, '\\"')}"]`);
          }
        }
        if (!el || !mainEl || !mainEl.contains(el)) return null;
        return el;
      };

      const scanRoot = tocRoot || document;
      for (const anchor of scanRoot.querySelectorAll('a[href^="#"]')) {
        const href = String(anchor.getAttribute('href') || '').trim();
        if (!href || href === '#' || href.startsWith('#/')) continue;
        if (!tocRoot && !anchor.closest('nav.forge-toc, [data-ks-hash="Ktx"], [class*="toc"]')) continue;
        if (!resolveTarget(href)) {
          brokenAnchors.push({ href, id: href.replace(/^#/, '') });
        }
      }

      return {
        isHome,
        layoutName,
        requiresToc,
        tocPresent,
        docHubSignals,
        tocHint,
        outlineHeadingCount,
        mainWordCount,
        brokenAnchors: brokenAnchors.slice(0, 8),
      };
    },
    {
      DOC_TOC_LAYOUT_SLUGS: [...DOC_TOC_LAYOUT_SLUGS],
      LANDING_LAYOUT_SLUGS: [...LANDING_LAYOUT_SLUGS],
      DOC_SIDEBAR_SELECTOR,
      TOC_SELECTOR,
      TOC_ROOT_SELECTOR,
      MIN_TOC_OUTLINE_HEADINGS,
      MIN_TOC_MAIN_WORDS,
    },
  );
}

export async function run({ metrics, page, url }) {
  const report = metrics?.navInPageTocReport
    ?? (page ? await collectNavInPageTocReport(page) : null);
  if (!report) return [];

  const hasIssue = (report.requiresToc && !report.tocPresent)
    || (Array.isArray(report.brokenAnchors) && report.brokenAnchors.length);
  if (!hasIssue) return [];

  return findingsFromNavInPageTocReport(report, url || metrics?.url || '');
}
