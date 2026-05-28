import path from 'node:path';

import { htmlPathsFromAppFindings, htmlPathsFromSources } from './url-to-app-static.mjs';

/**
 * Map audit page URL to a static HTML file under website/.
 * @param {string} repoRoot
 * @param {string} url
 */
export function urlToWebsiteHtmlPath(repoRoot, url) {
  const raw = String(url || '').trim();
  if (!raw) return '';

  let pathname = '/';
  if (raw.startsWith('file://')) {
    const abs = decodeURIComponent(raw.replace(/^file:\/\//, ''));
    const webRoot = path.join(repoRoot, 'website');
    if (abs.startsWith(webRoot)) {
      return abs;
    }
    return '';
  }

  try {
    pathname = new URL(raw).pathname;
  } catch {
    pathname = raw.startsWith('/') ? raw : `/${raw}`;
  }

  let rel = pathname.replace(/\/+$/, '') || '/';
  if (rel === '/') rel = '/index.html';
  else if (!path.extname(rel)) rel = `${rel}/index.html`;
  else if (!rel.endsWith('.html')) rel = `${rel}.html`;

  return path.join(repoRoot, 'website', rel.replace(/^\//, ''));
}

/**
 * Unique HTML paths from findings (cap applied by caller).
 * @param {string} repoRoot
 * @param {object[]} findings
 */
export function htmlPathsFromFindings(repoRoot, findings) {
  /** @type {Set<string>} */
  const paths = new Set();
  for (const f of findings) {
    const p = urlToWebsiteHtmlPath(repoRoot, f.url || '');
    if (p) paths.add(p);
  }
  for (const p of htmlPathsFromSources(repoRoot, findings)) paths.add(p);
  for (const p of htmlPathsFromAppFindings(repoRoot, findings)) paths.add(p);
  return [...paths];
}
