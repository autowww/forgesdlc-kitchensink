#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { validateAiRuleRegistryAlignment } from '../../lib/ai-rule-ids.js';

const BLENDER_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname));
const DEFAULT_REGISTRY = path.resolve(BLENDER_DIR, '..', 'registry.generated.json');

function parseArgs(argv) {
  const args = { registry: DEFAULT_REGISTRY, strict: false, json: false };
  for (let i = 2; i < argv.length; i += 1) {
    const raw = argv[i];
    if (raw === '--help' || raw === '-h') {
      console.log(
        'usage: node design-rules/blender/validate-ai-rule-registry-alignment.mjs [--registry FILE] [--strict] [--json]',
      );
      process.exit(0);
    }
    if (raw === '--strict') {
      args.strict = true;
      continue;
    }
    if (raw === '--json') {
      args.json = true;
      continue;
    }
    if (raw === '--registry') {
      args.registry = path.resolve(argv[++i] || '');
      continue;
    }
    throw new Error(`Unknown flag: ${raw}`);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const registry = JSON.parse(await fs.readFile(args.registry, 'utf8'));
  const result = await validateAiRuleRegistryAlignment({ registry });

  const payload = {
    ok: result.ok,
    activeCount: result.activeIds.length,
    docIdCount: result.docIds.length,
    aliasCount: result.aliasCount,
    docOnlyCount: result.docOnlyCount,
    errors: result.errors,
  };

  if (args.json) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  } else {
    process.stdout.write(
      [
        `validate AI registry alignment: ${result.ok ? 'OK' : 'FAIL'}`,
        `active=${result.activeIds.length} doc-mentions=${result.docIds.length} aliases=${result.aliasCount}`,
        ...result.errors.map((e) => `  - ${e}`),
      ].join('\n'),
    );
    process.stdout.write('\n');
  }

  if (!result.ok) {
    process.exit(args.strict ? 1 : 2);
  }
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
