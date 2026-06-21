#!/usr/bin/env node
/**
 * Regenerate pilot-registry.json from design-rules/registry.generated.json
 * plus intentional production-fixer-decisions.mjs entries.
 *
 * Usage:
 *   node generate-pilot-registry.mjs          # write
 *   node generate-pilot-registry.mjs --check  # exit 1 if stale
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  FIXER_DECISIONS,
  PILOT_EXCLUDED,
  resolveFixerDecision,
  validateFixerDecisions,
} from './production-fixer-decisions.mjs';
import { listProductionFixerRuleIds } from './fixers/patch-registry.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '../..');
const REGISTRY_PATH = path.join(TOOL_ROOT, 'design-rules/registry.generated.json');
const OUT_PATH = path.join(__dirname, 'pilot-registry.json');

const checkMode = process.argv.includes('--check');

const reg = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
const registryRows = (reg.deterministicRules || [])
  .filter((r) => r.status === 'implemented' && r.modulePath && r.id)
  .filter((r) => !PILOT_EXCLUDED.has(r.id));

const registryIds = registryRows.map((r) => r.id).sort();
const validation = validateFixerDecisions(registryIds);
if (!validation.ok) {
  console.warn(
    `generate-pilot-registry: note — ${validation.missing.length} rules use defaultFixerDecision fallback`,
  );
}

/** @type {Map<string, object>} */
const byRule = new Map();

for (const r of registryRows) {
  const decision = resolveFixerDecision(r.id);
  byRule.set(r.id, {
    ruleId: r.id,
    fixerId: decision.fixerId,
    verifyMode: decision.verifyMode || 'expect_rule_clean',
    harnessModes: decision.harnessModes || ['standalone'],
    ...(decision.planOnly ? { planOnly: true, planOnlyReason: decision.planOnlyReason } : {}),
    ...(decision.productionHandler ? { productionHandler: decision.productionHandler } : {}),
  });
}

// Include decision-only rules not yet in registry.generated.json (prompts 03–05 ahead of blend)
for (const [ruleId, decision] of Object.entries(FIXER_DECISIONS)) {
  if (byRule.has(ruleId) || PILOT_EXCLUDED.has(ruleId)) continue;
  byRule.set(ruleId, {
    ruleId,
    fixerId: decision.fixerId,
    verifyMode: decision.verifyMode || 'expect_rule_clean',
    harnessModes: decision.harnessModes || ['standalone'],
    pendingRegistry: true,
    ...(decision.planOnly ? { planOnly: true, planOnlyReason: decision.planOnlyReason } : {}),
    ...(decision.productionHandler ? { productionHandler: decision.productionHandler } : {}),
  });
}

const rules = [...byRule.values()].sort((a, b) => a.ruleId.localeCompare(b.ruleId));
const productionIds = new Set(listProductionFixerRuleIds());

const doc = {
  schemaVersion: 3,
  generatedAt: new Date().toISOString(),
  ruleCount: rules.length,
  registryRuleCount: registryIds.length,
  productionFixerCount: productionIds.size,
  rules,
};

const outText = `${JSON.stringify(doc, null, 2)}\n`;

if (checkMode) {
  let existing = '';
  try {
    existing = await fs.readFile(OUT_PATH, 'utf8');
  } catch {
    console.error('generate-pilot-registry --check: pilot-registry.json missing — run without --check');
    process.exit(1);
  }
  const normalize = (s) => {
    const doc = JSON.parse(s);
    const rules = (doc.rules || []).map((r) => {
      const row = {
        ruleId: r.ruleId,
        fixerId: r.fixerId,
        verifyMode: r.verifyMode,
        harnessModes: r.harnessModes,
      };
      if (r.planOnly) row.planOnly = true;
      if (r.planOnlyReason) row.planOnlyReason = r.planOnlyReason;
      if (r.productionHandler) row.productionHandler = r.productionHandler;
      if (r.pendingRegistry) row.pendingRegistry = true;
      return row;
    });
    rules.sort((a, b) => a.ruleId.localeCompare(b.ruleId));
    return JSON.stringify(rules);
  };
  if (normalize(existing) !== normalize(outText)) {
    console.error('generate-pilot-registry --check: pilot-registry.json is stale — run npm run fixers:generate-pilot-registry');
    process.exit(1);
  }
  console.log(`generate-pilot-registry --check: OK (${rules.length} rules, ${productionIds.size} production handlers)`);
  process.exit(0);
}

await fs.writeFile(OUT_PATH, outText);
console.log(
  `generate-pilot-registry: wrote ${rules.length} rules (${registryIds.length} in registry, ${productionIds.size} production handlers) → ${OUT_PATH}`,
);
