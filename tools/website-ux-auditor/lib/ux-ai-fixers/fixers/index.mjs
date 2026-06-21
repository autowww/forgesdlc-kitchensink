import { runAiApplyDashboardPriorityFixer } from './ai-apply-dashboard-priority.mjs';
import { runAiApplyDataFreshnessFixer } from './ai-apply-data-freshness.mjs';
import { runAiApplyEmptyStateFixer } from './ai-apply-empty-state.mjs';
import { runAiApplyErrorCopyFixer } from './ai-apply-error-copy.mjs';
import { runAiApplyFormRecoveryFixer } from './ai-apply-form-recovery.mjs';
import { runPlanOnlyFixer } from './plan-only.mjs';
import { runRemediationNoteFixer } from './remediation-note.mjs';

const FIXERS = {
  plan_only: runPlanOnlyFixer,
  remediation_note: runRemediationNoteFixer,
  ai_apply_form_recovery: runAiApplyFormRecoveryFixer,
  ai_apply_empty_state: runAiApplyEmptyStateFixer,
  ai_apply_dashboard_priority: runAiApplyDashboardPriorityFixer,
  ai_apply_data_freshness: runAiApplyDataFreshnessFixer,
  ai_apply_error_copy: runAiApplyErrorCopyFixer,
};

/**
 * @param {string} fixerId
 * @param {object} ctx
 */
export async function runAiFixerById(fixerId, ctx) {
  const fn = FIXERS[fixerId] || FIXERS.plan_only;
  return fn(ctx);
}

export { FIXERS };
