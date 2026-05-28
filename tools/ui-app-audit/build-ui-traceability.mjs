#!/usr/bin/env node
/**
 * Build ui-traceability.generated.json for Studio smoke (deterministic, pre-run).
 *
 * Usage:
 *   node build-ui-traceability.mjs --app-repo PATH --smoke-plan PATH --out PATH
 *     [--ks-repo PATH] [--contract-md PATH] [--check]
 */
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildTraceabilityIndex } from './lib/build-traceability-index.mjs';
import { KS_ROOT_DEFAULT } from './lib/paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const opts = {
    appRepo: '',
    ksRepo: KS_ROOT_DEFAULT,
    smokePlan: '',
    contractMd: '',
    out: '',
    check: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--app-repo' && argv[i + 1]) opts.appRepo = path.resolve(argv[++i]);
    else if (a === '--ks-repo' && argv[i + 1]) opts.ksRepo = path.resolve(argv[++i]);
    else if (a === '--smoke-plan' && argv[i + 1]) opts.smokePlan = path.resolve(argv[++i]);
    else if (a === '--contract-md' && argv[i + 1]) opts.contractMd = path.resolve(argv[++i]);
    else if (a === '--out' && argv[i + 1]) opts.out = path.resolve(argv[++i]);
    else if (a === '--check') opts.check = true;
    else if (a === '-h' || a === '--help') {
      console.log(`Usage: node build-ui-traceability.mjs --app-repo R --smoke-plan P --out O [--ks-repo K] [--contract-md M] [--check]`);
      process.exit(0);
    }
  }
  return opts;
}

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.appRepo || !opts.smokePlan || !opts.out) {
    console.error('build-ui-traceability: --app-repo, --smoke-plan, --out required');
    process.exit(2);
  }

  const index = await buildTraceabilityIndex({
    appRepo: opts.appRepo,
    ksRepo: opts.ksRepo,
    smokePlanPath: opts.smokePlan,
    contractMdPath: opts.contractMd || path.join(opts.appRepo, 'docs', 'studio-functionality.md'),
    appRepoName: path.basename(opts.appRepo),
  });

  const text = `${JSON.stringify(index, null, 2)}\n`;

  if (opts.check) {
    let prior = '';
    try {
      prior = await fs.readFile(opts.out, 'utf8');
    } catch {
      console.error(`build-ui-traceability --check: missing ${opts.out}`);
      process.exit(1);
    }
    if (sha256(prior) !== sha256(text)) {
      console.error('build-ui-traceability --check: drift (regenerate ui-traceability.generated.json)');
      process.exit(1);
    }
    console.log(`build-ui-traceability --check: OK (${index.entries.length} entries)`);
    return;
  }

  await fs.mkdir(path.dirname(opts.out), { recursive: true });
  await fs.writeFile(opts.out, text, 'utf8');
  console.error(`build-ui-traceability: wrote ${opts.out} (${index.entries.length} entries)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
