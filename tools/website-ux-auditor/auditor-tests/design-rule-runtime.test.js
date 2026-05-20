import assert from 'node:assert/strict';
import test from 'node:test';

import { createDesignRuleRuntime } from '../lib/design-rule-runtime.js';
import { RulePageTraceStore } from '../lib/audit-backlog-trace.js';
import { makeFinding } from '../lib/severity.js';

test('design rule runtime enriches legacy findings and runs deterministic modules', async () => {
  const runtime = await createDesignRuleRuntime();
  const enriched = runtime.enrichLegacyFindings([
    makeFinding({
      checkId: 'metadata-a11y',
      severity: 'minor',
      area: 'accessibility',
      message: 'missing lang',
      evidence: '',
      remediation: '',
    }),
  ]);
  assert.equal(enriched[0].ruleId, 'DET.PAGE.LANG');
  assert.ok(Number.isFinite(enriched[0].scoreImpactWeight));

  const deterministic = await runtime.runDeterministicRules({
    metrics: {
      title: '',
      lang: '',
      metaViewport: '',
    },
    url: 'https://fixture.test/',
    page: null,
    repoRoot: '/tmp',
    ctx: { siteKind: 'generic' },
  });

  assert.ok(deterministic.some((f) => f.ruleId === 'DET.PAGE.LANG'));
  assert.ok(deterministic.some((f) => f.ruleId === 'DET.PAGE.TITLE'));
  assert.ok(deterministic.some((f) => f.ruleId === 'DET.PAGE.VIEWPORT'));

  const traced = await runtime.runDeterministicRulesWithTrace({
    metrics: { title: '', lang: '', metaViewport: '' },
    url: 'https://fixture.test/',
    page: null,
    repoRoot: '/tmp',
    ctx: { siteKind: 'generic' },
  });
  assert.ok(Array.isArray(traced.trace));
  assert.equal(traced.trace.length, (runtime.registry.deterministicRules || []).length);
  assert.ok(traced.trace.filter((t) => t.status === 'ran').length >= 3);
});

test('design rule runtime clamps deterministic concurrency to 5', async () => {
  const runtime = await createDesignRuleRuntime({ deterministicConcurrency: 99 });
  assert.equal(runtime.deterministicConcurrency, 5);
});

test('design rule runtime skips cached no-finding rule/page pairs', async () => {
  const store = new RulePageTraceStore({ disabled: false, registryFingerprint: 'reg-test' });
  const runtime = await createDesignRuleRuntime({ traceStore: store, deterministicConcurrency: 2 });
  const ctx = {
    metrics: { title: 'T', lang: 'en', metaViewport: 'width=device-width', headings: [], visibleTextSample: 'x' },
    url: 'https://fixture.test/page',
    page: null,
    repoRoot: '/tmp',
    ctx: { siteKind: 'generic' },
  };
  const first = await runtime.runDeterministicRulesWithTrace(ctx);
  const noFindingIds = new Set(
    first.trace
      .filter((t) => t.status === 'ran' && (t.findingsCount ?? 0) === 0)
      .map((t) => t.ruleId),
  );
  const second = await runtime.runDeterministicRulesWithTrace(ctx);
  const skippedIds = second.trace
    .filter((t) => t.status === 'skipped_no_findings_cache')
    .map((t) => t.ruleId);
  assert.ok(noFindingIds.size >= 1, 'expected at least one zero-finding rule on first pass');
  for (const id of noFindingIds) {
    assert.ok(skippedIds.includes(id), `expected cache skip for ${id}`);
  }
  assert.equal(first.trace.length, second.trace.length);
});
