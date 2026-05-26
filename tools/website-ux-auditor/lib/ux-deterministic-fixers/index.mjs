import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runFixerById } from './fixers/index.mjs';
import { PRODUCTION_FIXER_BY_RULE } from './fixers/patch-registry.mjs';
import { loadAfterHtmlForRule } from './handbook-loader.mjs';
import { loadAuditFindings, ruleIdsWithFindings } from './load-audit-findings.mjs';
import { markPlanTodosCompletedForRules } from './plan-trim.mjs';
import { getPilotEntry, isPilotRule, listPilotRuleIds, loadPilotRegistry } from './registry.mjs';
import { verifyRuleClean } from './verify.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {import('./registry.mjs').PilotRuleEntry} entry
 * @param {object} ctx
 */
async function resolveFixerId(entry, ctx) {
  const harness = ctx.harness || Boolean(ctx.fixtureDir);
  if (harness && entry.fixerId === 'handbook_after') {
    return 'handbook_after';
  }
  if (harness && entry.fixerId === 'repo_overlay') {
    return 'repo_overlay';
  }
  if (entry.fixerId === 'handbook_after' && !harness && !ctx.fixtureDir) {
    return PRODUCTION_FIXER_BY_RULE[entry.ruleId] ? 'handbook_html_patch' : null;
  }
  if (entry.fixerId === 'repo_overlay') {
    if (harness || ctx.repoOverlay) return 'repo_overlay';
    return PRODUCTION_FIXER_BY_RULE[entry.ruleId] ? 'handbook_html_patch' : 'repo_production';
  }
  return entry.fixerId;
}

/**
 * @param {{
 *   repoRoot: string,
 *   auditDataPath: string,
 *   outDir: string,
 *   ruleIds?: string[],
 *   harness?: boolean,
 *   fixtureDir?: string,
 *   fixtureMode?: string,
 *   fixtureRoot?: string,
 *   repoOverlay?: string,
 *   skipVerify?: boolean,
 *   planPath?: string,
 * }} opts
 */
export async function runDeterministicFixers(opts) {
  const {
    repoRoot,
    auditDataPath,
    outDir,
    ruleIds: onlyRuleIds,
    harness = false,
    fixtureDir = process.env.FORGE_UX_FIXER_FIXTURE_DIR || '',
    fixtureMode = process.env.FORGE_UX_FIXER_FIXTURE_MODE || 'standalone',
    fixtureRoot = process.env.FORGE_UX_FIXER_FIXTURE_ROOT || '',
    repoOverlay = process.env.FORGE_UX_FIXER_REPO_OVERLAY || '',
    skipVerify = false,
    planPath = '',
  } = opts;

  const { findingsByRuleId } = await loadAuditFindings(auditDataPath);
  const candidateIds = ruleIdsWithFindings(findingsByRuleId, onlyRuleIds);
  const pilotIds = candidateIds.filter((id) => isPilotRule(id));
  const harnessForced =
    harness && onlyRuleIds?.length
      ? onlyRuleIds.filter((id) => isPilotRule(id))
      : [];

  const harnessOnly =
    harness && onlyRuleIds?.length
      ? onlyRuleIds.filter((id) => isPilotRule(id))
      : [];
  const toRun =
    harnessForced.length > 0
      ? harnessForced
      : harnessOnly.length > 0
        ? harnessOnly
        : [...new Set([...pilotIds, ...(onlyRuleIds || []).filter((id) => isPilotRule(id) && harness)])];

  /** @type {Record<string, object>} */
  const perRule = {};
  const verifiedOk = new Set();

  for (const ruleId of toRun) {
    const entry = getPilotEntry(ruleId);
    if (!entry) continue;

    const findings = findingsByRuleId.get(ruleId) || [];
    const afterHtml = await loadAfterHtmlForRule(ruleId);
    const fixerId = await resolveFixerId(entry, {
      harness,
      fixtureDir,
      ruleId,
    });

    const row = {
      ruleId,
      attempted: true,
      fixerId: fixerId || entry.fixerId,
      applied: false,
      verifyOk: false,
      findingsCount: findings.length,
      error: null,
    };

    if (!fixerId) {
      row.error = 'no production fixer; agent required';
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
      fixtureRoot,
      repoOverlay,
      harness,
    };

    try {
      const result = await runFixerById(fixerId, ctx);
      row.applied = Boolean(result.applied);
      row.adapter = result.adapter;
      if (result.error) row.error = result.error;
      if (result.filesTouched != null) row.filesTouched = result.filesTouched;
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
    } else if (row.applied && skipVerify) {
      row.verifyOk = null;
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

  const plan = planPath || path.join(outDir, 'forge-ux-remediation.plan.md');
  if (verifiedOk.size) {
    try {
      await markPlanTodosCompletedForRules(plan, verifiedOk);
    } catch {
      /* plan may not exist yet */
    }
  }

  return { report, reportPath, verifiedOk: [...verifiedOk] };
}

export { loadPilotRegistry, listPilotRuleIds, isPilotRule };
