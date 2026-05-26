import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Repo root that owns docs/design/catalog (KS or kitchensink submodule).
 * @param {string} repoRoot
 */
export async function resolveCatalogRepoRoot(repoRoot) {
  const root = path.resolve(repoRoot);
  const candidates = [
    path.join(root, 'kitchensink'),
    root,
    path.join(root, 'forgesdlc-kitchensink'),
  ];
  for (const c of candidates) {
    try {
      await fs.access(path.join(c, 'docs', 'design', 'catalog'));
      return c;
    } catch {
      /* try next */
    }
  }
  return root;
}

/**
 * KS Python/components root for DET.PY.KS_HASH_ATTRS.
 * @param {string} repoRoot
 */
export async function resolveKsPythonRepoRoot(repoRoot) {
  const catalog = await resolveCatalogRepoRoot(repoRoot);
  try {
    await fs.access(path.join(catalog, 'components', 'ks_hash_attrs.py'));
    return catalog;
  } catch {
    /* */
  }
  try {
    await fs.access(path.join(catalog, 'components'));
    return catalog;
  } catch {
    return catalog;
  }
}
