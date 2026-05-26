/**
 * Incremental audit pages for FORGE_UX_LOOP_WATCH (written during crawl, before audit-data.json).
 */

import fs from 'node:fs';
import path from 'node:path';

export const LIVE_AUDIT_DATA_FILE = 'audit-data.live.json';

/**
 * @param {string} outDir
 */
export function liveAuditDataPath(outDir) {
  return path.join(outDir, LIVE_AUDIT_DATA_FILE);
}

/**
 * @param {object} page
 */
export function slimLiveAuditPage(page) {
  if (!page || typeof page !== 'object') return null;
  const url = String(page.url || '').trim();
  if (!url) return null;
  return {
    url,
    findings: page.findings || [],
    ruleExecution: page.ruleExecution || {},
    error: page.error || null,
    metrics: page.metrics || {},
    score: page.score,
    auditWave: page.auditWave || 'crawl',
  };
}

/**
 * @param {string} outDir
 */
export function readLiveAuditPages(outDir) {
  const p = liveAuditDataPath(outDir);
  try {
    const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
    return Array.isArray(raw?.pages) ? raw.pages : [];
  } catch {
    return [];
  }
}

/**
 * @param {string} outDir
 */
export function clearLiveAuditSnapshot(outDir) {
  const p = liveAuditDataPath(outDir);
  try {
    fs.unlinkSync(p);
  } catch {
    /* ignore */
  }
}

/**
 * Replace rolling live pages (used at crawl start).
 * @param {string} outDir
 * @param {object[]} pages
 */
export function writeLiveAuditSnapshot(outDir, pages) {
  const p = liveAuditDataPath(outDir);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const payload = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    pages: (pages || []).map(slimLiveAuditPage).filter(Boolean),
  };
  const tmp = `${p}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, p);
}

/**
 * Append or replace one completed page in the live snapshot.
 * @param {string} outDir
 * @param {object} page
 */
export function appendLiveAuditPage(outDir, page) {
  const slim = slimLiveAuditPage(page);
  if (!slim) return;
  const existing = readLiveAuditPages(outDir);
  const byUrl = new Map(existing.map((p) => [String(p.url || '').trim(), p]));
  byUrl.set(slim.url, slim);
  writeLiveAuditSnapshot(outDir, [...byUrl.values()]);
}
