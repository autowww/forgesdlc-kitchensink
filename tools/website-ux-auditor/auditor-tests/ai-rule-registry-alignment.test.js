import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import {
  AI_RULE_ALIASES,
  AI_RULE_DOC_ONLY,
  extractAiRuleIdsFromMarkdown,
  normalizeAiPrincipleId,
  validateAiRuleRegistryAlignment,
} from '../lib/ai-rule-ids.js';
import { normalizeAiFinding } from '../lib/ai-audit-batches.js';

const TOOL_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const REGISTRY_PATH = path.join(TOOL_ROOT, 'design-rules/registry.generated.json');
const AI_DOC_PATH = path.resolve(TOOL_ROOT, '..', '..', 'docs/design/ux-audit/ai-enabled-design-principles.md');

test('normalizeAiPrincipleId maps legacy hierarchy and credibility ids', () => {
  assert.equal(normalizeAiPrincipleId('AI.VISUAL.HIERARCHY_CONFIDENCE'), 'AI.VISUAL.HIERARCHY');
  assert.equal(normalizeAiPrincipleId('AI.GOVERNANCE.CREDIBILITY'), 'AI.CREDIBILITY.NO_OVERCLAIM');
  assert.equal(normalizeAiPrincipleId('AI.CONTRACT.ACTIONABILITY'), 'AI.CONTRACT.IMPLEMENTATION_USEFULNESS');
  assert.equal(normalizeAiPrincipleId('AI.VISUAL.HIERARCHY'), 'AI.VISUAL.HIERARCHY');
});

test('normalizeAiFinding records principleIdAlias when alias is normalized', () => {
  const finding = normalizeAiFinding({
    url: 'https://fixture.test/',
    severity: 'major',
    principleId: 'AI.VISUAL.HIERARCHY_CONFIDENCE',
    title: 'Competing hero CTAs',
  });
  assert.equal(finding.principleId, 'AI.VISUAL.HIERARCHY');
  assert.equal(finding.principleIdAlias, 'AI.VISUAL.HIERARCHY_CONFIDENCE');
});

test('registry, AI principles doc, prompts, and rule pages align', async () => {
  const registry = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
  const aiMarkdown = await fs.readFile(AI_DOC_PATH, 'utf8');
  const result = await validateAiRuleRegistryAlignment({
    registry,
    aiRulesDocMarkdown: aiMarkdown,
  });
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.ok(result.activeIds.includes('AI.VISUAL.HIERARCHY'));
  assert.ok(!result.activeIds.includes('AI.VISUAL.HIERARCHY_CONFIDENCE'));
});

test('doc-only legacy and discovery ids are declared', async () => {
  const aiMarkdown = await fs.readFile(AI_DOC_PATH, 'utf8');
  const docIds = extractAiRuleIdsFromMarkdown(aiMarkdown);
  for (const legacyId of Object.keys(AI_RULE_ALIASES)) {
    assert.ok(
      docIds.includes(legacyId) || AI_RULE_DOC_ONLY[legacyId],
      `expected doc mention or doc-only entry for ${legacyId}`,
    );
  }
  assert.equal(AI_RULE_DOC_ONLY['AI.RULE_DISCOVERY.CANDIDATE_DETERMINISTIC_RULE'].kind, 'discovery-only');
  assert.equal(AI_RULE_DOC_ONLY['AI.CONTRACT.FAMILY_COVERAGE_JUSTIFIED'].kind, 'discovery-only');
});

test('generated registry lists governance aliases when present', async () => {
  const registry = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
  if (!registry.aiRuleGovernance) {
    assert.fail('run npm run blend-rules to embed aiRuleGovernance in registry.generated.json');
  }
  const aliasFrom = registry.aiRuleGovernance.aliases.map((a) => a.from);
  assert.ok(aliasFrom.includes('AI.VISUAL.HIERARCHY_CONFIDENCE'));
});
