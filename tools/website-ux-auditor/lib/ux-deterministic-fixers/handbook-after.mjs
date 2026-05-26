import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '../..');
const APPLY_SCRIPT = path.join(TOOL_ROOT, 'auditor-tests/apply-harness-fixture-remediation.py');

/**
 * Harness / fixture remediation via handbook After HTML (Python).
 * @param {{
 *   ruleId: string,
 *   fixtureDir: string,
 *   fixtureMode?: string,
 *   fixtureRoot?: string,
 *   repoOverlay?: string,
 * }} ctx
 */
export function runHandbookAfterFixer(ctx) {
  const {
    ruleId,
    fixtureDir,
    fixtureMode = 'standalone',
    fixtureRoot,
    repoOverlay,
  } = ctx;

  if (!fixtureDir) {
    return { applied: false, error: 'fixtureDir required for handbook_after' };
  }

  const args = [
    APPLY_SCRIPT,
    '--rule-id',
    ruleId,
    '--fixture-dir',
    fixtureDir,
    '--fixture-mode',
    fixtureMode,
  ];
  if (fixtureMode === 'multi_page' && fixtureRoot) {
    args.push('--fixture-root', fixtureRoot);
  }
  if (fixtureMode === 'repo_overlay' && repoOverlay) {
    args.push('--repo-overlay', repoOverlay);
  }

  const proc = spawnSync('python3', args, {
    encoding: 'utf8',
    cwd: TOOL_ROOT,
  });
  if (proc.status !== 0) {
    return {
      applied: false,
      error: (proc.stderr || proc.stdout || `exit ${proc.status}`).trim().slice(0, 500),
    };
  }
  return { applied: true, adapter: 'handbook_after' };
}
