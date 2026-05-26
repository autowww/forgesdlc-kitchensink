import { rule as baseRule, run } from '../../../../website-ux-auditor/design-rules/deterministic/generated/det-py-ks-hash-attrs.check.js';
import { wrapRule } from '../../../lib/rule-wrap.mjs';

export const rule = wrapRule(
  baseRule,
  'DET.A11Y.KS.PY_HASH_ATTRS',
  'ks',
  'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-ks-py-hash-attrs',
);

export { run };
