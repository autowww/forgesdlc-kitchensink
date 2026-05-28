import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(TOOL_ROOT, 'design-rules/registry.generated.json');
const AI_FIXER_PATH = path.join(TOOL_ROOT, 'lib/a11y-ai-fixers/ai-fixer-registry.json');

describe('ai-fixer-registry coverage', () => {
  it('lists every implemented AI rule explicitly', () => {
    const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    const aiFixer = JSON.parse(fs.readFileSync(AI_FIXER_PATH, 'utf8'));
    const implemented = (registry.aiRules || []).filter((r) => r.status === 'implemented');
    const byRule = new Map((aiFixer.rules || []).map((r) => [r.ruleId, r]));
    assert.equal(byRule.size, implemented.length);
    assert.equal(aiFixer.ruleCount, implemented.length);
    for (const rule of implemented) {
      assert.ok(byRule.has(rule.id), `missing ai fixer row for ${rule.id}`);
    }
    const applyCount = (aiFixer.rules || []).filter((r) =>
      String(r.fixerId || '').startsWith('ai_apply_'),
    ).length;
    const noteCount = (aiFixer.rules || []).filter((r) => r.fixerId === 'remediation_note').length;
    assert.ok(applyCount >= 6, `expected at least six ai_apply_* fixers, got ${applyCount}`);
    assert.ok(noteCount >= 6, `expected at least six remediation_note fixers, got ${noteCount}`);
  });
});
