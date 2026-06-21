/**
 * @param {{
 *   ruleId: string,
 *   fixerId?: string,
 *   reason: string,
 *   findings?: object[],
 *   confidence?: number,
 * }} opts
 */
export function buildPlanOnlyResult(opts) {
  const { ruleId, fixerId = 'plan_only', reason, findings = [], confidence = 0 } = opts;
  return {
    ruleId,
    fixerId,
    applied: false,
    filesTouched: 0,
    confidence,
    fallbackReason: reason,
    adapter: 'plan_only',
    planOnly: true,
    remediationNote:
      findings.length > 0
        ? `${reason} (${findings.length} finding(s) need manual or agent remediation.)`
        : reason,
    error: reason,
  };
}
