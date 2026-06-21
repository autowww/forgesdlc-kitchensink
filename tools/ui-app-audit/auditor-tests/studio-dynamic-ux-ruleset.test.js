import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  isStudioDynamicUxRuleId,
  pageHasReactPrimitiveRoots,
  resolveStudioDynamicUxRuleIds,
  STUDIO_DYNAMIC_UX_PRIMITIVE_RULES,
  STUDIO_DYNAMIC_UX_RUN,
} from '../lib/studio-dynamic-ux-ruleset.mjs';
import { loadDesignRuleRegistry } from '../../website-ux-auditor/lib/design-rule-runtime.js';

describe('studio-dynamic-ux-ruleset', () => {
  it('skips repo-static and handbook rules', () => {
    assert.equal(isStudioDynamicUxRuleId('DET.CONTRACT.PATH'), false);
    assert.equal(isStudioDynamicUxRuleId('DET.PY.KS_HASH_ATTRS'), false);
    assert.equal(isStudioDynamicUxRuleId('DET.CONTEXT.BURDEN'), false);
    assert.equal(isStudioDynamicUxRuleId('DET.CARD.TITLE'), true);
    assert.equal(isStudioDynamicUxRuleId('DET.APP.PRIMARY_STATE'), true);
  });

  it('allowlist includes new DET.APP dynamic rules', () => {
    assert.ok(STUDIO_DYNAMIC_UX_RUN.includes('DET.APP.PRIMARY_STATE'));
    assert.ok(STUDIO_DYNAMIC_UX_RUN.includes('DET.APP.DEMO_DISCLOSURE'));
    assert.ok(STUDIO_DYNAMIC_UX_RUN.includes('DET.APP.TAB_PANEL'));
    assert.ok(STUDIO_DYNAMIC_UX_RUN.includes('DET.APP.PRIMITIVE_STYLES'));
    assert.ok(STUDIO_DYNAMIC_UX_RUN.includes('DET.APP.ROUTE_DEEPLINK_STATE'));
    assert.ok(STUDIO_DYNAMIC_UX_RUN.includes('DET.APP.CLIENT_ERROR_LOG_CLEAN'));
    assert.ok(STUDIO_DYNAMIC_UX_RUN.includes('DET.APP.WIZARD_PROGRESS_CONTROLS'));
    assert.ok(!STUDIO_DYNAMIC_UX_RUN.includes('DET.APP.PRIMITIVE_MARKERS'));
    assert.ok(!STUDIO_DYNAMIC_UX_RUN.some((id) => id.startsWith('DET.REACT.')));
  });

  it('STUDIO_DYNAMIC_UX_PRIMITIVE_RULES lists APP primitive checks', () => {
    assert.ok(STUDIO_DYNAMIC_UX_PRIMITIVE_RULES.includes('DET.APP.PRIMITIVE_MARKERS'));
    assert.ok(STUDIO_DYNAMIC_UX_PRIMITIVE_RULES.includes('DET.APP.CONTROL_A11Y'));
  });

  it('pageHasReactPrimitiveRoots is exported', () => {
    assert.equal(typeof pageHasReactPrimitiveRoots, 'function');
  });

  it('primitive rules resolve only when includePrimitives', async () => {
    const registry = await loadDesignRuleRegistry();
    const withPrimitives = resolveStudioDynamicUxRuleIds(registry, { includePrimitives: true });
    const without = resolveStudioDynamicUxRuleIds(registry, { includePrimitives: false });
    assert.ok(withPrimitives.includes('DET.APP.PRIMITIVE_MARKERS'));
    assert.ok(!without.includes('DET.APP.PRIMITIVE_MARKERS'));
  });

  it('resolve intersects implemented registry rules', async () => {
    const registry = await loadDesignRuleRegistry();
    const ids = resolveStudioDynamicUxRuleIds(registry);
    assert.ok(ids.includes('DET.SECTION.HEADING'));
    assert.ok(!ids.includes('DET.CONTRACT.PATH'));
    assert.ok(ids.length >= 40 && ids.length <= 55);
  });
});
