import fs from 'node:fs/promises';

/**
 * Resolve rule id for fixer routing (DET direct, AI via candidateDeterministicRule).
 * @param {object} f
 */
export function resolveFixerRuleId(f) {
  const candidate = String(f.candidateDeterministicRule || '').trim();
  if (candidate.startsWith('DET.A11Y.')) return candidate;
  const check = String(f.checkId || f.ruleId || '').trim();
  if (check.startsWith('DET.A11Y.')) return check;
  return '';
}

/**
 * @param {string} auditDataPath
 */
export async function loadAuditFindings(auditDataPath) {
  const raw = JSON.parse(await fs.readFile(auditDataPath, 'utf8'));
  /** @type {Map<string, object[]>} */
  const findingsByRuleId = new Map();

  const all = raw.findings || [];
  for (const f of all) {
    const rid = resolveFixerRuleId(f);
    if (!rid) continue;
    if (!findingsByRuleId.has(rid)) findingsByRuleId.set(rid, []);
    findingsByRuleId.get(rid).push({ ...f, url: f.url || '' });
  }
  return { findingsByRuleId, audit: raw };
}

/**
 * @param {Map<string, object[]>} findingsByRuleId
 * @param {string[]} [onlyRuleIds]
 */
export function ruleIdsWithFindings(findingsByRuleId, onlyRuleIds) {
  const ids = [...findingsByRuleId.keys()].filter((id) => (findingsByRuleId.get(id) || []).length > 0);
  if (!onlyRuleIds?.length) return ids;
  const set = new Set(onlyRuleIds);
  return ids.filter((id) => set.has(id));
}
