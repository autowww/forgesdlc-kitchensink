/**
 * Collect per-page control labels for sitewide consistent-identification checks.
 */

/**
 * @param {import('playwright').Page} page
 */
export async function collectLabelSamples(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
    /** @type {Array<{ key: string, label: string }>} */
    const samples = [];

    for (const a of document.querySelectorAll('a[href]')) {
      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#')) continue;
      let pathKey;
      try {
        pathKey = new URL(href, window.location.href).pathname;
      } catch {
        continue;
      }
      const label = norm(
        a.getAttribute('aria-label') ||
          a.getAttribute('title') ||
          a.querySelector('img')?.getAttribute('alt') ||
          a.textContent ||
          '',
      );
      if (!label) {
        samples.push({ key: `link:${pathKey}`, label: '(empty)' });
        continue;
      }
      samples.push({ key: `link:${pathKey}`, label });
    }

    for (const btn of document.querySelectorAll('button,[role="button"],input[type="submit"],input[type="button"]')) {
      const label = norm(
        btn.getAttribute('aria-label') ||
          btn.getAttribute('value') ||
          btn.getAttribute('title') ||
          btn.textContent ||
          '',
      );
      const form = btn.closest('form');
      const formId = form?.id || form?.getAttribute('name') || '';
      const name = btn.getAttribute('name') || '';
      const key = `button:${formId}:${name || label.slice(0, 40) || 'unnamed'}`;
      samples.push({ key, label: label || '(empty)' });
    }

    return samples.slice(0, 80);
  });
}
