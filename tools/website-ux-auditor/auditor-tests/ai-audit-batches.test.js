import assert from 'node:assert/strict';
import test from 'node:test';

import {
  aggregateAiAuditResults,
  buildAiAuditBatches,
  extractJsonFromAgentText,
  selectLikelySourceFiles,
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
  });
  assert.equal(manifest.totalBatches, 2);
  assert.deepEqual(manifest.batches[0].urls, ['https://fixture.test/']);
  assert.deepEqual(manifest.batches[1].urls, [
    'https://fixture.test/docs-start.html',
    'https://fixture.test/docs-start-01-start-here.html',
  ]);
  assert.equal(manifest.batches[0].designStandardPath, 'docs/design/std.md');
});

test('extractJsonFromAgentText parses fenced JSON blocks', () => {
  const parsed = extractJsonFromAgentText('hello\n```json\n{"summary":"ok","findings":[]}\n```\n');
  assert.equal(parsed.summary, 'ok');
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
        rawOutput: '```json\n{"summary":"found one","inspectedUrls":["https://fixture.test/"],"findings":[{"url":"https://fixture.test/","severity":"high","guardrail":"trust","title":"Weak trust proof","evidence":"No governance section","sourceFiles":["content/index.md"],"remediation":"Add proof."}]}\n```',
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
});
