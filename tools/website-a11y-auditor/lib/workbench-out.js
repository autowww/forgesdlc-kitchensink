import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '..');

function findCodeHubRoot() {
  let dir = TOOL_ROOT;
  for (let i = 0; i < 8; i += 1) {
    if (path.basename(dir) === 'Code') return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(TOOL_ROOT, '../../..');
}

/**
 * @param {string} repoRoot
 * @param {string | null} explicitOut
 */
export function resolveDefaultOutDir(repoRoot, explicitOut) {
  if (explicitOut) return path.resolve(explicitOut);
  const hub = process.env.FORGE_A11Y_AUDIT_WORKBENCH_ROOT || findCodeHubRoot();
  const base = path.join(hub, 'workbench', 'a11y-auditor', 'a11y-audit');
  const repoBase = path.basename(path.resolve(repoRoot)) || 'site';
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const id = crypto.randomBytes(4).toString('hex');
  return path.join(base, repoBase, `${stamp}_${id}`);
}

export function workbenchRootExists() {
  const hub = process.env.FORGE_A11Y_AUDIT_WORKBENCH_ROOT || findCodeHubRoot();
  return fs.existsSync(path.join(hub, 'workbench'));
}
