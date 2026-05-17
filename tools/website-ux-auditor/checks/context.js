export function pageContext(url, siteKind) {
  let pathname = '';
  try {
    pathname = new URL(url).pathname;
  } catch {
    pathname = '';
  }
  const isHome = pathname === '/' || pathname === '' || pathname === '/index.html';
  const isPlatformHandbookInner = siteKind === 'platform' && !isHome;
  return { pathname, isHome, isPlatformHandbookInner };
}
