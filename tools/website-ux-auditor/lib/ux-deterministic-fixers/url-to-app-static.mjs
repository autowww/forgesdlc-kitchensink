import fs from 'node:fs/promises';
import path from 'node:path';

const STATIC_ROOT = path.join('forge_accessibility', 'static');

/**
 * Resolve traceability sources[] to absolute HTML paths under the app repo.
 * @param {string} repoRoot
 * @param {object[]} findings
 */
export function htmlPathsFromSources(repoRoot, findings) {
  /** @type {Set<string>} */
  const paths = new Set();
  for (const f of findings || []) {
    for (const s of f.sources || []) {
      const rel = String(s.path || '').trim();
      if (!rel || !/\.html?$/i.test(rel)) continue;
      paths.add(path.join(repoRoot, rel.replace(/^\//, '')));
    }
  }
  return [...paths];
}

/**
 * Map a Studio scenario URL (hash route) to static HTML under forge_accessibility/static/.
 * @param {string} repoRoot
 * @param {string} url
 */
export async function urlToAppHtmlPath(repoRoot, url) {
  const raw = String(url || '').trim();
  if (!raw) return '';

  let hash = '';
  try {
    hash = new URL(raw).hash.replace(/^#/, '');
  } catch {
    const m = raw.match(/#([\w-]+)/);
    hash = m ? m[1] : '';
  }

  const staticBase = path.join(repoRoot, STATIC_ROOT);
  if (hash) {
    const partial = path.join(staticBase, 'partials', `${hash}.html`);
    try {
      await fs.access(partial);
      return partial;
    } catch {
      /* fall through */
    }
  }

  const index = path.join(staticBase, 'index.html');
  try {
    await fs.access(index);
    return index;
  } catch {
    return '';
  }
}

/**
 * Sync variant of urlToAppHtmlPath (no fs access).
 * @param {string} repoRoot
 * @param {string} url
 */
export function urlToAppHtmlPathSync(repoRoot, url) {
  const raw = String(url || '').trim();
  if (!raw) return '';

  let hash = '';
  try {
    hash = new URL(raw).hash.replace(/^#/, '');
  } catch {
    const m = raw.match(/#([\w-]+)/);
    hash = m ? m[1] : '';
  }

  const staticBase = path.join(repoRoot, STATIC_ROOT);
  if (hash) {
    return path.join(staticBase, 'partials', `${hash}.html`);
  }
  return path.join(staticBase, 'index.html');
}

/**
 * Unique app static HTML paths from findings (sources first, then hash URLs).
 * @param {string} repoRoot
 * @param {object[]} findings
 */
export function htmlPathsFromAppFindings(repoRoot, findings) {
  /** @type {Set<string>} */
  const paths = new Set(htmlPathsFromSources(repoRoot, findings));
  for (const f of findings || []) {
    const p = urlToAppHtmlPathSync(repoRoot, f.url || '');
    if (p) paths.add(p);
  }
  return [...paths];
}
