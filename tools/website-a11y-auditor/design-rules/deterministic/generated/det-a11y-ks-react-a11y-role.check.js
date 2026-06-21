import { rule as baseRule, run } from '../../../../website-ux-auditor/design-rules/deterministic/generated/det-app-control-a11y.check.js';
import { wrapRule } from '../../../lib/rule-wrap.mjs';

export const rule = wrapRule(
  baseRule,
  'DET.A11Y.KS.REACT_A11Y_ROLE',
  'ks',
  'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-ks-react-a11y-role',
);

export { run };
