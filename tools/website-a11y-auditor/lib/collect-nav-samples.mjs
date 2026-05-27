/**
 * Collect primary navigation fingerprints for sitewide consistent-navigation checks.
 */

/**
 * @param {import('playwright').Page} page
 */
export async function collectNavSamples(page) {
  return page.evaluate(() => {
    const nav =
      document.querySelector('nav[aria-label],nav,#main-nav,[role="navigation"]') ||
      document.querySelector('nav');
    if (!nav) {
      return { navLabel: '', linkPaths: [] };
    }
    const navLabel = (
      nav.getAttribute('aria-label') ||
      nav.getAttribute('aria-labelledby') ||
      ''
    ).trim();
    const linkPaths = [...nav.querySelectorAll('a[href]')]
      .map((a) => {
        try {
          return new URL(a.getAttribute('href') || '', window.location.href).pathname;
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .slice(0, 40);
    return { navLabel: navLabel.toLowerCase(), linkPaths };
  });
}
