import { rule as baseRule, run } from '../../../../website-ux-auditor/design-rules/deterministic/page/viewport.check.js';
import { wrapRule } from '../../../lib/rule-wrap.mjs';

export const rule = wrapRule(
  baseRule,
  'DET.A11Y.GENERIC.VIEWPORT',
  'generic',
  'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-viewport',
);

export { run };
