import { rule as baseRule, run } from '../../../../website-ux-auditor/design-rules/deterministic/generated/det-app-focus-trap.check.js';
import { wrapRule } from '../../../lib/rule-wrap.mjs';

export const rule = wrapRule(
  baseRule,
  'DET.A11Y.GENERIC.APP_FOCUS_TRAP',
  'generic',
  'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-app-focus-trap',
);

export { run };
