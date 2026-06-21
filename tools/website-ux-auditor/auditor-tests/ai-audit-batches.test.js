import assert from 'node:assert/strict';
import test from 'node:test';

import {
  aggregateAiAuditResults,
  buildAiAuditBatches,
  extractJsonFromAgentText,
  filterScoreableAiFindings,
  normalizeAiFinding,
  selectLikelySourceFiles,
  shouldMergeAiFindingForScoreGate,
} from '../lib/ai-audit-batches.js';

const inventory = {
  framework: 'static/html',
  pageFiles: [
    'content/index.md',
    'content/docs-start.md',
    'content/docs-start-01-start-here.md',
  ],
  componentFiles: [
    'generator/layouts/landing.html',
    'generator/layouts/docs-shell.html',
  ],
  navCandidates: ['generator/nav.yml'],
  styleFiles: ['css/theme.css'],
};

test('selectLikelySourceFiles prefers slug-matching content and shell files', () => {
  const files = selectLikelySourceFiles({ url: 'https://fixture.test/docs-start-01-start-here.html' }, inventory, 5);
  assert.ok(files.includes('content/docs-start-01-start-here.md'));
  assert.ok(files.includes('generator/layouts/docs-shell.html'));
});

test('buildAiAuditBatches isolates homepage first and groups remaining pages', () => {
  const manifest = buildAiAuditBatches({
    auditData: {
      auditRunId: 'run123',
      pages: [
        { url: 'https://fixture.test/', findings: [] },
        { url: 'https://fixture.test/docs-start.html', findings: [{ severity: 'minor', message: 'm' }] },
        { url: 'https://fixture.test/docs-start-01-start-here.html', findings: [] },
      ],
    },
    inventory,
    repoRoot: '/repo',
    designStandardPath: '/repo/docs/design/std.md',
    batchSize: 2,
    aiRulePrompts: [{ id: 'AI.CONTEXT.COGNITIVE_CLARITY', promptPath: 'design-rules/ai/prompts/ai-context-cognitive-clarity.md' }],
    registryFingerprint: 'fp123',
    registryPath: '/tmp/registry.generated.json',
  });
  assert.equal(manifest.totalBatches, 2);
  assert.deepEqual(manifest.batches[0].urls, ['https://fixture.test/']);
  assert.deepEqual(manifest.batches[1].urls, [
    'https://fixture.test/docs-start.html',
    'https://fixture.test/docs-start-01-start-here.html',
  ]);
  assert.equal(manifest.batches[0].designStandardPath, 'docs/design/std.md');
  assert.ok(manifest.aiReviewContract?.principleIds?.includes('AI.CONTEXT.COGNITIVE_CLARITY'));
  assert.ok(manifest.batches[0].aiReviewContract?.principleIds?.length);
  assert.equal(manifest.designRulesRegistryFingerprint, 'fp123');
  assert.equal(manifest.aiRulePrompts?.[0]?.id, 'AI.CONTEXT.COGNITIVE_CLARITY');
  assert.equal(manifest.batches[0].aiRulePrompts?.[0]?.promptPath, 'design-rules/ai/prompts/ai-context-cognitive-clarity.md');
});

test('aggregateAiAuditResults records partial plan metadata when batchesPlanned is set', () => {
  const { data, markdown } = aggregateAiAuditResults({
    auditData: { auditRunId: 'run123', generatedAt: '2026-05-18T00:00:00.000Z' },
    manifest: { batches: [{ batchId: 'ai-batch-00' }] },
    batchArtifacts: [
      {
        batchId: 'ai-batch-00',
        urls: ['https://fixture.test/'],
        transcriptPath: 'transcripts/ai-batch-00.log',
        rawOutput: '```json\n{"summary":"ok","findings":[]}\n```',
      },
    ],
    batchesPlanned: 5,
    stopReason: 'major_plus_threshold',
  });
  assert.equal(data.batchesPlanned, 5);
  assert.equal(data.batchesProcessed, 1);
  assert.equal(data.batchesSkippedFromPlan, 4);
  assert.equal(data.stopReason, 'major_plus_threshold');
  assert.match(markdown, /Early stop/);
});

test('extractJsonFromAgentText parses fenced JSON blocks', () => {
  const parsed = extractJsonFromAgentText('hello\n```json\n{"summary":"ok","findings":[]}\n```\n');
  assert.equal(parsed.summary, 'ok');
});

test('shouldMergeAiFindingForScoreGate excludes covered and low confidence', () => {
  const ok = normalizeAiFinding({
    url: 'https://fixture.test/',
    severity: 'major',
    principleId: 'AI.EMPTY_STATE.USEFULNESS',
    deterministicCoverage: 'not-covered',
    confidence: 0.9,
    title: 'Empty',
  });
  assert.equal(shouldMergeAiFindingForScoreGate(ok), true);
  assert.equal(
    shouldMergeAiFindingForScoreGate({ ...ok, deterministicCoverage: 'covered' }),
    false,
  );
  assert.equal(shouldMergeAiFindingForScoreGate({ ...ok, confidence: 0.2 }), false);
  assert.equal(
    shouldMergeAiFindingForScoreGate({ ...ok, deterministicCoverage: 'partially-covered' }),
    true,
  );
});

test('filterScoreableAiFindings keeps partially-covered high-confidence items', () => {
  const findings = [
    normalizeAiFinding({
      url: 'https://a/',
      severity: 'minor',
      principleId: 'AI.ERROR_COPY.REASSURANCE',
      deterministicCoverage: 'partially-covered',
      confidence: 0.8,
      title: 'harsh error',
    }),
    normalizeAiFinding({
      url: 'https://b/',
      severity: 'minor',
      principleId: 'AI.FORM.FRICTION_AND_RECOVERY',
      deterministicCoverage: 'covered',
      confidence: 0.95,
      title: 'covered',
    }),
  ];
  assert.equal(filterScoreableAiFindings(findings).length, 1);
});

test('aggregateAiAuditResults normalizes findings and parse errors', () => {
  const { data, markdown } = aggregateAiAuditResults({
    auditData: { auditRunId: 'run123', generatedAt: '2026-05-18T00:00:00.000Z' },
    manifest: { batches: [{ batchId: 'ai-batch-00' }, { batchId: 'ai-batch-01' }] },
    batchArtifacts: [
      {
        batchId: 'ai-batch-00',
        urls: ['https://fixture.test/'],
        transcriptPath: 'transcripts/ai-batch-00.log',
        rawOutput: '```json\n{"summary":"found one","inspectedUrls":["https://fixture.test/"],"findings":[{"url":"https://fixture.test/","severity":"high","guardrail":"trust","principleId":"AI.GOVERNANCE.CREDIBILITY","deterministicCoverage":"not-covered","candidateDeterministicRule":"DET.TRUST.HERO_GOVERNANCE_BLOCK presence","hashesOrContractsAffected":["ABC","docs/design/catalog/layouts/foo.md"],"screenshotOrDomEvidence":"Hero lacks governance strip","title":"Weak trust proof","evidence":"No governance section","sourceFiles":["content/index.md"],"remediation":"Add proof.","confidence":"high"}]}\n```',
      },
      {
        batchId: 'ai-batch-01',
        urls: ['https://fixture.test/docs-start.html'],
        transcriptPath: 'transcripts/ai-batch-01.log',
        rawOutput: 'not json',
      },
    ],
  });
  assert.equal(data.totalFindings, 1);
  assert.equal(data.majorPlusFindingCount, 1);
  assert.equal(data.findings[0].severity, 'critical');
  assert.equal(data.parseErrors.length, 1);
  assert.match(markdown, /AI-assisted UX audit/);
  assert.match(markdown, /Weak trust proof/);
  assert.equal(data.findings[0].principleId, 'AI.CREDIBILITY.NO_OVERCLAIM');
  assert.equal(data.findings[0].principleIdAlias, 'AI.GOVERNANCE.CREDIBILITY');
  assert.equal(data.findings[0].candidateDeterministicRule, 'DET.TRUST.HERO_GOVERNANCE_BLOCK presence');
  assert.deepEqual(data.findings[0].hashesOrContractsAffected, ['ABC', 'docs/design/catalog/layouts/foo.md']);
  assert.equal(data.findings[0].screenshotOrDomEvidence, 'Hero lacks governance strip');
  assert.equal(data.findings[0].confidence, 0.85);
  assert.match(markdown, /Candidate deterministic rule:/);
});
