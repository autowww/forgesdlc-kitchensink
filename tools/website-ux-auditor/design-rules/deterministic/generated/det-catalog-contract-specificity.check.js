/**
 * DET.CATALOG.CONTRACT_SPECIFICITY — design contracts must be element-specific:
 * Anatomy, Forbidden patterns, Deterministic checks (verification), and non-generic Expected look.
 */

import fs from 'node:fs';
import path from 'node:path';

import {
  analyzeContractSpecificity,
  analyzeDuplicateExpectedLookBodies,
  extractExpectedLookBody,
} from '../../../../design-catalog/lib/contract-specificity.mjs';
import { loadGeneratedRegistry } from '../../../lib/visual-catalog.js';

/** Cap findings per audit pass (repo-wide contract scan). */
export const MAX_CONTRACT_SPECIFICITY_FINDINGS = 12;

const SKIP_CONTRACT_RE = /contract-template\.md$|\/ONTOLOGY\.md$|\/README\.md$|\/screenshots\//;

export const rule = {
  id: 'DET.CATALOG.CONTRACT_SPECIFICITY',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-catalog-contract-specificity',
};

/**
 * Required governance sections (KS contract template).
 * "Verification" in the rule doc maps to ## Deterministic checks.
 * @param {string} text
 * @param {string} relPath
 * @returns {string[]}
 */
export function analyzeRequiredContractSections(text, relPath) {
  const rel = String(relPath || '').replace(/\\/g, '/');
  /** @type {string[]} */
  const errors = [];
  if (!rel.endsWith('.md') || SKIP_CONTRACT_RE.test(rel)) return errors;

  if (!/^## Expected look\s*$/m.test(text)) {
    errors.push(`${rel}: missing ## Expected look — describe hash-specific rhythm, density, and visual role.`);
  }
  if (!/^## Anatomy\s*$/m.test(text)) {
    errors.push(`${rel}: missing ## Anatomy — document element-specific structure from root through major regions.`);
  }
  if (!/^## Forbidden patterns\s*$/m.test(text)) {
    errors.push(`${rel}: missing ## Forbidden patterns — list anti-patterns specific to this hash (not generic UX platitudes).`);
  }
  if (!/^## Deterministic checks\s*$/m.test(text)) {
    errors.push(
      `${rel}: missing ## Deterministic checks — document repeatable verification gates (markers, selectors, inventories).`,
    );
  }

  return errors;
}

/**
 * @param {{
 *   skipped?: boolean,
 *   reason?: string,
 *   issues?: Array<{
 *     severity: 'warn' | 'minor',
 *     hash?: string,
 *     contract: string,
 *     message: string,
 *   }>,
 * }} report
 */
export function findingsFromContractSpecificityReport(report) {
  if (!report || report.skipped) return [];
  const issues = Array.isArray(report.issues) ? report.issues : [];
  if (!issues.length) return [];

  const findings = [];
  const seen = new Set();

  for (const issue of issues.slice(0, MAX_CONTRACT_SPECIFICITY_FINDINGS)) {
    const contract = String(issue.contract || '').replace(/\\/g, '/');
    const key = `${issue.severity}:${contract}:${issue.message}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const hash = issue.hash ? String(issue.hash) : '';
    findings.push({
      severity: issue.severity === 'minor' ? 'minor' : 'warn',
      area: 'visual-catalog',
      message: issue.message,
      evidence: hash ? `hash=${hash} contract=${contract}` : `contract=${contract}`,
      remediation:
        'Deepen the design contract: element-specific Expected look and Anatomy, hash-specific Forbidden patterns, and Deterministic checks tied to scripts or DOM gates. Run `node tools/design-catalog/check-visual-catalog.mjs` for the full catalog report.',
    });
  }

  if (issues.length > MAX_CONTRACT_SPECIFICITY_FINDINGS) {
    findings.push({
      severity: 'minor',
      area: 'visual-catalog',
      message: `Additional contract specificity issues omitted (${issues.length - MAX_CONTRACT_SPECIFICITY_FINDINGS} more).`,
      evidence: `contract_specificity_total=${issues.length}`,
      remediation: 'Run `node tools/design-catalog/check-visual-catalog.mjs --repo .` locally to list every contract failure.',
    });
  }

  return findings;
}

/**
 * Repo scan of registry-linked contracts (mirrors check-visual-catalog specificity pass).
 * @param {string} repoRoot
 * @param {{ strictGovernanceHeadings?: boolean }} [opts]
 */
export function scanCatalogContractSpecificity(repoRoot, opts = {}) {
  const reg = loadGeneratedRegistry(repoRoot);
  if (!reg?.entries?.length) {
    return { skipped: true, reason: 'no-registry', issues: [] };
  }

  /** @type {Map<string, { rel: string, types: Set<string>, hashes: Set<string> }>} */
  const byContract = new Map();

  for (const e of reg.entries) {
    const cs = String(e.contract_status || '');
    if (cs !== 'own' && cs !== 'family-covered') continue;
    const rel = e.contract ? String(e.contract).replace(/\\/g, '/') : '';
    if (!rel || rel.endsWith('contract-template.md')) continue;
    if (!byContract.has(rel)) {
      byContract.set(rel, { rel, types: new Set(), hashes: new Set() });
    }
    const row = byContract.get(rel);
    if (e.type) row.types.add(String(e.type));
    if (e.hash) row.hashes.add(String(e.hash));
  }

  /** @type {Array<{ severity: 'warn' | 'minor', hash?: string, contract: string, message: string }>} */
  const issues = [];

  /** @type {{ relPath: string, registryTypes: string[], body: string }[]} */
  const expectedLookSamples = [];

  for (const { rel, types, hashes } of byContract.values()) {
    const abs = path.join(repoRoot, rel);
    if (!fs.existsSync(abs)) continue;
    const txt = fs.readFileSync(abs, 'utf8');
    const registryType = [...types][0] || '';
    const hash = [...hashes].sort().join(',') || undefined;

    for (const m of analyzeRequiredContractSections(txt, rel)) {
      issues.push({ severity: 'warn', hash, contract: rel, message: m });
    }

    const { errors: specErr, warnings: specWarn } = analyzeContractSpecificity(txt, rel, registryType, {
      strictGovernanceHeadings: !!opts.strictGovernanceHeadings,
    });
    for (const m of specErr) {
      issues.push({ severity: 'warn', hash, contract: rel, message: m });
    }
    for (const m of specWarn) {
      issues.push({ severity: 'minor', hash, contract: rel, message: m });
    }

    expectedLookSamples.push({
      relPath: rel,
      registryTypes: [...types],
      body: extractExpectedLookBody(txt),
    });
  }

  for (const m of analyzeDuplicateExpectedLookBodies(expectedLookSamples)) {
    const rel = m.split(':')[0];
    const row = byContract.get(rel);
    const hash = row ? [...row.hashes].sort().join(',') : undefined;
    issues.push({ severity: 'warn', hash, contract: rel, message: m });
  }

  issues.sort((a, b) => a.contract.localeCompare(b.contract) || a.message.localeCompare(b.message));

  return {
    skipped: false,
    contractCount: byContract.size,
    issues,
  };
}

export async function run({ metrics, repoRoot, ctx }) {
  const root = String(repoRoot || ctx?.repoRoot || metrics?.repoRoot || '').trim();
  if (!root) return [];

  const report = metrics?.contractSpecificityReport
    ?? scanCatalogContractSpecificity(root, {
      strictGovernanceHeadings: ctx?.strictContractGovernance === true,
    });

  return findingsFromContractSpecificityReport(report);
}
