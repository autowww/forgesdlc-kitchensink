/**
 * Page crawl order and adaptive DET rule ordering heuristics.
 */

import { normalizeAuditUrl, extractBacklogUrlsAndRulesFromPriorAudit } from './audit-backlog-trace.js';
import { countMajorPlus } from './severity.js';
import { pagePassesQualityGate, loadQualityGateThresholdsFromEnv } from './quality-gate.js';
import { scorePage } from './scoring.js';

const DEFAULT_DEPRIORITIZE_AFTER_PAGES = 4;
const DEFAULT_DEPRIORITIZE_AFTER_ZERO_GATE = 3;

/**
 * @param {object|null} priorAudit
 * @param {object|null} scoreJson
 * @param {string[]} excludeHrefs
 * @param {Record<string, number>} [thresholds]
 */
export function planAuditorPagePriority(priorAudit, scoreJson, excludeHrefs = [], thresholds = null) {
  let thr = thresholds;
  if (!thr) {
    try {
      thr = loadQualityGateThresholdsFromEnv();
    } catch {
      thr = loadQualityGateThresholdsFromEnv({});
    }
  }
  const exclude = new Set((excludeHrefs || []).map(normalizeAuditUrl).filter(Boolean));
  /** @type {Map<string, { score: number, majorPlus: number, findings: number, gateFail: boolean }>} */
  const meta = new Map();

  for (const row of scoreJson?.pages || scoreJson?.pageScores || []) {
    const url = normalizeAuditUrl(row.url || row.href || '');
    if (!url || exclude.has(url)) continue;
    meta.set(url, {
      score: Number.isFinite(Number(row.score)) ? Number(row.score) : 50,
      majorPlus: countMajorPlus(row.findings || []),
      findings: (row.findings || []).length,
      gateFail: false,
    });
  }

  for (const p of priorAudit?.pages || []) {
    const url = normalizeAuditUrl(p.url || '');
    if (!url || exclude.has(url)) continue;
    const findings = p.findings || [];
    const gateFail = !pagePassesQualityGate(findings, thr);
    const cur = meta.get(url) || {
      score: scorePage(p.metrics || {}, findings),
      majorPlus: 0,
      findings: 0,
      gateFail: false,
    };
    cur.majorPlus = Math.max(cur.majorPlus, countMajorPlus(findings));
    cur.findings = Math.max(cur.findings, findings.length);
    cur.gateFail = cur.gateFail || gateFail;
    if (!Number.isFinite(cur.score)) cur.score = scorePage(p.metrics || {}, findings);
    meta.set(url, cur);
  }

  const backlog = priorAudit ? extractBacklogUrlsAndRulesFromPriorAudit(priorAudit, 80) : { urls: [], priorityRuleIds: [] };

  /** @type {Array<{ url: string, priority: number }>} */
  const ranked = [...meta.entries()].map(([url, m]) => {
    let priority = 1000 - m.score;
    if (m.gateFail) priority += 500;
    priority += m.majorPlus * 40;
    priority += m.findings * 2;
    return { url, priority };
  });

  for (const url of backlog.urls || []) {
    const n = normalizeAuditUrl(url);
    if (!n || exclude.has(n)) continue;
    if (!ranked.some((r) => r.url === n)) {
      ranked.push({ url: n, priority: 800 });
    } else {
      const row = ranked.find((r) => r.url === n);
      if (row) row.priority += 200;
    }
  }

  ranked.sort((a, b) => b.priority - a.priority);
  return {
    orderedUrls: ranked.map((r) => r.url),
    priorityRuleIds: backlog.priorityRuleIds || [],
    scoresByUrl: Object.fromEntries([...meta.entries()].map(([u, m]) => [u, m.score])),
  };
}

/**
 * @param {import('./audit-backlog-trace.js').RulePageTraceStore | null} traceStore
 * @param {string[]} priorityRuleIds
 * @param {string[]} implementedRuleIds
 * @param {object} [opts]
 */
export function computeAdaptiveRuleOrder(traceStore, priorityRuleIds, implementedRuleIds, opts = {}) {
  const deprioritizeAfterPages = Number(opts.deprioritizeAfterPages) || DEFAULT_DEPRIORITIZE_AFTER_PAGES;
  const deprioritizeAfterZero = Number(opts.deprioritizeAfterZeroGate) || DEFAULT_DEPRIORITIZE_AFTER_ZERO_GATE;
  const prio = new Set(priorityRuleIds || []);
  const impl = implementedRuleIds || [];

  /** @type {Map<string, { pages: number, gateHits: number }>} */
  const stats = new Map();
  if (traceStore?.entries) {
    for (const entry of traceStore.entries.values()) {
      const rid = String(entry.ruleId || '');
      if (!rid) continue;
      if (!stats.has(rid)) stats.set(rid, { pages: 0, gateHits: 0 });
      const s = stats.get(rid);
      s.pages += 1;
      const sev = entry.severityCounts || {};
      const gateHit = Number(entry.findingsCount) > 0;
      if (gateHit) s.gateHits += 1;
    }
  }

  /** @type {string[]} */
  const deprioritized = [];
  /** @type {string[]} */
  const normal = [];
  for (const id of impl) {
    const s = stats.get(id);
    if (prio.has(id)) continue;
    if (s && s.pages >= deprioritizeAfterPages && s.gateHits === 0) deprioritized.push(id);
    else normal.push(id);
  }

  const ordered = [
    ...impl.filter((id) => prio.has(id)),
    ...normal,
    ...deprioritized,
  ];
  const seen = new Set();
  const deduped = [];
  for (const id of ordered) {
    if (seen.has(id)) continue;
    seen.add(id);
    deduped.push(id);
  }
  return { orderedRuleIds: deduped, deprioritizedRuleIds: deprioritized, priorityRuleIds: [...prio] };
}

/**
 * @param {{ href: string, depth: number }[]} queue
 * @param {Record<string, number>} priorityByUrl higher = sooner
 */
export function pickHighestPriorityQueueItem(queue, priorityByUrl) {
  if (!queue.length) return null;
  let bestIdx = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < queue.length; i += 1) {
    const href = queue[i].href;
    const base = Number(priorityByUrl[href]) || 0;
    const depthPenalty = (queue[i].depth || 0) * 0.01;
    const score = base - depthPenalty + (queue.length - i) * 0.0001;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  const [item] = queue.splice(bestIdx, 1);
  return item;
}
