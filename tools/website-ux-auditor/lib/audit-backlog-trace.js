import crypto from 'node:crypto';
import fsp from 'node:fs/promises';
import path from 'node:path';

import { isMajorPlus } from './severity.js';
import { countBySeverity } from './quality-gate.js';
import { fileExists } from './files.js';

export const TRACE_FILENAME = 'ux-audit-rule-page-trace.json';

/** @param {string} raw */
export function normalizeAuditUrl(raw) {
  try {
    const url = new URL(raw);
    url.hash = '';
    return url.href;
  } catch {
    return null;
  }
}

/**
 * @param {object} metrics DOM metrics from collectDomMetrics
 */
export function fingerprintPageContent(metrics) {
  const title = String(metrics?.title || '').slice(0, 200);
  const headings = (metrics?.headings || [])
    .slice(0, 12)
    .map((h) => `${h?.level || ''}:${String(h?.text || '').slice(0, 80)}`)
    .join('|');
  const textSample = String(metrics?.visibleTextSample || metrics?.bodyTextSample || '')
    .replace(/\s+/g, ' ')
    .slice(0, 400);
  const ksHashes = [...(metrics?.ksVisualHashReport?.validUnique || metrics?.ksHashes || [])]
    .slice(0, 40)
    .sort()
    .join(',');
  return sha256Hex(`${title}\n${headings}\n${textSample}\n${ksHashes}`);
}

export function sha256Hex(input) {
  return crypto.createHash('sha256').update(String(input || ''), 'utf8').digest('hex');
}

/**
 * @param {string} url
 * @param {string} ruleId
 * @param {string} registryFingerprint
 * @param {string} ruleModuleFingerprint
 * @param {string} pageContentFingerprint
 */
export function traceCacheKey(url, ruleId, registryFingerprint, ruleModuleFingerprint, pageContentFingerprint) {
  const href = normalizeAuditUrl(url) || String(url || '');
  return sha256Hex(
    JSON.stringify({
      href,
      ruleId: String(ruleId || ''),
      registryFingerprint: String(registryFingerprint || ''),
      ruleModuleFingerprint: String(ruleModuleFingerprint || ''),
      pageContentFingerprint: String(pageContentFingerprint || ''),
    }),
  );
}

/**
 * @param {object} ruleMeta registry row
 * @param {string} registryFingerprint
 */
export function ruleModuleFingerprintForMeta(ruleMeta, registryFingerprint) {
  return sha256Hex(
    JSON.stringify({
      registryFingerprint: registryFingerprint || '',
      modulePath: ruleMeta?.modulePath || '',
      status: ruleMeta?.status || '',
      sourceRule: ruleMeta?.sourceRule || '',
    }),
  );
}

/**
 * @typedef {{
 *   key: string,
 *   url: string,
 *   ruleId: string,
 *   lastRunAt: string,
 *   status: string,
 *   findingsCount: number,
 *   severityCounts: Record<string, number>,
 *   pageContentFingerprint: string,
 *   ruleModuleFingerprint: string,
 *   registryFingerprint: string,
 * }} TraceEntry
 */

export class RulePageTraceStore {
  /**
   * @param {{ outDir?: string, registryFingerprint?: string | null, disabled?: boolean }} opts
   */
  constructor(opts = {}) {
    this.outDir = opts.outDir || null;
    this.registryFingerprint = opts.registryFingerprint || null;
    this.disabled = Boolean(opts.disabled);
    /** @type {Map<string, TraceEntry>} */
    this.entries = new Map();
    this.dirty = false;
    this.loaded = false;
  }

  get filePath() {
    return this.outDir ? path.join(this.outDir, TRACE_FILENAME) : null;
  }

  async load() {
    if (this.loaded || !this.filePath) {
      this.loaded = true;
      return;
    }
    if (!(await fileExists(this.filePath))) {
      this.loaded = true;
      return;
    }
    try {
      const raw = JSON.parse(await fsp.readFile(this.filePath, 'utf8'));
      for (const row of raw.entries || []) {
        if (row?.key) this.entries.set(row.key, row);
      }
      if (raw.registryFingerprint && !this.registryFingerprint) {
        this.registryFingerprint = raw.registryFingerprint;
      }
    } catch {
      // start fresh
    }
    this.loaded = true;
  }

  async save() {
    if (!this.dirty || !this.filePath || this.disabled) return;
    const payload = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      registryFingerprint: this.registryFingerprint,
      entries: [...this.entries.values()].sort((a, b) =>
        `${a.url}:${a.ruleId}`.localeCompare(`${b.url}:${b.ruleId}`),
      ),
    };
    await fsp.mkdir(path.dirname(this.filePath), { recursive: true });
    await fsp.writeFile(this.filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    this.dirty = false;
  }

  /**
   * @returns {TraceEntry | null}
   */
  lookup(url, ruleMeta, pageContentFingerprint) {
    if (this.disabled) return null;
    const ruleFp = ruleModuleFingerprintForMeta(ruleMeta, this.registryFingerprint);
    const key = traceCacheKey(url, ruleMeta.id, this.registryFingerprint, ruleFp, pageContentFingerprint);
    return this.entries.get(key) || null;
  }

  shouldSkipNoFindings(url, ruleMeta, pageContentFingerprint) {
    if (this.disabled) return false;
    const prior = this.lookup(url, ruleMeta, pageContentFingerprint);
    if (!prior) return false;
    return prior.findingsCount === 0 && prior.status === 'ran';
  }

  /**
   * @param {object} params
   */
  record(params) {
    if (this.disabled) return;
    const {
      url,
      ruleMeta,
      pageContentFingerprint,
      status,
      findingsCount = 0,
      findings = [],
    } = params;
    const ruleFp = ruleModuleFingerprintForMeta(ruleMeta, this.registryFingerprint);
    const key = traceCacheKey(url, ruleMeta.id, this.registryFingerprint, ruleFp, pageContentFingerprint);
    const entry = {
      key,
      url: normalizeAuditUrl(url) || String(url || ''),
      ruleId: ruleMeta.id,
      lastRunAt: new Date().toISOString(),
      status,
      findingsCount,
      severityCounts: countBySeverity(findings),
      pageContentFingerprint,
      ruleModuleFingerprint: ruleFp,
      registryFingerprint: this.registryFingerprint || '',
    };
    this.entries.set(key, entry);
    this.dirty = true;
  }
}

/**
 * Prior URLs and rule ids from prior audit for regression wave.
 * @param {object|null} prevParsed audit-data.previous.json
 * @param {number} maxUrls
 */
export function extractBacklogUrlsAndRulesFromPriorAudit(prevParsed, maxUrls = 40) {
  const urlScores = new Map();
  /** @type {Map<string, number>} */
  const ruleScores = new Map();

  for (const p of prevParsed?.pages || []) {
    const url = normalizeAuditUrl(p?.url || '');
    if (!url) continue;
    const findings = p.findings || [];
    if (!findings.length) continue;
    let score = 0;
    for (const f of findings) {
      score += isMajorPlus(f?.severity) ? 10 : 1;
      const rid = f.ruleId || f.checkId;
      if (rid) ruleScores.set(rid, (ruleScores.get(rid) || 0) + (isMajorPlus(f?.severity) ? 5 : 1));
    }
    urlScores.set(url, (urlScores.get(url) || 0) + score + findings.length);
  }

  const urls = [...urlScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxUrls)
    .map(([u]) => u);

  const priorityRuleIds = [...ruleScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  return { urls, priorityRuleIds };
}

/**
 * @param {object|null} prevParsed
 * @param {number} maxUrls
 */
export function extractMajorPlusUrlsFromPriorAudit(prevParsed, maxUrls) {
  const urls = [];
  const seen = new Set();
  const pages = [...(prevParsed?.pages || [])].sort((a, b) => {
    const am = (a.findings || []).filter((f) => isMajorPlus(f?.severity)).length;
    const bm = (b.findings || []).filter((f) => isMajorPlus(f?.severity)).length;
    return bm - am;
  });
  for (const p of pages) {
    const url = p?.url;
    if (!url) continue;
    const has = (p.findings || []).some((f) => isMajorPlus(f?.severity));
    if (!has) continue;
    const n = normalizeAuditUrl(url);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    urls.push(n);
    if (urls.length >= maxUrls) break;
  }
  return urls;
}

/**
 * Merge backlog URLs with Major+ URLs (backlog first).
 */
export function mergeRegressionUrls(backlogUrls, majorPlusUrls) {
  const out = [];
  const seen = new Set();
  for (const u of [...(backlogUrls || []), ...(majorPlusUrls || [])]) {
    const n = normalizeAuditUrl(u);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

/**
 * Sort rule metas: priority ids first, then registry order.
 * @param {object[]} rules
 * @param {string[]} priorityRuleIds
 */
export function sortRulesByPriority(rules, priorityRuleIds) {
  const prio = new Set(priorityRuleIds || []);
  const indexed = (rules || []).map((r, i) => ({ r, i }));
  indexed.sort((a, b) => {
    const ap = prio.has(a.r.id) ? 0 : 1;
    const bp = prio.has(b.r.id) ? 0 : 1;
    if (ap !== bp) return ap - bp;
    return a.i - b.i;
  });
  return indexed.map((x) => x.r);
}
