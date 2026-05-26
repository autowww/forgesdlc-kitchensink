import { rule as baseRule, run } from '../../../../website-ux-auditor/design-rules/deterministic/generated/det-hash-markers.check.js';
import { wrapRule } from '../../../lib/rule-wrap.mjs';

export const rule = wrapRule(
  baseRule,
  'DET.A11Y.KS.HASH_MARKERS',
  'ks',
  'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-ks-hash-markers',
);

export { run };
