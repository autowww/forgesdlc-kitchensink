/**
 * DET.KS.CONSUMER_ASSET_BUNDLE — KS consumer pages load required CSS/JS; Vite asset URLs resolve (live).
 */

import {
  buildConsumerAssetBundleReportFromHtml,
  collectConsumerAssetBundleReport,
  hasKsDomSignal,
  ksGovernanceEnabled,
} from '../../../lib/ks-governance.js';

export const MAX_KS_CONSUMER_BUNDLE_FINDINGS = 8;

export const rule = {
  id: 'DET.KS.CONSUMER_ASSET_BUNDLE',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'minor',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-ks-consumer-asset-bundle',
};

/**
 * @param {{ skipped?: boolean, missingPatterns?: string[], brokenAssets?: Array<Record<string, unknown>>, mode?: string }} report
 * @param {string} [url]
 */
export function findingsFromConsumerAssetBundleReport(report, url = '') {
  if (!report || report.skipped) return [];
  const findings = [];

  for (const pattern of report.missingPatterns || []) {
    let message = 'KS consumer page is missing a required stylesheet bundle.';
    if (pattern === 'forge-react-primitives-stylesheet') {
      message = 'Page with react-primitive roots does not link forge-react-primitives.css (or equivalent bundle).';
    } else if (pattern === 'ks-theme-stylesheet') {
      message = 'Page with KS markers does not link a Forge theme stylesheet (forge-theme, forgesdlc-theme, or docs-theme).';
    }
    findings.push({
      severity: 'minor',
      area: 'visual-catalog',
      message,
      evidence: `missingPattern=${pattern} mode=${report.mode || 'live'} url=${url || ''}`,
      remediation:
        'Link kitchensink theme CSS and forge-react-primitives.css (or consumer Vite bundle that includes them) before mounting governed roots.',
    });
  }

  for (const asset of report.brokenAssets || []) {
    findings.push({
      severity: 'warn',
      area: 'visual-catalog',
      message: `Asset URL failed to load (${asset.status || 'error'}): ${asset.href}`,
      evidence: `kind=${asset.kind} status=${asset.status}`,
      remediation: 'Fix Vite/build output paths or hosting base URL so module and stylesheet hrefs resolve.',
    });
  }

  return findings.slice(0, MAX_KS_CONSUMER_BUNDLE_FINDINGS);
}

export async function run({ metrics, url, page, repoRoot, ctx }) {
  if (
    !ksGovernanceEnabled({
      rulesScopeResolved: ctx?.rulesScopeResolved,
      metrics,
      repoRoot: String(repoRoot || ctx?.repoRoot || ''),
    })
  ) {
    return [];
  }

  const pageUrl = url || metrics?.url || '';
  let report = metrics?.ksConsumerAssetBundleReport;

  if (!report && page) {
    report = await collectConsumerAssetBundleReport(page, pageUrl);
  } else if (!report && metrics?.htmlSnapshot) {
    report = buildConsumerAssetBundleReportFromHtml(metrics.htmlSnapshot);
  } else if (!report && !page) {
    return [];
  }

  if (!report && !hasKsDomSignal(metrics)) return [];

  return findingsFromConsumerAssetBundleReport(report, pageUrl);
}
