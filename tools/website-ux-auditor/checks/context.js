/**
 * Handbook-style static builds (Forge Platform / Lenses / Fleet / LCDL private sites) use inner
 * doc pages like reference UX. Marketing-first checks (hero density, CTAs, etc.) apply on the
 * homepage only — same behavior as `--site-kind platform` handbook inner routing.
 */
const HANDBOOK_INNER_SITE_KINDS = new Set(['platform', 'lenses', 'fleet', 'lcdl']);

export function pageContext(url, siteKind) {
  let pathname = '';
  try {
    pathname = new URL(url).pathname;
  } catch {
    pathname = '';
  }
  const isHome = pathname === '/' || pathname === '' || pathname === '/index.html';
  const isPlatformHandbookInner = HANDBOOK_INNER_SITE_KINDS.has(siteKind) && !isHome;
  return { pathname, isHome, isPlatformHandbookInner };
}
