import { rule as baseRule, run } from '../../../../website-ux-auditor/design-rules/deterministic/generated/det-nav-focus-order.check.js';
import { wrapRule } from '../../../lib/rule-wrap.mjs';

export const rule = wrapRule(
  baseRule,
  'DET.A11Y.GENERIC.FOCUS_ORDER',
  'generic',
  'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-focus-order',
);

export { run };
