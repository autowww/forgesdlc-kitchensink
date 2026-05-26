import fs from 'node:fs/promises';

/**
 * @param {string} auditDataPath
 * @returns {Promise<{ pages: object[], findingsByRuleId: Map<string, object[]> }>}
 */
export async function loadAuditFindings(auditDataPath) {
  const raw = JSON.parse(await fs.readFile(auditDataPath, 'utf8'));
  const pages = raw.pages || [];
  /** @type {Map<string, object[]>} */
  const findingsByRuleId = new Map();

  for (const page of pages) {
    for (const f of page.findings || []) {
      const rid = f.ruleId || f.checkId || '';
      if (!rid || !rid.startsWith('DET.')) continue;
      if (!findingsByRuleId.has(rid)) findingsByRuleId.set(rid, []);
      findingsByRuleId.get(rid).push({ ...f, url: page.url || f.url || '' });
    }
  }
  return { pages, findingsByRuleId, audit: raw };
}

/**
 * Rule ids with at least one finding in audit-data.
 * @param {Map<string, object[]>} findingsByRuleId
 * @param {string[]} [onlyRuleIds]
 */
export function ruleIdsWithFindings(findingsByRuleId, onlyRuleIds) {
  const ids = [...findingsByRuleId.keys()].filter((id) => (findingsByRuleId.get(id) || []).length > 0);
  if (!onlyRuleIds?.length) return ids;
  const set = new Set(onlyRuleIds);
  return ids.filter((id) => set.has(id));
}
