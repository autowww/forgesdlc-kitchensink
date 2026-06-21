#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

import {
  aggregateAiAuditResults,
  loadAiScoreGateOptionsFromEnv,
  mergeAiFindingsIntoAuditData,
} from './lib/ai-audit-batches.js';
import { ensureDir } from './lib/files.js';

function usage() {
  console.error(
    'usage: node aggregate-ai-audit-results.mjs --audit AUDIT_DATA_JSON --ai-out AI_OUT_DIR [--max-batches N] [--stop-reason REASON]',
  );
  console.error(
    'Note: ai-audit-data.json findings preserve principleId, deterministicCoverage, candidateDeterministicRule, hashesOrContractsAffected, screenshotOrDomEvidence, and numeric confidence.',
  );
}

const argv = process.argv.slice(2);
const args = { audit: '', aiOut: '', maxBatches: 0, stopReason: '' };
for (let i = 0; i < argv.length; i += 1) {
  const key = argv[i];
  const next = argv[i + 1];
  if (key === '--audit') args.audit = next || '';
  else if (key === '--ai-out') args.aiOut = next || '';
  else if (key === '--max-batches') args.maxBatches = Math.max(0, Math.floor(Number(next || '0')));
  else if (key === '--stop-reason') args.stopReason = String(next || '').trim();
}
if (!args.audit || !args.aiOut) {
  usage();
  process.exit(2);
}

const auditData = JSON.parse(await fs.readFile(args.audit, 'utf8'));
const aiOut = path.resolve(args.aiOut);
const manifest = JSON.parse(await fs.readFile(path.join(aiOut, 'manifest.json'), 'utf8'));

const fullBatches = manifest.batches || [];
const maxB =
  args.maxBatches > 0 ? Math.min(args.maxBatches, fullBatches.length) : fullBatches.length;
const activeBatches = fullBatches.slice(0, maxB);

const artifacts = [];
for (const batch of activeBatches) {
  const transcriptPath = path.join(aiOut, 'transcripts', `${batch.batchId}.log`);
  let rawOutput = '';
  try {
    rawOutput = await fs.readFile(transcriptPath, 'utf8');
  } catch {
    rawOutput = '';
  }
  artifacts.push({
    batchId: batch.batchId,
    urls: batch.urls || [],
    transcriptPath: path.relative(aiOut, transcriptPath).replaceAll(path.sep, '/'),
    rawOutput,
  });
}

const partialRun = args.maxBatches > 0 && maxB < fullBatches.length;
const batchesPlannedMeta = partialRun ? fullBatches.length : null;

const { data, markdown } = aggregateAiAuditResults({
  auditData,
  manifest: { ...manifest, batches: activeBatches },
  batchArtifacts: artifacts,
  stopReason: args.stopReason || null,
  batchesPlanned: batchesPlannedMeta,
});
await ensureDir(aiOut);
await fs.writeFile(path.join(aiOut, 'ai-audit-data.json'), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(aiOut, 'ai-audit-report.md'), markdown, 'utf8');

const scoreOpts = loadAiScoreGateOptionsFromEnv();
if (scoreOpts.mergeIntoAuditData && data.scoreableFindings?.length) {
  mergeAiFindingsIntoAuditData(auditData, data.scoreableFindings, { minConfidence: scoreOpts.minConfidence });
  await fs.writeFile(args.audit, `${JSON.stringify(auditData, null, 2)}\n`, 'utf8');
}

process.stdout.write(`${path.join(aiOut, 'ai-audit-data.json')}\n`);
