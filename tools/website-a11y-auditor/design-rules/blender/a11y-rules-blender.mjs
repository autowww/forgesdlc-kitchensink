#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { A11Y_STANDARD_PRESETS } from '../../lib/a11y-standards.js';
import { buildComplianceProfilesCrosswalk } from '../../lib/compliance-profiles.js';
import { buildTraceabilityFromRegistry } from '../../lib/build-traceability-matrix.js';
import { writeStandardsPacks } from './build-standards-packs.mjs';
import {
  AI_PROMPT_IMPLEMENTATIONS,
  BLENDER_SCHEMA_VERSION,
  DETERMINISTIC_IMPLEMENTATIONS,
} from './rule-mappings.js';

const TOOL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const REPO_KS_ROOT = path.resolve(TOOL_ROOT, '../..');
const COMPLIANCE_PROFILES_OUT = path.resolve(
  TOOL_ROOT,
  'design-rules/compliance-profiles.generated.json',
);
const TRACEABILITY_OUT = path.resolve(TOOL_ROOT, 'design-rules/standards-traceability.generated.json');
const TRACEABILITY_GAPS_MD = path.resolve(
  REPO_KS_ROOT,
  'docs/design/a11y-audit/standards-traceability-gaps.md',
);
const DEFAULT_OUT = path.resolve(TOOL_ROOT, 'design-rules/registry.generated.json');
const DET_DOC = path.resolve(TOOL_ROOT, '../../docs/design/a11y-audit/deterministic-a11y-rules.md');
const AI_DOC = path.resolve(TOOL_ROOT, '../../docs/design/a11y-audit/ai-enabled-a11y-principles.md');

function parseArgs(argv) {
  const args = { out: DEFAULT_OUT, write: true };
  for (let i = 2; i < argv.length; i += 1) {
    const raw = argv[i];
    if (raw === '--dry-run') {
      args.write = false;
      continue;
    }
    if (raw === '--out') {
      args.out = path.resolve(argv[++i] || '');
      continue;
    }
    throw new Error(`Unknown flag: ${raw}`);
  }
  return args;
}

function sha256(input) {
  return crypto.createHash('sha256').update(String(input || ''), 'utf8').digest('hex');
}

function validateScopeFilename(ruleId, scope, modulePath) {
  const base = path.basename(modulePath || '');
  if (scope === 'generic' && !base.includes('-generic-')) {
    throw new Error(`${ruleId}: generic scope requires -generic- in filename (${base})`);
  }
  if (scope === 'ks' && !base.includes('-ks-')) {
    throw new Error(`${ruleId}: ks scope requires -ks- in filename (${base})`);
  }
}

function validateDeterministicTraceability(ruleId, impl) {
  const hasSc = Array.isArray(impl.wcagCriteria) && impl.wcagCriteria.length > 0;
  const forgeOnly = impl.traceabilityRole === 'forge_only';
  if (!hasSc && !forgeOnly) {
    throw new Error(
      `${ruleId}: DET rule must have wcagCriteria[] or traceabilityRole: forge_only`,
    );
  }
}

function buildDeterministicRules() {
  return Object.entries(DETERMINISTIC_IMPLEMENTATIONS).map(([id, impl]) => {
    validateScopeFilename(id, impl.scope, impl.modulePath);
    validateDeterministicTraceability(id, impl);
    return {
      id,
      lane: 'deterministic',
      status: 'implemented',
      phase: 'metrics',
      scope: impl.scope,
      standards: impl.standards || [],
      wcagCriteria: impl.wcagCriteria || [],
      traceabilityRole: impl.traceabilityRole || null,
      area: impl.area || 'accessibility',
      defaultSeverity: impl.defaultSeverity || 'minor',
      priorityWeight: Number(impl.priorityWeight || 0),
      modulePath: impl.modulePath,
      sourceRule: impl.sourceRule,
      sitewide: Boolean(impl.sitewide),
      implementationSource: 'explicit-map',
    };
  });
}

function buildAiRules() {
  return Object.entries(AI_PROMPT_IMPLEMENTATIONS).map(([id, impl]) => {
    const base = path.basename(impl.promptPath || '');
    if (impl.scope === 'generic' && !base.includes('-generic-')) {
      throw new Error(`${id}: generic AI scope requires -generic- in prompt filename`);
    }
    if (impl.scope === 'ks' && !base.includes('-ks-')) {
      throw new Error(`${id}: ks AI scope requires -ks- in prompt filename`);
    }
    return {
      id,
      lane: 'ai',
      status: 'implemented',
      scope: impl.scope,
      promptPath: impl.promptPath,
      sourceRule: impl.sourceRule,
      wcagCriteria: impl.wcagCriteria || [],
      traceabilityRole: impl.traceabilityRole || null,
    };
  });
}

async function main() {
  const args = parseArgs(process.argv);
  const detDoc = await fs.readFile(DET_DOC, 'utf8').catch(() => '');
  const aiDoc = await fs.readFile(AI_DOC, 'utf8').catch(() => '');
  const detRules = buildDeterministicRules();
  const aiRules = buildAiRules();
  const fingerprint = sha256(JSON.stringify({ detRules, aiRules }));

  const registry = {
    schemaVersion: BLENDER_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    fingerprint,
    sources: {
      deterministicRulesDoc: { path: 'docs/design/a11y-audit/deterministic-a11y-rules.md', sha256: sha256(detDoc) },
      aiRulesDoc: { path: 'docs/design/a11y-audit/ai-enabled-a11y-principles.md', sha256: sha256(aiDoc) },
      mappingFile: { path: 'tools/website-a11y-auditor/design-rules/blender/rule-mappings.js' },
    },
    deterministicCoverage: {
      documentedRuleCount: detRules.length,
      implementedCount: detRules.length,
      implementedRuleIds: detRules.map((r) => r.id),
    },
    requiredAiFindingMetadata: [
      'principleId',
      'deterministicCoverage',
      'candidateDeterministicRule',
      'screenshotOrDomEvidence',
      'confidence',
    ],
    deterministicRules: detRules,
    aiRules,
  };

  const axeTagsByPresetKey = Object.fromEntries(
    Object.entries(A11Y_STANDARD_PRESETS).map(([key, preset]) => [key, preset.axeTags]),
  );
  const complianceCrosswalk = buildComplianceProfilesCrosswalk(axeTagsByPresetKey);
  const { matrix, gapsMd } = buildTraceabilityFromRegistry(registry);

  if (args.write) {
    await fs.mkdir(path.dirname(args.out), { recursive: true });
    await fs.writeFile(args.out, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
    await fs.writeFile(
      COMPLIANCE_PROFILES_OUT,
      `${JSON.stringify(complianceCrosswalk, null, 2)}\n`,
      'utf8',
    );
    await fs.writeFile(TRACEABILITY_OUT, `${JSON.stringify(matrix, null, 2)}\n`, 'utf8');
    await fs.writeFile(TRACEABILITY_GAPS_MD, gapsMd, 'utf8');
    const packs = await writeStandardsPacks(matrix);
    console.log(`wrote ${args.out} (${detRules.length} DET, ${aiRules.length} AI)`);
    console.log(`wrote ${COMPLIANCE_PROFILES_OUT} (${complianceCrosswalk.profiles.length} profiles)`);
    console.log(`wrote ${TRACEABILITY_OUT}`);
    console.log(`wrote ${TRACEABILITY_GAPS_MD}`);
    console.log(`wrote ${Object.keys(packs).length} standards packs under design-rules/standards-packs/`);
    const { spawnSync } = await import('node:child_process');
    const exportRc = spawnSync(process.execPath, ['scripts/export-axe-catalog.mjs'], {
      cwd: TOOL_ROOT,
      stdio: 'inherit',
    });
    if (exportRc.status !== 0) process.exit(exportRc.status ?? 1);
  } else {
    console.log(JSON.stringify(registry, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
