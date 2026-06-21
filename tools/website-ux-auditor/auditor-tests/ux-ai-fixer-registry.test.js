import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import { resolveAiFixerId, loadAiFixerRegistry } from '../lib/ux-ai-fixers/registry.mjs';

const TOOL_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

test('ux ai fixer registry resolves targeted apply fixers', async () => {
  loadAiFixerRegistry();
  assert.equal(resolveAiFixerId('AI.FORM.FRICTION_AND_RECOVERY'), 'ai_apply_form_recovery');
  assert.equal(resolveAiFixerId('AI.EMPTY_STATE.USEFULNESS'), 'ai_apply_empty_state');
  assert.equal(resolveAiFixerId('AI.ERROR_COPY.REASSURANCE'), 'ai_apply_error_copy');
  assert.equal(resolveAiFixerId('AI.BRAND.GENERICITY_AND_DIFFERENTIATION'), 'remediation_note');
  assert.equal(resolveAiFixerId('AI.UNKNOWN.RULE'), 'plan_only');
});

test('ux ai fixer registry includes new prompt 06 rules when registry is blended', async () => {
  const regPath = path.join(TOOL_ROOT, 'lib/ux-ai-fixers/ai-fixer-registry.json');
  const reg = JSON.parse(await fs.readFile(regPath, 'utf8'));
  const ids = new Set((reg.rules || []).map((r) => r.ruleId));
  for (const id of [
    'AI.FORM.FRICTION_AND_RECOVERY',
    'AI.DASHBOARD.ACTIONABILITY_PRIORITY',
    'AI.APP.WORKFLOW_RISK_GUARDRAILS',
  ]) {
    assert.ok(ids.has(id), `missing ${id} in ai-fixer-registry.json — run blend-rules && generate-ux-ai-fixer-registry`);
  }
});
