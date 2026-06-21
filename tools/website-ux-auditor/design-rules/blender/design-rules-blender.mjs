#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import {
  AI_PROMPT_IMPLEMENTATIONS,
  BLENDER_SCHEMA_VERSION,
  DETERMINISTIC_IMPLEMENTATIONS,
  LEGACY_CHECK_ADAPTERS,
} from './rule-mappings.js';
import { buildAiRuleGovernanceBlock, validateAiRuleRegistryAlignment } from '../../lib/ai-rule-ids.js';
import { buildDeterministicRuleRegistryEntries } from './rule-status.js';

const TOOL_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const DESIGN_RULES_ROOT = path.resolve(TOOL_ROOT, 'design-rules');
const DEFAULT_OUT = path.resolve(DESIGN_RULES_ROOT, 'registry.generated.json');

const DET_RULES_DOC = path.resolve(TOOL_ROOT, '..', '..', 'docs/design/ux-audit/deterministic-design-rules.md');
const AI_RULES_DOC = path.resolve(TOOL_ROOT, '..', '..', 'docs/design/ux-audit/ai-enabled-design-principles.md');
const MATRIX_DOC = path.resolve(TOOL_ROOT, '..', '..', 'docs/design/ux-audit/element-level-ruleset-matrix.md');
const TAXONOMY_DOC = path.resolve(TOOL_ROOT, '..', '..', 'docs/design/ux-audit/component-design-ruleset-taxonomy.md');

const REQUIRED_AI_FINDING_METADATA = [
  'principleId',
  'severity',
  'deterministicCoverage',
  'candidateDeterministicRule',
  'hashesOrContractsAffected',
  'screenshotOrDomEvidence',
  'confidence',
  'recommendedFixScope',
  'sourceFilesLikelyAffected',
];

function parseArgs(argv) {
  const args = { out: DEFAULT_OUT, write: true, overrideVersion: false };
  for (let i = 2; i < argv.length; i += 1) {
    const raw = argv[i];
    if (raw === '--help' || raw === '-h') {
      console.log('usage: node design-rules/blender/design-rules-blender.mjs [--out FILE] [--dry-run] [--override-version]');
      process.exit(0);
    }
    if (raw === '--dry-run') {
      args.write = false;
      continue;
    }
    if (raw === '--out') {
      args.out = path.resolve(argv[++i] || '');
      continue;
    }
    if (raw === '--override-version') {
      args.overrideVersion = true;
      continue;
    }
    throw new Error(`Unknown flag: ${raw}`);
  }
  return args;
}

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

function kebabFromRuleId(ruleId) {
  return String(ruleId || '')
    .toLowerCase()
    .replaceAll('.', '-')
    .replaceAll('_', '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function detRuleDocAnchor(ruleId) {
  return `docs/design/ux-audit/deterministic-design-rules.md#${kebabFromRuleId(ruleId)}`;
}

function aiRuleDocAnchor(ruleId) {
  return `docs/design/ux-audit/ai-enabled-design-principles.md#${kebabFromRuleId(ruleId)}`;
}

function extractRuleIds(markdown, prefix) {
  const rx = new RegExp('`(' + prefix + '\\.[A-Z0-9_.]+)`', 'g');
  const out = [];
  for (const match of markdown.matchAll(rx)) out.push(match[1]);
  return uniqueSorted(out);
}

function aiPromptPathForRuleId(ruleId) {
  return `design-rules/ai/prompts/generated/${kebabFromRuleId(ruleId)}.md`;
}

function detGeneratedCheckPathForRuleId(ruleId) {
  return `design-rules/deterministic/generated/${kebabFromRuleId(ruleId)}.check.js`;
}

function aiPromptTemplate(ruleId, rulesVersion) {
  return `<!-- generated-by: design-rules-blender -->
<!-- rule-id: ${ruleId} -->
<!-- rules-version: ${rulesVersion} -->
# ${ruleId}

This AI rule is explicitly referenced in KS UX rule docs (matrix/taxonomy) and runs as a judgment overlay.

PDCA framing:
- Plan: identify issues tied to ${ruleId}.
- Do: propose concrete remediation steps.
- Check: define objective acceptance checks and evidence capture.
- Adjust: if repeatable, propose a deterministic \`DET.*\` candidate.
`;
}

function deterministicStubTemplate(ruleId, rulesVersion) {
  return `// generated-by: design-rules-blender
// rule-id: ${ruleId}
// rules-version: ${rulesVersion}
export const rule = {
  id: '${ruleId}',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'site-inspection',
  scoreDimension: null,
  defaultSeverity: 'minor',
  priorityWeight: 0,
  source: '${detRuleDocAnchor(ruleId)}',
};

/** Auto-generated stub for ${ruleId}. Replace with measurable checks when implemented. */
export function run() {
  return [];
}
`;
}

function readEmbeddedRulesVersion(text, lane) {
  const source = String(text || '');
  if (lane === 'ai') {
    const m = source.match(/<!--\s*rules-version:\s*([a-f0-9]+)\s*-->/i);
    return m ? String(m[1]).trim() : '';
  }
  const m = source.match(/\/\/\s*rules-version:\s*([a-f0-9]+)/i);
  return m ? String(m[1]).trim() : '';
}

async function shouldRewriteGeneratedFile(absPath, expectedVersion, lane, args) {
  if (args.overrideVersion) return true;
  try {
    const raw = await fs.readFile(absPath, 'utf8');
    const existingVersion = readEmbeddedRulesVersion(raw, lane);
    if (!existingVersion) return true;
    return existingVersion !== expectedVersion;
  } catch {
    return true;
  }
}

async function ensureGeneratedDeterministicLibrary(detIds, rulesVersion, args) {
  const generated = [];
  for (const id of detIds) {
    if (DETERMINISTIC_IMPLEMENTATIONS[id]) continue;
    const rel = detGeneratedCheckPathForRuleId(id);
    const abs = path.resolve(TOOL_ROOT, rel);
    const rewrite = await shouldRewriteGeneratedFile(abs, rulesVersion, 'deterministic', args);
    if (!rewrite) continue;
    if (args.write) {
      await fs.mkdir(path.dirname(abs), { recursive: true });
      await fs.writeFile(abs, deterministicStubTemplate(id, rulesVersion), 'utf8');
    }
    generated.push(rel);
  }
  return generated;
}

async function ensureGeneratedAiPromptLibrary(aiIds, rulesVersion, args) {
  const generated = [];
  for (const id of aiIds) {
    if (AI_PROMPT_IMPLEMENTATIONS[id]?.promptPath) continue;
    const rel = aiPromptPathForRuleId(id);
    const abs = path.resolve(TOOL_ROOT, rel);
    const rewrite = await shouldRewriteGeneratedFile(abs, rulesVersion, 'ai', args);
    if (!rewrite) continue;
    if (args.write) {
      await fs.mkdir(path.dirname(abs), { recursive: true });
      await fs.writeFile(abs, aiPromptTemplate(id, rulesVersion), 'utf8');
    }
    generated.push(rel);
  }
  return generated;
}

function sha256(input) {
  return crypto.createHash('sha256').update(String(input || ''), 'utf8').digest('hex');
}


function buildAiRules(aiIds) {
  return aiIds.map((id) => {
    const impl = AI_PROMPT_IMPLEMENTATIONS[id];
    return {
      id,
      lane: 'ai',
      status: impl?.status || 'generated',
      promptPath: impl?.promptPath || aiPromptPathForRuleId(id),
      sourceRule: aiRuleDocAnchor(id),
    };
  });
}

async function main() {
  const args = parseArgs(process.argv);
  const detMarkdown = await fs.readFile(DET_RULES_DOC, 'utf8');
  const aiMarkdown = await fs.readFile(AI_RULES_DOC, 'utf8');
  const matrixMarkdown = await fs.readFile(MATRIX_DOC, 'utf8');
  const taxonomyMarkdown = await fs.readFile(TAXONOMY_DOC, 'utf8');

  const deterministicRuleIds = extractRuleIds(detMarkdown, 'DET');
  const aiRuleIdsFromAiDoc = extractRuleIds(aiMarkdown, 'AI');
  const aiRuleIdsFromMatrix = extractRuleIds(matrixMarkdown, 'AI');
  const aiRuleIdsFromTaxonomy = extractRuleIds(taxonomyMarkdown, 'AI');
  const explicitAiRuleIds = uniqueSorted([...aiRuleIdsFromMatrix, ...aiRuleIdsFromTaxonomy]);
  const aiRuleIds = explicitAiRuleIds;

  const deterministicRulesVersion = sha256(detMarkdown);
  const aiRulesVersion = sha256([aiMarkdown, matrixMarkdown, taxonomyMarkdown].join('\n\n---\n\n'));
  const generatedDeterministicChecks = await ensureGeneratedDeterministicLibrary(deterministicRuleIds, deterministicRulesVersion, args);
  const generatedAiPrompts = await ensureGeneratedAiPromptLibrary(aiRuleIds, aiRulesVersion, args);

  const deterministicRules = await buildDeterministicRuleRegistryEntries(
    deterministicRuleIds,
    deterministicRulesVersion,
    args.overrideVersion,
  );
  const aiRules = buildAiRules(aiRuleIds);
  const legacyAdapters = [...LEGACY_CHECK_ADAPTERS].sort((a, b) => a.checkId.localeCompare(b.checkId));

  const implementedDet = deterministicRules.filter((r) => r.status === 'implemented');
  const stubDet = deterministicRules.filter((r) => r.status === 'stub');

  const fingerprintInput = JSON.stringify({
    detRules: deterministicRuleIds,
    aiRules: aiRuleIds,
    legacyAdapters,
    deterministicImplementations: DETERMINISTIC_IMPLEMENTATIONS,
    resolvedDeterministicRules: deterministicRules.map((r) => ({
      id: r.id,
      status: r.status,
      implementationSource: r.implementationSource || null,
      modulePath: r.modulePath,
    })),
    aiPromptImplementations: AI_PROMPT_IMPLEMENTATIONS,
    generatedDeterministicChecks,
    generatedAiPrompts,
    docsSha: {
      deterministic: sha256(detMarkdown),
      ai: sha256(aiMarkdown),
      matrix: sha256(matrixMarkdown),
      taxonomy: sha256(taxonomyMarkdown),
    },
  });

  const registry = {
    schemaVersion: BLENDER_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    blender: {
      version: BLENDER_SCHEMA_VERSION,
      entry: 'design-rules/blender/design-rules-blender.mjs',
    },
    fingerprint: sha256(fingerprintInput),
    sources: {
      deterministicRulesDoc: {
        path: 'docs/design/ux-audit/deterministic-design-rules.md',
        sha256: sha256(detMarkdown),
      },
      aiRulesDoc: {
        path: 'docs/design/ux-audit/ai-enabled-design-principles.md',
        sha256: sha256(aiMarkdown),
      },
      matrixDoc: {
        path: 'docs/design/ux-audit/element-level-ruleset-matrix.md',
        sha256: sha256(matrixMarkdown),
      },
      taxonomyDoc: {
        path: 'docs/design/ux-audit/component-design-ruleset-taxonomy.md',
        sha256: sha256(taxonomyMarkdown),
      },
      mappingFile: {
        path: 'tools/website-ux-auditor/design-rules/blender/rule-mappings.js',
      },
    },
    aiSelectionPolicy: {
      mode: 'explicit-only',
      description: 'Only AI rules explicitly referenced as AI-enabled principles in matrix/taxonomy are emitted for AI review.',
      fromMatrixCount: aiRuleIdsFromMatrix.length,
      fromTaxonomyCount: aiRuleIdsFromTaxonomy.length,
      fromAiDocCount: aiRuleIdsFromAiDoc.length,
      selectedCount: aiRuleIds.length,
    },
    versioning: {
      deterministicRulesVersion,
      aiRulesVersion,
      overrideVersionApplied: Boolean(args.overrideVersion),
      policy: 'Generated files are not rewritten when embedded rules-version matches, unless --override-version is passed.',
    },
    generatedLibrary: {
      deterministicChecksGenerated: generatedDeterministicChecks.length,
      aiPromptsGenerated: generatedAiPrompts.length,
    },
    deterministicCoverage: {
      documentedRuleCount: deterministicRuleIds.length,
      implementedCount: implementedDet.length,
      stubCount: stubDet.length,
      implementedRuleIds: implementedDet.map((r) => r.id),
      stubRuleIds: stubDet.map((r) => r.id),
      byImplementationSource: implementedDet.reduce((acc, r) => {
        const key = r.implementationSource || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    },
    requiredAiFindingMetadata: REQUIRED_AI_FINDING_METADATA,
    aiRuleGovernance: buildAiRuleGovernanceBlock(),
    deterministicRules,
    aiRules,
    legacyAdapters,
  };

  const alignment = await validateAiRuleRegistryAlignment({
    registry,
    aiRulesDocMarkdown: aiMarkdown,
  });
  if (!alignment.ok) {
    const detail = alignment.errors.join('\n  - ');
    throw new Error(`AI rule registry/doc alignment failed:\n  - ${detail}`);
  }

  const payload = `${JSON.stringify(registry, null, 2)}\n`;
  if (args.write) {
    await fs.mkdir(path.dirname(args.out), { recursive: true });
    await fs.writeFile(args.out, payload, 'utf8');
  }

  process.stdout.write(`${args.out}\n`);
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
