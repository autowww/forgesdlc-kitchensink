#!/usr/bin/env node
/**
 * Regenerate ai-fixer-registry.json with every implemented AI.A11Y.* rule.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(TOOL_ROOT, 'design-rules/registry.generated.json');
const OUT_PATH = path.join(TOOL_ROOT, 'lib/a11y-ai-fixers/ai-fixer-registry.json');

/** DOM-apply pilots (require --repo-root on run-ai-fixers). */
const AI_APPLY_RULES = new Map([
  ['AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION', 'ai_apply_form_error'],
  ['AI.A11Y.GENERIC.AUDIO_CONTROL', 'ai_apply_audio_control'],
]);

/** Rules that may emit a remediation note artifact (guarded apply). */
const REMEDIATION_NOTE_RULES = new Set([
  'AI.A11Y.KS.HANDBOOK_SIDEBAR_LABELS',
  'AI.A11Y.KS.REGION_LABELING',
  'AI.A11Y.GENERIC.SENSORY_INSTRUCTIONS',
  'AI.A11Y.GENERIC.READING_LEVEL',
  'AI.A11Y.GENERIC.TIMING_ADJUSTABLE',
  'AI.A11Y.GENERIC.MEDIA_ALTERNATIVES',
  'AI.A11Y.GENERIC.ERROR_PREVENTION',
  'AI.A11Y.GENERIC.CONTEXT_HELP',
  'AI.A11Y.GENERIC.CONSISTENT_NAV_JUDGMENT',
  'AI.A11Y.GENERIC.POINTER_GESTURES_JUDGMENT',
  'AI.A11Y.GENERIC.VISUAL_PRESENTATION',
]);

async function main() {
  const checkOnly = process.argv.includes('--check');
  const registry = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
  const rules = (registry.aiRules || [])
    .filter((r) => r.status === 'implemented')
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
      console.error('generate-ai-fixer-registry --check: drift');
      process.exit(1);
    }
    console.log(`generate-ai-fixer-registry --check: OK (${rules.length} rules)`);
    return;
  }

  await fs.writeFile(OUT_PATH, body, 'utf8');
  console.log(`generate-ai-fixer-registry: wrote ${rules.length} rules`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
