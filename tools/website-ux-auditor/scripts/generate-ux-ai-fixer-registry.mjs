#!/usr/bin/env node
/**
 * Regenerate lib/ux-ai-fixers/ai-fixer-registry.json from registry.generated.json.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(TOOL_ROOT, 'design-rules/registry.generated.json');
const OUT_PATH = path.join(TOOL_ROOT, 'lib/ux-ai-fixers/ai-fixer-registry.json');

const AI_APPLY_RULES = new Map([
  ['AI.FORM.FRICTION_AND_RECOVERY', 'ai_apply_form_recovery'],
  ['AI.EMPTY_STATE.USEFULNESS', 'ai_apply_empty_state'],
  ['AI.DASHBOARD.ACTIONABILITY_PRIORITY', 'ai_apply_dashboard_priority'],
  ['AI.TRUST.DATA_FRESHNESS_PROVENANCE', 'ai_apply_data_freshness'],
  ['AI.ERROR_COPY.REASSURANCE', 'ai_apply_error_copy'],
]);

const REMEDIATION_NOTE_RULES = new Set([
  'AI.RESPONSIVE.CROSS_DEVICE_COMPREHENSION',
  'AI.ONBOARDING.PROGRESSIVE_DISCLOSURE',
  'AI.INFORMATION_SCENT.NEXT_STEP',
  'AI.BRAND.GENERICITY_AND_DIFFERENTIATION',
  'AI.APP.WORKFLOW_RISK_GUARDRAILS',
]);

async function main() {
  const checkOnly = process.argv.includes('--check');
  const registry = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
  const rules = (registry.aiRules || [])
    .map((r) => ({
      ruleId: r.id,
      fixerId:
        AI_APPLY_RULES.get(r.id) ||
        (REMEDIATION_NOTE_RULES.has(r.id) ? 'remediation_note' : 'plan_only'),
    }))
    .sort((a, b) => a.ruleId.localeCompare(b.ruleId));

  const payload = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    defaultFixerId: 'plan_only',
    ruleCount: rules.length,
    rules,
  };
  const body = `${JSON.stringify(payload, null, 2)}\n`;

  if (checkOnly) {
    const prev = JSON.parse(await fs.readFile(OUT_PATH, 'utf8'));
    const prevStable = { ruleCount: prev.ruleCount, rules: prev.rules, defaultFixerId: prev.defaultFixerId };
    const nextStable = {
      ruleCount: payload.ruleCount,
      rules: payload.rules,
      defaultFixerId: payload.defaultFixerId,
    };
    if (JSON.stringify(prevStable) !== JSON.stringify(nextStable)) {
      console.error('generate-ux-ai-fixer-registry --check: drift (run without --check)');
      process.exit(1);
    }
    console.log(`generate-ux-ai-fixer-registry --check: OK (${rules.length} rules)`);
    return;
  }

  await fs.writeFile(OUT_PATH, body, 'utf8');
  console.log(`generate-ux-ai-fixer-registry: wrote ${rules.length} rules`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
