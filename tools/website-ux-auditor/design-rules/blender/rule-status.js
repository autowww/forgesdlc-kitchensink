import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { DETERMINISTIC_IMPLEMENTATIONS } from './rule-mappings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '../..');

/** True no-op stub emitted by blender before real implementation exists. */
export function isStubImplementationSource(source) {
  const text = String(source || '');
  if (/Auto-generated stub for/i.test(text)) return true;
  if (/Replace with measurable checks when implemented/i.test(text)) return true;
  if (/export function run\s*\(\s*\)\s*\{\s*return\s*\[\]\s*;\s*\}/.test(text)) {
    if (!/(collect|page\.evaluate|metrics\.|import |await )/.test(text)) return true;
  }
  return false;
}

export function explicitImplementationMeta(ruleId) {
  return DETERMINISTIC_IMPLEMENTATIONS[ruleId] || null;
}

/**
 * Resolve registry status for one DET rule from explicit map + generated file heuristics.
 * @param {string} ruleId
 * @param {string} rulesVersion
 * @param {boolean} overrideVersion
 */
export async function resolveDeterministicRuleStatus(ruleId, rulesVersion, overrideVersion = false) {
  const explicit = explicitImplementationMeta(ruleId);
  if (explicit) {
    return {
      id: ruleId,
      lane: 'deterministic',
      status: 'implemented',
      phase: explicit.phase || 'metrics',
      area: explicit.area || null,
      scoreDimension: explicit.scoreDimension || null,
      defaultSeverity: explicit.defaultSeverity || 'minor',
      priorityWeight: Number(explicit.priorityWeight || 0),
      scope: explicit.scope || 'generic',
      modulePath: explicit.modulePath,
      sourceRule: explicit.sourceRule || null,
      implementationSource: 'explicit-map',
    };
  }

  const rel = `design-rules/deterministic/generated/${ruleId
    .toLowerCase()
    .replaceAll('.', '-')
    .replaceAll('_', '-')}.check.js`;
  const abs = path.resolve(TOOL_ROOT, rel);
  let modulePath = rel;
  let implementationSource = 'generated-stub';

  try {
    const raw = await fs.readFile(abs, 'utf8');
    const embedded = raw.match(/\/\/\s*rules-version:\s*([a-f0-9]+)/i);
    const fileVersion = embedded ? String(embedded[1]).trim() : '';
    if (!overrideVersion && fileVersion && rulesVersion && fileVersion === fileVersion && isStubImplementationSource(raw)) {
      return {
        id: ruleId,
        lane: 'deterministic',
        status: 'stub',
        phase: 'metrics',
        area: null,
        scoreDimension: null,
        defaultSeverity: 'minor',
        priorityWeight: 0,
        modulePath: rel,
        sourceRule: `docs/design/ux-audit/deterministic-design-rules.md#${ruleId.toLowerCase().replaceAll('.', '-')}`,
        implementationSource: 'generated-stub-locked',
      };
    }
    if (!isStubImplementationSource(raw)) {
      return {
        id: ruleId,
        lane: 'deterministic',
        status: 'implemented',
        phase: 'metrics',
        area: null,
        scoreDimension: null,
        defaultSeverity: 'minor',
        priorityWeight: 0,
        modulePath: rel,
        sourceRule: `docs/design/ux-audit/deterministic-design-rules.md#${ruleId.toLowerCase().replaceAll('.', '-')}`,
        implementationSource: 'generated-real',
      };
    }
  } catch {
    implementationSource = 'generated-missing';
  }

  return {
    id: ruleId,
    lane: 'deterministic',
    status: 'stub',
    phase: 'metrics',
    area: null,
    scoreDimension: null,
    defaultSeverity: 'minor',
    priorityWeight: 0,
    modulePath,
    sourceRule: `docs/design/ux-audit/deterministic-design-rules.md#${ruleId.toLowerCase().replaceAll('.', '-')}`,
    implementationSource,
  };
}

export async function importRuleModule(modulePath) {
  if (!modulePath) return { ok: false, error: 'missing modulePath' };
  const abs = path.resolve(TOOL_ROOT, modulePath);
  try {
    const loaded = await import(pathToFileURL(abs).href);
    if (!loaded || typeof loaded.run !== 'function') {
      return { ok: false, error: 'missing run()' };
    }
    return { ok: true, module: loaded };
  } catch (error) {
    return { ok: false, error: String(error?.message || error) };
  }
}

export async function buildDeterministicRuleRegistryEntries(detIds, rulesVersion, overrideVersion) {
  const out = [];
  for (const id of detIds) {
    out.push(await resolveDeterministicRuleStatus(id, rulesVersion, overrideVersion));
  }
  return out;
}

export async function summarizeExecutableCoverage(detIds, rulesVersion, overrideVersion) {
  const entries = await buildDeterministicRuleRegistryEntries(detIds, rulesVersion, overrideVersion);
  const implemented = entries.filter((e) => e.status === 'implemented');
  const stubs = entries.filter((e) => e.status === 'stub');
  const importResults = [];
  for (const rule of implemented) {
    importResults.push({
      id: rule.id,
      ...(await importRuleModule(rule.modulePath)),
    });
  }
  const importOk = importResults.filter((r) => r.ok).length;
  const importFail = importResults.filter((r) => !r.ok);
  return {
    totalDocumented: detIds.length,
    implementedRegistryCount: implemented.length,
    stubRegistryCount: stubs.length,
    importOk,
    importFail: importFail.map((r) => ({ id: r.id, error: r.error })),
    implementedRuleIds: implemented.map((r) => r.id),
    stubRuleIds: stubs.map((r) => r.id),
  };
}
