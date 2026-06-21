import { buildPlanOnlyResult } from '../vite-react-patcher/index.mjs';
import { getFixerDecision } from '../production-fixer-decisions.mjs';
import { defaultVerifyCommand } from './fixer-result.mjs';

/**
 * Explicit plan-only deterministic fixer (no file mutations).
 * @param {{ ruleId: string, findings?: object[] }} ctx
 */
export async function runPlanOnlyDeterministicFixer(ctx) {
  const { ruleId, findings = [] } = ctx;
  const decision = getFixerDecision(ruleId);
  const reason =
    decision?.planOnlyReason ||
    `Rule ${ruleId} is marked plan_only — requires agent or manual remediation`;
  return {
    ...buildPlanOnlyResult({ ruleId, reason, findings, confidence: 0 }),
    verifyCommand: defaultVerifyCommand(ruleId, decision?.verifyAuditHint),
    fixerId: 'plan_only',
  };
}
