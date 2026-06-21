/**
 * DET.KS.PRIMITIVE_VERSION_MATCH — runtime data-ks-primitive-version matches registry/contract when declared.
 */

import {
  buildPrimitiveVersionMatchReport,
  collectPrimitiveVersionInstances,
  hasKsDomSignal,
  ksGovernanceEnabled,
} from '../../../lib/ks-governance.js';

export const MAX_KS_PRIMITIVE_VERSION_FINDINGS = 8;

export const rule = {
  id: 'DET.KS.PRIMITIVE_VERSION_MATCH',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'minor',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-ks-primitive-version-match',
};

/**
 * @param {{ skipped?: boolean, violations?: Array<Record<string, unknown>> }} report
 * @param {string} [url]
 */
export function findingsFromPrimitiveVersionReport(report, url = '') {
  if (!report || report.skipped) return [];
  const violations = Array.isArray(report.violations) ? report.violations : [];
  if (!violations.length) return [];

  return violations.slice(0, MAX_KS_PRIMITIVE_VERSION_FINDINGS).map((v) => {
    const hash = String(v.hash || '?');
    const kind = String(v.kind || 'version-mismatch');
    let message = `Primitive version on hash ${hash} does not match registry/contract.`;
    if (kind === 'missing-runtime-version') {
      message = `Hash ${hash} declares primitive_version in catalog but DOM lacks data-ks-primitive-version.`;
    } else if (kind === 'undeclared-runtime-version') {
      message = `DOM declares data-ks-primitive-version="${v.domVersion}" for ${hash} but registry/contract has no version.`;
    } else if (kind === 'version-mismatch') {
      message = `Hash ${hash}: data-ks-primitive-version="${v.domVersion}" ≠ expected "${v.expectedVersion}".`;
    }
    return {
      severity: 'minor',
      area: 'visual-catalog',
      hash: hash !== '?' ? hash : undefined,
      message,
      evidence: `kind=${kind} url=${url || 'repo'}`,
      remediation:
        'Align data-ks-primitive-version on react-primitive roots with primitive_version in visual-registry.yaml and the contract Primitive version line.',
    };
  });
}

export async function run({ metrics, url, page, repoRoot, ctx }) {
  const root = String(repoRoot || ctx?.repoRoot || metrics?.repoRoot || '').trim();
  if (
    !ksGovernanceEnabled({
      rulesScopeResolved: ctx?.rulesScopeResolved,
      metrics,
      repoRoot: root,
    })
  ) {
    return [];
  }

  let instances = metrics?.ksPrimitiveVersionReport?.instances;
  if ((!instances || !instances.length) && page) {
    instances = await collectPrimitiveVersionInstances(page);
  }
  if (!instances?.length && !hasKsDomSignal(metrics)) return [];

  const report = metrics?.ksPrimitiveVersionReport?.violations
    ? metrics.ksPrimitiveVersionReport
    : buildPrimitiveVersionMatchReport(root, instances || []);

  return findingsFromPrimitiveVersionReport(report, url || metrics?.url || '');
}
