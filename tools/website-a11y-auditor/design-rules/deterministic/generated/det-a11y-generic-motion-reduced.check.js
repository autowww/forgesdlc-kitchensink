import { rule as baseRule, run } from '../../../../website-ux-auditor/design-rules/deterministic/generated/det-motion-prefers-reduced.check.js';
import { wrapRule } from '../../../lib/rule-wrap.mjs';

export const rule = wrapRule(
  baseRule,
  'DET.A11Y.GENERIC.MOTION_REDUCED',
  'generic',
  'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-motion-reduced',
);

export { run };
