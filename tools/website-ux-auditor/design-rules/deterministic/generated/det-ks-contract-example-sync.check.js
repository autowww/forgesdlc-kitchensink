/**
 * DET.KS.CONTRACT_EXAMPLE_SYNC — rule-page examples, fixtures, and contract snippets stay aligned per hash/rule.
 */

import { buildContractExampleSyncReport, ksGovernanceEnabled } from '../../../lib/ks-governance.js';

export const MAX_KS_CONTRACT_EXAMPLE_SYNC_FINDINGS = 10;

export const rule = {
  id: 'DET.KS.CONTRACT_EXAMPLE_SYNC',
  lane: 'deterministic',
  phase: 'repo',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'minor',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-ks-contract-example-sync',
};

/**
 * @param {{ skipped?: boolean, issues?: Array<Record<string, unknown>> }} report
 */
export function findingsFromContractExampleSyncReport(report) {
  if (!report || report.skipped) return [];
  const issues = Array.isArray(report.issues) ? report.issues : [];
  if (!issues.length) return [];

  return issues.slice(0, MAX_KS_CONTRACT_EXAMPLE_SYNC_FINDINGS).map((issue) => {
    const ruleId = String(issue.ruleId || '');
    const kind = String(issue.kind || 'drift');
    let message = `Rule page artifacts drift for ${ruleId}.`;
    if (kind === 'hash-not-referenced-outside-before') {
      message = `${ruleId}: Before example hash ${issue.hash} is not cited in remediation, Deterministic checks, or passing signals.`;
    } else if (kind === 'rule-id-missing-in-deterministic-checks') {
      message = `${ruleId}: ## Deterministic checks section does not cite the rule id.`;
    }
    return {
      severity: 'minor',
      area: 'visual-catalog',
      message,
      evidence: `${issue.file || ''} kind=${kind}`,
      remediation:
        'Update Before/After HTML in the rule page, defect fixture, and contract verification snippets together when changing governed hashes.',
    };
  });
}

export async function run({ metrics, repoRoot, ctx }) {
  const root = String(repoRoot || ctx?.repoRoot || metrics?.repoRoot || '').trim();
  if (!root) return [];
  if (
    !ksGovernanceEnabled({
      rulesScopeResolved: ctx?.rulesScopeResolved,
      metrics,
      repoRoot: root,
    })
  ) {
    return [];
  }

  const report = metrics?.ksContractExampleSyncReport || buildContractExampleSyncReport(root);
  return findingsFromContractExampleSyncReport(report);
}
