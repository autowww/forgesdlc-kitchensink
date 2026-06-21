import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FIXER_DECISIONS,
  resolveFixerDecision,
} from '../lib/ux-deterministic-fixers/production-fixer-decisions.mjs';
import {
  listProductionFixerRuleIds,
  PRODUCTION_FIXER_BY_RULE,
} from '../lib/ux-deterministic-fixers/fixers/patch-registry.mjs';
import { runPlanOnlyDeterministicFixer } from '../lib/ux-deterministic-fixers/fixers/plan-only-fixer.mjs';

const REQUIRED_AUTO = [
  'DET.APP.DEMO_DISCLOSURE',
  'DET.APP.PRIMARY_CTA',
  'DET.APP.PRIMARY_STATE',
  'DET.APP.PRIMITIVE_STYLES',
  'DET.APP.SHELL_INTEGRATION',
  'DET.APP.TAB_PANEL',
  'DET.APP.TILE_AFFORDANCE',
  'DET.APP.PRIMITIVE_SOURCE',
  'DET.THEME.FONT_STACK',
];

const REQUIRED_PLAN_ONLY = [
  'DET.APP.ROUTE_DEEPLINK_STATE',
  'DET.KS.CONSUMER_ASSET_BUNDLE',
  'DET.ROUTE.HTTP_STATUS_CANONICAL',
  'DET.FORM.LABEL_ERROR_SUMMARY',
];

test('production fixer decisions cover prompt 03-05 rules explicitly', () => {
  for (const id of [...REQUIRED_AUTO, ...REQUIRED_PLAN_ONLY]) {
    assert.ok(FIXER_DECISIONS[id], `missing FIXER_DECISIONS[${id}]`);
  }
});

test('auto-fixable app rules map to production handlers', () => {
  for (const id of REQUIRED_AUTO) {
    const d = FIXER_DECISIONS[id];
    assert.ok(d.productionHandler || PRODUCTION_FIXER_BY_RULE[id], `${id} has no production handler`);
    assert.equal(d.planOnly, undefined);
  }
});

test('plan_only rules are marked intentionally', () => {
  for (const id of REQUIRED_PLAN_ONLY) {
    const d = FIXER_DECISIONS[id];
    assert.equal(d.planOnly, true, id);
    assert.ok(d.planOnlyReason, id);
    assert.equal(PRODUCTION_FIXER_BY_RULE[id], runPlanOnlyDeterministicFixer);
  }
});

test('listProductionFixerRuleIds includes new app rules', () => {
  const ids = listProductionFixerRuleIds();
  for (const id of REQUIRED_AUTO) {
    assert.ok(ids.includes(id), `production registry missing ${id}`);
  }
});

test('resolveFixerDecision defaults handbook_after for legacy rules', () => {
  const d = resolveFixerDecision('DET.PAGE.TITLE');
  assert.equal(d.fixerId, 'handbook_after');
});
