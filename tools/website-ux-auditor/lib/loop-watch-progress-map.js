/**
 * Defragmentation-style progress map + phase bars for loop-watch dashboard.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  countBySeverity,
  evaluateAuditQualityGate,
  evaluateQualityGate,
  flattenAuditFindings,
  loadQualityGateThresholdsFromEnv,
  pagePassesQualityGate,
  SEVERITY_GATE_SHORT,
} from './quality-gate.js';
import { countMajorPlus, isMajorPlus, SEVERITY_LEVELS } from './severity.js';
import { scorePage } from './scoring.js';
import {
  buildPageFragments,
  buildPageGroupPlan,
  collectMapUrlCatalog,
} from './loop-watch-page-groups.js';
import {
  isScorerSourcedQualityGate,
  isScorerWatchPhase,
  usesAuditIssueControls,
} from './loop-watch-phase-source.js';

export { buildPageFragments } from './loop-watch-page-groups.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = path.resolve(__dirname, '../design-rules/registry.generated.json');

/** Load registry synchronously for TTY dashboard ticks. */
function loadRegistrySync() {
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch {
    return { deterministicRules: [], aiRules: [] };
  }
}

function listImplementedDeterministicRulesSync(registry) {
  return (registry?.deterministicRules || []).filter((r) => r.status === 'implemented' && r.modulePath);
}

export const UX_LOOP_PROGRESS_MAP_FILE = 'ux-loop-progress-map.json';

/** Max page/worker slots shown during AI audit phases. */
export const MAP_SLOT_AUDITOR = 3;
/** Max page/worker slots shown during deterministic (scorer) crawl. */
export const MAP_SLOT_SCORER = 5;

/**
 * Map grid cell lifecycle (ruleset × page fragment).
 * @typedef {'unseen'|'scored'|'auditing'|'auditing-dim'|'audited-clean'|'audited-major'|'audited-minor'|'fixing'|'fixing-dim'|'fixed'|'error'|'pending-ai'} MapCellStatus
 */

/** Worst status wins when aggregating fragments. */
const MAP_STATUS_RANK = {
  unseen: 0,
  scored: 1,
  'pending-ai': 2,
  auditing: 3,
  'auditing-dim': 3,
  fixing: 4,
  'fixing-dim': 4,
  'audited-clean': 5,
  fixed: 6,
  'audited-minor': 7,
  'audited-major': 8,
  error: 9,
};

/** @typedef {'unseen'|'scoring'|'issue'|'clean'|'fixed'|'error'|'pending-ai'} LegacyMapCellStatus */

/** @param {LegacyMapCellStatus | string} st */
export function normalizeLegacyMapStatus(st) {
  switch (st) {
    case 'scoring':
      return 'auditing';
    case 'clean':
      return 'audited-clean';
    case 'issue':
      return 'audited-major';
    case 'fixed':
      return 'fixed';
    case 'pending-ai':
      return 'pending-ai';
    case 'error':
      return 'error';
    default:
      return /** @type {MapCellStatus} */ (st);
  }
}

/**
 * @param {MapCellStatus[]} statuses
 * @returns {MapCellStatus}
 */
function mapStatusRank(st) {
  const s = String(st || 'unseen');
  if (s === 'auditing-dim') return MAP_STATUS_RANK.auditing;
  if (s === 'fixing-dim') return MAP_STATUS_RANK.fixing;
  return MAP_STATUS_RANK[/** @type {keyof typeof MAP_STATUS_RANK} */ (s)] ?? 0;
}

export function aggregateMapStatus(statuses) {
  if (!statuses?.length) return 'unseen';
  let best = 'unseen';
  let rank = -1;
  for (const st of statuses) {
    const r = mapStatusRank(st);
    if (r > rank || (r === rank && String(st).endsWith('-dim') === false && String(best).endsWith('-dim'))) {
      rank = r;
      best = /** @type {MapCellStatus} */ (st);
    }
  }
  return best;
}

/**
 * @param {string} url
 */
export function shortPageLabel(url) {
  const s = String(url || '').trim();
  if (!s) return '—';
  try {
    const u = new URL(s);
    const path = u.pathname === '/' ? u.host : `${u.host}${u.pathname}`;
    return path.length > 28 ? `…${path.slice(-27)}` : path;
  } catch {
    return s.length > 28 ? `…${s.slice(-27)}` : s;
  }
}

/**
 * @param {{ ruleExecution?: { deterministic?: object[] } } | null | undefined} page
 * @param {number} detTotal
 */
export function countDetProgressOnPage(page, detTotal) {
  if (!page) return { done: 0, total: detTotal };
  const det = page.ruleExecution?.deterministic || [];
  const done = det.filter((t) => {
    const st = String(t.status || '');
    return st === 'ran' || st === 'skipped_no_findings_cache' || st === 'import_error' || st === 'threw';
  }).length;
  return { done, total: detTotal || det.length || done };
}

/**
 * @param {string} outDir
 */
export function progressMapPath(outDir) {
  return path.join(outDir, UX_LOOP_PROGRESS_MAP_FILE);
}

/**
 * @param {string} outDir
 */
export function readProgressMapSafe(outDir) {
  try {
    const raw = fs.readFileSync(progressMapPath(outDir), 'utf8');
    const o = JSON.parse(raw);
    return o && typeof o === 'object' ? o : null;
  } catch {
    return null;
  }
}

/**
 * @param {string} outDir
 * @param {object} model
 */
export function writeProgressMapAtomic(outDir, model) {
  const finalPath = progressMapPath(outDir);
  fs.mkdirSync(path.dirname(finalPath), { recursive: true });
  const tmp = `${finalPath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(model, null, 2)}\n`);
  fs.renameSync(tmp, finalPath);
}

/**
 * @param {Array<{ url?: string, score?: number, findings?: unknown[], error?: string, metrics?: object }>} pages
 * @param {Record<string, number>} thresholds
 * @param {Map<string, number>} [scoreByUrl]
 */
export function buildOrderedPageSets(pages, thresholds, scoreByUrl = new Map()) {
  /** @type {Array<{ id: number, url: string, score: number, status: MapCellStatus, majorPlus: number }>} */
  const rows = [];
  for (let i = 0; i < (pages || []).length; i += 1) {
    const p = pages[i];
    const url = String(p?.url || '').trim();
    if (!url) continue;
    const findings = p.findings || [];
    let status = /** @type {MapCellStatus} */ ('unseen');
    if (p.error) status = 'error';
    else if (pagePassesQualityGate(findings, thresholds)) status = 'clean';
    else status = 'issue';
    const score =
      scoreByUrl.has(url)
        ? scoreByUrl.get(url)
        : Number.isFinite(Number(p.score))
          ? Number(p.score)
          : scorePage(p.metrics || {}, findings);
    rows.push({
      id: i,
      url,
      score,
      status,
      majorPlus: countMajorPlus(findings),
    });
  }
  rows.sort((a, b) => {
    if (a.status === 'issue' && b.status !== 'issue') return -1;
    if (b.status === 'issue' && a.status !== 'issue') return 1;
    if (a.majorPlus !== b.majorPlus) return b.majorPlus - a.majorPlus;
    return a.score - b.score;
  });
  return rows.map((r, idx) => ({ ...r, order: idx }));
}

/**
 * @param {object} registry
 */
export function buildRuleSetRows(registry) {
  const det = listImplementedDeterministicRulesSync(registry).map((r) => ({
    id: r.id,
    lane: 'deterministic',
    short: String(r.id || '').replace(/^DET\./, '').slice(0, 12),
  }));
  const ai = (registry?.aiRules || []).map((r) => ({
    id: r.id,
    lane: 'ai',
    short: String(r.id || '').replace(/^AI\./, '').slice(0, 12),
  }));
  return { deterministic: det, ai };
}

/**
 * Group implemented rules into schematic rulesets (DET by registry `area`, AI by id prefix).
 * @param {object} registry
 */
export function buildRulesetGroups(registry) {
  /** @type {Map<string, string[]>} */
  const detByArea = new Map();
  for (const r of listImplementedDeterministicRulesSync(registry)) {
    const area = String(r.area || 'other');
    if (!detByArea.has(area)) detByArea.set(area, []);
    detByArea.get(area).push(r.id);
  }
  const deterministic = [...detByArea.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([area, ruleIds]) => ({
      id: `ruleset:det:${area}`,
      lane: 'deterministic',
      label: area,
      short: area,
      ruleIds,
    }));

  /** @type {Map<string, string[]>} */
  const aiByFamily = new Map();
  for (const r of registry?.aiRules || []) {
    const parts = String(r.id || '').split('.');
    const family = parts.length >= 2 ? parts[1].toLowerCase() : 'ai';
    if (!aiByFamily.has(family)) aiByFamily.set(family, []);
    aiByFamily.get(family).push(r.id);
  }
  const ai = [...aiByFamily.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([family, ruleIds]) => ({
      id: `ruleset:ai:${family}`,
      lane: 'ai',
      label: family,
      short: family,
      ruleIds,
    }));

  return { deterministic, ai, all: [...deterministic, ...ai] };
}

/**
 * @param {Array<{ id?: string, ruleIds?: string[] }>} rulesets
 * @param {string} ruleId
 */
export function resolveActiveRulesetId(rulesets, ruleId) {
  const rid = String(ruleId || '').trim();
  if (!rid) return null;
  for (const rs of rulesets || []) {
    if (rs.ruleIds?.includes(rid)) return rs.id || null;
  }
  return null;
}

/**
 * @param {Array<{ label?: string, short?: string, id?: string }>} ruleRows
 * @param {number} [minW]
 * @param {number} [maxW]
 */
/** @typedef {{ id: string, count: number, threshold: number, status: string }} GateSegment */

/**
 * @param {Array<{ id?: string, lane?: string, label?: string, ruleIds?: string[] }>} rulesets
 * @param {unknown[]} findings
 * @param {Record<string, number>} thresholds
 */
export function findingMatchesRuleset(finding, ruleset) {
  const rid = String(/** @type {{ ruleId?: string }} */ (finding).ruleId || '').trim();
  const ruleIds = ruleset.ruleIds || [];
  if (rid && ruleIds.includes(rid)) return true;
  if (ruleset.lane === 'ai' && rid.startsWith('AI.')) {
    const parts = rid.split('.');
    const family = parts.length >= 2 ? parts[1].toLowerCase() : '';
    return family === String(ruleset.label || '').toLowerCase();
  }
  if (ruleset.lane === 'deterministic') {
    const area = String(/** @type {{ area?: string }} */ (finding).area || '');
    return area === String(ruleset.label || '');
  }
  return false;
}

/**
 * 3-char defect summary for one ruleset column (worst severity + count).
 * @param {{ lane?: string, label?: string, ruleIds?: string[] }} ruleset
 * @param {unknown[]} findings
 * @param {Record<string, number>} thresholds
 */
export function formatRulesetDefectCell(ruleset, findings, thresholds) {
  const related = (findings || []).filter((f) => findingMatchesRuleset(f, ruleset));
  if (!related.length) return '  -';
  const counts = countBySeverity(related);
  const order = ['blocker', 'critical', 'major', 'warn', 'minor', 'trivial', 'cosmetic'];
  for (const id of order) {
    const n = counts[id] || 0;
    if (n <= 0) continue;
    const short = SEVERITY_GATE_SHORT[id] || id.slice(0, 2);
    const t = thresholds[id] ?? 0;
    const over = n > t;
    if (short.length === 1) {
      const num = n > 9 ? '+' : String(n);
      return `${short}${num} `.slice(0, 3);
    }
    if (over) return `${short}+`.slice(0, 3).padEnd(3, '+');
    if (n > 9) return `${short}+`;
    return `${short}${n}`.padStart(3, ' ');
  }
  return '  -';
}

/**
 * @param {Array<{ id?: string, lane?: string, label?: string, ruleIds?: string[] }>} rulesets
 * @param {object | null} audit
 * @param {Record<string, number>} thresholds
 */
export function buildRulesetDefectColumns(rulesets, audit, thresholds) {
  const flat = flattenAuditFindings(audit || {});
  return (rulesets || []).map((rs) => ({
    id: rs.id,
    label: String(rs.label || rs.short || ''),
    cell: formatRulesetDefectCell(rs, flat, thresholds),
  }));
}

/**
 * @param {object | null} audit
 * @param {Record<string, number>} thresholds
 * @returns {{ segments: GateSegment[], violationUnits: number, pass: boolean, total: number }}
 */
export function computeGateProgressFromCounts(counts, thresholds) {
  const gateEval = evaluateQualityGate(counts, thresholds);
  const segments = SEVERITY_LEVELS.map((id) => {
    const count = gateEval.counts[id] || 0;
    const threshold = gateEval.thresholds[id] ?? 0;
    let status = 'ok';
    if (count > threshold) status = 'over';
    else if (count > 0 && count === threshold) status = 'at_cap';
    return { id, count, threshold, status };
  });
  let violationUnits = 0;
  for (const v of gateEval.violations || []) {
    violationUnits += v.overBy;
  }
  return {
    segments,
    violationUnits,
    pass: gateEval.pass,
    total: gateEval.total,
  };
}

/**
 * @param {Record<string, unknown>} dashboardState
 * @param {object | null} audit
 * @param {Record<string, number>} thresholds
 */
export function computeLiveGateProgress(dashboardState, audit, thresholds) {
  const crawl =
    dashboardState.crawl && typeof dashboardState.crawl === 'object'
      ? /** @type {Record<string, unknown>} */ (dashboardState.crawl)
      : {};
  const crawlLabel = String(crawl.label || '');
  const phase = String(dashboardState.phase || '');
  const auditControls = usesAuditIssueControls(phase, crawlLabel);

  if (audit?.pages?.length && auditControls) {
    return computeGateProgressFromAudit(audit, thresholds);
  }
  if (!auditControls) {
    return computeGateProgressFromCounts({}, thresholds);
  }
  const sev =
    crawl.severityCounts && typeof crawl.severityCounts === 'object'
      ? /** @type {Record<string, number>} */ (crawl.severityCounts)
      : null;
  if (sev && Object.values(sev).some((n) => Number(n) > 0)) {
    return computeGateProgressFromCounts(sev, thresholds);
  }
  const qg =
    dashboardState.qualityGate && typeof dashboardState.qualityGate === 'object'
      ? /** @type {Record<string, unknown>} */ (dashboardState.qualityGate)
      : null;
  if (qg?.counts && typeof qg.counts === 'object' && !isScorerSourcedQualityGate(qg)) {
    return computeGateProgressFromCounts(/** @type {Record<string, number>} */ (qg.counts), thresholds);
  }
  return computeGateProgressFromCounts({}, thresholds);
}

export function computeGateProgressFromAudit(audit, thresholds) {
  const gateEval = audit
    ? evaluateAuditQualityGate(audit, thresholds)
    : evaluateQualityGate(countBySeverity([]), thresholds);
  return computeGateProgressFromCounts(gateEval.counts, thresholds);
}

/**
 * @param {Array<GateSegment>} segments
 */
export function gateSegmentsMaxFillPct(segments) {
  let max = 0;
  for (const seg of segments || []) {
    const t = Number(seg.threshold) || 0;
    const c = Number(seg.count) || 0;
    if (t <= 0) {
      if (c > 0) max = Math.max(max, 100);
      continue;
    }
    max = Math.max(max, Math.min(100, Math.round((c / t) * 100)));
  }
  return max;
}

export function rulesetLabelColWidth(ruleRows, minW = 12, maxW = 28) {
  let w = minW;
  for (const r of ruleRows || []) {
    const len = String(r.label || r.short || r.id || '').length;
    if (len > w) w = len;
  }
  return Math.min(maxW, w);
}

/** Visible width of leading space + `│` + 3-char defect summary on map rows. */
export const DEFRAG_MAP_DEFECT_COL_W = 4;
/** Visible width of `│` + 7×3-char gate threshold strip (matches renderGateThresholdStrip). */
export const DEFRAG_MAP_GATE_COL_W = 28;

const DEFRAG_MAP_LEAD_LEN = 4; // ` Map`

/**
 * Fixed defrag-map column layout: label | page grid (padded to gridSlotW) | defect.
 * @param {{ ruleRows?: object[], pageFragments?: object[], rulesetDefectCols?: object[] }} mapModel
 * @param {{ innerWidth?: number, labelColMax?: number }} [opts]
 */
export function computeDefragMapLayout(mapModel, opts = {}) {
  const innerW = Math.max(24, opts.innerWidth || 48);
  const ruleRows = mapModel.ruleRows || [];
  const fragments = mapModel.pageFragments || [];
  const defectCols = mapModel.rulesetDefectCols || [];
  const labelColW = rulesetLabelColWidth(ruleRows, 12, opts.labelColMax ?? 28);
  const defectStripW = defectCols.length > 0 ? DEFRAG_MAP_DEFECT_COL_W : 0;
  const gateStripW = mapModel.showGateColumn !== false ? DEFRAG_MAP_GATE_COL_W : 0;
  const gridSlotW = Math.max(
    4,
    innerW - DEFRAG_MAP_LEAD_LEN - 1 - labelColW - 1 - defectStripW - gateStripW,
  );
  const cols = Math.min(fragments.length || 1, gridSlotW);
  const rowPrefixBeforeGrid = 1 + labelColW + 1;
  const headerGridPad = Math.max(0, rowPrefixBeforeGrid - DEFRAG_MAP_LEAD_LEN);
  return {
    innerW,
    labelColW,
    gridSlotW,
    cols,
    defectStripW,
    gateStripW,
    mapLeadLen: DEFRAG_MAP_LEAD_LEN,
    headerGridPad,
    rowPrefixBeforeGrid,
  };
}

/**
 * @param {Array<{ col: number, urls: string[], label: string }>} fragments
 * @param {Array<{ lane: string, ruleIds: string[] }>} rulesets
 * @param {Array<{ url: string }>} pageSets
 * @param {Array<{ id: string, lane: string }>} ruleRows
 * @param {MapCellStatus[][]} matrix
 */
/**
 * @param {{ ruleIds?: string[], lane?: string }} ruleset
 * @param {{ url?: string, findings?: unknown[], error?: string, ruleExecution?: { deterministic?: object[] } }} page
 */
export function rulesetFindingsOnPage(ruleset, page) {
  return (page?.findings || []).filter((f) => findingMatchesRuleset(f, ruleset));
}

/**
 * @param {{ ruleIds?: string[] }} ruleset
 * @param {{ ruleExecution?: { deterministic?: object[] } }} page
 */
export function rulesetDeterministicRanCount(ruleset, page) {
  const det = page?.ruleExecution?.deterministic || [];
  const ids = new Set(ruleset.ruleIds || []);
  let ran = 0;
  for (const t of det) {
    const rid = String(t.ruleId || '');
    if (!ids.has(rid)) continue;
    const st = String(t.status || '');
    if (st === 'ran' || st === 'skipped_no_findings_cache' || st === 'import_error' || st === 'threw') {
      ran += 1;
    }
  }
  return ran;
}

/**
 * @param {string} outDir
 */
export function readPriorAuditPagesByUrl(outDir) {
  /** @type {Map<string, object>} */
  const m = new Map();
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(outDir, 'audit-data.previous.json'), 'utf8'));
    for (const p of raw?.pages || []) {
      const u = String(p.url || '').trim();
      if (u) m.set(u, p);
    }
  } catch {
    /* no prior */
  }
  return m;
}

/**
 * @param {Set<string>} scoredUrls
 * @param {string} outDir
 */
export function loadScoredUrlSet(outDir, scoredUrls = new Set()) {
  const urls = new Set(scoredUrls);
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(outDir, 'ux-quality-score.json'), 'utf8'));
    for (const row of raw?.pagesBrief || raw?.pages || []) {
      const u = String(row.url || row.href || '').trim();
      if (u) urls.add(u);
    }
  } catch {
    /* optional */
  }
  return urls;
}

/**
 * @param {{
 *   activeUrl?: string,
 *   activeRuleId?: string,
 *   crawlPhase?: string,
 *   phase?: string,
 *   auditInFlight?: boolean,
 *   isRemediation?: boolean,
 *   remediationActive?: boolean,
 *   priorPagesByUrl?: Map<string, object>,
 *   scoredUrls?: Set<string>,
 * }} ctx
 * @param {{ ruleIds?: string[], lane?: string }} ruleset
 * @param {string} pageUrl
 * @param {{ url?: string, findings?: unknown[], error?: string, ruleExecution?: object } | null} page
 * @param {Record<string, number>} thresholds
 */
export function classifyRulesetPageCell(ctx, ruleset, pageUrl, page, thresholds) {
  const url = String(pageUrl || '').trim();
  if (!url) return 'unseen';

  if (!page) {
    return ctx.scoredUrls?.has(url) ? 'scored' : 'unseen';
  }

  if (page.error) return 'error';

  const findings = rulesetFindingsOnPage(ruleset, page);
  const ran = rulesetDeterministicRanCount(ruleset, page);
  const total = (ruleset.ruleIds || []).length;
  const activeUrl = String(ctx.activeUrl || '').trim();
  const onActivePage = activeUrl && (activeUrl === url || activeUrl.includes(url) || url.includes(activeUrl));
  const activeRule = String(ctx.activeRuleId || '');
  const ruleInSet = (ruleset.ruleIds || []).includes(activeRule);

  if (ctx.isRemediation) {
    const prior = ctx.priorPagesByUrl?.get(url);
    const priorFindings = prior ? rulesetFindingsOnPage(ruleset, prior) : [];
    const hadIssue =
      priorFindings.length > 0 && !pagePassesQualityGate(priorFindings, thresholds);
    const nowClean = findings.length === 0 || pagePassesQualityGate(findings, thresholds);
    if (hadIssue && nowClean) {
      return ctx.remediationActive ? 'fixing' : 'fixed';
    }
  }

  if (ruleset.lane === 'ai') {
    if (onActivePage && ctx.auditInFlight && String(ctx.phase || '').includes('ai')) return 'auditing';
    if (!findings.length) return 'audited-clean';
    if (countMajorPlus(findings) > 0) return 'audited-major';
    return 'audited-minor';
  }

  if (onActivePage && ctx.auditInFlight) {
    if (ruleInSet || ran < total) return 'auditing';
  }

  if (ran <= 0) {
    return 'scored';
  }

  if (findings.length === 0) {
    return 'audited-clean';
  }
  if (countMajorPlus(findings) > 0) return 'audited-major';
  const onlyLow = findings.every((f) => !isMajorPlus(/** @type {{ severity?: string }} */ (f).severity));
  if (onlyLow) return 'audited-minor';
  return 'audited-major';
}

/**
 * @param {Array<{ url: string }>} pageSets
 * @param {Array<{ id?: string, lane?: string, label?: string, ruleIds?: string[] }>} rulesets
 * @param {Array<{ url?: string, findings?: unknown[], error?: string, ruleExecution?: object }>} pages
 * @param {Record<string, number>} thresholds
 * @param {Parameters<typeof classifyRulesetPageCell>[0]} ctx
 */
export function computeRulesetPageMatrix(pageSets, rulesets, pages, thresholds, ctx) {
  const byUrl = new Map();
  for (const p of pages || []) {
    const u = String(p.url || '').trim();
    if (u) byUrl.set(u, p);
  }
  return (rulesets || []).map((rs) =>
    pageSets.map((ps) => classifyRulesetPageCell(ctx, rs, ps.url, byUrl.get(ps.url) || null, thresholds)),
  );
}

/**
 * Collapse per-page ruleset matrix into page-fragment columns.
 * @param {Array<{ col: number, urls: string[] }>} fragments
 * @param {Array<{ url: string }>} pageSets
 * @param {MapCellStatus[][]} rulesetPageMatrix rows=rulesets, cols=pages
 */
export function computeRulesetFragmentMatrix(fragments, pageSets, rulesetPageMatrix) {
  /** @type {Map<number, number>} */
  const pageIndexToFrag = new Map();
  for (let fi = 0; fi < fragments.length; fi += 1) {
    for (const url of fragments[fi].urls) {
      const pi = pageSets.findIndex((p) => p.url === url);
      if (pi >= 0) pageIndexToFrag.set(pi, fi);
    }
  }

  return (rulesetPageMatrix || []).map((row) =>
    fragments.map((frag) => {
      /** @type {MapCellStatus[]} */
      const statuses = [];
      for (let pi = 0; pi < pageSets.length; pi += 1) {
        if (pageIndexToFrag.get(pi) !== frag.col) continue;
        statuses.push(row[pi] || 'unseen');
      }
      if (!frag.urls.length && frag.label) return 'unseen';
      return aggregateMapStatus(statuses);
    }),
  );
}

/**
 * @param {Record<string, unknown>} dashboardState
 * @param {Array<{ url: string, status?: string }>} pageSets
 * @param {object | null} audit
 * @param {object} registry
 * @param {{ maxSlots?: number, detTotal?: number }} [opts]
 */
export function buildPageSlotBars(dashboardState, pageSets, audit, registry, opts = {}) {
  const phase = String(dashboardState.phase || '').toLowerCase();
  const isAuditorPhase = phase.includes('ai') || phase.includes('remediation');
  const maxSlots = opts.maxSlots ?? (isAuditorPhase ? MAP_SLOT_AUDITOR : MAP_SLOT_SCORER);
  const detTotal =
    opts.detTotal ?? listImplementedDeterministicRulesSync(registry).length;
  const ap =
    dashboardState.auditProgress && typeof dashboardState.auditProgress === 'object'
      ? /** @type {Record<string, unknown>} */ (dashboardState.auditProgress)
      : {};
  const prp =
    ap.pageRuleProgress && typeof ap.pageRuleProgress === 'object'
      ? /** @type {Record<string, unknown>} */ (ap.pageRuleProgress)
      : {};
  const crawl =
    dashboardState.crawl && typeof dashboardState.crawl === 'object'
      ? /** @type {Record<string, unknown>} */ (dashboardState.crawl)
      : {};
  const activeUrl = String(prp.url || crawl.phaseDetail || '').trim();
  const pages = audit?.pages || [];
  const byUrl = new Map(pages.map((p) => [String(p.url || '').trim(), p]));

  /** @type {Array<{ label: string, pct: number, done: number, total: number, state: string }>} */
  const bars = [];

  if (activeUrl) {
    const p = byUrl.get(activeUrl);
    const liveDone = Number(prp.done);
    const liveTotal = Number(prp.total) || detTotal;
    const prog = countDetProgressOnPage(p, detTotal);
    const done = Number.isFinite(liveDone) && prp.url === activeUrl ? liveDone : prog.done;
    const total = Number.isFinite(liveTotal) && liveTotal > 0 ? liveTotal : prog.total;
    const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    bars.push({
      label: shortPageLabel(activeUrl),
      pct,
      done,
      total,
      state: 'active',
    });
  }

  for (const ps of pageSets) {
    if (bars.length >= maxSlots) break;
    if (ps.url === activeUrl) continue;
    const p = byUrl.get(ps.url);
    if (!p) continue;
    const { done, total } = countDetProgressOnPage(p, detTotal);
    const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    bars.push({
      label: shortPageLabel(ps.url),
      pct: done >= total && total > 0 ? 100 : pct,
      done,
      total,
      state: ps.status === 'issue' ? 'issue' : 'done',
    });
  }

  return { maxSlots, mode: isAuditorPhase ? 'auditor' : 'scorer', bars };
}

/**
 * Concurrent DET worker strip (maps done/total across up to N slots).
 * @param {{ done?: number, total?: number }} prp
 * @param {number} maxSlots
 * @param {number} detTotal
 */
export function buildRuleWorkerSlots(prp, maxSlots, detTotal) {
  const total = Number(prp.total) > 0 ? Number(prp.total) : detTotal;
  const done = Math.max(0, Number(prp.done) || 0);
  const slots = Math.max(1, maxSlots);
  const per = Math.max(1, Math.ceil(total / slots));
  /** @type {Array<{ pct: number, done: number, total: number }>} */
  const workers = [];
  for (let i = 0; i < slots; i += 1) {
    const start = i * per;
    const slotDone = Math.max(0, Math.min(per, done - start));
    workers.push({
      done: slotDone,
      total: per,
      pct: Math.round((slotDone / per) * 100),
    });
  }
  return workers;
}

/**
 * @param {Array<{ url: string, order: number }>} pageSets
 * @param {Array<{ id: string, lane: string }>} ruleRows
 * @param {Array<{ url?: string, findings?: unknown[], error?: string, ruleExecution?: { deterministic?: object[] } }>} pages
 * @param {Record<string, number>} thresholds
 */
export function computePageRuleMatrix(pageSets, ruleRows, pages, thresholds) {
  const byUrl = new Map();
  for (const p of pages || []) {
    const u = String(p.url || '').trim();
    if (u) byUrl.set(u, p);
  }
  /** @type {MapCellStatus[][]} */
  const matrix = [];
  for (const rule of ruleRows) {
    /** @type {MapCellStatus[]} */
    const row = [];
    for (const ps of pageSets) {
      const p = byUrl.get(ps.url);
      if (!p) {
        row.push('unseen');
        continue;
      }
      if (p.error) {
        row.push('error');
        continue;
      }
      if (rule.lane === 'ai') {
        const aiFindings = (p.findings || []).filter((f) => String(f.ruleId || '') === rule.id);
        if (!aiFindings.length && pagePassesQualityGate(p.findings || [], thresholds)) {
          row.push('pending-ai');
        } else if (countMajorPlus(aiFindings.length ? aiFindings : p.findings) > 0) {
          row.push('audited-major');
        } else if (aiFindings.length) {
          row.push('audited-minor');
        } else {
          row.push('audited-clean');
        }
        continue;
      }
      const det = p.ruleExecution?.deterministic || [];
      const hit = det.find((t) => String(t.ruleId) === rule.id);
      if (!hit) {
        row.push('scored');
        continue;
      }
      const st = String(hit.status || '');
      if (st === 'import_error' || st === 'threw') {
        row.push('error');
        continue;
      }
      const ruleFindings = (p.findings || []).filter((f) => String(f.ruleId || '') === rule.id);
      if (!ruleFindings.length) {
        row.push('audited-clean');
        continue;
      }
      if (countMajorPlus(ruleFindings) > 0) row.push('audited-major');
      else row.push('audited-minor');
    }
    matrix.push(row);
  }
  return matrix;
}

/**
 * Apply scoring overlay for active crawl page.
 * @param {MapCellStatus[][]} matrix
 * @param {number} pageSetIndex
 * @param {number} tick
 */
/**
 * Keep the TTY map compact: top issue-heavy DET rows + a few AI rows.
 * @param {Array<{ id: string, lane: string }>} ruleRows
 * @param {MapCellStatus[][]} matrix
 * @param {number} maxDet
 * @param {number} maxAi
 */
export function selectDisplayRuleRows(ruleRows, matrix, maxDet = 10, maxAi = 4) {
  /** @type {number[]} */
  const detIdx = [];
  /** @type {number[]} */
  const aiIdx = [];
  for (let i = 0; i < ruleRows.length; i += 1) {
    if (ruleRows[i].lane === 'ai') aiIdx.push(i);
    else detIdx.push(i);
  }
  const hot = new Set([
    'audited-major',
    'audited-minor',
    'error',
    'auditing',
    'fixing',
    'issue',
    'scoring',
  ]);
  const rowScore = (i) => (matrix[i] || []).filter((c) => hot.has(String(c))).length;
  detIdx.sort((a, b) => rowScore(b) - rowScore(a));
  aiIdx.sort((a, b) => rowScore(b) - rowScore(a));
  const pick = [...detIdx.slice(0, maxDet), ...aiIdx.slice(0, maxAi)].sort((a, b) => a - b);
  return {
    ruleRows: pick.map((i) => ruleRows[i]),
    matrix: pick.map((i) => matrix[i]),
    detCount: Math.min(maxDet, detIdx.length),
    aiCount: Math.min(maxAi, aiIdx.length),
  };
}

/**
 * Pulse `auditing` / `fixing` cells in one page column (fragment column index).
 * @param {MapCellStatus[][]} matrix
 * @param {number} colIndex
 * @param {number} tick
 */
export function overlayActiveColumnPulse(matrix, colIndex, tick) {
  if (colIndex < 0 || !matrix.length) return matrix;
  const pulseOn = Math.floor(tick / 2) % 2 === 0;
  return matrix.map((row) =>
    row.map((cell, col) => {
      if (col !== colIndex) return cell;
      if (cell === 'auditing') return pulseOn ? 'auditing' : 'auditing-dim';
      if (cell === 'fixing') return pulseOn ? 'fixing' : 'fixing-dim';
      if (pulseOn && cell === 'unseen' && tick % 4 === 0) return 'auditing';
      return cell;
    }),
  );
}

/** @deprecated use overlayActiveColumnPulse */
export function overlayScoringBlink(matrix, pageSetIndex, tick) {
  return overlayActiveColumnPulse(matrix, pageSetIndex, tick);
}

/**
 * @param {string} planText
 */
export function parseRemediationPlanTodos(planText) {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(String(planText || ''));
  if (!fm) return { total: 0, done: 0, inProgress: 0, pending: 0 };
  const body = fm[1];
  const re = /\n\s*- id:\s*(ux-[0-9a-z-]+)[\s\S]*?\n\s+status:\s*(\S+)/g;
  let total = 0;
  let done = 0;
  let inProgress = 0;
  let pending = 0;
  let m;
  while ((m = re.exec(body)) !== null) {
    total += 1;
    const st = String(m[2] || '').toLowerCase();
    if (st === 'completed' || st === 'complete' || st === 'done') done += 1;
    else if (st === 'in_progress' || st === 'in-progress') inProgress += 1;
    else pending += 1;
  }
  return { total, done, inProgress, pending };
}

/**
 * @param {string} outDir
 */
export function readRemediationTodoProgress(outDir) {
  const planPath = path.join(outDir, 'forge-ux-remediation.plan.md');
  try {
    const text = fs.readFileSync(planPath, 'utf8');
    return parseRemediationPlanTodos(text);
  } catch {
    return { total: 0, done: 0, inProgress: 0, pending: 0 };
  }
}

/**
 * @param {Record<string, unknown>} state
 * @param {object | null} audit
 * @param {{ tick?: number }} [opts]
 */
export function computeAuditPhaseBar(state, audit, opts = {}) {
  let thresholds;
  try {
    thresholds = loadQualityGateThresholdsFromEnv(opts.env || process.env);
  } catch {
    thresholds = loadQualityGateThresholdsFromEnv({});
  }
  const crawl = state.crawl && typeof state.crawl === 'object' ? /** @type {Record<string, unknown>} */ (state.crawl) : {};
  const phase = String(state.phase || '');
  const crawlLabel = String(crawl.label || '');
  if (isScorerWatchPhase(phase, crawlLabel)) {
    const gate = computeGateProgressFromCounts({}, thresholds);
    return {
      label: 'Audit',
      primary: { kind: 'backlog', current: 0, cap: 0, pct: 0 },
      secondary: { kind: 'major_plus', current: 0, cap: 0 },
      capReached: false,
      note: 'audit after scorer',
      gateSegments: gate.segments,
      gateFillPct: 0,
      gateViolationUnits: 0,
      gatePass: true,
    };
  }
  const ap =
    state.auditProgress && typeof state.auditProgress === 'object'
      ? /** @type {Record<string, unknown>} */ (state.auditProgress)
      : {};
  const stopBacklog = Number(ap.stopAfterBacklog ?? crawl.stopAfterBacklog ?? 10);
  const stopMj = Number(ap.stopAfterMajorPlus ?? crawl.stopAfterMajorPlus ?? 10);
  let findingAccum = Number(ap.findingAccum);
  let majorPlusAccum = Number(ap.majorPlusAccum);
  if (!Number.isFinite(findingAccum) && audit) {
    findingAccum = flattenAuditFindings(audit).length;
  }
  if (!Number.isFinite(majorPlusAccum) && audit) {
    majorPlusAccum = countMajorPlus(flattenAuditFindings(audit));
  }
  if (!Number.isFinite(findingAccum)) findingAccum = 0;
  if (!Number.isFinite(majorPlusAccum)) majorPlusAccum = 0;

  const backlogPct = stopBacklog > 0 ? Math.min(100, Math.round((findingAccum / stopBacklog) * 100)) : 0;
  const mjPct = stopMj > 0 ? Math.min(100, Math.round((majorPlusAccum / stopMj) * 100)) : 0;
  const primary =
    backlogPct >= mjPct
      ? { kind: 'backlog', current: findingAccum, cap: stopBacklog, pct: backlogPct }
      : { kind: 'major_plus', current: majorPlusAccum, cap: stopMj, pct: mjPct };
  const gate = computeLiveGateProgress(state, audit, thresholds);
  const gateSegmentFilled = (gate.segments || []).some(
    (seg) => seg.status === 'at_cap' || seg.status === 'over',
  );
  const capReached =
    (primary.current >= primary.cap && primary.cap > 0) || gateSegmentFilled;
  return {
    label: 'Audit',
    primary,
    secondary:
      primary.kind === 'backlog'
        ? { kind: 'major_plus', current: majorPlusAccum, cap: stopMj }
        : { kind: 'backlog', current: findingAccum, cap: stopBacklog },
    capReached,
    note: capReached
      ? gateSegmentFilled && !(primary.current >= primary.cap && primary.cap > 0)
        ? 'gate segment full → remed'
        : 'cap reached → remediation next'
      : '',
    gateSegments: gate.segments,
    gateFillPct: gateSegmentsMaxFillPct(gate.segments),
    gateViolationUnits: gate.violationUnits,
    gatePass: gate.pass,
  };
}

/**
 * @param {Record<string, unknown>} state
 * @param {string} outDir
 */
export function computeRemediationPhaseBar(state, outDir, audit = null, opts = {}) {
  const todos = readRemediationTodoProgress(outDir);
  const cycle = String(state.cyclePhase || '').toLowerCase();
  const agentDone = cycle.includes('remediation_done') || cycle === 'build' || cycle.includes('build_');
  let done = todos.done;
  let total = todos.total;
  if (total <= 0 && cycle.includes('remediation')) {
    total = 1;
    done = agentDone ? 1 : 0;
  }
  const todoPct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : agentDone ? 100 : 0;
  let thresholds;
  try {
    thresholds = loadQualityGateThresholdsFromEnv(opts.env || process.env);
  } catch {
    thresholds = loadQualityGateThresholdsFromEnv({});
  }
  const gate = computeLiveGateProgress(state, audit, thresholds);
  const gateFillPct = gateSegmentsMaxFillPct(gate.segments);
  const gateFixPct = gate.pass ? 100 : Math.max(0, 100 - gateFillPct);
  const combinedPct =
    total > 0 ? Math.round(todoPct * 0.4 + gateFixPct * 0.6) : gateFixPct;
  return {
    label: 'Remediation',
    done,
    total,
    inProgress: todos.inProgress,
    pending: todos.pending,
    pct: combinedPct,
    todoPct,
    gateFixPct,
    gateSegments: gate.segments,
    gateViolationUnits: gate.violationUnits,
    gatePass: gate.pass,
    note: gate.pass
      ? 'gate clear'
      : total > 0
        ? `${Math.max(0, total - done)} todos · ${gate.violationUnits} gate units over`
        : agentDone
          ? 'agent finished'
          : 'running agent',
  };
}

/**
 * @param {string} outDir
 * @param {Record<string, unknown>} dashboardState
 * @param {object | null} audit
 * @param {{ tick?: number, env?: Record<string, string | undefined> }} [opts]
 */
export function buildLoopWatchProgressMap(outDir, dashboardState, audit, opts = {}) {
  const env = opts.env || process.env;
  const tick = Number(opts.tick) || 0;
  const mapCols = Math.max(12, Math.min(56, Number(opts.mapCols) || Number(opts.innerWidth) || 40));
  let thresholds;
  try {
    thresholds = loadQualityGateThresholdsFromEnv(env);
  } catch {
    thresholds = loadQualityGateThresholdsFromEnv({});
  }

  /** @type {Map<string, number>} */
  const scoreByUrl = new Map();
  try {
    const scoreRaw = JSON.parse(fs.readFileSync(path.join(outDir, 'ux-quality-score.json'), 'utf8'));
    for (const row of scoreRaw?.pages || scoreRaw?.pageScores || []) {
      const u = String(row.url || row.href || '').trim();
      if (u && Number.isFinite(Number(row.score))) scoreByUrl.set(u, Number(row.score));
    }
  } catch {
    /* optional */
  }

  const pages = audit?.pages || [];
  const pageSets = buildOrderedPageSets(pages, thresholds, scoreByUrl);
  const registry = loadRegistrySync();
  const rulesets = buildRulesetGroups(registry);
  const ruleRows = rulesets.all;
  const scoredUrls = loadScoredUrlSet(outDir, new Set(scoreByUrl.keys()));
  const priorPagesByUrl = readPriorAuditPagesByUrl(outDir);
  const crawlEarly =
    dashboardState.crawl && typeof dashboardState.crawl === 'object'
      ? /** @type {Record<string, unknown>} */ (dashboardState.crawl)
      : {};
  const apEarly =
    dashboardState.auditProgress && typeof dashboardState.auditProgress === 'object'
      ? /** @type {Record<string, unknown>} */ (dashboardState.auditProgress)
      : {};
  const prpEarly =
    apEarly.pageRuleProgress && typeof apEarly.pageRuleProgress === 'object'
      ? /** @type {Record<string, unknown>} */ (apEarly.pageRuleProgress)
      : {};
  const phaseEarly = String(dashboardState.phase || '').toLowerCase();
  const mapCtx = {
    activeUrl: String(crawlEarly.phaseDetail || prpEarly.url || '').trim(),
    activeRuleId: String(prpEarly.ruleId || '').trim(),
    crawlPhase: String(crawlEarly.crawlPhase || ''),
    phase: phaseEarly,
    auditInFlight: crawlEarly.crawlPhase === 'page' || crawlEarly.crawlPhase === 'launch',
    isRemediation: phaseEarly.includes('remediation'),
    remediationActive: phaseEarly.includes('remediation_agent') && !phaseEarly.includes('remediation_done'),
    priorPagesByUrl,
    scoredUrls,
  };
  let matrix = computeRulesetPageMatrix(pageSets, rulesets.all, pages, thresholds, mapCtx);
  const crawlForBudget =
    dashboardState.crawl && typeof dashboardState.crawl === 'object'
      ? /** @type {Record<string, unknown>} */ (dashboardState.crawl)
      : {};
  const pagesField = String(crawlForBudget.pages || '');
  const budgetMatch = /(\d+)\s*\/\s*(\d+)/.exec(pagesField);
  const pageBudget = budgetMatch ? Number(budgetMatch[2]) : Math.max(pageSets.length, pages.length, 1);
  const mapUrlCatalog = collectMapUrlCatalog(outDir, pageSets);
  const pageFragments = buildPageFragments(pageSets, pageBudget, mapCols, {
    scorerUrls: mapUrlCatalog,
  });
  const pageGroupPlan =
    mapUrlCatalog.length >= 3 ? buildPageGroupPlan(mapUrlCatalog) : null;
  let rulesetMatrix = computeRulesetFragmentMatrix(pageFragments, pageSets, matrix);
  const { deterministic } = buildRuleSetRows(registry);
  const detTotal = deterministic.length;
  const pageSlotBars = buildPageSlotBars(dashboardState, pageSets, audit, registry, { detTotal });
  const apForWorkers =
    dashboardState.auditProgress && typeof dashboardState.auditProgress === 'object'
      ? /** @type {Record<string, unknown>} */ (dashboardState.auditProgress)
      : {};
  const prpForWorkers =
    apForWorkers.pageRuleProgress && typeof apForWorkers.pageRuleProgress === 'object'
      ? /** @type {Record<string, unknown>} */ (apForWorkers.pageRuleProgress)
      : {};
  const ruleWorkerSlots = buildRuleWorkerSlots(
    prpForWorkers,
    pageSlotBars.maxSlots,
    detTotal,
  );

  const crawl = dashboardState.crawl && typeof dashboardState.crawl === 'object'
    ? /** @type {Record<string, unknown>} */ (dashboardState.crawl)
    : {};
  const activeUrl = String(crawl.phaseDetail || '').trim();
  let activePageIndex = pageSets.findIndex((p) => p.url === activeUrl || activeUrl.endsWith(p.url));
  if (activePageIndex < 0 && activeUrl) {
    activePageIndex = pageSets.findIndex((p) => activeUrl.includes(p.url) || p.url.includes(activeUrl));
  }
  const phase = String(dashboardState.phase || '').toLowerCase();
  const pulseCol =
    activePageIndex >= 0
      ? findFragmentCol(pageFragments, pageSets, activePageIndex)
      : pageSets.length
        ? findFragmentCol(pageFragments, pageSets, tick % pageSets.length)
        : -1;
  const shouldPulse =
    mapCtx.auditInFlight || mapCtx.remediationActive || phase.includes('scorer');
  if (shouldPulse && pulseCol >= 0) {
    rulesetMatrix = overlayActiveColumnPulse(rulesetMatrix, pulseCol, tick);
  }
  if (shouldPulse && activePageIndex >= 0) {
    matrix = overlayActiveColumnPulse(matrix, activePageIndex, tick);
  }

  const rulesetDefectCols = buildRulesetDefectColumns(rulesets.all, audit, thresholds);
  const auditBar = computeAuditPhaseBar(dashboardState, audit, opts);
  const remediationBar = computeRemediationPhaseBar(dashboardState, outDir, audit, opts);

  const display = selectDisplayRuleRows(ruleRows, matrix, 10, 4);

  return {
    generatedAt: new Date().toISOString(),
    pageSets,
    pageFragments,
    pageGroupPlan,
    mapUrlCatalogSize: mapUrlCatalog.length,
    showGateColumn: true,
    pageBudget,
    mapCols: pageFragments.length,
    rulesets: rulesets.all,
    rulesetMatrix,
    rulesetDetCount: rulesets.deterministic.length,
    rulesetAiCount: rulesets.ai.length,
    rulesetDefectCols,
    pageSlotBars,
    ruleWorkerSlots,
    ruleRows: rulesets.all,
    matrix: rulesetMatrix,
    mapCtx,
    ruleRowsFull: ruleRows,
    matrixFull: matrix,
    detCount: rulesets.deterministic.length,
    aiCount: rulesets.ai.length,
    displaySample: display,
    activePageIndex,
    activeRulesetId: resolveActiveRulesetId(rulesets.all, String(prpForWorkers.ruleId || '')),
    auditBar,
    remediationBar,
    mapTick: tick,
  };
}

/**
 * @param {Array<{ col: number, urls: string[] }>} fragments
 * @param {Array<{ url: string }>} pageSets
 * @param {number} pageSetIndex
 */
function findFragmentCol(fragments, pageSets, pageSetIndex) {
  if (pageSetIndex < 0) return -1;
  const url = String(pageSets[pageSetIndex]?.url || '').trim();
  if (!url) return -1;
  for (const frag of fragments) {
    if (frag.urls.includes(url)) return frag.col;
  }
  return -1;
}

/**
 * @param {string} outDir
 * @param {Record<string, unknown>} dashboardState
 * @param {object | null} audit
 * @param {{ tick?: number }} [opts]
 */
export function refreshProgressMapArtifact(outDir, dashboardState, audit, opts = {}) {
  const model = buildLoopWatchProgressMap(outDir, dashboardState, audit, opts);
  writeProgressMapAtomic(outDir, model);
  return model;
}
