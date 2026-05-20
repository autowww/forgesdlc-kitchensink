#!/usr/bin/env node
/**
 * Scan deterministic check modules, promote non-stub files into
 * DETERMINISTIC_IMPLEMENTATIONS, then regenerate registry.generated.json.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  explicitImplementationMeta,
  isStubImplementationSource,
  resolveDeterministicRuleStatus,
} from './rule-status.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '../..');
const MAPPINGS_PATH = path.resolve(__dirname, 'rule-mappings.js');
const REGISTRY_PATH = path.resolve(TOOL_ROOT, 'design-rules/registry.generated.json');
const GENERATED_DIR = path.resolve(TOOL_ROOT, 'design-rules/deterministic/generated');
const PAGE_DIR = path.resolve(TOOL_ROOT, 'design-rules/deterministic/page');

function kebabFromRuleId(ruleId) {
  return String(ruleId || '')
    .toLowerCase()
    .replaceAll('.', '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function detGeneratedRel(ruleId) {
  return `design-rules/deterministic/generated/${kebabFromRuleId(ruleId)}.check.js`;
}

function parseRuleExport(source) {
  const idMatch = source.match(/\bid:\s*['"]([^'"]+)['"]/);
  const areaMatch = source.match(/\barea:\s*['"]([^'"]+)['"]/);
  const scoreMatch = source.match(/\bscoreDimension:\s*['"]([^'"]+)['"]/);
  const sevMatch = source.match(/\bdefaultSeverity:\s*['"]([^'"]+)['"]/);
  const weightMatch = source.match(/\bpriorityWeight:\s*(\d+)/);
  const sourceMatch = source.match(/\bsource:\s*['"]([^'"]+)['"]/);
  if (!idMatch) return null;
  return {
    id: idMatch[1],
    area: areaMatch?.[1] || 'site-inspection',
    scoreDimension: scoreMatch?.[1] || null,
    defaultSeverity: sevMatch?.[1] || 'minor',
    priorityWeight: Number(weightMatch?.[1] || 0),
    sourceRule: sourceMatch?.[1] || `docs/design/ux-audit/deterministic-design-rules.md#${kebabFromRuleId(idMatch[1])}`,
  };
}

async function listCheckFiles() {
  const out = [];
  for (const dir of [GENERATED_DIR, PAGE_DIR]) {
    let names = [];
    try {
      names = await fs.readdir(dir);
    } catch {
      continue;
    }
    for (const name of names) {
      if (!name.endsWith('.check.js')) continue;
      const abs = path.join(dir, name);
      const rel = path.relative(TOOL_ROOT, abs).split(path.sep).join('/');
      const source = await fs.readFile(abs, 'utf8');
      out.push({ abs, rel, source, stub: isStubImplementationSource(source) });
    }
  }
  return out;
}

function formatMappingEntry(ruleId, meta, modulePath) {
  const lines = [
    `  '${ruleId}': {`,
    `    modulePath: '${modulePath}',`,
    `    status: 'implemented',`,
    `    defaultSeverity: '${meta.defaultSeverity}',`,
    `    area: '${meta.area}',`,
    meta.scoreDimension
      ? `    scoreDimension: '${meta.scoreDimension}',`
      : `    scoreDimension: null,`,
    `    priorityWeight: ${meta.priorityWeight},`,
    `    sourceRule: '${meta.sourceRule}',`,
    `  },`,
  ];
  return lines.join('\n');
}

async function insertMappingEntries(entries) {
  if (!entries.length) return false;
  let raw = await fs.readFile(MAPPINGS_PATH, 'utf8');
  const close = '\n};\n\nexport const AI_PROMPT_IMPLEMENTATIONS';
  const idx = raw.indexOf(close);
  if (idx < 0) throw new Error('Could not locate DETERMINISTIC_IMPLEMENTATIONS closing brace in rule-mappings.js');
  const block = entries.map(({ ruleId, meta, modulePath }) => formatMappingEntry(ruleId, meta, modulePath)).join('\n');
  raw = `${raw.slice(0, idx)}\n${block}${raw.slice(idx)}`;
  await fs.writeFile(MAPPINGS_PATH, raw, 'utf8');
  return true;
}

function parseArgs(argv) {
  const args = { dryRun: false, write: true };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--dry-run') args.dryRun = true;
    else if (argv[i] === '--help' || argv[i] === '-h') {
      console.log('usage: node sync-deterministic-implementations.mjs [--dry-run]');
      process.exit(0);
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const registryBefore = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
  const detIds = (registryBefore.deterministicRules || []).map((r) => r.id);
  const rulesVersion = registryBefore.versioning?.deterministicRulesVersion || '';

  const files = await listCheckFiles();
  const realFiles = files.filter((f) => !f.stub);
  const stubFiles = files.filter((f) => f.stub);

  const toAdd = [];
  const alreadyMapped = [];
  const realButUnregistered = [];

  for (const file of realFiles) {
    const meta = parseRuleExport(file.source);
    if (!meta?.id) continue;
    const existing = explicitImplementationMeta(meta.id);
    if (existing) {
      alreadyMapped.push(meta.id);
      continue;
    }
    realButUnregistered.push(meta.id);
    toAdd.push({
      ruleId: meta.id,
      meta,
      modulePath: file.rel,
    });
  }

  const registryMismatches = [];
  for (const id of detIds) {
    const reg = registryBefore.deterministicRules.find((r) => r.id === id);
    const resolved = await resolveDeterministicRuleStatus(id, rulesVersion, false);
    if (reg?.status !== resolved.status) {
      registryMismatches.push({ id, was: reg.status, now: resolved.status, source: resolved.implementationSource });
    }
  }

  const report = {
    scannedFiles: files.length,
    realOnDisk: realFiles.length,
    stubOnDisk: stubFiles.length,
    mappedImplemented: alreadyMapped.length,
    promotedToMappings: toAdd.map((t) => t.ruleId),
    realButUnregistered,
    registryMismatches,
    registryBefore: {
      implemented: (registryBefore.deterministicRules || []).filter((r) => r.status === 'implemented').length,
      stub: (registryBefore.deterministicRules || []).filter((r) => r.status === 'stub').length,
    },
  };

  if (args.dryRun) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }

  if (toAdd.length) {
    await insertMappingEntries(toAdd);
  }

  const blend = spawnSync('node', [path.resolve(__dirname, 'design-rules-blender.mjs')], {
    cwd: TOOL_ROOT,
    encoding: 'utf8',
  });
  if (blend.status !== 0) {
    console.error(blend.stderr || blend.stdout);
    process.exit(blend.status || 1);
  }

  const registryAfter = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
  report.registryAfter = {
    implemented: (registryAfter.deterministicRules || []).filter((r) => r.status === 'implemented').length,
    stub: (registryAfter.deterministicRules || []).filter((r) => r.status === 'stub').length,
    fingerprint: registryAfter.fingerprint,
    implementedRuleIds: registryAfter.deterministicCoverage?.implementedRuleIds || [],
  };

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
