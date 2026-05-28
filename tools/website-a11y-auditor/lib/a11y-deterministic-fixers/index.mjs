import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runFixerById } from './fixers/index.mjs';
import { loadAfterHtmlForRule } from './handbook-loader.mjs';
import { loadAuditFindings, ruleIdsWithFindings } from './load-audit-findings.mjs';
import { getPilotEntry, isPilotRule, listPilotRuleIds, loadPilotRegistry } from './registry.mjs';
import { verifyRuleClean } from './verify.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {{
 *   repoRoot: string,
 *   auditDataPath: string,
 *   outDir: string,
 *   ruleIds?: string[],
 *   harness?: boolean,
 *   fixtureDir?: string,
 *   fixtureMode?: string,
 *   skipVerify?: boolean,
 * }} opts
 */
export async function runDeterministicFixers(opts) {
  const {
    repoRoot,
    auditDataPath,
    outDir,
    ruleIds: onlyRuleIds,
    harness = false,
    fixtureDir = process.env.FORGE_A11Y_FIXER_FIXTURE_DIR || '',
    fixtureMode = process.env.FORGE_A11Y_FIXER_FIXTURE_MODE || 'standalone',
    skipVerify = false,
  } = opts;

  const { findingsByRuleId } = await loadAuditFindings(auditDataPath);
  const candidateIds = ruleIdsWithFindings(findingsByRuleId, onlyRuleIds);
  const pilotIds = candidateIds.filter((id) => isPilotRule(id));
  const harnessForced =
    harness && onlyRuleIds?.length ? onlyRuleIds.filter((id) => isPilotRule(id)) : [];
  const toRun =
    harnessForced.length > 0
      ? harnessForced
      : pilotIds.length > 0
        ? pilotIds
        : (onlyRuleIds || []).filter((id) => isPilotRule(id));

  /** @type {Record<string, object>} */
  const perRule = {};
  const verifiedOk = new Set();

  for (const ruleId of toRun) {
    const entry = getPilotEntry(ruleId);
    if (!entry) continue;

    const findings = findingsByRuleId.get(ruleId) || [];
    const afterHtml = await loadAfterHtmlForRule(ruleId);
    const row = {
      ruleId,
      attempted: true,
      fixerId: entry.fixerId,
      applied: false,
      verifyOk: false,
      findingsCount: findings.length,
      error: null,
      agentRequired: false,
    };

    if (!afterHtml && entry.fixerId === 'handbook_after') {
      row.error = 'no After example in rule page';
      row.agentRequired = true;
      perRule[ruleId] = row;
      continue;
    }

    const ctx = {
      ruleId,
      repoRoot,
      findings,
      afterHtml,
      fixtureDir: fixtureDir || path.join(repoRoot, 'fixture-website'),
      fixtureMode,
      harness,
    };

    try {
      const result = await runFixerById(entry.fixerId, ctx);
      row.applied = Boolean(result.applied);
      row.adapter = result.adapter;
      if (result.error) row.error = result.error;
    } catch (err) {
      row.error = String(err?.message || err);
    }

    if (!skipVerify && row.applied) {
      const v = await verifyRuleClean({
        auditDataPath,
        ruleId,
        verifyMode: entry.verifyMode,
      });
      row.verifyOk = v.verifyOk;
      row.postFindingsCount = v.findingsCount;
      if (v.verifyOk) verifiedOk.add(ruleId);
      else row.agentRequired = true;
    } else if (!row.applied) {
      row.agentRequired = true;
    }

    perRule[ruleId] = row;
  }

  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    repoRoot,
    auditDataPath,
    harness,
    pilotRuleIds: listPilotRuleIds(),
    rules: perRule,
    summary: {
      attempted: Object.keys(perRule).length,
      applied: Object.values(perRule).filter((r) => r.applied).length,
      verifyOk: Object.values(perRule).filter((r) => r.verifyOk).length,
      agentRequired: Object.values(perRule).filter((r) => r.agentRequired).length,
    },
  };

  await fs.mkdir(outDir, { recursive: true });
  const reportPath = path.join(outDir, 'deterministic-fixer-report.json');
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  return { report, reportPath, verifiedOk: [...verifiedOk] };
}

export { loadPilotRegistry, listPilotRuleIds, isPilotRule };
