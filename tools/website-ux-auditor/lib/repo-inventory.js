import path from 'node:path';
import { fileExists, readMaybe } from './files.js';
import { appendDashboardLog } from './ux-loop-dashboard-state.js';

export const SKIP_DIRS = new Set([
  '.git', 'node_modules', '.next', '.nuxt', 'dist', 'build', 'out', '.cache', '.turbo',
  'coverage', '.vercel', '.netlify', 'vendor', '__pycache__', '.venv', 'venv',
  /** Generated site trees — inventory is heuristic-only; skipping avoids multi‑minute walks on handbook bundles. */
  'website', 'showcase',
]);

/**
 * @param {string} root
 * @param {number} [maxFiles]
 * @param {(count: number) => void} [onCounted] invoked every 1500 files collected (same cadence after first batch)
 */
export async function walkFiles(root, maxFiles = 6000, onCounted = null) {
  const fsp = await import('node:fs/promises');
  const results = [];
  async function walk(dir) {
    if (results.length >= maxFiles) return;
    let entries = [];
    try {
      entries = await fsp.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (results.length >= maxFiles) return;
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full).replaceAll(path.sep, '/');
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) await walk(full);
      } else if (entry.isFile()) {
        results.push(rel);
        if (onCounted && results.length % 1500 === 0) onCounted(results.length);
      }
    }
  }
  await walk(root);
  return results;
}

/** @typedef {Awaited<ReturnType<typeof inventoryRepo>>} RepoInventory */

/**
 * Lightweight repository survey for heuristic UX audits.
 *
 * @param {string} repo
 * @param {{ progressLog?: boolean, progressTag?: string }} [opts]
 * progressLog — stderr breadcrumbs during walk (auditor only; sitewide scorer stays quiet).
 * progressTag — prefix for lines (default `[ux-audit]`).
 * @returns {Promise<object>}
 */
export async function inventoryRepo(repo, opts = {}) {
  const progressLog = opts.progressLog === true;
  const tag = typeof opts.progressTag === 'string' && opts.progressTag.trim()
    ? opts.progressTag.trim()
    : '[ux-audit]';
  const watchOutDir = String(process.env.FORGE_UX_LOOP_WATCH_OUT_DIR || '').trim();

  const onCounted = progressLog
    ? (n) => {
      const line = `${tag} phase=inventory · ${n} paths sampled (still walking repo tree…)`;
      if (watchOutDir) appendDashboardLog(watchOutDir, line);
      else console.error(line);
    }
    : null;

  const files = await walkFiles(repo, 6000, onCounted);
  if (progressLog) {
    const line = `${tag} phase=inventory · done · ${files.length} paths (cap 6000)`;
    if (watchOutDir) appendDashboardLog(watchOutDir, line);
    else console.error(line);
  }
  const packageJsonPath = path.join(repo, 'package.json');
  let packageJson = {};
  if (await fileExists(packageJsonPath)) {
    try { packageJson = JSON.parse(await readMaybe(packageJsonPath)); } catch { packageJson = {}; }
  }
  const deps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
  const depNames = Object.keys(deps);
  let framework = 'unknown';
  if (depNames.includes('next') || files.some((f) => f === 'next.config.js' || f === 'next.config.mjs')) framework = 'Next.js';
  else if (depNames.includes('astro') || files.some((f) => f.startsWith('src/pages/') && f.endsWith('.astro'))) framework = 'Astro';
  else if (depNames.includes('@sveltejs/kit')) framework = 'SvelteKit';
  else if (depNames.includes('vite') && depNames.some((d) => ['react', 'vue', 'svelte'].includes(d))) framework = 'Vite app';
  else if (depNames.includes('vite')) framework = 'Vite/static';
  else if (files.some((f) => f.endsWith('.html'))) framework = 'static/html';

  const pageFiles = files.filter((f) => /(^|\/)(pages|app|routes|content|docs|src)\//.test(f) && /\.(tsx|jsx|ts|js|astro|svelte|vue|mdx|md|html)$/.test(f));
  const componentFiles = files.filter((f) => /(component|components|layouts|ui|partials|templates)\//i.test(f) && /\.(tsx|jsx|ts|js|astro|svelte|vue|html)$/.test(f));
  const styleFiles = files.filter((f) => /\.(css|scss|sass|less|pcss)$/.test(f) || /(tailwind|theme|tokens|styles)/i.test(f));
  const navCandidates = files.filter((f) => /(nav|navigation|header|layout|shell|sidebar|menu)/i.test(f) && /\.(tsx|jsx|ts|js|astro|svelte|vue|mdx|md|html)$/.test(f));

  return {
    packageName: packageJson.name || '',
    framework,
    fileCount: files.length,
    topFiles: files.slice(0, 300),
    pageFiles: pageFiles.slice(0, 120),
    componentFiles: componentFiles.slice(0, 120),
    styleFiles: styleFiles.slice(0, 80),
    navCandidates: navCandidates.slice(0, 80),
  };
}
