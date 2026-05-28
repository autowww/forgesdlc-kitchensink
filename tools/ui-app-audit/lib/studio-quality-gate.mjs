import fs from 'node:fs/promises';
import path from 'node:path';

import yaml from 'js-yaml';

import {
  countBySeverity,
  evaluateQualityGate,
  LEGACY_MAJOR_ONLY_QUALITY_GATE_THRESHOLDS,
  loadQualityGateThresholdsFromEnv,
  normalizeThresholds,
} from '../../website-ux-auditor/lib/quality-gate.js';

/** @returns {'a11y' | 'ux' | 'all'} */
export function resolveStudioGateMode(env = process.env) {
  const raw = String(env.FORGE_STUDIO_GATE_MODE || 'a11y')
    .trim()
    .toLowerCase();
  if (raw === 'ux' || raw === 'all') return raw;
  return 'a11y';
}

/** Findings that count toward the Studio sealed-smoke gate (actionable product a11y). */
export function isGateableStudioFinding(f) {
  const checkId = String(f?.checkId || '');
  const ruleId = String(f?.ruleId || '');
  if (checkId === 'app-shell-inner') return true;
  if (checkId === 'axe-lane' || ruleId.startsWith('AXE.')) return true;
  if (ruleId.startsWith('DET.A11Y.')) return true;
  if (checkId === 'scenario-assert' || checkId === 'scenario-load') return true;
  return false;
}

/** UX DET findings (handbook layout rules; excludes DET.A11Y.* and app-shell-inner). */
export function isGateableUxFinding(f) {
  const ruleId = String(f?.ruleId || '');
  if (!ruleId.startsWith('DET.')) return false;
  if (ruleId.startsWith('DET.A11Y.')) return false;
  if (f?.checkId === 'design-rule-runtime' || f?.lane === 'deterministic') return true;
  return ruleId.startsWith('DET.');
}

/**
 * @param {object[]} findings
 * @param {Set<string>} [waivedRuleIds]
 */
export function filterFindingsForStudioUxGate(findings, waivedRuleIds = new Set()) {
  return (findings || []).filter((f) => {
    if (!isGateableUxFinding(f)) return false;
    const rid = String(f.ruleId || f.checkId || '');
    if (waivedRuleIds.has(rid)) return false;
    return true;
  });
}

/**
 * @param {object[]} findings
 * @param {Set<string>} [waivedRuleIds]
 */
export function filterFindingsForStudioGate(findings, waivedRuleIds = new Set()) {
  return (findings || []).filter((f) => {
    if (!isGateableStudioFinding(f)) return false;
    const rid = String(f.ruleId || f.checkId || '');
    if (waivedRuleIds.has(rid)) return false;
    return true;
  });
}

/**
 * @param {string} [waiversPath]
 */
export async function loadStudioWaivers(waiversPath) {
  if (!waiversPath) return { waivedRuleIds: new Set(), entries: [] };
  try {
    const raw = await fs.readFile(path.resolve(waiversPath), 'utf8');
    const doc = yaml.load(raw);
    const list = Array.isArray(doc?.waivers) ? doc.waivers : [];
    const waivedRuleIds = new Set(
      list.map((w) => String(w.ruleId || w.checkId || '').trim()).filter(Boolean),
    );
    return { waivedRuleIds, entries: list };
  } catch {
    return { waivedRuleIds: new Set(), entries: [] };
  }
}

/**
 * @param {object[]} findings
 * @param {{ env?: Record<string, string>, waiversPath?: string }} [opts]
 */
export async function evaluateStudioQualityGate(findings, opts = {}) {
  const env = opts.env || process.env;
  const { waivedRuleIds, entries } = await loadStudioWaivers(opts.waiversPath);
  const gateFindings = filterFindingsForStudioGate(findings, waivedRuleIds);
  const counts = countBySeverity(gateFindings);

  let thresholds;
  if (String(env.FORGE_STUDIO_QUALITY_GATE_LEGACY_MAJOR_ONLY || '') === '1') {
    thresholds = { ...LEGACY_MAJOR_ONLY_QUALITY_GATE_THRESHOLDS };
  } else if (String(env.FORGE_STUDIO_QUALITY_GATE || env.FORGE_STUDIO_QUALITY_GATE_JSON || '').trim()) {
    const uxEnv = {
      FORGE_UX_QUALITY_GATE: env.FORGE_STUDIO_QUALITY_GATE,
      FORGE_UX_QUALITY_GATE_JSON: env.FORGE_STUDIO_QUALITY_GATE_JSON,
      FORGE_UX_QUALITY_GATE_LEGACY_MAJOR_ONLY: env.FORGE_STUDIO_QUALITY_GATE_LEGACY_MAJOR_ONLY,
    };
    thresholds = loadQualityGateThresholdsFromEnv(uxEnv);
  } else {
    // Actionable gate: Blocker/Critical/Major on gateable findings only; supplemental warn/minor uncapped.
    thresholds = { ...LEGACY_MAJOR_ONLY_QUALITY_GATE_THRESHOLDS };
  }

  const evaluation = evaluateQualityGate(counts, thresholds);
  return {
    pass: evaluation.pass,
    mode: 'a11y',
    counts,
    thresholds,
    gateFindingCount: gateFindings.length,
    totalFindingCount: (findings || []).length,
    waivedRuleIds: [...waivedRuleIds],
    waivers: entries,
    violations: evaluation.violations,
  };
}

/**
 * @param {object[]} findings
 * @param {{ env?: Record<string, string>, waiversPath?: string }} [opts]
 */
export async function evaluateStudioUxQualityGate(findings, opts = {}) {
  const env = opts.env || process.env;
  const { waivedRuleIds, entries } = await loadStudioWaivers(opts.waiversPath);
  const gateFindings = filterFindingsForStudioUxGate(findings, waivedRuleIds);
  const counts = countBySeverity(gateFindings);

  let thresholds;
  if (String(env.FORGE_STUDIO_UX_QUALITY_GATE_LEGACY_MAJOR_ONLY || '') === '1') {
    thresholds = { ...LEGACY_MAJOR_ONLY_QUALITY_GATE_THRESHOLDS };
  } else if (
    String(env.FORGE_STUDIO_UX_QUALITY_GATE || env.FORGE_STUDIO_UX_QUALITY_GATE_JSON || '').trim()
  ) {
    const uxEnv = {
      FORGE_UX_QUALITY_GATE: env.FORGE_STUDIO_UX_QUALITY_GATE,
      FORGE_UX_QUALITY_GATE_JSON: env.FORGE_STUDIO_UX_QUALITY_GATE_JSON,
      FORGE_UX_QUALITY_GATE_LEGACY_MAJOR_ONLY: env.FORGE_STUDIO_UX_QUALITY_GATE_LEGACY_MAJOR_ONLY,
    };
    thresholds = loadQualityGateThresholdsFromEnv(uxEnv);
  } else {
    thresholds = { ...LEGACY_MAJOR_ONLY_QUALITY_GATE_THRESHOLDS };
  }

  const evaluation = evaluateQualityGate(counts, thresholds);
  return {
    pass: evaluation.pass,
    mode: 'ux',
    counts,
    thresholds,
    gateFindingCount: gateFindings.length,
    totalFindingCount: (findings || []).length,
    waivedRuleIds: [...waivedRuleIds],
    waivers: entries,
    violations: evaluation.violations,
  };
}

/**
 * Evaluate a11y + UX gates; `pass` follows FORGE_STUDIO_GATE_MODE.
 * @param {object[]} findings
 * @param {{ env?: Record<string, string>, waiversPath?: string }} [opts]
 */
export async function evaluateStudioQualityGates(findings, opts = {}) {
  const env = opts.env || process.env;
  const mode = resolveStudioGateMode(env);
  const qualityGate = await evaluateStudioQualityGate(findings, opts);
  const uxQualityGate = await evaluateStudioUxQualityGate(findings, opts);

  let pass = qualityGate.pass;
  if (mode === 'ux') pass = uxQualityGate.pass;
  else if (mode === 'all') pass = qualityGate.pass && uxQualityGate.pass;

  return { mode, pass, qualityGate, uxQualityGate };
}
