import { summarizeExecutableCoverage } from '../design-rules/blender/rule-status.js';
import { loadDesignRuleRegistry } from './design-rule-runtime.js';

/**
 * Ensure every registry-implemented DET rule imports and exposes run().
 * Stub rules are not required to pass.
 * @param {{ strict?: boolean }} [opts]
 */
export async function runDeterministicPreflight(opts = {}) {
  const registry = await loadDesignRuleRegistry();
  const detIds = (registry.deterministicRules || []).map((r) => r.id);
  const rulesVersion = registry.versioning?.deterministicRulesVersion || '';
  const summary = await summarizeExecutableCoverage(detIds, rulesVersion, false);

  const registryImplemented = (registry.deterministicRules || []).filter((r) => r.status === 'implemented');
  const importFail = summary.importFail || [];
  const ok = importFail.length === 0 && summary.importOk === summary.implementedRegistryCount;

  const result = {
    ok,
    registryFingerprint: registry.fingerprint || null,
    registryImplementedCount: registryImplemented.length,
    registryStubCount: (registry.deterministicRules || []).filter((r) => r.status === 'stub').length,
    resolvedImplementedCount: summary.implementedRegistryCount,
    importOk: summary.importOk,
    importFail,
    implementedRuleIds: summary.implementedRuleIds,
    stubRuleIds: summary.stubRuleIds,
    deterministicCoverage: registry.deterministicCoverage || null,
  };

  if (!ok && opts.strict) {
    const detail = importFail.map((f) => `${f.id}: ${f.error}`).join('; ');
    throw new Error(`Deterministic preflight failed (${importFail.length} import errors): ${detail}`);
  }

  return result;
}
