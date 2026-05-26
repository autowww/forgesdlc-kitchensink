import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs/promises';

import { clampInt, mapLimit } from '../../website-ux-auditor/lib/map-limit.js';
import { makeFinding, SCORE_WEIGHTS } from '../../website-ux-auditor/lib/severity.js';
import { ruleScopeEnabled } from './detect-ks-site.js';
import { ruleMatchesComplianceProfile } from './compliance-profiles.js';

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
    area: raw?.area || fallback.area || 'accessibility',
    message: raw?.message || 'Rule reported a deterministic issue.',
    evidence: raw?.evidence || '',
    remediation: raw?.remediation || '',
  });
  finding.ruleId = fallback.ruleId || null;
  finding.lane = 'deterministic';
  finding.scope = fallback.scope || null;
  finding.scoreImpactWeight = scoreImpactWeight(finding.severity, Number(fallback.priorityWeight || 0));
  finding.sourceRule = fallback.sourceRule || null;
  return finding;
}

export async function loadA11yRuleRegistry() {
  try {
    const raw = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
    return { ...raw, path: REGISTRY_PATH };
  } catch {
    return {
      schemaVersion: 0,
      fingerprint: null,
      deterministicRules: [],
      aiRules: [],
      path: REGISTRY_PATH,
    };
  }
}

export function listImplementedDeterministicRules(registry) {
  return (registry?.deterministicRules || []).filter((r) => r.status === 'implemented' && r.modulePath);
}

/**
 * @param {{
 *   rulesScopeResolved: { effectiveScope: string, ksDriven: boolean },
 *   deterministicConcurrency?: number,
 *   onlyDeterministicRuleIds?: string[] | null,
 *   detStandardsTags?: string[] | null,
 *   verbose?: boolean,
 * }} opts
 */
export async function createA11yRuleRuntime(opts) {
  const registry = await loadA11yRuleRegistry();
  const moduleCache = new Map();
  const onlySet = opts.onlyDeterministicRuleIds?.length
    ? new Set(opts.onlyDeterministicRuleIds)
    : null;
  const detStandardsTags = opts.detStandardsTags ?? null;

  const scopeAndOnlyFiltered = listImplementedDeterministicRules(registry).filter((r) => {
    if (onlySet && !onlySet.has(r.id)) return false;
    return ruleScopeEnabled(r.scope, opts.rulesScopeResolved);
  });

  const implementedRules = [];
  const excludedByProfile = [];
  for (const rule of scopeAndOnlyFiltered) {
    if (ruleMatchesComplianceProfile(rule, detStandardsTags)) {
      implementedRules.push(rule);
    } else {
      excludedByProfile.push(rule);
    }
  }

  if (opts.verbose && excludedByProfile.length) {
    console.error(
      `[a11y-audit] DET rules excluded by compliance profile (${excludedByProfile.length}): ` +
        `${excludedByProfile.map((r) => r.id).join(', ')}`,
    );
  }

  const deterministicConcurrency = clampInt(
    opts.deterministicConcurrency,
    1,
    MAX_DETERMINISTIC_CONCURRENCY,
    DEFAULT_DETERMINISTIC_CONCURRENCY,
  );

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

  async function evaluateRule(ruleMeta, ctx) {
    const base = {
      ruleId: ruleMeta.id,
      scope: ruleMeta.scope,
      status: ruleMeta.status,
      modulePath: ruleMeta.modulePath,
      findingsCount: 0,
    };

    if (ruleMeta.status !== 'implemented' || !ruleMeta.modulePath) {
      return { trace: { ...base, status: 'skipped_status' }, findings: [] };
    }

    const loaded = await importRuleModule(ruleMeta.modulePath);
    if (!loaded || loaded.__importError) {
      return {
        trace: { ...base, status: 'import_error', error: loaded?.__importError || 'import failed' },
        findings: [],
      };
    }
    if (typeof loaded.run !== 'function') {
      return { trace: { ...base, status: 'no_run' }, findings: [] };
    }

    try {
      const rawFindings = await loaded.run(ctx);
      const findings = (Array.isArray(rawFindings) ? rawFindings : []).map((raw) =>
        normalizeRuleFinding(raw, {
          checkId: 'a11y-rule-runtime',
          ruleId: ruleMeta.id,
          area: ruleMeta.area,
          scope: ruleMeta.scope,
          defaultSeverity: ruleMeta.defaultSeverity,
          priorityWeight: ruleMeta.priorityWeight,
          sourceRule: ruleMeta.sourceRule,
        }),
      );
      return { trace: { ...base, status: 'ran', findingsCount: findings.length }, findings };
    } catch (error) {
      return {
        trace: { ...base, status: 'threw', error: String(error?.message || error) },
        findings: [],
      };
    }
  }

  async function runDeterministicRules(ctx) {
    const total = implementedRules.length;
    let done = 0;
    const outcomes = await mapLimit(implementedRules, deterministicConcurrency, async (ruleMeta) => {
      const outcome = await evaluateRule(ruleMeta, ctx);
      done += 1;
      return outcome;
    });

    return {
      findings: outcomes.flatMap((o) => o.findings),
      trace: outcomes.map((o) => o.trace),
      rulesRun: total,
      deterministicConcurrency,
      implementedRuleIds: implementedRules.map((r) => r.id),
    };
  }

  function listAiRules() {
    return (registry.aiRules || []).filter((r) => {
      if (r.status !== 'implemented' && r.status !== 'documented') return false;
      return ruleScopeEnabled(r.scope, opts.rulesScopeResolved);
    });
  }

  return {
    registry,
    registryFingerprint: registry.fingerprint || null,
    runDeterministicRules,
    listAiRules,
    implementedRuleIds: implementedRules.map((r) => r.id),
    excludedDeterministicRuleIds: excludedByProfile.map((r) => r.id),
    allScopeRuleIds: scopeAndOnlyFiltered.map((r) => r.id),
  };
}
