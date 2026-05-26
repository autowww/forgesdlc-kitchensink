import { rule as baseRule, run } from '../../../../website-ux-auditor/design-rules/deterministic/generated/det-data-table-headers.check.js';
import { wrapRule } from '../../../lib/rule-wrap.mjs';

export const rule = wrapRule(
  baseRule,
  'DET.A11Y.GENERIC.DATA_TABLE_HEADERS',
  'generic',
  'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-data-table-headers',
);

export { run };
