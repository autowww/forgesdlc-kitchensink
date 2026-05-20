#!/usr/bin/env node

import process from 'node:process';

import { summarizeExecutableCoverage } from './rule-status.js';
import { loadDesignRuleRegistry } from '../../lib/design-rule-runtime.js';

function parseArgs(argv) {
  const args = { strict: false, json: false };
  for (let i = 2; i < argv.length; i += 1) {
    const raw = argv[i];
    if (raw === '--help' || raw === '-h') {
      console.log(
        'usage: node design-rules/blender/preflight-deterministic-coverage.mjs [--strict] [--json]\n' +
          '  Verifies every registry-implemented DET rule imports and exposes run().\n' +
          '  Does not require stub rules to be implemented.',
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
    throw new Error(`Unknown flag: ${raw}`);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const registry = await loadDesignRuleRegistry();
  const detIds = (registry.deterministicRules || []).map((r) => r.id);
  const rulesVersion = registry.versioning?.deterministicRulesVersion || '';
  const summary = await summarizeExecutableCoverage(detIds, rulesVersion, false);

  const registryImplemented = (registry.deterministicRules || []).filter((r) => r.status === 'implemented');
  const registryStub = (registry.deterministicRules || []).filter((r) => r.status === 'stub');

  const ok = summary.importFail.length === 0 && summary.importOk === summary.implementedRegistryCount;

  const payload = {
    ok,
    registryFingerprint: registry.fingerprint || null,
    registryImplementedCount: registryImplemented.length,
    registryStubCount: registryStub.length,
    resolvedImplementedCount: summary.implementedRegistryCount,
    importOk: summary.importOk,
    importFail: summary.importFail,
    implementedRuleIds: summary.implementedRuleIds,
    stubRuleIds: summary.stubRuleIds,
  };

  if (args.json) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  } else {
    process.stdout.write(
      [
        `preflight deterministic: ${ok ? 'OK' : 'FAIL'}`,
        `registry implemented=${registryImplemented.length} stub=${registryStub.length}`,
        `resolved importable=${summary.importOk} (heuristic + explicit map)`,
        summary.importFail.length
          ? `import failures: ${summary.importFail.map((f) => `${f.id}: ${f.error}`).join('; ')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    );
    process.stdout.write('\n');
  }

  if (!ok) {
    if (args.strict) process.exit(1);
    process.exit(2);
  }
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
