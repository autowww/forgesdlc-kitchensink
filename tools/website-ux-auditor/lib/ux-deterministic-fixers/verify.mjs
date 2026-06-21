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
 * Resolve audit data path for live/scenario verify modes.
 * @param {string} auditDataPath
 * @param {string} [verifyMode]
 */
export function resolveVerifyAuditPath(auditDataPath, verifyMode) {
  if (verifyMode !== 'live_scenario') return auditDataPath;
  const scenarioEnv = process.env.FORGE_UX_SCENARIO_AUDIT_DATA || '';
  if (scenarioEnv) return scenarioEnv;
  const dir = path.dirname(auditDataPath);
  const candidates = [
    path.join(dir, 'scenario-audit-data.json'),
    path.join(dir, 'live-audit-data.json'),
    auditDataPath,
  ];
  return candidates[0];
}

/**
 * @param {string} ruleId
 * @param {string} auditDataPath
 * @param {string} [verifyMode]
 */
export function buildVerifyCommand(ruleId, auditDataPath, verifyMode = 'expect_rule_clean') {
  const audit = resolveVerifyAuditPath(auditDataPath, verifyMode);
  if (verifyMode === 'count_only') {
    return `node -e "/* count ${ruleId} findings in ${audit} */"`;
  }
  if (verifyMode === 'live_scenario') {
    return `FORGE_UX_SCENARIO_AUDIT_DATA=${audit} bash auditor-tests/expect-rule-clean.sh ${audit} ${ruleId}`;
  }
  return `bash auditor-tests/expect-rule-clean.sh ${audit} ${ruleId}`;
}

/**
 * @param {{ auditDataPath: string, ruleId: string, verifyMode?: string }} opts
 */
export async function verifyRuleClean(opts) {
  const { ruleId, verifyMode = 'expect_rule_clean' } = opts;
  let { auditDataPath } = opts;
  auditDataPath = resolveVerifyAuditPath(auditDataPath, verifyMode);

  if (!auditDataPath) {
    return { verifyOk: false, findingsCount: -1, error: 'missing auditDataPath', verifyCommand: '' };
  }
  try {
    await fs.access(auditDataPath);
  } catch {
    if (verifyMode === 'live_scenario') {
      return {
        verifyOk: null,
        findingsCount: -1,
        note: 'scenario audit data not present — verify skipped',
        verifyCommand: buildVerifyCommand(ruleId, auditDataPath, verifyMode),
      };
    }
    return { verifyOk: true, findingsCount: 0, note: 'no audit file yet' };
  }

  if (verifyMode === 'count_only') {
    const fc = await countRuleFindings(auditDataPath, ruleId);
    return {
      verifyOk: fc === 0,
      findingsCount: fc,
      verifyCommand: buildVerifyCommand(ruleId, auditDataPath, verifyMode),
    };
  }

  const proc = spawnSync('bash', [EXPECT_CLEAN, auditDataPath, ruleId], {
    encoding: 'utf8',
    cwd: TOOL_ROOT,
  });
  const fc = parseInt(String(proc.stdout || '0').trim(), 10) || 0;
  return {
    verifyOk: proc.status === 0 && fc === 0,
    findingsCount: fc,
    verifyCommand: buildVerifyCommand(ruleId, auditDataPath, verifyMode),
  };
}
