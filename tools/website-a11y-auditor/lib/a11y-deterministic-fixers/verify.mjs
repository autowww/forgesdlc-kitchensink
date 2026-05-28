import fs from 'node:fs/promises';

/**
 * @param {string} auditDataPath
 * @param {string} ruleId
 */
export async function countRuleFindings(auditDataPath, ruleId) {
  try {
    const raw = JSON.parse(await fs.readFile(auditDataPath, 'utf8'));
    let n = 0;
    for (const f of raw.findings || []) {
      const rid =
        f.checkId?.startsWith('DET.A11Y.') ? f.checkId : f.candidateDeterministicRule || f.checkId;
      if (rid === ruleId) n += 1;
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
  const fc = await countRuleFindings(auditDataPath, ruleId);
  if (verifyMode === 'count_only') {
    return { verifyOk: fc === 0, findingsCount: fc };
  }
  return { verifyOk: fc === 0, findingsCount: fc };
}
