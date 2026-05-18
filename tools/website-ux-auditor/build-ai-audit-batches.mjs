#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

import { buildAiAuditBatchManifest } from './lib/ai-audit-batches.js';
import { ensureDir } from './lib/files.js';

function usage() {
  console.error('usage: node build-ai-audit-batches.mjs --repo REPO --audit AUDIT_DATA_JSON --out AI_OUT_DIR [--standard PATH] [--batch-size N]');
}

const argv = process.argv.slice(2);
const args = { repo: '', audit: '', out: '', standard: '', batchSize: 5 };
for (let i = 0; i < argv.length; i += 1) {
  const key = argv[i];
  const next = argv[i + 1];
  if (key === '--repo') args.repo = next || '';
  else if (key === '--audit') args.audit = next || '';
  else if (key === '--out') args.out = next || '';
  else if (key === '--standard') args.standard = next || '';
  else if (key === '--batch-size') args.batchSize = Number(next || '5');
}
if (!args.repo || !args.audit || !args.out) {
  usage();
  process.exit(2);
}

const raw = JSON.parse(await fs.readFile(args.audit, 'utf8'));
const manifest = await buildAiAuditBatchManifest({
  auditData: raw,
  repoRoot: args.repo,
  designStandardPath: args.standard || null,
  batchSize: args.batchSize,
});

const outDir = path.resolve(args.out);
const batchDir = path.join(outDir, 'batches');
await ensureDir(batchDir);

const writtenBatches = [];
for (const batch of manifest.batches) {
  const rel = `batches/${batch.batchId}.json`;
  await fs.writeFile(path.join(outDir, rel), `${JSON.stringify(batch, null, 2)}\n`, 'utf8');
  writtenBatches.push({
    batchId: batch.batchId,
    path: rel,
    urls: batch.urls,
  });
}

const manifestPayload = {
  ...manifest,
  batches: writtenBatches,
};
await fs.writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifestPayload, null, 2)}\n`, 'utf8');
process.stdout.write(`${path.join(outDir, 'manifest.json')}\n`);
