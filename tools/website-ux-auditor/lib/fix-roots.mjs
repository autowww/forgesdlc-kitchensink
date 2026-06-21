/**
 * Multi-root fix policy: app repo (local) + optional external libraries.
 */
import fs from 'node:fs';
import path from 'node:path';

/**
 * @typedef {{ id: string, path: string, label: string }} FixRoot
 */

/**
 * @param {string} repoRoot
 * @param {{ externalPaths?: string[], envRoots?: string }} [opts]
 * @returns {FixRoot[]}
 */
export function resolveFixRoots(repoRoot, opts = {}) {
  const roots = [
    { id: 'local', path: path.resolve(repoRoot), label: 'app' },
  ];
  const external = [...(opts.externalPaths || [])];
  if (opts.envRoots) {
    external.push(
      ...opts.envRoots
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }
  let n = 1;
  for (const p of external) {
    const abs = path.resolve(p);
    if (!fs.existsSync(abs)) continue;
    roots.push({ id: `library${n}`, path: abs, label: `library${n}` });
    n += 1;
  }
  return roots;
}

/**
 * @param {string} filePath
 * @param {FixRoot[]} roots
 * @returns {FixRoot | null}
 */
export function fixRootForFilePath(filePath, roots) {
  const abs = path.resolve(filePath);
  for (const root of roots) {
    const rel = path.relative(root.path, abs);
    if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) {
      return root;
    }
  }
  return null;
}

/**
 * @param {string} ruleId
 */
export function ruleAllowsExternalLibraryFix(ruleId) {
  const id = String(ruleId || '');
  return (
    id.startsWith('DET.APP.PRIMITIVE_')
    || id.startsWith('DET.HASH.')
    || id === 'DET.PY.KS_HASH_ATTRS'
    || id === 'DET.APP.PRIMITIVE_SOURCE'
  );
}

/**
 * @param {{ sources?: Array<{ path?: string, repo?: string }> }} finding
 * @param {FixRoot[]} roots
 * @param {string} ruleId
 */
export function resolveFixDisposition(finding, roots, ruleId) {
  const local = roots.find((r) => r.id === 'local');
  const sources = finding.sources || [];
  for (const s of sources) {
    const p = s.path || '';
    if (!p) continue;
    const hit = fixRootForFilePath(path.join(local?.path || '', p), roots);
    if (hit?.id === 'local') return { disposition: 'local', root: hit };
    if (hit && hit.id !== 'local') {
      if (ruleAllowsExternalLibraryFix(ruleId)) {
        return { disposition: 'external_library', root: hit };
      }
      return { disposition: 'external_library_required', root: hit };
    }
  }
  return { disposition: 'local', root: local || roots[0] };
}

/**
 * Parse CLI/env external library paths from remediation loop flags.
 * @param {string[]} extraArgs
 */
export function parseExternalLibraryPathsFromArgs(extraArgs) {
  /** @type {string[]} */
  const paths = [];
  for (const arg of extraArgs) {
    const m = arg.match(/^--external-library-path(\d+)=(.+)$/);
    if (m) paths.push(m[2]);
  }
  if (process.env.FORGE_UX_FIX_ROOTS) {
    paths.push(...process.env.FORGE_UX_FIX_ROOTS.split(',').map((s) => s.trim()).filter(Boolean));
  }
  return paths;
}
