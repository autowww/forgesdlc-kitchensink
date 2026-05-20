/**
 * DET.CONTRACT.PATH — active registry rows with contract_status own | family-covered
 * must reference an on-disk design contract Markdown file (catalog governance).
 */

import fs from 'node:fs';
import path from 'node:path';

import {
  contractPathFromRegistryEntry,
  loadGeneratedRegistry,
} from '../../../lib/visual-catalog.js';

/** Cap findings per audit pass (full-registry scan). */
export const MAX_CONTRACT_PATH_FINDINGS = 12;

export const rule = {
  id: 'DET.CONTRACT.PATH',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'minor',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-contract-path',
};

/**
 * @param {object | null | undefined} entry
 * @returns {boolean}
 */
export function isActiveRegistryRow(entry) {
  return String(entry?.status || '').toLowerCase() === 'active';
}

/**
 * Registry policy: these statuses require a resolvable contract path.
 * @param {object | null | undefined} entry
 * @returns {boolean}
 */
export function requiresContractPath(entry) {
  const cs = String(entry?.contract_status || '').toLowerCase();
  return cs === 'own' || cs === 'family-covered';
}

/**
 * Repo scan of active registry rows (mirrors check-visual-catalog contract path gates).
 * @param {string} repoRoot
 */
export function scanContractPaths(repoRoot) {
  const reg = loadGeneratedRegistry(repoRoot);
  if (!reg?.entries?.length) {
    return { skipped: true, reason: 'no-registry', issues: [] };
  }

  /** @type {Array<{ kind: 'empty-path' | 'missing-file', hash: string, contract?: string, contractStatus: string, message: string }>} */
  const issues = [];

  for (const e of reg.entries) {
    if (!isActiveRegistryRow(e)) continue;
    if (!requiresContractPath(e)) continue;

    const hash = String(e.hash || '').trim();
    const contractStatus = String(e.contract_status || '');
    const contractPath = contractPathFromRegistryEntry(e);

    if (!contractPath) {
      issues.push({
        kind: 'empty-path',
        hash,
        contractStatus,
        message: `Active catalog entry ${hash || '(no hash)'} has contract_status=${contractStatus} but contract path is empty.`,
      });
      continue;
    }

    const rel = contractPath.replace(/\\/g, '/');
    const abs = path.join(repoRoot, rel);
    if (!fs.existsSync(abs)) {
      issues.push({
        kind: 'missing-file',
        hash,
        contract: rel,
        contractStatus,
        message: `Active catalog entry ${hash || '(no hash)'} lists contract ${rel} but the file is missing on disk.`,
      });
    }
  }

  issues.sort((a, b) => {
    const ha = a.hash || '';
    const hb = b.hash || '';
    if (ha !== hb) return ha.localeCompare(hb);
    return a.message.localeCompare(b.message);
  });

  return {
    skipped: false,
    rowCount: reg.entries.length,
    issues,
  };
}

/**
 * @param {{
 *   skipped?: boolean,
 *   issues?: Array<{
 *     kind: string,
 *     hash: string,
 *     contract?: string,
 *     contractStatus: string,
 *     message: string,
 *   }>,
 * }} report
 * @returns {object[]}
 */
export function findingsFromContractPathReport(report) {
  if (!report || report.skipped) return [];
  const issues = Array.isArray(report.issues) ? report.issues : [];
  if (!issues.length) return [];

  const findings = [];
  const seen = new Set();

  for (const issue of issues.slice(0, MAX_CONTRACT_PATH_FINDINGS)) {
    const key = `${issue.kind}:${issue.hash}:${issue.contract || ''}:${issue.message}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const hash = issue.hash ? String(issue.hash) : '';
    const contract = issue.contract ? String(issue.contract).replace(/\\/g, '/') : '';
    findings.push({
      severity: 'minor',
      area: 'visual-catalog',
      message: issue.message,
      evidence: contract
        ? `hash=${hash} contract_status=${issue.contractStatus} contract=${contract}`
        : `hash=${hash} contract_status=${issue.contractStatus}`,
      remediation: issue.kind === 'empty-path'
        ? 'Point contract to docs/design/catalog/... markdown or set contract_status to not-applicable with a justified family rule.'
        : 'Restore the Markdown contract or update the registry contract path. Run `node tools/design-catalog/check-visual-catalog.mjs --repo .` for the full catalog report.',
    });
  }

  if (issues.length > MAX_CONTRACT_PATH_FINDINGS) {
    findings.push({
      severity: 'minor',
      area: 'visual-catalog',
      message: `Additional contract path issues omitted (${issues.length - MAX_CONTRACT_PATH_FINDINGS} more).`,
      evidence: `contract_path_total=${issues.length}`,
      remediation: 'Run `node tools/design-catalog/check-visual-catalog.mjs --repo .` locally to list every registry contract failure.',
    });
  }

  return findings;
}

export async function run({ metrics, repoRoot, ctx }) {
  const root = String(repoRoot || ctx?.repoRoot || metrics?.repoRoot || '').trim();
  if (!root) return [];

  const report = metrics?.contractPathReport ?? scanContractPaths(root);
  return findingsFromContractPathReport(report);
}
