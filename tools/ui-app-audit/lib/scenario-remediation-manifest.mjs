/**
 * Build scenario-remediation-manifest.json for step-scoped agents.
 */
import { getScenarioRenderRoots, normalizeScenarioSteps } from './smoke-plan.mjs';
import { resolveFixDisposition } from '../../website-ux-auditor/lib/fix-roots.mjs';
import { isMajorPlus } from '../../website-ux-auditor/lib/severity.js';

/**
 * @param {object} auditData
 * @param {{ scenarios: object[] }} smokePlan
 * @param {{ roots?: import('../../website-ux-auditor/lib/fix-roots.mjs').FixRoot[] }} [opts]
 */
export function buildScenarioRemediationManifest(auditData, smokePlan, opts = {}) {
  const roots = opts.roots || [];
  const scenarioById = new Map((smokePlan.scenarios || []).map((s) => [s.scenarioId, s]));
  /** @type {Map<string, { scenarioId: string, stepId: string, findings: object[], render_roots: object[] }>} */
  const groups = new Map();

  for (const page of auditData.pages || []) {
    const scenarioId = page.scenarioId || 'unknown';
    const scenario = scenarioById.get(scenarioId) || { scenarioId };
    const steps = normalizeScenarioSteps(scenario);

    for (const f of page.findings || []) {
      if (!isMajorPlus(f.severity)) continue;
      const stepId = f.stepId || 'land';
      const key = `${scenarioId}::${stepId}`;
      if (!groups.has(key)) {
        const step = steps.find((s) => s.stepId === stepId) || steps[0];
        groups.set(key, {
          scenarioId,
          stepId: step?.stepId || stepId,
          findings: [],
          render_roots: getScenarioRenderRoots(scenario, step?.stepId || stepId),
          allowedWriteRoots: roots.map((r) => r.path),
        });
      }
      const g = groups.get(key);
      const disp = resolveFixDisposition(f, roots, f.ruleId || f.checkId || '');
      g.findings.push({
        ...f,
        fixDisposition: disp.disposition,
        fixRootId: disp.root?.id,
      });
    }
  }

  const jobs = [...groups.values()].filter((g) => g.findings.length);
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    fixRoots: roots,
    jobs,
  };
}
