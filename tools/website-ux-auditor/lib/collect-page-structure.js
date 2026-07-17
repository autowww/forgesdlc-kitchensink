/**
 * Per-page DOM structure: KS markers, layout, page type heuristics, anonymous fingerprints.
 */

import { pageContext } from '../checks/context.js';

const HASH_RE = /^[A-Za-z]{3}$/;

/**
 * Collect structure in the browser (call via page.evaluate).
 * @param {string} pageUrl
 */
export function collectPageStructureInBrowser(pageUrl) {
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

  const layoutEl = document.querySelector('[data-ks-type="layout"]');
  const layoutKsName = layoutEl?.getAttribute('data-ks-name') || '';
  const layoutHashRaw = layoutEl?.getAttribute('data-ks-hash') || layoutEl?.getAttribute('hash') || '';
  const layoutHash = HASH_RE.test(String(layoutHashRaw).trim()) ? String(layoutHashRaw).trim() : '';

  const mainEl = document.querySelector('main, [role="main"]');
  const headerEl = document.querySelector('header, [role="banner"]');
  const navEl = document.querySelector('nav, [role="navigation"]');
  const asideEl = document.querySelector('aside, [role="complementary"]');

  const mainRect = mainEl?.getBoundingClientRect();
  const firstH1 = document.querySelector('main h1, [role="main"] h1, h1');
  const firstH1Top = firstH1 ? Math.round(firstH1.getBoundingClientRect().top) : -1;

  const columnGuess = (() => {
    if (!mainEl) return 1;
    const children = Array.from(mainEl.children).filter((c) => {
      const r = c.getBoundingClientRect();
      return r.width > 80 && r.height > 40;
    });
    if (children.length < 2) return 1;
    const tops = children.map((c) => Math.round(c.getBoundingClientRect().top));
    const uniqueTops = new Set(tops);
    return uniqueTops.size >= 2 && children.length >= 2 ? 2 : 1;
  })();

  const layoutFingerprint = [
    mainEl ? 'main' : 'no-main',
    headerEl ? 'hdr' : '',
    navEl ? 'nav' : '',
    asideEl ? 'aside' : '',
    `cols${columnGuess}`,
    `h1@${firstH1Top}`,
    layoutKsName ? `ks:${layoutKsName}` : '',
  ]
    .filter(Boolean)
    .join('|');

  /** @type {Array<object>} */
  const instances = [];
  const seenSig = new Map();
  let instIdx = 0;

  const compactSelector = (el) => {
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const role = el.getAttribute('role');
    const ksName = el.getAttribute('data-ks-name');
    if (ksName) return `${tag}[data-ks-name="${ksName}"]`;
    if (id) return `${tag}${id}`;
    if (role) return `${tag}[role="${role}"]`;
    const cls = (el.className && typeof el.className === 'string' ? el.className : '')
      .split(/\s+/)
      .filter((c) => c && !/^col-/.test(c))
      .slice(0, 2)
      .join('.');
    return cls ? `${tag}.${cls}` : tag;
  };

  const taxonomyFromKsType = (ksType) => {
    const t = String(ksType || '').toLowerCase();
    if (t === 'layout') return 'layouts';
    if (t === 'chrome-region') return 'chrome-regions';
    if (t === 'section' || t === 'content-section') return 'content-sections';
    if (t === 'card' || t === 'surface') return 'cards-surfaces';
    if (t === 'nav' || t === 'navigation') return 'navigation-components';
    if (t === 'react-primitive') return 'react-primitives';
    return 'cards-surfaces';
  };

  const roots = Array.from(document.querySelectorAll('[data-ks-hash], [hash]'));
  for (const el of roots) {
    const dRaw = String(el.getAttribute('data-ks-hash') || '').trim();
    const hRaw = String(el.getAttribute('hash') || '').trim();
    const dValid = HASH_RE.test(dRaw);
    const hValid = HASH_RE.test(hRaw);
    if (!dValid && !hValid) continue;
    const hash = dValid ? dRaw : hRaw;
    const ksType = el.getAttribute('data-ks-type') || '';
    const ksName = el.getAttribute('data-ks-name') || '';
    const sigKey = hash ? `ks:${hash}` : `anon:${compactSelector(el)}`;
    const repeatIndex = seenSig.get(sigKey) || 0;
    seenSig.set(sigKey, repeatIndex + 1);
    const signatureId = hash
      ? `cmp:${ksName || 'hash'}:${hash}`
      : `heuristic:${taxonomyFromKsType(ksType)}:${sigKey.slice(0, 48)}`;
    instances.push({
      nodeId: `inst${instIdx++}`,
      signatureId,
      taxonomyLevel: taxonomyFromKsType(ksType),
      hash: hash || null,
      ksType: ksType || null,
      ksName: ksName || null,
      selectorPath: compactSelector(el),
      repeatIndex,
      confidence: hash ? 'deterministic' : 'heuristic',
    });
  }

  const pathname = (() => {
    try {
      return new URL(pageUrl).pathname;
    } catch {
      return '/';
    }
  })();
  const isHome = pathname === '/' || pathname === '' || pathname === '/index.html';
  const bodyText = norm(document.body?.innerText || '').toLowerCase();
  const hasHandbookChrome =
    (document.querySelector('.sidebar, .offcanvas, [data-bs-toggle="offcanvas"]') != null) ||
    bodyText.includes('on this page') ||
    (document.querySelectorAll('nav a').length > 25 && !isHome);

  let pageTypeId = 'generic';
  if (isHome) {
    pageTypeId = hasHandbookChrome ? 'handbook-home' : 'landing';
  } else if (hasHandbookChrome || pathname.includes('/docs/') || pathname.includes('/handbook/')) {
    pageTypeId = 'handbook-chapter';
  } else if (document.querySelector('[role="tablist"], .nav-tabs')) {
    pageTypeId = 'reference';
  } else if (document.querySelector('.cap-app-grid')) {
    pageTypeId = 'app-shell';
  } else if (bodyText.includes('dashboard') || document.querySelector('[role="dialog"]')) {
    pageTypeId = 'app-shell';
  }

  const layoutId = layoutHash
    ? `ks:layout:${layoutKsName || layoutHash}`
    : layoutKsName
      ? `layout:${layoutKsName}`
      : `heuristic:${layoutFingerprint.slice(0, 80)}`;

  return {
    pageType: {
      id: pageTypeId,
      confidence: layoutHash || layoutKsName ? 'deterministic' : 'heuristic',
    },
    layout: {
      id: layoutId,
      ksName: layoutKsName || null,
      hash: layoutHash || null,
      fingerprint: layoutFingerprint,
    },
    instances,
    layoutFingerprint,
  };
}

/**
 * @param {import('playwright').Page} page
 * @param {string} url
 * @param {string} siteKind
 */
export async function collectPageStructure(page, url, siteKind) {
  const raw = await page.evaluate(collectPageStructureInBrowser, url);
  const ctx = pageContext(url, siteKind);
  if (ctx.isAppShell && raw.pageType?.id !== 'app-shell') {
    raw.pageType = { id: 'app-shell', confidence: 'heuristic' };
  }
  if (ctx.isPlatformHandbookInner && raw.pageType?.id === 'generic') {
    raw.pageType = { id: 'handbook-chapter', confidence: 'heuristic' };
  }
  return raw;
}
