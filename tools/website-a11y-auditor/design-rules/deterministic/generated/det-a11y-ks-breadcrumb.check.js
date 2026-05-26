import { rule as baseRule, run } from '../../../../website-ux-auditor/design-rules/deterministic/generated/det-nav-breadcrumb.check.js';
import { wrapRule } from '../../../lib/rule-wrap.mjs';

export const rule = wrapRule(
  baseRule,
  'DET.A11Y.KS.BREADCRUMB',
  'ks',
  'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-ks-breadcrumb',
);

export { run };
