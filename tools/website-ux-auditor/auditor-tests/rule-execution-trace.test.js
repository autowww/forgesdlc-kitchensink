import assert from 'node:assert/strict';
import test from 'node:test';

import { rollupRuleExecution } from '../lib/rule-execution-rollup.js';
import { createDesignRuleRuntime } from '../lib/design-rule-runtime.js';

test('rollupRuleExecution marks missing rules when a page skips an implemented rule', () => {
  const coverage = rollupRuleExecution(
    [
      {
        url: 'https://a.test/',
        ruleExecution: {
          legacy: [{ checkId: 'hero-headings', status: 'ran', findingsCount: 0 }],
          deterministic: [
            { ruleId: 'DET.PAGE.LANG', status: 'ran', findingsCount: 1 },
            { ruleId: 'DET.PAGE.TITLE', status: 'skipped_stub' },
          ],
        },
      },
      {
        url: 'https://b.test/',
        ruleExecution: {
          legacy: [{ checkId: 'hero-headings', status: 'ran', findingsCount: 0 }],
          deterministic: [{ ruleId: 'DET.PAGE.LANG', status: 'ran', findingsCount: 0 }],
        },
      },
    ],
    { implementedRuleIds: ['DET.PAGE.LANG', 'DET.PAGE.TITLE'] },
  );
  assert.equal(coverage.pagesVisited, 2);
  assert.equal(coverage.deterministicRanOnAllVisitedPages, false);
  assert.ok(coverage.deterministicMissingOnPages.includes('DET.PAGE.TITLE'));
});

test('design rule runtime trace lists every registry rule with a status', async () => {
  const runtime = await createDesignRuleRuntime();
  const { trace } = await runtime.runDeterministicRulesWithTrace({
    metrics: { title: '', lang: '', metaViewport: '' },
    url: 'https://fixture.test/',
    page: null,
    repoRoot: '/tmp',
    ctx: {},
  });
  const registryCount = (runtime.registry.deterministicRules || []).length;
  assert.equal(trace.length, registryCount);
  assert.ok(trace.some((t) => t.status === 'ran' && t.ruleId === 'DET.PAGE.LANG'));
  assert.ok(trace.some((t) => t.status === 'skipped_stub'));
});
