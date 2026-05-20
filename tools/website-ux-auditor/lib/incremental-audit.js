import fsp from 'node:fs/promises';
import path from 'node:path';

import { countMajorPlus } from './severity.js';
import { fileExists } from './files.js';
import {
  normalizeAuditUrl,
  extractMajorPlusUrlsFromPriorAudit,
  extractBacklogUrlsAndRulesFromPriorAudit,
  mergeRegressionUrls,
} from './audit-backlog-trace.js';

export {
  normalizeAuditUrl,
  extractMajorPlusUrlsFromPriorAudit,
  extractBacklogUrlsAndRulesFromPriorAudit,
  mergeRegressionUrls,
};

/**
 * Per-URL Major+ counts: previous snapshot vs current regression wave pages.
 * @param {object|null} prevParsed prior audit-data JSON
 * @param {Array<{ url?: string, findings?: unknown[] }>} regressionPages pages tagged auditWave==='regression'
 */
export function buildRegressionWaveSummary(prevParsed, regressionPages) {
  const prevByUrl = new Map();
  for (const p of prevParsed?.pages || []) {
    const k = normalizeAuditUrl(p.url);
    if (k) prevByUrl.set(k, p);
  }
  const rows = [];
  for (const cur of regressionPages) {
    const k = normalizeAuditUrl(cur.url);
    if (!k) continue;
    const prev = prevByUrl.get(k);
    const prevMj = prev ? countMajorPlus(prev.findings) : null;
    const curMj = countMajorPlus(cur.findings);
    rows.push({
      url: k,
      priorMajorPlusCount: prevMj,
      currentMajorPlusCount: curMj,
      deltaMajorPlus: prevMj === null ? null : curMj - prevMj,
    });
  }
  return {
    baselineArtifact: 'audit-data.previous.json',
    urlsChecked: rows.length,
    rows,
  };
}

/** Copy audit-data.json → audit-data.previous.json when present. */
export async function archiveAuditDataToPrevious(outDir, logger) {
  const cur = path.join(outDir, 'audit-data.json');
  const prev = path.join(outDir, 'audit-data.previous.json');
  if (!(await fileExists(cur))) return false;
  await fsp.copyFile(cur, prev);
  logger?.verbose?.('[archive]', 'audit snapshot', `audit-data.json → audit-data.previous.json (${outDir})`);
  return true;
}

export async function readJsonIfExists(absPath) {
  if (!(await fileExists(absPath))) return null;
  try {
    return JSON.parse(await fsp.readFile(absPath, 'utf8'));
  } catch {
    return null;
  }
}

/** @returns {Promise<object|null>} */
export async function readAuditDataPrevious(outDir) {
  return readJsonIfExists(path.join(outDir, 'audit-data.previous.json'));
}

/** @returns {Promise<object|null>} */
export async function readCrawlSession(outDir) {
  return readJsonIfExists(path.join(outDir, 'crawl-session.json'));
}

export async function writeCrawlSession(outDir, payload, logger) {
  const target = path.join(outDir, 'crawl-session.json');
  await fsp.writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  logger?.verbose?.('[session]', 'wrote crawl-session.json', target);
}
