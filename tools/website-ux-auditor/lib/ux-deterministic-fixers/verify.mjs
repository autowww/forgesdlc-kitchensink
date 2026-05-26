import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '../..');
const EXPECT_CLEAN = path.join(TOOL_ROOT, 'auditor-tests/expect-rule-clean.sh');

/**
 * Count findings for ruleId in audit-data.json.
 * @param {string} auditDataPath
 * @param {string} ruleId
 */
export async function countRuleFindings(auditDataPath, ruleId) {
  try {
    const raw = JSON.parse(await fs.readFile(auditDataPath, 'utf8'));
    let n = 0;
    for (const page of raw.pages || []) {
      for (const f of page.findings || []) {
        if ((f.ruleId || '') === ruleId && (f.checkId || '') === 'design-rule-runtime') n += 1;
      }
    }
    return n;
  } catch {
    return -1;
  }
}

/**
 * @param {{ auditDataPath: string, ruleId: string, verifyMode?: string }} opts
 */
export async function verifyRuleClean(opts) {
  const { auditDataPath, ruleId, verifyMode = 'expect_rule_clean' } = opts;
  if (!auditDataPath) {
    return { verifyOk: false, findingsCount: -1, error: 'missing auditDataPath' };
  }
  try {
    await fs.access(auditDataPath);
  } catch {
    return { verifyOk: true, findingsCount: 0, note: 'no audit file yet' };
  }

  if (verifyMode === 'count_only') {
    const fc = await countRuleFindings(auditDataPath, ruleId);
    return { verifyOk: fc === 0, findingsCount: fc };
  }

  const proc = spawnSync('bash', [EXPECT_CLEAN, auditDataPath, ruleId], {
    encoding: 'utf8',
    cwd: TOOL_ROOT,
  });
  const fc = parseInt(String(proc.stdout || '0').trim(), 10) || 0;
  return {
    verifyOk: proc.status === 0 && fc === 0,
    findingsCount: fc,
  };
}
