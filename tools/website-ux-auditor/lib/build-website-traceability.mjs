/**
 * Website repo traceability: KS hashes → source files, URL patterns → generator entries.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadGeneratedRegistry } from './visual-catalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HASH_RE = /^[A-Za-z]{3}$/;

/**
 * @param {string} dir
 */
async function gitHead(dir) {
  try {
    const { execSync } = await import('node:child_process');
    return execSync('git rev-parse HEAD', { cwd: dir, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

/**
 * @param {string} repoRoot
 */
async function resolveKsRepoRoot(repoRoot) {
  const candidates = [
    repoRoot,
    path.join(repoRoot, 'kitchensink'),
  ];
  for (const c of candidates) {
    const reg = path.join(c, 'docs/design/catalog/visual-registry.generated.json');
    try {
      await fs.access(reg);
      return c;
    } catch {
      /* try next */
    }
  }
  return repoRoot;
}

/**
 * @param {string} repoRoot
 */
async function grepHashInRepo(repoRoot, hash, cap = 12) {
  const hits = [];
  const patterns = [
    `hash="${hash}"`,
    `data-ks-hash="${hash}"`,
    `'${hash}'`,
  ];
  const scanDirs = ['components', 'generator', 'layouts', 'content'];
  for (const sub of scanDirs) {
    const dir = path.join(repoRoot, sub);
    try {
      const entries = await fs.readdir(dir, { recursive: true, withFileTypes: true });
      for (const ent of entries) {
        if (!ent.isFile() || !/\.(py|html|md|tsx|jsx|js)$/i.test(ent.name)) continue;
        const rel = path.join(sub, ent.name);
        const full = path.join(repoRoot, rel);
        let text;
        try {
          text = await fs.readFile(full, 'utf8');
        } catch {
          continue;
        }
        if (patterns.some((p) => text.includes(p))) {
          hits.push({ repo: path.basename(repoRoot), path: rel.replaceAll(path.sep, '/'), role: 'emitter' });
          if (hits.length >= cap) return hits;
        }
      }
    } catch {
      /* missing dir */
    }
  }
  return hits;
}

/**
 * @param {string} repoRoot
 */
async function loadContentMapUrlPatterns(repoRoot) {
  const mapPath = path.join(repoRoot, 'content-map.yaml');
  /** @type {Array<{ pattern: string, source: string }>} */
  const out = [];
  try {
    const text = await fs.readFile(mapPath, 'utf8');
    const lines = text.split('\n');
    let currentKey = '';
    for (const line of lines) {
      const keyM = line.match(/^\s{2}([a-z0-9_.-]+):\s*$/i);
      if (keyM) {
        currentKey = keyM[1];
        continue;
      }
      const pathM = line.match(/path:\s*["']?([^"'\n]+)/);
      if (pathM && currentKey) {
        out.push({ pattern: `/${currentKey.replace(/\./g, '/')}`, source: `content-map.yaml → ${currentKey}` });
      }
    }
  } catch {
    /* no map */
  }
  return out;
}

/**
 * @param {{
 *   websiteRepo: string,
 *   ksRepo?: string | null,
 *   inventory?: { pageFiles?: string[], componentFiles?: string[] } | null,
 * }} opts
 */
export async function buildWebsiteTraceabilityIndex(opts) {
  const websiteRepo = path.resolve(opts.websiteRepo);
  const ksRepo = path.resolve(opts.ksRepo || (await resolveKsRepoRoot(websiteRepo)));
  const reg = loadGeneratedRegistry(ksRepo);
  const entries = reg?.entries || [];

  /** @type {Map<string, object>} */
  const byHash = new Map();

  for (const row of entries) {
    const hash = row.hash && String(row.hash);
    if (!hash || !HASH_RE.test(hash)) continue;
    const sources = [];
    const contract = row.contract || row.contract_path;
    if (contract) {
      sources.push({ repo: path.basename(ksRepo), path: String(contract).replace(/^\//, ''), role: 'contract' });
    }
    for (const sp of row.source_paths || row.sourcePaths || []) {
      sources.push({ repo: path.basename(ksRepo), path: String(sp).replace(/^\//, ''), role: 'registry' });
    }
    const emitterHits = await grepHashInRepo(ksRepo, hash, 8);
    for (const h of emitterHits) {
      if (!sources.some((s) => s.path === h.path)) sources.push(h);
    }
    byHash.set(hash, {
      id: `ks.hash.${hash}`,
      hash,
      name: row.name || row.slug || '',
      taxonomyLevel: row.taxonomy_level || row.taxonomyLevel || null,
      sources,
    });
  }

  const urlPatterns = await loadContentMapUrlPatterns(websiteRepo);
  const pageFiles = (opts.inventory?.pageFiles || []).slice(0, 200).map((p) => ({
    path: p,
    role: 'page-candidate',
  }));

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    meta: {
      websiteRepo,
      ksRepo,
      gitHead: {
        website: gitHead(websiteRepo),
        ks: gitHead(ksRepo),
      },
    },
    byKsHash: Object.fromEntries([...byHash.entries()].map(([h, v]) => [h, v.id])),
    entries: [...byHash.values()].sort((a, b) => a.hash.localeCompare(b.hash)),
    urlPatterns,
    inventoryPageFiles: pageFiles,
  };
}

/**
 * Attach sources[] to principal catalog components.
 * @param {object} principalCatalog
 * @param {object} traceability
 */
export function mergeTraceabilityIntoCatalog(principalCatalog, traceability) {
  if (!principalCatalog?.components || !traceability?.entries) return principalCatalog;
  const byHash = new Map(traceability.entries.map((e) => [e.hash, e.sources || []]));
  principalCatalog.components = principalCatalog.components.map((c) => ({
    ...c,
    sources: c.hash && byHash.has(c.hash) ? byHash.get(c.hash) : c.sources || [],
  }));
  return principalCatalog;
}

/**
 * @param {string} outDir
 * @param {object} index
 */
export async function writeTraceabilityIndex(outDir, index) {
  const p = path.join(outDir, 'traceability.generated.json');
  await fs.writeFile(p, `${JSON.stringify(index, null, 2)}\n`);
  return p;
}
