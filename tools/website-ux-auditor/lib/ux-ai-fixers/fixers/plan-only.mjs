/**
 * @param {{ ruleId: string, findings: object[] }} ctx
 */
export function runPlanOnlyFixer(ctx) {
  const { ruleId, findings } = ctx;
  const sample = findings[0] || {};
  return {
    applied: false,
    fixerId: 'plan_only',
    suggestedAction:
      `Review AI finding for ${ruleId}: ${String(sample.title || sample.message || '').slice(0, 200)}. ` +
      'Apply copy/layout fix or document manual exception; re-run UX audit with AI enabled when agent is available.',
    promptPath: null,
  };
}
