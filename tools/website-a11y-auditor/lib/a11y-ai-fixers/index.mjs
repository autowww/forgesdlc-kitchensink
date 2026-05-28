import fs from 'node:fs/promises';
import path from 'node:path';

import { resolveAiFixerId } from './registry.mjs';
import { runAiFixerById } from './fixers/index.mjs';

/**
 * @param {string} auditDataPath
 */
async function loadAiFindingsByRule(auditDataPath) {
  const raw = JSON.parse(await fs.readFile(auditDataPath, 'utf8'));
  /** @type {Map<string, object[]>} */
  const map = new Map();
  for (const f of raw.findings || []) {
    const rid = String(f.ruleId || f.checkId || f.principleId || '').trim();
    if (!rid.startsWith('AI.')) continue;
    if (!map.has(rid)) map.set(rid, []);
    map.get(rid).push(f);
  }
  return map;
}

/**
 * @param {{
 *   auditDataPath: string,
 *   outDir: string,
 *   ruleIds?: string[],
 * }} opts
 */
export async function runAiFixers(opts) {
  const { auditDataPath, outDir, ruleIds: onlyRuleIds } = opts;
  const findingsByRuleId = await loadAiFindingsByRule(auditDataPath);
  let aiIds = [...findingsByRuleId.keys()];
  if (onlyRuleIds?.length) {
    const set = new Set(onlyRuleIds);
    aiIds = aiIds.filter((id) => set.has(id));
  }

  /** @type {Record<string, object>} */
  const perRule = {};
  for (const ruleId of aiIds) {
    const findings = findingsByRuleId.get(ruleId) || [];
    const fixerId = resolveAiFixerId(ruleId);
    const result = await runAiFixerById(fixerId, { ruleId, findings, outDir });
    perRule[ruleId] = {
      ruleId,
      fixerId,
      findingCount: findings.length,
      ...result,
    };
  }

  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    rules: perRule,
    summary: {
      rulesProcessed: Object.keys(perRule).length,
      applied: Object.values(perRule).filter((r) => r.applied).length,
    },
  };

  await fs.mkdir(outDir, { recursive: true });
  const reportPath = path.join(outDir, 'ai-fixer-report.json');
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return { reportPath, report };
}
