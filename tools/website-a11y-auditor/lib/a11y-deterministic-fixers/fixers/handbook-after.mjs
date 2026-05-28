import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '../../..');
const APPLY_SCRIPT = path.join(TOOL_ROOT, 'auditor-tests/apply-harness-fixture-remediation.py');

/**
 * @param {{ ruleId: string, fixtureDir: string, fixtureMode?: string }} ctx
 */
export function runHandbookAfterFixer(ctx) {
  const { ruleId, fixtureDir, fixtureMode = 'standalone' } = ctx;
  if (!fixtureDir) {
    return { applied: false, error: 'fixtureDir required for handbook_after' };
  }
  const proc = spawnSync(
    'python3',
    [APPLY_SCRIPT, '--rule-id', ruleId, '--fixture-dir', fixtureDir, '--fixture-mode', fixtureMode],
    { encoding: 'utf8', cwd: TOOL_ROOT },
  );
  if (proc.status !== 0) {
    return {
      applied: false,
      error: (proc.stderr || proc.stdout || `exit ${proc.status}`).trim().slice(0, 500),
    };
  }
  return { applied: true, adapter: 'handbook_after' };
}
