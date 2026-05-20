/**
 * DET.CONTRACT.PLACEHOLDERS — design contracts must not retain unresolved placeholder
 * language; stub bullets (TBD/TODO/FIXME) fail only when strictContractPlaceholders is enabled.
 */

import fs from 'node:fs';
import path from 'node:path';

import { analyzeContractPlaceholders } from '../../../../design-catalog/lib/contract-placeholders.mjs';
import { loadGeneratedRegistry } from '../../../lib/visual-catalog.js';

/** Cap findings per audit pass (repo-wide contract scan). */
export const MAX_CONTRACT_PLACEHOLDER_FINDINGS = 12;

const SKIP_CONTRACT_RE = /contract-template\.md$/;

export const rule = {
  id: 'DET.CONTRACT.PLACEHOLDERS',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'minor',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-contract-placeholders',
};

/**
 * @param {string} message
 * @returns {'stub-bullet' | 'placeholder-marker'}
 */
export function placeholderIssueKind(message) {
  const m = String(message || '');
  if (m.includes('stub bullets')) return 'stub-bullet';
  return 'placeholder-marker';
}

/**
 * Repo scan of registry-linked contracts (mirrors check-visual-catalog placeholder pass).
 * @param {string} repoRoot
 * @param {{ strict?: boolean }} [opts]
 */
export function scanContractPlaceholders(repoRoot, opts = {}) {
  const strict = !!opts.strict;
  const reg = loadGeneratedRegistry(repoRoot);
  if (!reg?.entries?.length) {
    return { skipped: true, reason: 'no-registry', issues: [] };
  }

  /** @type {Map<string, { rel: string, hashes: Set<string> }>} */
  const byContract = new Map();

  for (const e of reg.entries) {
    const cs = String(e.contract_status || '');
    if (cs !== 'own' && cs !== 'family-covered') continue;
    const rel = e.contract ? String(e.contract).replace(/\\/g, '/') : '';
    if (!rel || SKIP_CONTRACT_RE.test(rel)) continue;
    if (!byContract.has(rel)) {
      byContract.set(rel, { rel, hashes: new Set() });
    }
    if (e.hash) byContract.get(rel).hashes.add(String(e.hash));
  }

  /** @type {Array<{ severity: 'minor' | 'warn', hash?: string, contract: string, kind: string, message: string }>} */
  const issues = [];

  for (const { rel, hashes } of byContract.values()) {
    const abs = path.join(repoRoot, rel);
    if (!fs.existsSync(abs)) continue;
    const txt = fs.readFileSync(abs, 'utf8');
    const hash = [...hashes].sort().join(',') || undefined;
    const { errors: phErr } = analyzeContractPlaceholders(txt, rel, { strict });

    for (const m of phErr) {
      issues.push({
        severity: 'minor',
        hash,
        contract: rel,
        kind: placeholderIssueKind(m),
        message: m,
      });
    }
  }

  issues.sort((a, b) => a.contract.localeCompare(b.contract) || a.message.localeCompare(b.message));

  return {
    skipped: false,
    contractCount: byContract.size,
    strict,
    issues,
  };
}

/**
 * @param {{
 *   skipped?: boolean,
 *   issues?: Array<{
 *     severity: 'minor' | 'warn',
 *     hash?: string,
 *     contract: string,
 *     kind: string,
 *     message: string,
 *   }>,
 * }} report
 */
export function findingsFromContractPlaceholderReport(report) {
  if (!report || report.skipped) return [];
  const issues = Array.isArray(report.issues) ? report.issues : [];
  if (!issues.length) return [];

  const findings = [];
  const seen = new Set();

  for (const issue of issues.slice(0, MAX_CONTRACT_PLACEHOLDER_FINDINGS)) {
    const contract = String(issue.contract || '').replace(/\\/g, '/');
    const key = `${issue.severity}:${contract}:${issue.message}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const hash = issue.hash ? String(issue.hash) : '';
    const isStub = issue.kind === 'stub-bullet';
    findings.push({
      severity: issue.severity === 'minor' ? 'minor' : 'warn',
      area: 'visual-catalog',
      message: isStub
        ? `Design contract still uses unresolved stub bullets: ${issue.message}`
        : issue.message,
      evidence: hash ? `hash=${hash} contract=${contract}` : `contract=${contract}`,
      remediation: isStub
        ? 'Replace TBD/TODO/FIXME bullets with element-specific contract text, or enable strict catalog lint only after stubs are cleared. Run `node tools/design-catalog/check-visual-catalog.mjs --strict-contract-placeholders`.'
        : 'Remove template placeholder language (lorem ipsum, [placeholder], example-visual, XYZ headings). Run `node tools/design-catalog/check-visual-catalog.mjs` for the full catalog report.',
    });
  }

  if (issues.length > MAX_CONTRACT_PLACEHOLDER_FINDINGS) {
    findings.push({
      severity: 'minor',
      area: 'visual-catalog',
      message: `Additional contract placeholder issues omitted (${issues.length - MAX_CONTRACT_PLACEHOLDER_FINDINGS} more).`,
      evidence: `contract_placeholder_total=${issues.length}`,
      remediation:
        'Run `node tools/design-catalog/check-visual-catalog.mjs --verbose-contract-placeholders` locally to list every contract failure.',
    });
  }

  return findings;
}

export async function run({ metrics, repoRoot, ctx }) {
  const root = String(repoRoot || ctx?.repoRoot || metrics?.repoRoot || '').trim();
  if (!root) return [];

  const report =
    metrics?.contractPlaceholderReport
    ?? scanContractPlaceholders(root, {
      strict: ctx?.strictContractPlaceholders === true,
    });

  return findingsFromContractPlaceholderReport(report);
}
