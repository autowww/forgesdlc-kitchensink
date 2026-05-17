import fsp from 'node:fs/promises';
import path from 'node:path';

import { DESIGN_DIMENSION_IDS } from './design-dimensions.js';

/** Written at `--repo` root for local analytics only (ignored by git in site repos). */
export const UX_SCORING_CSV_FILENAME = 'ux-scoring.csv';

function csvEscape(value) {
  const t = value === undefined || value === null ? '' : String(value);
  if (/[",\r\n]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
  return t;
}

export function uxScoringCsvHeaderLine() {
  const cols = [
    'generated_at_iso',
    'tool',
    'run_segment',
    'site_kind',
    'run_id',
    'site_url',
    'overall',
    'crawl_mode',
    'stop_reason',
    'pages_analyzed',
    'effective_findings_count',
    'ancillary_findings_count',
    'perfect_score_eligible',
    'static_only_analysis',
    'crawl_stopped_early',
    'ux_scores_schema_version',
  ];
  for (const id of DESIGN_DIMENSION_IDS) {
    cols.push(`${id}_score`, `${id}_raw_damage`, `${id}_finding_count`);
  }
  return cols.join(',');
}

/**
 * @param {{
 *   generatedAt: string,
 *   tool: string,
 *   runSegment: string,
 *   siteKind: string,
 *   runId: string,
 *   siteUrl: string,
 *   uxScores: object,
 *   crawlSummary?: object | null,
 * }} row
 */
export function formatUxScoringCsvDataLine(row) {
  const ux = row.uxScores || {};
  const cov = ux.coverage || {};
  const crawl = row.crawlSummary || {};

  /** @type {(string | number | boolean | null | undefined)[]} */
  const cells = [
    row.generatedAt,
    row.tool,
    row.runSegment,
    row.siteKind,
    row.runId,
    row.siteUrl,
    ux.overall,
    crawl.crawlMode ?? '',
    crawl.stopReason ?? cov.stopReason ?? '',
    cov.pagesAnalyzed ?? crawl.pagesCaptured ?? '',
    cov.effectiveFindingCount,
    cov.ancillaryFindingCount,
    cov.perfectScoreEligible,
    cov.staticOnly,
    cov.crawlStoppedEarly,
    ux.version,
  ];

  for (const id of DESIGN_DIMENSION_IDS) {
    const d = ux.dimensions?.[id] || {};
    cells.push(d.score, d.rawDamage, d.findingCount);
  }

  return cells.map(csvEscape).join(',');
}

/**
 * @param {string} repoRoot
 * @param {{
 *   generatedAt: string,
 *   tool: string,
 *   runSegment: string,
 *   siteKind: string,
 *   runId: string,
 *   siteUrl: string,
 *   uxScores: object,
 *   crawlSummary?: object | null,
 * }} payload
 */
export async function appendUxScoringCsv(repoRoot, payload) {
  const abs = path.resolve(repoRoot, UX_SCORING_CSV_FILENAME);
  let needHeader = true;
  try {
    const stat = await fsp.stat(abs);
    needHeader = stat.size === 0;
  } catch {
    needHeader = true;
  }
  const line = `${formatUxScoringCsvDataLine(payload)}\n`;
  const chunk = needHeader ? `${uxScoringCsvHeaderLine()}\n${line}` : line;
  await fsp.appendFile(abs, chunk, 'utf8');
}
