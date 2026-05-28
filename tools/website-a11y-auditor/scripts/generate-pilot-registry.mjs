#!/usr/bin/env node
/**
 * Regenerate pilot-registry.json from registry + FIXER_ID_BY_RULE.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defaultFixerIdForRule } from '../lib/a11y-deterministic-fixers/fixers/patch-registry.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(TOOL_ROOT, 'design-rules/registry.generated.json');
const OUT_PATH = path.join(TOOL_ROOT, 'lib/a11y-deterministic-fixers/pilot-registry.json');

async function main() {
  const checkOnly = process.argv.includes('--check');
  const registry = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
  const rules = (registry.deterministicRules || [])
    .filter((r) => r.status === 'implemented')
    .map((r) => ({
      ruleId: r.id,
      fixerId: defaultFixerIdForRule(r.id),
      verifyMode: 'expect_rule_clean',
      harnessModes: ['standalone'],
    }))
    .sort((a, b) => a.ruleId.localeCompare(b.ruleId));

  const payload = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    ruleCount: rules.length,
    rules,
  };
  const body = `${JSON.stringify(payload, null, 2)}\n`;

  if (checkOnly) {
    const prev = JSON.parse(await fs.readFile(OUT_PATH, 'utf8'));
    const prevStable = { ruleCount: prev.ruleCount, rules: prev.rules };
    const nextStable = { ruleCount: payload.ruleCount, rules: payload.rules };
    if (JSON.stringify(prevStable) !== JSON.stringify(nextStable)) {
      console.error('generate-pilot-registry --check: drift (run without --check)');
      process.exit(1);
    }
    console.log(`generate-pilot-registry --check: OK (${rules.length} rules)`);
    return;
  }

  await fs.writeFile(OUT_PATH, body, 'utf8');
  const nonHandbook = rules.filter((r) => r.fixerId !== 'handbook_after').length;
  console.log(
    `generate-pilot-registry: wrote ${rules.length} rules (${nonHandbook} non-handbook_after)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
