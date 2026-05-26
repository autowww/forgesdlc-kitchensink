import { rule as baseRule, run } from '../../../../website-ux-auditor/design-rules/deterministic/page/lang.check.js';
import { wrapRule } from '../../../lib/rule-wrap.mjs';

export const rule = wrapRule(
  baseRule,
  'DET.A11Y.GENERIC.LANG',
  'generic',
  'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-lang',
);

export { run };
