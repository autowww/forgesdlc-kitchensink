#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

import { aggregateAiAuditResults } from './lib/ai-audit-batches.js';
import { ensureDir } from './lib/files.js';

function usage() {
  console.error('usage: node aggregate-ai-audit-results.mjs --audit AUDIT_DATA_JSON --ai-out AI_OUT_DIR');
}

const argv = process.argv.slice(2);
const args = { audit: '', aiOut: '' };
for (let i = 0; i < argv.length; i += 1) {
  const key = argv[i];
  const next = argv[i + 1];
  if (key === '--audit') args.audit = next || '';
  else if (key === '--ai-out') args.aiOut = next || '';
}
if (!args.audit || !args.aiOut) {
  usage();
  process.exit(2);
}

const auditData = JSON.parse(await fs.readFile(args.audit, 'utf8'));
const aiOut = path.resolve(args.aiOut);
const manifest = JSON.parse(await fs.readFile(path.join(aiOut, 'manifest.json'), 'utf8'));

const artifacts = [];
for (const batch of manifest.batches || []) {
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

const { data, markdown } = aggregateAiAuditResults({
  auditData,
  manifest,
  batchArtifacts: artifacts,
});
await ensureDir(aiOut);
await fs.writeFile(path.join(aiOut, 'ai-audit-data.json'), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(aiOut, 'ai-audit-report.md'), markdown, 'utf8');
process.stdout.write(`${path.join(aiOut, 'ai-audit-data.json')}\n`);
