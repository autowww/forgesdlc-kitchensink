#!/usr/bin/env node
/** One-shot: print pilot-registry rules JSON array to stdout (for manual sync if needed). */
import { resolveFixerDecision, FIXER_DECISIONS } from '../lib/ux-deterministic-fixers/production-fixer-decisions.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../design-rules/registry.generated.json'), 'utf8'),
);
const registryIds = (reg.deterministicRules || [])
  .filter((r) => r.status === 'implemented' && r.modulePath && r.id)
  .map((r) => r.id);

const allIds = [...new Set([...registryIds, ...Object.keys(FIXER_DECISIONS)])].sort();
const rules = allIds.map((ruleId) => {
  const decision = resolveFixerDecision(ruleId);
  const pendingRegistry = !registryIds.includes(ruleId);
  return {
    ruleId,
    fixerId: decision.fixerId,
    verifyMode: decision.verifyMode || 'expect_rule_clean',
    harnessModes: decision.harnessModes || ['standalone'],
    ...(decision.planOnly ? { planOnly: true, planOnlyReason: decision.planOnlyReason } : {}),
    ...(decision.productionHandler ? { productionHandler: decision.productionHandler } : {}),
    ...(pendingRegistry ? { pendingRegistry: true } : {}),
  };
});
process.stdout.write(`${JSON.stringify(rules, null, 2)}\n`);
