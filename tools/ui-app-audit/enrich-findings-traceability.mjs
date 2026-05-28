#!/usr/bin/env node
/**
 * Attach traceabilityId and sources[] to audit-data.json findings.
 *
 * Usage:
 *   node enrich-findings-traceability.mjs --audit PATH --traceability PATH [--out PATH]
 */
import fs from 'node:fs/promises';
import path from 'node:path';

import { enrichAuditFile } from './lib/enrich-findings.mjs';

function parseArgs(argv) {
  const opts = { audit: '', traceability: '', out: '' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--audit' && argv[i + 1]) opts.audit = path.resolve(argv[++i]);
    else if (a === '--traceability' && argv[i + 1]) opts.traceability = path.resolve(argv[++i]);
    else if (a === '--out' && argv[i + 1]) opts.out = path.resolve(argv[++i]);
    else if (a === '-h' || a === '--help') {
      console.log('Usage: node enrich-findings-traceability.mjs --audit A --traceability T [--out O]');
      process.exit(0);
    }
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.audit || !opts.traceability) {
    console.error('enrich-findings-traceability: --audit and --traceability required');
    process.exit(2);
  }
  const out = opts.out || opts.audit;
  if (out === opts.audit) {
    const bak = `${opts.audit}.pre-enrich.bak`;
    await fs.copyFile(opts.audit, bak);
  }
  const enriched = await enrichAuditFile(opts.audit, opts.traceability, out);
  const withSources = (enriched.pages || []).flatMap((p) => p.findings || []).filter((f) => f.sources?.length);
  console.error(
    `enrich-findings-traceability: wrote ${out} findings=${(enriched.pages || []).flatMap((p) => p.findings || []).length} withSources=${withSources.length}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
