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
      `Review AI finding for ${ruleId}: ${String(sample.message || '').slice(0, 200)}. ` +
      'Apply DOM/content fix or document manual exception; re-run audit with --lanes axe,det,ai when agent is available.',
    promptPath: null,
  };
}
