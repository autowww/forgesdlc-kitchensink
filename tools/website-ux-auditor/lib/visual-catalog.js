/**
 * Shared helpers for KS visual hash catalog (authoritative parse in tools/design-catalog).
 * Re-exports are relative — keep design-catalog CLIs independent of the auditor.
 */

import fs from 'node:fs';
import path from 'node:path';

export { loadRegistry, normalizeRegistryForJson, entryByHash } from '../../design-catalog/lib/parse-registry.mjs';

/**
 * @param {string} repoRoot
 * @returns {string}
 */
export function generatedRegistryPath(repoRoot) {
  return path.join(repoRoot, 'docs/design/catalog/visual-registry.generated.json');
}

/**
 * @param {string} repoRoot
 * @returns {{ schemaVersion?: number, repoRoot?: string, entries?: object[] } | null}
 */
export function loadGeneratedRegistry(repoRoot) {
  const p = generatedRegistryPath(repoRoot);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}
