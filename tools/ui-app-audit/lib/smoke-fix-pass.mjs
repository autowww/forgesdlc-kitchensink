/**
 * Write smoke-fix-pass.json / .md after a remediation iteration.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

import { resolveFixDisposition } from '../../website-ux-auditor/lib/fix-roots.mjs';
import { normalizeScenarioSteps } from './smoke-plan.mjs';

/**
 * @param {object} auditData
 * @param {{ scenarios?: object[] }} smokePlan
 * @param {import('../../website-ux-auditor/lib/fix-roots.mjs').FixRoot[]} fixRoots
 */
export function buildSmokeFixPassScenarios(auditData, smokePlan, fixRoots) {
  const scenarioById = new Map((smokePlan.scenarios || []).map((s) => [s.scenarioId, s]));
  /** @type {Map<string, { scenarioId: string, stepId: string, ruleIds: Set<string>, disposition: string, filesTouched: Set<string> }>} */
  const groups = new Map();

  for (const page of auditData.pages || []) {
    const scenarioId = page.scenarioId || 'unknown';
    const scenario = scenarioById.get(scenarioId) || { scenarioId };
    normalizeScenarioSteps(scenario);

    for (const f of page.findings || []) {
      const stepId = f.stepId || 'land';
      const key = `${scenarioId}::${stepId}`;
      const ruleId = f.ruleId || f.checkId || '';
      const disp = resolveFixDisposition(f, fixRoots, ruleId);
      if (!groups.has(key)) {
        groups.set(key, {
          scenarioId,
          stepId,
          ruleIds: new Set(),
          disposition: disp.disposition,
          filesTouched: new Set(),
        });
      }
      const g = groups.get(key);
      if (ruleId) g.ruleIds.add(ruleId);
      for (const s of f.sources || []) {
        if (s.path) g.filesTouched.add(s.path);
      }
      if (disp.disposition === 'external_library_required') {
        g.disposition = 'external_library_required';
      }
    }
  }

  return [...groups.values()].map((g) => ({
    scenarioId: g.scenarioId,
    stepId: g.stepId,
    ruleIds: [...g.ruleIds],
    disposition: g.disposition,
    filesTouched: [...g.filesTouched],
  }));
}

/**
 * @param {string} outDir
 * @param {{ passId?: string, fixRoots?: object[], scenarios?: object[] }} report
 */
export async function writeSmokeFixPass(outDir, report) {
  const passId = report.passId || `pass-${Date.now()}`;
  const payload = {
    schemaVersion: 1,
    passId,
    generatedAt: new Date().toISOString(),
    fixRoots: report.fixRoots || [],
    scenarios: report.scenarios || [],
  };
  const jsonPath = path.join(outDir, 'smoke-fix-pass.json');
  await fs.writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const lines = [
    `# Smoke fix pass ${passId}`,
    '',
    `Generated: ${payload.generatedAt}`,
    '',
    '## Fix roots',
    ...(payload.fixRoots || []).map((r) => `- **${r.id}**: ${r.path}`),
    '',
    '## Scenarios',
  ];
  for (const s of payload.scenarios || []) {
    lines.push(
      `- **${s.scenarioId}** / ${s.stepId || 'land'}: ${s.disposition || 'pending'} (${(s.ruleIds || []).join(', ')})`,
    );
  }
  await fs.writeFile(path.join(outDir, 'smoke-fix-pass.md'), `${lines.join('\n')}\n`, 'utf8');
  return jsonPath;
}
