import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { listAiRulesFromRegistry, runAiRules, shouldSkipAiAgent } from '../lib/ai-audit-run.mjs';

describe('ai-audit-run', () => {
  it('shouldSkipAiAgent respects env', () => {
    assert.equal(shouldSkipAiAgent({ FORGE_A11Y_SKIP_AI_AGENT: '1' }), true);
    assert.equal(shouldSkipAiAgent({ FORGE_A11Y_SKIP_AI_AGENT: '0' }), false);
  });

  it('runAiRules with skipAgent returns no findings', async () => {
    const registry = {
      aiRules: [{ id: 'AI.A11Y.GENERIC.FOO', promptPath: 'design-rules/ai/foo.md' }],
    };
    const rules = listAiRulesFromRegistry(registry);
    const result = await runAiRules({
      rules,
      repoRoot: process.cwd(),
      urls: ['http://example.test/'],
      outDir: '/tmp/ai-test-skip',
      skipAgent: true,
    });
    assert.equal(result.findings.length, 0);
    assert.equal(result.aiLaneExecuted, false);
  });
});
