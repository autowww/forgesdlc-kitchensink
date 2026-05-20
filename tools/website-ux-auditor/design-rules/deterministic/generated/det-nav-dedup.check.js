/**
 * DET.NAV.DEDUP — same destination must not repeat across conflicting chrome nav bands
 * (primary header, doc sidebar, mobile/offcanvas tree) without breadcrumb hierarchy.
 */

/** Peer chrome band pairs that must not repeat the same navigational destination. */
export const CONFLICTING_BAND_PAIRS = [
  ['primary', 'sidebar'],
  ['primary', 'offcanvas'],
  ['sidebar', 'offcanvas'],
];

const PRIMARY_BAND_SELECTOR = [
  'nav.fs-primary-nav-global',
  '[data-ks-hash="Kpn"]',
  'header.site-header nav',
  '.site-header nav',
  '.landing-header nav',
].join(',');

const SIDEBAR_BAND_SELECTOR = [
  '.forge-sidebar',
  '#ks-sidebar-aside',
  'aside[data-ks-hash="Ksr"]',
  'aside.forge-sidebar',
  'aside[class*="sidebar"]',
].join(',');

const OFFCANVAS_BAND_SELECTOR = [
  '.offcanvas',
  '.navbar-collapse',
  '[id*="navbarNav"]',
  '[class*="offcanvas"]',
].join(',');

const BREADCRUMB_BAND_SELECTOR = [
  '.ks-doc-breadcrumb',
  '[data-ks-hash="Kbc"]',
  'nav[aria-label="breadcrumb"]',
  'nav[aria-label*="breadcrumb" i]',
].join(',');

const TOC_BAND_SELECTOR = [
  '[data-ks-hash="Ktx"]',
  '.ks-doc-toc',
  'aside.doc-toc',
].join(',');

const FOOTER_BAND_SELECTOR = [
  'footer nav',
  'footer .nav',
  '.ks-site-footer-region nav',
].join(',');

export const rule = {
  id: 'DET.NAV.DEDUP',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-nav-dedup',
};

/**
 * @param {string} href
 * @param {string} [baseUrl]
 */
export function normalizeNavDestination(href, baseUrl = 'https://example.test/') {
  const raw = String(href || '').trim();
  if (!raw || /^javascript:|^mailto:|^tel:/i.test(raw)) return null;
  try {
    const url = new URL(raw, baseUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    const base = new URL(baseUrl);
    if (url.origin !== base.origin) return null;
    let path = url.pathname || '/';
    if (/\/index\.html?$/i.test(path)) {
      path = path.replace(/\/index\.html?$/i, '') || '/';
    }
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    const hash = url.hash && url.hash.length > 1 ? url.hash.toLowerCase() : '';
    return `${path}${hash}` || '/';
  } catch {
    return null;
  }
}

/**
 * @param {string} a
 * @param {string} b
 */
export function bandsConflict(a, b) {
  if (!a || !b || a === b) return false;
  return CONFLICTING_BAND_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

/**
 * @param {string[]} bands
 */
export function hasConflictingBandPair(bands) {
  const unique = [...new Set(bands)];
  for (let i = 0; i < unique.length; i += 1) {
    for (let j = i + 1; j < unique.length; j += 1) {
      if (bandsConflict(unique[i], unique[j])) return true;
    }
  }
  return false;
}

/**
 * @param {Array<{ pathname: string, band: string, label?: string, primaryRootId?: string }>} entries
 */
export function violationsFromNavLinkEntries(entries) {
  const byPath = new Map();
  for (const entry of entries || []) {
    const pathname = String(entry?.pathname || '').trim();
    const band = String(entry?.band || '').trim();
    if (!pathname || !band) continue;
    if (!byPath.has(pathname)) byPath.set(pathname, []);
    byPath.get(pathname).push(entry);
  }

  /** @type {Array<Record<string, unknown>>} */
  const violations = [];
  const seen = new Set();

  for (const [pathname, list] of byPath) {
    const bandsAll = [...new Set(list.map((e) => e.band))];
    const hasBreadcrumb = bandsAll.includes('breadcrumb');
    const chromeBands = bandsAll.filter((b) => b !== 'footer' && b !== 'breadcrumb');

    const primaryRoots = new Set(
      list.filter((e) => e.band === 'primary' && e.primaryRootId).map((e) => e.primaryRootId),
    );
    if (primaryRoots.size > 1) {
      const key = `primary-roots:${pathname}`;
      if (!seen.has(key)) {
        seen.add(key);
        violations.push({
          kind: 'duplicate-primary-roots',
          pathname,
          bands: ['primary'],
          labels: list.filter((e) => e.band === 'primary').map((e) => e.label).filter(Boolean).slice(0, 4),
          selectorHint: list.find((e) => e.band === 'primary')?.selectorHint || 'primary',
        });
      }
    }

    if (chromeBands.length < 2) continue;
    if (hasBreadcrumb && chromeBands.length === 1) continue;

    const assessBands = hasBreadcrumb
      ? chromeBands
      : bandsAll.filter((b) => b !== 'footer');

    if (!hasConflictingBandPair(assessBands)) continue;
    if (pathname.startsWith('#') && !assessBands.includes('primary')) continue;

    const pairKey = `${pathname}:${assessBands.sort().join('+')}`;
    if (seen.has(pairKey)) continue;
    seen.add(pairKey);

    violations.push({
      kind: 'duplicate-destination',
      pathname,
      bands: assessBands,
      labels: list.map((e) => e.label).filter(Boolean).slice(0, 5),
      selectorHint: list.map((e) => e.selectorHint).filter(Boolean)[0] || assessBands.join('+'),
    });
  }

  return violations.slice(0, 10);
}

/**
 * @param {{ violations?: Array<Record<string, unknown>> } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromNavDedupReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const pathname = String(v.pathname || '/').slice(0, 160);
    const bands = Array.isArray(v.bands) ? v.bands.join('+') : String(v.bands || '?');
    const key = `${v.kind || 'dup'}:${pathname}:${bands}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const labels = Array.isArray(v.labels) ? v.labels.join(' | ').slice(0, 120) : '';
    const hint = String(v.selectorHint || bands).slice(0, 120);
    const isPrimaryRoots = v.kind === 'duplicate-primary-roots';

    findings.push({
      severity: isPrimaryRoots ? 'major' : 'warn',
      area: 'informationArchitecture',
      message: isPrimaryRoots
        ? 'Competing primary navigation roots repeat the same destination (nested masthead / duplicate global nav).'
        : 'The same navigational destination appears in conflicting chrome bands without an intentional hierarchy.',
      evidence:
        `nav_dedup pathname="${pathname}" bands=${bands} kind=${v.kind || 'duplicate-destination'}${
          labels ? ` labels="${labels}"` : ''
        } hint="${hint}"`,
      remediation: isPrimaryRoots
        ? 'Keep a single Kpn primary nav horizon; remove nested site headers or duplicate .fs-primary-nav-global trees inside main (see Kpn contract).'
        : 'Deduplicate IA: keep the destination in one chrome band (primary OR sidebar OR offcanvas), use breadcrumb for hierarchy, and avoid mirroring the full handbook tree in header and sidebar.',
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
export async function collectNavDedupReport(page) {
  return page.evaluate(
    ({
      PRIMARY_BAND_SELECTOR,
      SIDEBAR_BAND_SELECTOR,
      OFFCANVAS_BAND_SELECTOR,
      BREADCRUMB_BAND_SELECTOR,
      TOC_BAND_SELECTOR,
      FOOTER_BAND_SELECTOR,
    }) => {
      const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

      const visible = (el) => {
        if (!el || el.nodeType !== 1) return false;
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 8 && rect.height > 8 && style.visibility !== 'hidden'
          && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
      };

      const auxiliaryLink = (a) => {
        const raw = String(a.getAttribute('href') || '').trim();
        const al = norm(a.getAttribute('aria-label') || a.textContent || '').toLowerCase();
        if (!raw || raw === '#') return true;
        if (/^#(main|content|skip|top|skipnav|navbarNav|page|root)\b/i.test(raw)) return true;
        if (/\bskip\b/.test(al) || al.includes('skip to')) return true;
        const idNearest = String(a.closest('[id]')?.id || '').toLowerCase();
        const cls = String(a.className || '').toLowerCase();
        if (idNearest.includes('cookie') || /\bcookie|consent\b/i.test(cls)) return true;
        if (/\btheme\b|\btoggle\b.*\btheme\b/i.test(al) || /\btheme-switch\b|\btheme-toggle\b/i.test(cls)) return true;
        return false;
      };

      const normalizeDest = (href) => {
        const raw = String(href || '').trim();
        if (!raw || /^javascript:|^mailto:|^tel:/i.test(raw)) return null;
        try {
          const url = new URL(raw, window.location.href);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
          if (url.origin !== window.location.origin) return null;
          let path = url.pathname || '/';
          if (/\/index\.html?$/i.test(path)) {
            path = path.replace(/\/index\.html?$/i, '') || '/';
          }
          if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
          const hash = url.hash && url.hash.length > 1 ? url.hash.toLowerCase() : '';
          return `${path}${hash}` || '/';
        } catch {
          return null;
        }
      };

      const mainEl = document.querySelector('main#main') || document.querySelector('main');
      const isOutsideMain = (el) => !mainEl || !mainEl.contains(el);

      const bandDefs = [
        { band: 'primary', selector: PRIMARY_BAND_SELECTOR },
        { band: 'sidebar', selector: SIDEBAR_BAND_SELECTOR },
        { band: 'offcanvas', selector: OFFCANVAS_BAND_SELECTOR },
        { band: 'breadcrumb', selector: BREADCRUMB_BAND_SELECTOR },
        { band: 'toc', selector: TOC_BAND_SELECTOR },
        { band: 'footer', selector: FOOTER_BAND_SELECTOR },
      ];

      /** @type {Map<string, { band: string, root: Element }>} */
      const bandRoots = new Map();
      for (const def of bandDefs) {
        for (const el of document.querySelectorAll(def.selector)) {
          if (!(el instanceof HTMLElement) || !isOutsideMain(el)) continue;
          if (def.band === 'offcanvas' || def.band === 'sidebar') {
            if (!visible(el) && el.querySelectorAll('a[href]').length < 3) continue;
          } else if (!visible(el)) continue;
          const key = `${def.band}:${el.tagName}:${el.id || ''}:${norm(el.className).slice(0, 40)}`;
          if (!bandRoots.has(key)) bandRoots.set(key, { band: def.band, root: el });
        }
      }

      /** @type {Array<{ pathname: string, band: string, label: string, selectorHint: string, primaryRootId?: string }>} */
      const entries = [];
      const seenAnchor = new Set();

      for (const { band, root } of bandRoots.values()) {
        const primaryRootId = band === 'primary'
          ? `${root.tagName}:${root.id || norm(root.className).slice(0, 30)}`
          : undefined;

        for (const a of root.querySelectorAll('a[href]')) {
          if (!(a instanceof HTMLAnchorElement) || !visible(a) || auxiliaryLink(a)) continue;
          const pathname = normalizeDest(a.getAttribute('href') || '');
          if (!pathname) continue;
          const label = norm(a.innerText || a.textContent || a.getAttribute('aria-label') || '');
          if (label.length < 2 && !pathname.startsWith('#')) continue;

          const anchorKey = `${band}:${pathname}:${label.toLowerCase()}:${primaryRootId || ''}`;
          if (seenAnchor.has(anchorKey)) continue;
          seenAnchor.add(anchorKey);

          const id = a.id ? `#${a.id}` : '';
          const cls = norm(a.className).split(' ').filter(Boolean).slice(0, 2).join('.');
          entries.push({
            pathname,
            band,
            label: label.slice(0, 80),
            selectorHint: `${band}${id}${cls ? `.${cls}` : ''}`,
            primaryRootId,
          });
        }
      }

      const byPath = new Map();
      for (const entry of entries) {
        if (!byPath.has(entry.pathname)) byPath.set(entry.pathname, []);
        byPath.get(entry.pathname).push(entry);
      }

      /** @type {Array<Record<string, unknown>>} */
      const violations = [];
      const seenViolation = new Set();

      const bandsConflict = (a, b) => {
        const pairs = [
          ['primary', 'sidebar'],
          ['primary', 'offcanvas'],
          ['sidebar', 'offcanvas'],
        ];
        return pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
      };

      const hasConflict = (bands) => {
        const u = [...new Set(bands)];
        for (let i = 0; i < u.length; i += 1) {
          for (let j = i + 1; j < u.length; j += 1) {
            if (bandsConflict(u[i], u[j])) return true;
          }
        }
        return false;
      };

      for (const [pathname, list] of byPath) {
        const bandsAll = [...new Set(list.map((e) => e.band))];
        const hasBreadcrumb = bandsAll.includes('breadcrumb');
        const chromeBands = bandsAll.filter((b) => b !== 'footer' && b !== 'breadcrumb');

        const primaryRoots = new Set(
          list.filter((e) => e.band === 'primary' && e.primaryRootId).map((e) => e.primaryRootId),
        );
        if (primaryRoots.size > 1) {
          const key = `primary-roots:${pathname}`;
          if (!seenViolation.has(key)) {
            seenViolation.add(key);
            violations.push({
              kind: 'duplicate-primary-roots',
              pathname,
              bands: ['primary'],
              labels: list.filter((e) => e.band === 'primary').map((e) => e.label).slice(0, 4),
              selectorHint: list.find((e) => e.band === 'primary')?.selectorHint || 'primary',
            });
          }
        }

        if (chromeBands.length < 2) continue;
        if (hasBreadcrumb && chromeBands.length === 1) continue;
        const assessBands = hasBreadcrumb ? chromeBands : bandsAll.filter((b) => b !== 'footer');
        if (!hasConflict(assessBands)) continue;
        if (pathname.startsWith('#') && !assessBands.includes('primary')) continue;

        const pairKey = `${pathname}:${assessBands.sort().join('+')}`;
        if (seenViolation.has(pairKey)) continue;
        seenViolation.add(pairKey);
        violations.push({
          kind: 'duplicate-destination',
          pathname,
          bands: assessBands,
          labels: list.map((e) => e.label).slice(0, 5),
          selectorHint: list.map((e) => e.selectorHint).filter(Boolean)[0] || assessBands.join('+'),
        });
      }

      return {
        linkEntryCount: entries.length,
        violations: violations.slice(0, 10),
      };
    },
    {
      PRIMARY_BAND_SELECTOR,
      SIDEBAR_BAND_SELECTOR,
      OFFCANVAS_BAND_SELECTOR,
      BREADCRUMB_BAND_SELECTOR,
      TOC_BAND_SELECTOR,
      FOOTER_BAND_SELECTOR,
    },
  );
}

export async function run({ metrics, page, url }) {
  let report = metrics?.navDedupReport ?? null;
  if (!report && page) {
    report = await collectNavDedupReport(page);
  }
  if (!report) return [];

  if (Array.isArray(report.entries) && report.entries.length && !report.violations?.length) {
    report = { violations: violationsFromNavLinkEntries(report.entries) };
  }

  if (!(report.violations || []).length) return [];
  return findingsFromNavDedupReport(report, url || metrics?.url || '');
}
