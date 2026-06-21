import fs from 'node:fs/promises';
import path from 'node:path';

import { findFilesRecursive } from '../ops.mjs';

const VITE_ENTRY_NAMES = ['main.tsx', 'main.ts', 'main.jsx', 'main.js', 'App.tsx', 'App.jsx'];
const JSX_EXT = /\.(tsx|jsx)$/i;
const CSS_EXT = /\.css$/i;

/**
 * @param {string} repoRoot
 */
async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} repoRoot
 */
async function discoverViteRoots(repoRoot) {
  /** @type {string[]} */
  const roots = [];
  const candidates = [
    path.join(repoRoot, 'src'),
    path.join(repoRoot, 'app', 'src'),
    path.join(repoRoot, 'client', 'src'),
    path.join(repoRoot, 'frontend', 'src'),
    path.join(repoRoot, 'react'),
    path.join(repoRoot, 'cockpit-ui', 'src'),
  ];
  for (const c of candidates) {
    if (await exists(c)) roots.push(c);
  }
  return roots;
}

/**
 * @param {object} finding
 */
function sourcesFromFinding(finding) {
  /** @type {{ rel: string, confidence: number }[]} */
  const out = [];
  for (const s of finding?.sources || []) {
    const rel = String(s.path || s.file || '').trim().replace(/^\//, '');
    if (!rel) continue;
    out.push({ rel, confidence: 0.92 });
  }
  return out;
}

/**
 * @param {string} evidence
 */
function pathFromEvidence(evidence) {
  const m = String(evidence || '').match(/\b(?:path|file|source)=([^\s"]+)/i);
  return m ? m[1].replace(/^"|"$/g, '') : '';
}

/**
 * @param {string} repoRoot
 * @param {object[]} findings
 * @param {{ extensions?: RegExp, max?: number }} [opts]
 */
export async function locateSourceCandidates(repoRoot, findings, opts = {}) {
  const extensions = opts.extensions || JSX_EXT;
  const max = opts.max ?? 12;
  /** @type {Map<string, number>} */
  const scored = new Map();

  const add = (rel, confidence, reason) => {
    const norm = rel.replace(/\\/g, '/');
    if (!norm || norm.includes('node_modules')) return;
    const prev = scored.get(norm) ?? 0;
    scored.set(norm, Math.max(prev, confidence));
    void reason;
  };

  for (const f of findings || []) {
    for (const { rel, confidence } of sourcesFromFinding(f)) {
      if (extensions.test(rel)) add(rel, confidence, 'sources[]');
    }
    const evPath = pathFromEvidence(f.evidence);
    if (evPath && extensions.test(evPath)) add(evPath, 0.75, 'evidence path');
  }

  const viteRoots = await discoverViteRoots(repoRoot);
  for (const root of viteRoots) {
    const relRoot = path.relative(repoRoot, root).replace(/\\/g, '/');
    for (const name of VITE_ENTRY_NAMES) {
      const rel = `${relRoot}/${name}`.replace(/^\//, '');
      if (await exists(path.join(repoRoot, rel))) add(rel, 0.55, 'vite entry');
    }
  }

  const tracePath = path.join(repoRoot, 'docs', 'design', 'catalog', 'traceability-index.json');
  if (await exists(tracePath)) {
    try {
      const doc = JSON.parse(await fs.readFile(tracePath, 'utf8'));
      for (const row of doc.entries || doc.routes || []) {
        const rel = String(row.sourcePath || row.tsx || row.component || '').replace(/^\//, '');
        if (rel && extensions.test(rel)) add(rel, 0.7, 'traceability');
      }
    } catch {
      /* ignore malformed index */
    }
  }

  if (!scored.size && viteRoots.length) {
    for (const root of viteRoots.slice(0, 2)) {
      const files = await findFilesRecursive(root, extensions);
      for (const abs of files.slice(0, 8)) {
        add(path.relative(repoRoot, abs).replace(/\\/g, '/'), 0.4, 'vite scan');
      }
    }
  }

  const candidates = [...scored.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([rel, confidence]) => ({ path: rel, abs: path.join(repoRoot, rel), confidence }));

  const top = candidates[0]?.confidence ?? 0;
  return {
    candidates,
    confidence: top,
    viteRoots: viteRoots.map((r) => path.relative(repoRoot, r).replace(/\\/g, '/')),
  };
}

/**
 * @param {string} repoRoot
 * @param {object[]} findings
 */
export async function locateCssCandidates(repoRoot, findings) {
  return locateSourceCandidates(repoRoot, findings, { extensions: CSS_EXT, max: 8 });
}

/**
 * @param {string} repoRoot
 */
export async function locateViteEntry(repoRoot) {
  const viteRoots = await discoverViteRoots(repoRoot);
  for (const root of viteRoots) {
    for (const name of VITE_ENTRY_NAMES) {
      const abs = path.join(root, name);
      if (await exists(abs)) {
        return {
          abs,
          rel: path.relative(repoRoot, abs).replace(/\\/g, '/'),
          confidence: 0.7,
        };
      }
    }
  }
  const indexHtml = path.join(repoRoot, 'index.html');
  if (await exists(indexHtml)) {
    return { abs: indexHtml, rel: 'index.html', confidence: 0.5 };
  }
  return null;
}
