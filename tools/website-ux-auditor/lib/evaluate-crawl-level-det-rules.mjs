/**
 * Run crawl-level DET rules after BFS completes; merge findings onto affected pages.
 */

import { makeFinding, SCORE_WEIGHTS } from './severity.js';

function scoreImpactWeight(severity, priorityWeight) {
  const base = SCORE_WEIGHTS[String(severity || '').toLowerCase()];
  const sevWeight = Number.isFinite(base) ? base : SCORE_WEIGHTS.minor;
  return sevWeight + Number(priorityWeight || 0);
}
import { findingsFromHttpStatusCanonicalReport } from '../design-rules/deterministic/generated/det-route-http-status-canonical.check.js';
import { findingsFromContentUniquenessReport } from '../design-rules/deterministic/generated/det-route-content-uniqueness.check.js';
import { buildCrawlRouteAuditReport } from './crawl-route-audit.js';

/**
 * @param {object} opts
 * @param {Array<{ url?: string, findings?: object[], metrics?: object }>} opts.pages
 * @param {string} opts.origin
 * @param {import('playwright').APIRequestContext} opts.request
 */
export async function evaluateCrawlLevelDetRules({ pages, origin, request }) {
  const report = await buildCrawlRouteAuditReport({ pages, origin, request });

  const normalize = (raw, meta) => {
    const finding = makeFinding({
      checkId: 'design-rule-runtime',
      severity: raw.severity,
      area: raw.area,
      message: raw.message,
      evidence: raw.evidence,
      remediation: raw.remediation,
    });
    finding.ruleId = meta.ruleId;
    finding.scoreDimension = meta.scoreDimension;
    finding.priorityWeight = Number(meta.priorityWeight || 0);
    finding.sourceRule = meta.sourceRule;
    finding.scoreImpactWeight = scoreImpactWeight(finding.severity, finding.priorityWeight);
    return finding;
  };

  const crawlFindings = [
    ...findingsFromHttpStatusCanonicalReport(report).map((f) =>
      normalize(f, {
        ruleId: 'DET.ROUTE.HTTP_STATUS_CANONICAL',
        scoreDimension: 'informationArchitecture',
        priorityWeight: 10,
        sourceRule: 'docs/design/ux-audit/deterministic-design-rules.md#det-route-http-status-canonical',
      }),
    ),
    ...findingsFromContentUniquenessReport(report).map((f) =>
      normalize(f, {
        ruleId: 'DET.ROUTE.CONTENT_UNIQUENESS',
        scoreDimension: 'informationArchitecture',
        priorityWeight: 9,
        sourceRule: 'docs/design/ux-audit/deterministic-design-rules.md#det-route-content-uniqueness',
      }),
    ),
  ];

  if (!crawlFindings.length) {
    return { crawlFindings: [], crawlRouteAudit: report };
  }

  const pageByUrl = new Map();
  for (const p of pages) {
    const u = p.url || p.metrics?.url || '';
    if (u) pageByUrl.set(u, p);
  }

  for (const finding of crawlFindings) {
    const evidence = String(finding.evidence || '');
    const urlMatch = evidence.match(/\burl=(\S+)/) || evidence.match(/\bhref="?([^"\s]+)"?/);
    const targetUrl = urlMatch?.[1] || pages[0]?.url;
    const page = targetUrl ? pageByUrl.get(targetUrl) : pages[0];
    if (page) {
      page.findings = [...(page.findings || []), finding];
    } else if (pages[0]) {
      pages[0].findings = [...(pages[0].findings || []), finding];
    }
  }

  return { crawlFindings, crawlRouteAudit: report };
}
