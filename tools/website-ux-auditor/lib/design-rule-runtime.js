import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { fingerprintPageContent, ruleModuleFingerprintForMeta } from './audit-backlog-trace.js';
import { clampInt, mapLimit } from './map-limit.js';
import { makeFinding, SCORE_WEIGHTS } from './severity.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.resolve(TOOL_ROOT, 'design-rules/registry.generated.json');

export const DEFAULT_DETERMINISTIC_CONCURRENCY = 5;
export const MAX_DETERMINISTIC_CONCURRENCY = 5;

function scoreImpactWeight(severity, priorityWeight) {
  const base = SCORE_WEIGHTS[String(severity || '').toLowerCase()];
  const sevWeight = Number.isFinite(base) ? base : SCORE_WEIGHTS.minor;
  return sevWeight + Number(priorityWeight || 0);
}

function normalizeRuleFinding(raw, fallback) {
  const finding = makeFinding({
    checkId: fallback.checkId,
    severity: raw?.severity || fallback.defaultSeverity || 'minor',
    area: raw?.area || fallback.area || 'site-inspection',
    message: raw?.message || 'Rule reported a deterministic issue.',
    evidence: raw?.evidence || '',
    remediation: raw?.remediation || '',
  });
  finding.ruleId = fallback.ruleId || null;
  finding.scoreDimension = fallback.scoreDimension || null;
  finding.priorityWeight = Number(fallback.priorityWeight || 0);
  finding.sourceRule = fallback.sourceRule || null;
  finding.scoreImpactWeight = scoreImpactWeight(finding.severity, finding.priorityWeight);
  return finding;
}

function buildLegacyAdapterMap(registry) {
  const map = new Map();
  for (const adapter of registry?.legacyAdapters || []) map.set(adapter.checkId, adapter);
  return map;
}

export async function loadDesignRuleRegistry() {
  try {
    const raw = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
    return {
      ...raw,
      path: REGISTRY_PATH,
    };
  } catch {
    return {
      schemaVersion: 0,
      fingerprint: null,
      deterministicRules: [],
      aiRules: [],
      legacyAdapters: [],
      path: REGISTRY_PATH,
    };
  }
}

export function listImplementedDeterministicRules(registry) {
  return (registry?.deterministicRules || []).filter((r) => r.status === 'implemented' && r.modulePath);
}

/**
 * @param {{
 *   deterministicConcurrency?: number,
 *   traceStore?: import('./audit-backlog-trace.js').RulePageTraceStore | null,
 *   priorityRuleIds?: string[],
 *   deprioritizedRuleIds?: string[],
 *   excludeDeterministicRuleIds?: string[],
 *   onlyDeterministicRuleIds?: string[] | null,
 *   onDeterministicRuleProgress?: (payload: { url: string, done: number, total: number, ruleId?: string }) => void,
 * }} [opts]
 */
export async function createDesignRuleRuntime(opts = {}) {
  const registry = await loadDesignRuleRegistry();
  const legacyAdapterMap = buildLegacyAdapterMap(registry);
  const moduleCache = new Map();
  const onlySet = opts.onlyDeterministicRuleIds?.length
    ? new Set(opts.onlyDeterministicRuleIds)
    : null;
  const excludeSet = opts.excludeDeterministicRuleIds?.length
    ? new Set(opts.excludeDeterministicRuleIds)
    : null;
  const implementedRules = listImplementedDeterministicRules(registry).filter(
    (r) => (!onlySet || onlySet.has(r.id)) && (!excludeSet || !excludeSet.has(r.id)),
  );
  const deterministicConcurrency = clampInt(
    opts.deterministicConcurrency,
    1,
    MAX_DETERMINISTIC_CONCURRENCY,
    DEFAULT_DETERMINISTIC_CONCURRENCY,
  );
  const traceStore = opts.traceStore || null;
  const priorityRuleIds = opts.priorityRuleIds || [];
  const deprioritizedRuleIds = new Set(opts.deprioritizedRuleIds || []);
  const onDeterministicRuleProgress = opts.onDeterministicRuleProgress || null;

  async function importRuleModule(modulePath) {
    if (!modulePath) return null;
    if (moduleCache.has(modulePath)) return moduleCache.get(modulePath);
    const abs = path.resolve(TOOL_ROOT, modulePath);
    try {
      const loaded = await import(pathToFileURL(abs).href);
      moduleCache.set(modulePath, loaded);
      return loaded;
    } catch (error) {
      moduleCache.set(modulePath, { __importError: String(error?.message || error) });
      return moduleCache.get(modulePath);
    }
  }

  async function evaluateRuleAtIndex(index, ruleMeta, ctx) {
    const { metrics, url, page, repoRoot, ctx: runCtx } = ctx;
    const pageFp = fingerprintPageContent(metrics);
    const base = {
      ruleId: ruleMeta.id,
      registryStatus: ruleMeta.status,
      implementationSource: ruleMeta.implementationSource || null,
      modulePath: ruleMeta.modulePath || null,
      findingsCount: 0,
    };

    if (ruleMeta.status !== 'implemented' || !ruleMeta.modulePath) {
      return {
        index,
        trace: {
          ...base,
          status: ruleMeta.status === 'stub' ? 'skipped_stub' : 'skipped_status',
        },
        findings: [],
      };
    }

    if (traceStore?.shouldSkipNoFindings(url, ruleMeta, pageFp)) {
      const skipped = {
        ...base,
        status: 'skipped_no_findings_cache',
        pageContentFingerprint: pageFp,
      };
      return { index, trace: skipped, findings: [] };
    }

    const loaded = await importRuleModule(ruleMeta.modulePath);
    if (!loaded || loaded.__importError) {
      const trace = {
        ...base,
        status: 'import_error',
        error: loaded?.__importError || 'import failed',
      };
      traceStore?.record({
        url,
        ruleMeta,
        pageContentFingerprint: pageFp,
        status: trace.status,
        findingsCount: 0,
        findings: [],
      });
      return { index, trace, findings: [] };
    }
    if (typeof loaded.run !== 'function') {
      const trace = { ...base, status: 'no_run' };
      traceStore?.record({
        url,
        ruleMeta,
        pageContentFingerprint: pageFp,
        status: trace.status,
        findingsCount: 0,
        findings: [],
      });
      return { index, trace, findings: [] };
    }

    try {
      const rawFindings = await loaded.run({ metrics, url, page, repoRoot, ctx: runCtx });
      if (!Array.isArray(rawFindings)) {
        const trace = { ...base, status: 'ran', findingsCount: 0, note: 'run() did not return an array' };
        traceStore?.record({
          url,
          ruleMeta,
          pageContentFingerprint: pageFp,
          status: trace.status,
          findingsCount: 0,
          findings: [],
        });
        return { index, trace, findings: [] };
      }
      const findings = rawFindings.map((rawFinding) =>
        normalizeRuleFinding(rawFinding, {
          checkId: 'design-rule-runtime',
          ruleId: ruleMeta.id,
          area: ruleMeta.area,
          defaultSeverity: ruleMeta.defaultSeverity,
          scoreDimension: ruleMeta.scoreDimension,
          priorityWeight: ruleMeta.priorityWeight,
          sourceRule: ruleMeta.sourceRule,
        }),
      );
      const trace = { ...base, status: 'ran', findingsCount: rawFindings.length };
      traceStore?.record({
        url,
        ruleMeta,
        pageContentFingerprint: pageFp,
        status: trace.status,
        findingsCount: rawFindings.length,
        findings,
      });
      return { index, trace, findings };
    } catch (error) {
      const trace = {
        ...base,
        status: 'threw',
        error: String(error?.message || error),
      };
      traceStore?.record({
        url,
        ruleMeta,
        pageContentFingerprint: pageFp,
        status: trace.status,
        findingsCount: 0,
        findings: [],
      });
      return { index, trace, findings: [] };
    }
  }

  async function runDeterministicRulesWithTrace({ metrics, url, page, repoRoot, ctx }) {
    const rules = implementedRules;
    const prioSet = new Set(priorityRuleIds);
    const indexed = rules.map((ruleMeta, index) => ({ ruleMeta, index }));
    indexed.sort((a, b) => {
      const ap = prioSet.has(a.ruleMeta.id) ? 0 : deprioritizedRuleIds.has(a.ruleMeta.id) ? 2 : 1;
      const bp = prioSet.has(b.ruleMeta.id) ? 0 : deprioritizedRuleIds.has(b.ruleMeta.id) ? 2 : 1;
      if (ap !== bp) return ap - bp;
      return a.index - b.index;
    });

    const runCtx = { metrics, url, page, repoRoot, ctx };
    const total = indexed.length;
    let done = 0;
    onDeterministicRuleProgress?.({ url, done: 0, total });
    const outcomes = await mapLimit(indexed, deterministicConcurrency, async ({ ruleMeta, index }) => {
      const outcome = await evaluateRuleAtIndex(index, ruleMeta, runCtx);
      done += 1;
      onDeterministicRuleProgress?.({ url, done, total, ruleId: ruleMeta.id });
      return outcome;
    });

    outcomes.sort((a, b) => a.index - b.index);
    const trace = outcomes.map((o) => o.trace);
    const findings = outcomes.flatMap((o) => o.findings);
    return { findings, trace, deterministicConcurrency };
  }

  async function runDeterministicRules(ctx) {
    const { findings } = await runDeterministicRulesWithTrace(ctx);
    return findings;
  }

  function enrichLegacyFindings(findings) {
    const input = Array.isArray(findings) ? findings : [];
    return input.map((finding) => {
      const out = { ...finding };
      const adapter = legacyAdapterMap.get(String(finding.checkId || ''));
      if (adapter) {
        out.ruleId = out.ruleId || adapter.defaultRuleId || null;
        out.scoreDimension = out.scoreDimension || adapter.scoreDimension || null;
        out.priorityWeight = Number(out.priorityWeight ?? adapter.priorityWeight ?? 0);
        out.sourceRule = out.sourceRule || adapter.sourceRule || null;
      } else {
        out.priorityWeight = Number(out.priorityWeight || 0);
      }
      out.scoreImpactWeight = scoreImpactWeight(out.severity, out.priorityWeight);
      return out;
    });
  }

  return {
    registry,
    registryFingerprint: registry.fingerprint || null,
    registryPath: registry.path,
    implementedRuleIds: implementedRules.map((r) => r.id),
    onlyDeterministicRuleIds: onlySet ? [...onlySet] : null,
    deterministicConcurrency,
    enrichLegacyFindings,
    runDeterministicRules,
    runDeterministicRulesWithTrace,
  };
}
