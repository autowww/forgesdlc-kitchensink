import {
  rule as baseRule,
  run,
  collectLandmarksReport,
  findingsFromLandmarksReport,
  violationsFromLandmarkSnapshot,
} from '../../../../website-ux-auditor/design-rules/deterministic/generated/det-landmarks-required.check.js';
import { wrapRule } from '../../../lib/rule-wrap.mjs';

export const rule = wrapRule(
  baseRule,
  'DET.A11Y.GENERIC.LANDMARKS',
  'generic',
  'docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-landmarks',
);

export {
  run,
  collectLandmarksReport,
  findingsFromLandmarksReport,
  violationsFromLandmarkSnapshot,
};
