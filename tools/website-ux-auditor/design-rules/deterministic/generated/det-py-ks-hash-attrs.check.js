/**
 * DET.PY.KS_HASH_ATTRS — Python HTML renderers route visual-root markers through
 * `ks_hash_attrs` or `ks_catalog_hashes` helpers (`layout_shell_attrs`, `page_main_attrs`,
 * `chrome_region_attrs`), not ad-hoc attribute strings.
 */

import fs from 'node:fs';
import path from 'node:path';

import { loadGeneratedRegistry } from '../../../lib/visual-catalog.js';

/** Cap findings per audit pass (repo-wide Python scan). */
export const MAX_PY_KS_HASH_ATTRS_FINDINGS = 12;

/** Canonical helper call sites (equivalent to ks_hash_attrs). */
export const HELPER_CALL_RE =
  /\b(?:ks_hash_attrs|layout_shell_attrs|page_main_attrs|chrome_region_attrs)\s*\(/;

export const CATALOG_HASH_IMPORT_RE =
  /\bfrom\s+ks_catalog_hashes\s+import\b|\bimport\s+ks_catalog_hashes\b/;

/** Inline governed-marker literals outside the canonical helper module. */
export const MANUAL_MARKER_PATTERNS = [
  /data-ks-hash\s*=\s*["']/,
  /data-ks-type\s*=\s*["']/,
  /data-ks-name\s*=\s*["']/,
  /\bhash\s*=\s*["'][A-Za-z]{3}["']/,
];

/** Python trees scanned for forbidden manual marker literals. */
export const PY_SCAN_DIRS = ['components', 'generator', 'forge-autodoc'];

/** Files allowed to contain inline marker string literals. */
export const EXEMPT_MANUAL_LITERAL_PATHS = new Set(['components/ks_hash_attrs.py']);

/**
 * Python modules that emit showcase/layout chrome markers (registry layout/chrome
 * rows plus build wrappers). Page modules under generator/pages/ compose layouts;
 * markers are applied in build-showcase.py / layout_previews.py.
 */
export const BASE_MARKER_EMITTER_PY_PATHS = [
  'components/layouts.py',
  'components/components.py',
  'components/ks_catalog_hashes.py',
  'generator/build-showcase.py',
  'generator/layout_previews.py',
  'forge-autodoc/forge_autodoc/page.py',
];

const REGISTRY_EMITTER_TYPES = new Set(['layout', 'chrome-region', 'layout-preview']);

export const rule = {
  id: 'DET.PY.KS_HASH_ATTRS',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'minor',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-py-ks_hash_attrs',
};

/**
 * @param {object[] | null | undefined} entries
 * @returns {string[]}
 */
export function collectMarkerEmitterPyPaths(entries) {
  /** @type {Set<string>} */
  const paths = new Set(BASE_MARKER_EMITTER_PY_PATHS);
  for (const e of entries || []) {
    if (String(e?.status || '').toLowerCase() !== 'active') continue;
    if (!REGISTRY_EMITTER_TYPES.has(String(e?.type || ''))) continue;
    for (const sp of e.source_paths || []) {
      const rel = String(sp || '').replace(/\\/g, '/').trim();
      if (rel.endsWith('.py')) paths.add(rel);
    }
  }
  return [...paths].sort();
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function usesKsHashHelper(text) {
  return HELPER_CALL_RE.test(String(text || '')) || CATALOG_HASH_IMPORT_RE.test(String(text || ''));
}

/**
 * @param {string} text
 * @returns {string | null}
 */
export function firstManualMarkerPattern(text) {
  for (const re of MANUAL_MARKER_PATTERNS) {
    if (re.test(String(text || ''))) return String(re);
  }
  return null;
}

/**
 * @param {string} dir
 * @param {string} prefix
 * @returns {string[]}
 */
function walkPyFiles(dir, prefix = '') {
  /** @type {string[]} */
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    const st = fs.statSync(abs);
    if (st.isDirectory()) {
      if (name === '__pycache__' || name === '.venv') continue;
      out.push(...walkPyFiles(abs, rel));
      continue;
    }
    if (name.endsWith('.py')) out.push(rel.replace(/\\/g, '/'));
  }
  return out.sort();
}

/**
 * @param {string} repoRoot
 */
export function scanPyKsHashAttrs(repoRoot) {
  const reg = loadGeneratedRegistry(repoRoot);
  const emitterPaths = collectMarkerEmitterPyPaths(reg?.entries || []);

  /** @type {Array<{ kind: string, path: string, message: string }>} */
  const issues = [];

  for (const rel of emitterPaths) {
    const abs = path.join(repoRoot, rel);
    if (!fs.existsSync(abs)) {
      issues.push({
        kind: 'missing-emitter',
        path: rel,
        message: `Marker emitter module ${rel} is missing on disk.`,
      });
      continue;
    }
    const text = fs.readFileSync(abs, 'utf8');
    if (!usesKsHashHelper(text)) {
      issues.push({
        kind: 'missing-helper',
        path: rel,
        message: `${rel} emits governed visual roots but does not call ks_hash_attrs or ks_catalog_hashes helpers.`,
      });
    }
  }

  for (const dirName of PY_SCAN_DIRS) {
    const absDir = path.join(repoRoot, dirName);
    for (const rel of walkPyFiles(absDir, dirName)) {
      if (EXEMPT_MANUAL_LITERAL_PATHS.has(rel)) continue;
      const abs = path.join(repoRoot, rel);
      const hit = firstManualMarkerPattern(fs.readFileSync(abs, 'utf8'));
      if (!hit) continue;
      issues.push({
        kind: 'manual-literal',
        path: rel,
        message: `${rel} inlines governed KS hash attributes (${hit}) — route through ks_hash_attrs or ks_catalog_hashes helpers.`,
      });
    }
  }

  issues.sort((a, b) => a.path.localeCompare(b.path) || a.message.localeCompare(b.message));

  return {
    skipped: false,
    emitterPathCount: emitterPaths.length,
    issues,
  };
}

/**
 * @param {{
 *   skipped?: boolean,
 *   issues?: Array<{ kind: string, path: string, message: string }>,
 * }} report
 */
export function findingsFromPyKsHashAttrsReport(report) {
  if (!report || report.skipped) return [];
  const issues = Array.isArray(report.issues) ? report.issues : [];
  if (!issues.length) return [];

  const findings = [];
  const seen = new Set();

  for (const issue of issues.slice(0, MAX_PY_KS_HASH_ATTRS_FINDINGS)) {
    const key = `${issue.kind}:${issue.path}:${issue.message}`;
    if (seen.has(key)) continue;
    seen.add(key);

    findings.push({
      severity: issue.kind === 'missing-emitter' ? 'warn' : 'minor',
      area: 'visual-catalog',
      message: issue.message,
      evidence: `python_source=${issue.path} kind=${issue.kind}`,
      remediation:
        issue.kind === 'manual-literal'
          ? 'Remove inline hash/data-ks-* attribute strings; use `ks_hash_attrs()` or `layout_shell_attrs` / `page_main_attrs` / `chrome_region_attrs` from `components/ks_catalog_hashes.py`.'
          : 'Import and call `ks_hash_attrs` or a `ks_catalog_hashes` wrapper when stamping visual roots in Python HTML renderers.',
    });
  }

  if (issues.length > MAX_PY_KS_HASH_ATTRS_FINDINGS) {
    findings.push({
      severity: 'minor',
      area: 'visual-catalog',
      message: `Additional Python ks_hash_attrs issues omitted (${issues.length - MAX_PY_KS_HASH_ATTRS_FINDINGS} more).`,
      evidence: `py_ks_hash_attrs_total=${issues.length}`,
      remediation:
        'Run the website UX auditor on the kitchensink repo root or inspect `components/` and `generator/` for manual hash attribute literals.',
    });
  }

  return findings;
}

export async function run({ metrics, repoRoot, ctx }) {
  const root = String(repoRoot || ctx?.repoRoot || metrics?.repoRoot || '').trim();
  if (!root) return [];

  const report = metrics?.pyKsHashAttrsReport ?? scanPyKsHashAttrs(root);
  return findingsFromPyKsHashAttrsReport(report);
}
