/**
 * Defragmentation-style progress map + phase bars for loop-watch dashboard.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  countBySeverity,
  DEFAULT_STOP_AFTER_GATE_VIOLATION_UNITS,
  evaluateAuditQualityGate,
  evaluateQualityGate,
  flattenAuditFindings,
  loadQualityGateThresholdsFromEnv,
  pagePassesQualityGate,
  SEVERITY_GATE_SHORT,
} from './quality-gate.js';
import { countMajorPlus, isMajorPlus, SEVERITY_LEVELS } from './severity.js';
import { scorePage } from './scoring.js';
import { buildOverlayMatrix, toMapCellBaseStatus } from './loop-watch-map-cell-model.js';
import { readLiveAuditPages } from './audit-live-snapshot.js';
import {
  buildRemediationWatchContext,
  syncRemediationProgressFromAgentLog,
} from './remediation-watch-progress.js';
import {
  buildPageFragments,
  buildPageFragmentsEven,
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
 * @typedef {'unseen'|'scored'|'scoring'|'auditing'|'auditing-dim'|'audited-clean'|'audited-major'|'audited-minor'|'fixing'|'fixing-dim'|'fixed'|'error'|'pending-ai'} MapCellStatus
 */

/** Worst status wins when aggregating fragments. */
const MAP_STATUS_RANK = {
  unseen: 0,
  scored: 1,
  scoring: 2,
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
      return 'scored';
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
 * Least-progressed status (keeps fragment columns gray until every page in the column is audited).
 * @param {MapCellStatus[]} statuses
 */
export function aggregateMapStatusByMinProgress(statuses) {
  if (!statuses?.length) return 'unseen';
  let best = 'unseen';
  let rank = 999;
  for (const st of statuses) {
    const r = mapCellProgressRank(st);
    if (r < rank) {
      rank = r;
      best = /** @type {MapCellStatus} */ (st);
    }
  }
  return best;
}

const MAP_CELL_IN_FLIGHT = new Set(['auditing', 'auditing-dim', 'scoring', 'fixing', 'fixing-dim']);

/**
 * Collapse per-page statuses into one fragment column (coverage-aware).
 * @param {MapCellStatus[]} statuses
 * @param {{ activeUrl?: string, fragmentUrls?: string[] }} [opts]
 */
export function aggregateFragmentMapStatus(statuses, opts = {}) {
  if (!statuses?.length) return 'unseen';
  const activeUrl = String(opts.activeUrl || '').trim();
  const fragUrls = (opts.fragmentUrls || []).map((u) => String(u || '').trim()).filter(Boolean);
  if (activeUrl && fragUrls.includes(activeUrl)) {
    const idx = fragUrls.indexOf(activeUrl);
    if (idx >= 0 && statuses[idx]) {
      const one = statuses[idx];
      if (MAP_CELL_IN_FLIGHT.has(one)) return one;
    }
  }
  const allAudited = statuses.every((s) => mapCellProgressRank(s) >= MAP_PROGRESS_RANK['audited-clean']);
  if (!allAudited) return aggregateMapStatusByMinProgress(statuses);
  return aggregateMapStatus(statuses);
}

/** Higher = more audit coverage (for cross-iteration merge; not worst-case aggregation). */
const MAP_PROGRESS_RANK = {
  unseen: 0,
  scored: 1,
  scoring: 2,
  'pending-ai': 2,
  auditing: 3,
  'auditing-dim': 3,
  fixing: 4,
  'fixing-dim': 4,
  'audited-clean': 5,
  'audited-minor': 6,
  'audited-major': 7,
  fixed: 8,
  error: 9,
};

/**
 * @param {MapCellStatus | string} st
 */
export function mapCellProgressRank(st) {
  const s = String(st || 'unseen');
  if (s === 'auditing-dim') return MAP_PROGRESS_RANK.auditing;
  if (s === 'fixing-dim') return MAP_PROGRESS_RANK.fixing;
  return MAP_PROGRESS_RANK[/** @type {keyof typeof MAP_PROGRESS_RANK} */ (s)] ?? 0;
}

const MAP_CELL_ACTIVE = new Set(['auditing', 'auditing-dim', 'fixing', 'fixing-dim']);

/**
 * Preserve prior coverage when a new iteration rebuilds from a partial audit snapshot.
 * @param {MapCellStatus | string} prior
 * @param {MapCellStatus | string} current
 * @returns {MapCellStatus}
 */
const MAP_AI_PRE_AUDIT = new Set(['audited-clean', 'audited-minor', 'audited-major']);

/**
 * @param {MapCellStatus | string} prior
 * @param {MapCellStatus | string} current
 * @param {{ aiLane?: boolean, urlAiDone?: boolean }} [opts]
 */
export function mergeMapCellProgress(prior, current, opts = {}) {
  const p = toMapCellBaseStatus(String(prior || 'unseen'));
  const c = toMapCellBaseStatus(String(current || 'unseen'));
  if (opts.scoringInFlight || opts.auditMapActive === false) {
    const scoringLane = new Set(['unseen', 'scored', 'scoring']);
    const pRank = mapCellProgressRank(/** @type {MapCellStatus} */ (p));
    const cRank = mapCellProgressRank(/** @type {MapCellStatus} */ (c));
    if (scoringLane.has(c) && pRank > MAP_PROGRESS_RANK.scoring) {
      return /** @type {MapCellStatus} */ (c);
    }
    if (scoringLane.has(p) && cRank > MAP_PROGRESS_RANK.scoring) {
      return /** @type {MapCellStatus} */ (p);
    }
    return cRank >= pRank ? /** @type {MapCellStatus} */ (c) : /** @type {MapCellStatus} */ (p);
  }
  if (opts.aiLane && !opts.urlAiDone) {
    if (c === 'pending-ai' || p === 'pending-ai') return 'pending-ai';
    if (MAP_AI_PRE_AUDIT.has(p) || MAP_AI_PRE_AUDIT.has(c)) return 'pending-ai';
  }
  return mapCellProgressRank(c) >= mapCellProgressRank(p)
    ? /** @type {MapCellStatus} */ (c)
    : /** @type {MapCellStatus} */ (p);
}

/**
 * Ephemeral process overlay for one ruleset × page (see docs/LOOP-WATCH-MAP-CELLS.md).
 * @param {Parameters<typeof classifyRulesetPageCell>[0]} ctx
 * @param {{ ruleIds?: string[], lane?: string, id?: string }} ruleset
 * @param {string} pageUrl
 * @param {{ url?: string } | null} page
 */
export function resolveMapCellOverlay(ctx, ruleset, pageUrl, page) {
  const url = String(pageUrl || '').trim();
  if (!url || !page) return null;
  const activeUrl = String(ctx.activeUrl || '').trim();
  const onActivePage = activeUrl && (activeUrl === url || activeUrl.includes(url) || url.includes(activeUrl));
  if (!onActivePage) return null;
  const activeRule = String(ctx.activeRuleId || '');
  const ruleInSet = (ruleset.ruleIds || []).includes(activeRule);
  const activeRuleset = isCtxActiveRuleset(ctx, ruleset, activeRule);

  if (ctx.isRemediation && ctx.remediationActive) {
    const hot =
      ctx.remediationActiveUrls?.has(url) || ctx.remediationPathMatchUrls?.has(url);
    if (!hot) return null;
    const pathRule = guessRuleIdFromRepoPath(String(ctx.remediationActivePath || ''));
    const pathRsId = pathRule ? resolveActiveRulesetId([ruleset], pathRule) : null;
    if ((activeRule && ruleInSet) || (pathRsId && ruleset.id === pathRsId)) return 'fixing';
    return null;
  }

  if (ruleset.lane === 'ai') {
    const phase = String(ctx.phase || '').toLowerCase();
    const aiPhase =
      ctx.aiAuditInFlight || phase.includes('ai_audit') || phase.includes('ai-audit');
    if (aiPhase && activeRuleset) return 'auditing';
    return null;
  }

  if (ctx.scoringInFlight && activeRuleset) return 'scoring';
  if (ctx.auditInFlight && activeRuleset && activeRule && ruleInSet) return 'auditing';
  return null;
}

/** @param {MapCellStatus} a @param {MapCellStatus} b */
export function mergeCellStatuses(a, b) {
  const left = /** @type {MapCellStatus} */ (a || 'unseen');
  const right = /** @type {MapCellStatus} */ (b || 'unseen');
  const fresh = right !== 'unseen' && right !== 'scored' ? right : left;
  const stale = left !== 'unseen' && left !== 'scored' ? left : right;
  if (mapStatusRank(fresh) >= mapStatusRank(stale)) return fresh;
  return stale;
}

/**
 * @param {string} phase
 */
export function isAiAuditPhaseComplete(phase) {
  const p = String(phase || '').toLowerCase();
  return (
    p.includes('ai_audit_done')
    || p.includes('ai_audit_pass')
    || p.includes('ai_audit_complete')
    || p.includes('until_quality_gate_pass')
    || p.includes('until_all_bars_pass')
  );
}

/**
 * Merge prior-iteration audit pages with the live snapshot (current wins per URL).
 * @param {object | null} audit
 * @param {string} outDir
 */
export function mergeAuditPagesForMap(audit, outDir) {
  /** @type {Map<string, object>} */
  const byUrl = new Map();
  for (const [, p] of readPriorAuditPagesByUrl(outDir)) {
    const u = String(p.url || '').trim();
    if (u) byUrl.set(u, p);
  }
  const priorMap = readProgressMapSafe(outDir);
  for (const p of priorMap?.accumulatedPages || []) {
    const u = String(p?.url || '').trim();
    if (u && !byUrl.has(u)) byUrl.set(u, p);
  }
  for (const p of readLiveAuditPages(outDir)) {
    const u = String(p.url || '').trim();
    if (u) byUrl.set(u, p);
  }
  for (const p of audit?.pages || []) {
    const u = String(p?.url || '').trim();
    if (u) byUrl.set(u, p);
  }
  return [...byUrl.values()];
}

/**
 * @param {MapCellStatus[][] | null | undefined} priorMatrix
 * @param {Array<{ col?: number, label?: string, urls?: string[] }>} priorFragments
 * @param {Array<{ col?: number, label?: string, urls?: string[] }>} fragments
 * @param {Array<{ id?: string }>} rulesets
 * @param {MapCellStatus[][]} nextMatrix
 */
export function mergeAccumulatedRulesetMatrix(
  priorMatrix,
  priorFragments,
  fragments,
  rulesets,
  nextMatrix,
  aiAuditedUrls = new Set(),
  mergeOpts = {},
) {
  if (!priorMatrix?.length || !priorFragments?.length) return nextMatrix;
  const fragKey = (frag) => String(frag?.label ?? frag?.col ?? '');
  const priorColByKey = new Map(priorFragments.map((f, i) => [fragKey(f), i]));
  return (rulesets || []).map((rs, ri) =>
    fragments.map((frag, ci) => {
      const key = fragKey(frag);
      const priorCol = priorColByKey.get(key);
      const priorSt =
        priorCol != null && priorMatrix[ri] ? priorMatrix[ri][priorCol] : 'unseen';
      const nextSt = nextMatrix[ri]?.[ci] || 'unseen';
      const urls = (frag.urls || []).map((u) => String(u || '').trim()).filter(Boolean);
      const urlAiDone = urls.length > 0 && urls.every((u) => aiAuditedUrls.has(u));
      return mergeMapCellProgress(
        /** @type {MapCellStatus} */ (priorSt),
        /** @type {MapCellStatus} */ (nextSt),
        {
          aiLane: rs.lane === 'ai',
          urlAiDone,
          scoringInFlight: Boolean(mergeOpts.scoringInFlight),
          auditMapActive: mergeOpts.auditMapActive !== false,
        },
      );
    }),
  );
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
/**
 * Best-effort DET rule hint from a repo-relative path the agent is touching.
 * @param {string} repoPath
 */
export function guessRuleIdFromRepoPath(repoPath) {
  const p = String(repoPath || '').toLowerCase();
  if (!p) return '';
  if (/a11y|accessib|axe/.test(p)) return 'DET.A11Y';
  if (/hash|registry|visual-catalog|catalog/.test(p)) return 'DET.HASH';
  if (/contract|design/.test(p)) return 'DET.CONTRACT';
  if (/nav|menu|breadcrumb/.test(p)) return 'DET.NAV';
  if (/cta|button|conversion/.test(p)) return 'DET.CTA';
  if (/hero|first-screen|landing/.test(p)) return 'DET.FIRST';
  if (/readab|typography|font/.test(p)) return 'DET.READ';
  if (/metadata|seo|title/.test(p)) return 'DET.META';
  return '';
}

export function resolveActiveRulesetId(rulesets, ruleId) {
  const rid = String(ruleId || '').trim();
  if (!rid) return null;
  for (const rs of rulesets || []) {
    if (rs.ruleIds?.includes(rid)) return rs.id || null;
  }
  return null;
}

/**
 * Ruleset row that should show the sole in-flight map animation for this tick.
 * @param {Parameters<typeof classifyRulesetPageCell>[0]} ctx
 * @param {{ id?: string, ruleIds?: string[] }} ruleset
 * @param {string} [activeRule]
 */
export function resolveCtxActiveRulesetId(ctx, ruleset, activeRule = '') {
  const rid = String(activeRule || ctx.activeRuleId || '').trim();
  if (rid) return resolveActiveRulesetId(ctx.rulesets || [ruleset], rid);
  if (ctx.scoringInFlight && ctx.defaultScoringRulesetId) {
    return String(ctx.defaultScoringRulesetId);
  }
  if (ctx.aiAuditInFlight && ctx.defaultAiRulesetId) {
    return String(ctx.defaultAiRulesetId);
  }
  return null;
}

/**
 * @param {Parameters<typeof classifyRulesetPageCell>[0]} ctx
 * @param {{ id?: string, ruleIds?: string[] }} ruleset
 * @param {string} [activeRule]
 */
export function isCtxActiveRuleset(ctx, ruleset, activeRule = '') {
  const rsId = resolveCtxActiveRulesetId(ctx, ruleset, activeRule);
  return Boolean(rsId && ruleset?.id && rsId === ruleset.id);
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
/**
 * Findings that belong to an AI ruleset (AI rule ids only — never DET/warn rows).
 * @param {{ ruleIds?: string[], lane?: string }} ruleset
 * @param {{ findings?: unknown[] }} page
 */
export function rulesetAiFindingsOnPage(ruleset, page) {
  if (ruleset.lane !== 'ai') return [];
  return (page?.findings || []).filter((f) => {
    const rid = String(/** @type {{ ruleId?: string }} */ (f).ruleId || '').trim();
    if (!rid.startsWith('AI.')) return false;
    return findingMatchesRuleset(f, ruleset);
  });
}

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
export function formatRulesetDefectCell(ruleset, findings, thresholds, opts = {}) {
  const pool =
    ruleset.lane === 'ai'
      ? (findings || []).filter((f) => String(/** @type {{ ruleId?: string }} */ (f).ruleId || '').startsWith('AI.'))
      : findings || [];
  const related = pool.filter((f) => findingMatchesRuleset(f, ruleset));
  if (!related.length) {
    if (ruleset.lane === 'ai' && !opts.aiAuditComplete) return ' ○';
    return '  -';
  }
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
export function buildRulesetDefectColumns(rulesets, audit, thresholds, opts = {}) {
  const pages = audit?.pages || [];
  return (rulesets || []).map((rs) => {
    const related = pages.flatMap((p) => rulesetFindingsOnPage(rs, p));
    return {
      id: rs.id,
      label: String(rs.label || rs.short || ''),
      cell: formatRulesetDefectCell(rs, related, thresholds, opts),
    };
  });
}

/**
 * Per-ruleset sitewide gate segments (same shape as header gate strip).
 * @param {Array<{ id?: string, lane?: string, label?: string, ruleIds?: string[] }>} rulesets
 * @param {object | null} audit
 * @param {Record<string, number>} thresholds
 */
export function buildRulesetGateSegmentRows(rulesets, audit, thresholds) {
  const pages = audit?.pages || [];
  return (rulesets || []).map((rs) => {
    const related =
      rs.lane === 'ai'
        ? pages.flatMap((p) => rulesetAiFindingsOnPage(rs, p))
        : pages.flatMap((p) => rulesetFindingsOnPage(rs, p));
    return computeGateProgressFromCounts(countBySeverity(related), thresholds).segments;
  });
}

/**
 * URLs that finished a deterministic audit pass (excludes the page currently crawling).
 * @param {Array<{ url?: string, findings?: unknown[], ruleExecution?: object }>} pages
 * @param {{ activeUrl?: string, auditInFlight?: boolean }} [opts]
 */
export function buildAuditedUrlSet(pages, opts = {}) {
  const activeUrl = String(opts.activeUrl || '').trim();
  const auditInFlight = Boolean(opts.auditInFlight);
  const out = new Set();
  for (const p of pages || []) {
    const u = String(p.url || '').trim();
    if (!u) continue;
    if (auditInFlight && activeUrl) {
      if (u === activeUrl || activeUrl.includes(u) || u.includes(activeUrl)) continue;
    }
    const det = p?.ruleExecution?.deterministic;
    const hasFindings = (p.findings || []).length > 0;
    if (Array.isArray(det) && det.length > 0) {
      out.add(u);
      continue;
    }
    if (hasFindings) out.add(u);
  }
  return out;
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
 * URLs that completed a post-deterministic AI audit batch (manifest / aggregate output).
 * @param {string} outDir
 */
export function readAiAuditedUrlSet(outDir) {
  /** @type {Set<string>} */
  const urls = new Set();
  const add = (u) => {
    const s = String(u || '').trim();
    if (s) urls.add(s);
  };
  const aiDir = path.join(outDir, 'ai-audit');
  try {
    const data = JSON.parse(fs.readFileSync(path.join(aiDir, 'ai-audit-data.json'), 'utf8'));
    for (const b of data.batches || []) {
      if (b && b.ok === false) continue;
      for (const u of b.urls || []) add(u);
    }
  } catch {
    /* optional */
  }
  /** @type {Map<string, string>} */
  let statusByBatchId = new Map();
  try {
    const st = JSON.parse(fs.readFileSync(path.join(aiDir, 'batch-status.json'), 'utf8'));
    for (const b of st.batches || []) {
      const id = String(b.batchId || '').trim();
      if (id) statusByBatchId.set(id, String(b.status || '').toLowerCase());
    }
  } catch {
    /* optional */
  }
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(aiDir, 'manifest.json'), 'utf8'));
    for (const b of manifest.batches || []) {
      const id = String(b.batchId || path.basename(String(b.path || ''), '.json')).trim();
      const st = statusByBatchId.get(id) || String(b.status || '').toLowerCase();
      if (st === 'error' || st === 'failed') continue;
      if (st === 'done' || st === 'complete' || st === 'running' || st === 'in_progress' || !st) {
        for (const u of b.urls || []) add(u);
      }
    }
  } catch {
    /* optional */
  }
  return urls;
}

/**
 * @param {object | null | undefined} priorModel
 */
export function extractRulesetUrlStatusMap(priorModel) {
  /** @type {Map<string, MapCellStatus>} */
  const out = new Map();
  if (!priorModel) return out;
  const rulesets = priorModel.rulesets || priorModel.ruleRows || [];
  const fragments = priorModel.pageFragments || [];
  const matrix = priorModel.rulesetMatrix || priorModel.matrix || [];
  for (let ri = 0; ri < rulesets.length; ri += 1) {
    const rsId = String(rulesets[ri]?.id || ri);
    const row = matrix[ri] || [];
    for (let fi = 0; fi < fragments.length; fi += 1) {
      const frag = fragments[fi];
      const st = /** @type {MapCellStatus} */ (row[fi] ?? row[frag.col] ?? 'unseen');
      for (const url of frag.urls || []) {
        const u = String(url || '').trim();
        if (!u) continue;
        const key = `${rsId}\0${u}`;
        const prev = out.get(key);
        out.set(key, prev ? mergeMapCellProgress(prev, st) : st);
      }
    }
  }
  return out;
}

/**
 * @param {object | null | undefined} priorModel
 * @param {Array<{ id?: string }>} rulesets
 * @param {Array<{ col?: number, label?: string, urls?: string[] }>} pageFragments
 * @param {MapCellStatus[][]} currentMatrix
 */
export function mergeRulesetMatricesWithPrior(
  priorModel,
  rulesets,
  pageFragments,
  currentMatrix,
  aiAuditedUrls = new Set(),
) {
  if (!priorModel) return currentMatrix;
  const priorByUrl = extractRulesetUrlStatusMap(priorModel);
  if (!priorByUrl.size) return currentMatrix;
  const priorFrags = priorModel.pageFragments || [];
  const priorMatrix = priorModel.rulesetMatrix || priorModel.matrix || [];
  return (currentMatrix || []).map((row, ri) => {
    const rs = rulesets[ri];
    const rsId = String(rs?.id || ri);
    const aiLane = rs?.lane === 'ai';
    const priorRow = priorMatrix[ri];
    return (row || []).map((cell, fi) => {
      const frag = pageFragments[fi];
      let merged = /** @type {MapCellStatus} */ (cell || 'unseen');
      for (const url of frag?.urls || []) {
        const u = String(url || '').trim();
        if (!u) continue;
        const prev = priorByUrl.get(`${rsId}\0${u}`);
        if (prev) {
          merged = mergeMapCellProgress(prev, merged, {
            aiLane,
            urlAiDone: aiAuditedUrls.has(u),
            auditMapActive: priorModel.auditMapActive !== false,
          });
        }
      }
      if (!frag?.urls?.length) {
        const priorFrag = priorFrags.find(
          (f) => f.col === frag?.col || (f.label && f.label === frag?.label),
        );
        if (priorFrag) {
          const pfi = priorFrags.indexOf(priorFrag);
          const prev = priorRow?.[pfi] ?? priorRow?.[priorFrag.col];
          if (prev) merged = mergeMapCellProgress(prev, merged, { aiLane, urlAiDone: false });
        }
      }
      return merged;
    });
  });
}

/**
 * @param {Array<{ url?: string }>} auditPages
 * @param {Map<string, object>} priorPagesByUrl
 * @param {object | null | undefined} priorMap
 */
export function mergePagesForProgressMap(auditPages, priorPagesByUrl, priorMap) {
  /** @type {Map<string, object>} */
  const byUrl = new Map();
  for (const p of auditPages || []) {
    const u = String(p?.url || '').trim();
    if (u) byUrl.set(u, p);
  }
  for (const [u, p] of priorPagesByUrl || []) {
    if (!byUrl.has(u)) byUrl.set(u, p);
  }
  for (const ps of priorMap?.pageSets || []) {
    const u = String(ps?.url || '').trim();
    if (!u || byUrl.has(u)) continue;
    const priorPage = priorPagesByUrl?.get(u);
    if (priorPage) byUrl.set(u, priorPage);
  }
  return [...byUrl.values()];
}

/**
 * @param {Array<{ url: string, order?: number }>} pageSets
 * @param {object | null | undefined} priorMap
 */
export function augmentPageSetsFromPriorMap(pageSets, priorMap) {
  const byUrl = new Map((pageSets || []).map((p) => [p.url, p]));
  for (const ps of priorMap?.pageSets || []) {
    const u = String(ps?.url || '').trim();
    if (!u || byUrl.has(u)) continue;
    byUrl.set(u, {
      url: u,
      order: byUrl.size,
      score: Number(ps.score) || 0,
      status: ps.status === 'issue' ? 'issue' : 'clean',
      majorPlus: Number(ps.majorPlus) || 0,
    });
  }
  return [...byUrl.values()];
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
 *   aiAuditInFlight?: boolean,
 *   rulesets?: Array<{ id?: string, ruleIds?: string[] }>,
 *   defaultScoringRulesetId?: string,
 *   defaultAiRulesetId?: string,
 *   isRemediation?: boolean,
 *   remediationActive?: boolean,
 *   remediationActiveUrls?: Set<string>,
 *   remediationDoneUrls?: Set<string>,
 *   remediationPathMatchUrls?: Set<string>,
 *   activeTodoId?: string,
 *   remediationActivePath?: string,
 *   priorPagesByUrl?: Map<string, object>,
 *   scoredUrls?: Set<string>,
 *   aiAuditedUrls?: Set<string>,
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
  const activeRuleset = isCtxActiveRuleset(ctx, ruleset, activeRule);

  if (ctx.isRemediation) {
    const prior = ctx.priorPagesByUrl?.get(url) || page;
    const priorFindings = prior ? rulesetFindingsOnPage(ruleset, prior) : [];
    const hadIssue =
      priorFindings.length > 0 && !pagePassesQualityGate(priorFindings, thresholds);
    if (!hadIssue) {
      return 'audited-clean';
    }
    if (ctx.remediationDoneUrls?.has(url)) {
      return 'fixed';
    }
    if (ctx.remediationActive) {
      const hot =
        ctx.remediationActiveUrls?.has(url) || ctx.remediationPathMatchUrls?.has(url);
      if (hot) {
        const pathRule = guessRuleIdFromRepoPath(String(ctx.remediationActivePath || ''));
        const pathRulesetId = pathRule ? resolveActiveRulesetId([ruleset], pathRule) : null;
        return 'audited-major';
      }
      return 'audited-major';
    }
    const nowClean = findings.length === 0 || pagePassesQualityGate(findings, thresholds);
    if (nowClean) return 'fixed';
    return 'audited-major';
  }

  if (ruleset.lane === 'ai') {
    const phase = String(ctx.phase || '').toLowerCase();
    const aiPhase =
      ctx.aiAuditInFlight
      || phase.includes('ai_audit')
      || phase.includes('ai-audit');
    if (onActivePage && aiPhase && !activeRuleset) {
      return 'pending-ai';
    }
    const urlAiDone = ctx.aiAuditedUrls?.has(url) === true;
    const aiFindings = rulesetAiFindingsOnPage(ruleset, page);
    if (!urlAiDone) return 'pending-ai';
    if (!aiFindings.length) return 'audited-clean';
    if (countMajorPlus(aiFindings) > 0) return 'audited-major';
    return 'audited-minor';
  }

  if (ctx.auditMapActive === false && ruleset.lane !== 'ai') {
    return ctx.scoredUrls?.has(url) ? 'scored' : 'unseen';
  }

  if (onActivePage && ctx.auditInFlight) {
    if (activeRuleset && activeRule && ruleInSet) return 'scored';
    return ctx.scoredUrls?.has(url) ? 'scored' : 'unseen';
  }

  const urlAudited =
    ctx.auditedUrls?.has(url) === true
    || (ruleset.lane !== 'ai' && (findings.length > 0 || ran > 0));

  if (!urlAudited) {
    return ctx.scoredUrls?.has(url) ? 'scored' : 'unseen';
  }

  if (ran <= 0) {
    return ctx.scoredUrls?.has(url) ? 'scored' : 'unseen';
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
 * @param {Parameters<typeof classifyRulesetPageCell>[0]} [ctx]
 * @param {Array<{ id?: string, ruleIds?: string[] }>} [rulesets]
 */
export function computeRulesetFragmentMatrix(fragments, pageSets, rulesetPageMatrix, ctx = {}, rulesets = []) {
  /** @type {Map<number, number>} */
  const pageIndexToFrag = new Map();
  for (let fi = 0; fi < fragments.length; fi += 1) {
    for (const url of fragments[fi].urls) {
      const pi = pageSets.findIndex((p) => p.url === url);
      if (pi >= 0) pageIndexToFrag.set(pi, fi);
    }
  }
  const activeUrl = String(ctx.activeUrl || '').trim();
  const activeRuleId = String(ctx.activeRuleId || '').trim();
  const activeRsId = activeRuleId ? resolveActiveRulesetId(rulesets, activeRuleId) : null;

  return (rulesetPageMatrix || []).map((row, ri) => {
    const rs = rulesets[ri];
    const ruleInSet = activeRuleId && (rs?.ruleIds || []).includes(activeRuleId);
    const rowIsActiveRuleset = Boolean(activeRsId && rs?.id === activeRsId);
    const hotRemediation =
      ctx.isRemediation
      && ctx.remediationActive
      && (ctx.remediationActiveUrls?.has(activeUrl) || ctx.remediationPathMatchUrls?.has(activeUrl));
    const hotAudit = ctx.auditInFlight && activeUrl;
    const hotScoring = ctx.scoringInFlight && activeUrl;
    return fragments.map((frag) => {
      const fragUrls = (frag.urls || []).map((u) => String(u || '').trim()).filter(Boolean);
      if (!fragUrls.length && frag.label) return 'unseen';

      const fragHasActive =
        activeUrl && fragUrls.some((u) => u === activeUrl || activeUrl.includes(u) || u.includes(activeUrl));
      if (fragHasActive && rs) {
        const pi = pageSets.findIndex(
          (p) => activeUrl === p.url || activeUrl.includes(p.url) || p.url.includes(activeUrl),
        );
        if (pi >= 0) {
          if ((hotAudit || hotScoring) && rowIsActiveRuleset) {
            return toMapCellBaseStatus(row[pi] || 'unseen');
          }
          if (hotRemediation) {
            const pathRule = guessRuleIdFromRepoPath(String(ctx.remediationActivePath || ''));
            const pathRsId = pathRule ? resolveActiveRulesetId(rulesets, pathRule) : null;
            if (ruleInSet || (pathRsId && rs.id === pathRsId)) return row[pi] || 'unseen';
          }
        }
      }

      /** @type {MapCellStatus[]} */
      const statuses = [];
      for (let pi = 0; pi < pageSets.length; pi += 1) {
        if (pageIndexToFrag.get(pi) !== frag.col) continue;
        statuses.push(row[pi] || 'unseen');
      }
      return aggregateFragmentMapStatus(statuses, { activeUrl, fragmentUrls: fragUrls });
    });
  });
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
  const isRemediationPhase = phase.includes('remediation');
  const isAuditorPhase = phase.includes('ai') || isRemediationPhase;
  const maxSlots = opts.maxSlots ?? (isAuditorPhase ? MAP_SLOT_AUDITOR : MAP_SLOT_SCORER);
  const outDir = String(opts.outDir || '').trim();

  if (isRemediationPhase && outDir) {
    const rem = buildRemediationWatchContext(outDir, dashboardState, pageSets);
    /** @type {Array<{ label: string, pct: number, done: number, total: number, state: string }>} */
    const bars = [];
    if (rem.activePath) {
      bars.push({
        label: shortPageLabel(rem.activePath),
        pct: 50,
        done: 0,
        total: 1,
        state: 'active',
      });
    } else if (rem.activeTodoId) {
      bars.push({
        label: `${rem.activeTodoId} · agent`,
        pct: 40,
        done: rem.done,
        total: Math.max(1, rem.total),
        state: 'active',
      });
    }
    for (const t of rem.todos) {
      if (bars.length >= maxSlots) break;
      if (t.id === rem.activeTodoId) continue;
      const st = t.status;
      if (st !== 'in_progress' && st !== 'in-progress' && st !== 'pending') continue;
      const label = t.planFile ? shortPageLabel(t.planFile) : t.id;
      bars.push({
        label,
        pct: st === 'in_progress' || st === 'in-progress' ? 30 : 0,
        done: 0,
        total: 1,
        state: 'queued',
      });
    }
    return {
      maxSlots,
      mode: 'remediation',
      bars,
      remediation: rem,
    };
  }
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
        if (!aiFindings.length) row.push('pending-ai');
        else if (countMajorPlus(aiFindings) > 0) row.push('audited-major');
        else row.push('audited-minor');
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
 * Pulse one matrix cell (ruleset row × fragment column) for in-flight states.
 * @param {MapCellStatus[][]} matrix
 * @param {number} rowIndex
 * @param {number} colIndex
 * @param {number} tick
 */
export function overlayActiveCellPulse(matrix, rowIndex, colIndex, tick) {
  if (rowIndex < 0 || colIndex < 0 || !matrix.length) return matrix;
  return matrix.map((row, ri) =>
    row.map((cell, ci) => {
      if (ri !== rowIndex || ci !== colIndex) return cell;
      if (cell === 'fixing' || cell === 'fixing-dim') {
        const phase = Math.floor(tick / 2) % 2 === 0;
        return phase ? 'fixing' : 'fixing-dim';
      }
      return cell;
    }),
  );
}

/** @deprecated use overlayActiveCellPulse — column-wide pulse misrepresents single-page audit */
export function overlayActiveColumnPulse(matrix, colIndex, tick) {
  return matrix;
}

/** @deprecated use overlayActiveCellPulse */
export function overlayScoringBlink(matrix, pageSetIndex, tick) {
  return overlayActiveCellPulse(matrix, 0, pageSetIndex, tick);
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
  const stopBacklog = Number(ap.stopAfterBacklog ?? crawl.stopAfterBacklog ?? 0);
  const stopMj = Number(ap.stopAfterMajorPlus ?? crawl.stopAfterMajorPlus ?? 10);
  const stopGateVu = Number(
    ap.stopAfterGateViolationUnits ?? crawl.stopAfterGateViolationUnits ?? DEFAULT_STOP_AFTER_GATE_VIOLATION_UNITS,
  );
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

  let gateViolationUnits = Number(ap.gateViolationUnits);
  const gate = computeLiveGateProgress(state, audit, thresholds);
  if (!Number.isFinite(gateViolationUnits)) gateViolationUnits = gate.violationUnits;
  const gateVuPct =
    stopGateVu > 0 ? Math.min(100, Math.round((gateViolationUnits / stopGateVu) * 100)) : 0;
  const backlogPct = stopBacklog > 0 ? Math.min(100, Math.round((findingAccum / stopBacklog) * 100)) : 0;
  const mjPct = stopMj > 0 ? Math.min(100, Math.round((majorPlusAccum / stopMj) * 100)) : 0;
  const gateHaltReached = stopGateVu > 0 && gateViolationUnits > stopGateVu;
  const primary = {
    kind: 'gate_violations',
    current: gateViolationUnits,
    cap: stopGateVu,
    pct: gateVuPct,
  };
  const capReached = gateHaltReached;
  return {
    label: 'Audit',
    primary,
    secondary:
      backlogPct >= mjPct
        ? { kind: 'backlog', current: findingAccum, cap: stopBacklog }
        : { kind: 'major_plus', current: majorPlusAccum, cap: stopMj },
    capReached,
    note: capReached
      ? `gate +${gateViolationUnits} > ${stopGateVu} → remed`
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
  const remCtx = buildRemediationWatchContext(outDir, state, []);
  const todos = {
    total: remCtx.total,
    done: remCtx.done,
    inProgress: remCtx.inProgress,
    pending: remCtx.pending,
  };
  const cycle = String(state.cyclePhase || '').toLowerCase();
  const agentDone = cycle.includes('remediation_done') || cycle === 'build' || cycle.includes('build_');
  let done = todos.done;
  let total = todos.total;
  if (total <= 0 && cycle.includes('remediation')) {
    total = 1;
    done = agentDone ? 1 : 0;
  }
  const todoPct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : agentDone ? 100 : 0;
  let note = '';
  if (remCtx.activeTodoId) note = `${remCtx.activeTodoId}`;
  if (remCtx.activePath) {
    note = note ? `${note} · ${shortPageLabel(remCtx.activePath)}` : shortPageLabel(remCtx.activePath);
  } else if (remCtx.activeKind) {
    note = note ? `${note} · ${remCtx.activeKind}` : remCtx.activeKind;
  }
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
    note:
      note
      || (gate.pass
        ? 'gate clear'
        : total > 0
          ? `${Math.max(0, total - done)} todos · ${gate.violationUnits} gate units over`
          : agentDone
            ? 'agent finished'
            : 'running agent'),
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

  const priorProgressMap = readProgressMapSafe(outDir);
  let pages = mergeAuditPagesForMap(audit, outDir);
  const crawlEarlyForPages =
    dashboardState.crawl && typeof dashboardState.crawl === 'object'
      ? /** @type {Record<string, unknown>} */ (dashboardState.crawl)
      : {};
  const apEarlyForPages =
    dashboardState.auditProgress && typeof dashboardState.auditProgress === 'object'
      ? /** @type {Record<string, unknown>} */ (dashboardState.auditProgress)
      : {};
  const prpEarlyForPages =
    apEarlyForPages.pageRuleProgress && typeof apEarlyForPages.pageRuleProgress === 'object'
      ? /** @type {Record<string, unknown>} */ (apEarlyForPages.pageRuleProgress)
      : {};
  const activeUrlForPages = String(
    crawlEarlyForPages.phaseDetail || prpEarlyForPages.url || '',
  ).trim();
  if (
    activeUrlForPages
    && !pages.some((p) => String(p.url || '').trim() === activeUrlForPages)
  ) {
    pages = [
      ...pages,
      {
        url: activeUrlForPages,
        findings: [],
        ruleExecution: { deterministic: [] },
      },
    ];
  }
  let pageSets = buildOrderedPageSets(pages, thresholds, scoreByUrl);
  pageSets = augmentPageSetsFromPriorMap(pageSets, priorProgressMap);
  pageSets = buildOrderedPageSets(
    pageSets.map((ps) => {
      const page = pages.find((p) => String(p.url || '').trim() === ps.url);
      return page || { url: ps.url, findings: [], score: ps.score };
    }),
    thresholds,
    scoreByUrl,
  );
  const aiAuditedUrls = readAiAuditedUrlSet(outDir);
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
  const crawlLabelEarly = String(crawlEarly.label || '');
  const remediationActive =
    phaseEarly.includes('remediation_agent') && !phaseEarly.includes('remediation_done');
  if (remediationActive) {
    try {
      syncRemediationProgressFromAgentLog(outDir);
    } catch {
      /* ignore */
    }
  }
  const remWatch = remediationActive
    ? buildRemediationWatchContext(outDir, dashboardState, pageSets)
    : null;
  const auditInFlight =
    crawlEarly.crawlPhase === 'page'
    && !crawlLabelEarly.toLowerCase().includes('ux-score');
  const scoringInFlight =
    crawlEarly.crawlPhase === 'page'
    && crawlLabelEarly.toLowerCase().includes('ux-score');
  const aiAuditInFlight =
    phaseEarly.includes('ai_audit')
    || phaseEarly.includes('ai-audit');
  const mapCtx = {
    activeUrl: String(
      remWatch?.activePath
      || crawlEarly.phaseDetail
      || prpEarly.url
      || '',
    ).trim(),
    activeRuleId: String(prpEarly.ruleId || '').trim(),
    activeTodoId: remWatch?.activeTodoId || '',
    crawlPhase: String(crawlEarly.crawlPhase || ''),
    phase: phaseEarly,
    auditInFlight,
    scoringInFlight,
    aiAuditInFlight,
    rulesets: rulesets.all,
    defaultScoringRulesetId: rulesets.deterministic[0]?.id || '',
    defaultAiRulesetId: rulesets.ai[0]?.id || '',
    isRemediation: phaseEarly.includes('remediation'),
    remediationActive,
    remediationActiveUrls: remWatch?.activeUrls,
    remediationDoneUrls: remWatch?.completedUrls,
    remediationPathMatchUrls: remWatch?.pathMatchUrls,
    remediationActivePath: remWatch?.activePath || '',
    aiAuditComplete: isAiAuditPhaseComplete(phaseEarly),
    priorPagesByUrl,
    scoredUrls,
    auditedUrls: buildAuditedUrlSet(pages, {
      activeUrl: String(
        remWatch?.activePath
        || crawlEarly.phaseDetail
        || prpEarly.url
        || '',
      ).trim(),
      auditInFlight,
    }),
    aiAuditedUrls,
    auditMapActive: usesAuditIssueControls(phaseEarly, crawlLabelEarly),
  };
  let matrix = computeRulesetPageMatrix(pageSets, rulesets.all, pages, thresholds, mapCtx);
  const crawlForBudget =
    dashboardState.crawl && typeof dashboardState.crawl === 'object'
      ? /** @type {Record<string, unknown>} */ (dashboardState.crawl)
      : {};
  const pagesField = String(crawlForBudget.pages || '');
  const budgetMatch = /(\d+)\s*\/\s*(\d+)/.exec(pagesField);
  const pageBudget = Math.max(
    budgetMatch ? Number(budgetMatch[2]) : 0,
    pageSets.length,
    pages.length,
    Number(priorProgressMap?.pageBudget) || 0,
    1,
  );
  const mapUrlCatalog = collectMapUrlCatalog(outDir, pageSets);
  for (const ps of priorProgressMap?.pageSets || []) {
    const u = String(ps?.url || '').trim();
    if (u && !mapUrlCatalog.includes(u)) mapUrlCatalog.push(u);
  }
  let pageFragments;
  let pageGroupPlan = null;
  try {
    pageFragments = buildPageFragments(pageSets, pageBudget, mapCols, {
      scorerUrls: mapUrlCatalog,
    });
    pageGroupPlan =
      mapUrlCatalog.length >= 3 ? buildPageGroupPlan(mapUrlCatalog) : null;
  } catch {
    pageFragments = buildPageFragmentsEven(pageSets, pageBudget, mapCols);
    pageGroupPlan = null;
  }
  let rulesetMatrix = computeRulesetFragmentMatrix(pageFragments, pageSets, matrix, mapCtx, rulesets.all);
  rulesetMatrix = mergeAccumulatedRulesetMatrix(
    priorProgressMap?.accumulatedRulesetMatrix || priorProgressMap?.rulesetMatrix,
    priorProgressMap?.pageFragments,
    pageFragments,
    rulesets.all,
    rulesetMatrix,
    aiAuditedUrls,
    { scoringInFlight, auditMapActive: mapCtx.auditMapActive },
  );
  rulesetMatrix = mergeRulesetMatricesWithPrior(
    priorProgressMap,
    rulesets.all,
    pageFragments,
    rulesetMatrix,
    aiAuditedUrls,
  );
  const { deterministic } = buildRuleSetRows(registry);
  const detTotal = deterministic.length;
  const pageSlotBars = buildPageSlotBars(dashboardState, pageSets, audit, registry, {
    detTotal,
    outDir,
  });
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
  const activeUrl = String(crawl.phaseDetail || mapCtx.activeUrl || '').trim();
  let activePageIndex = pageSets.findIndex((p) => p.url === activeUrl || activeUrl.endsWith(p.url));
  if (activePageIndex < 0 && activeUrl) {
    activePageIndex = pageSets.findIndex((p) => activeUrl.includes(p.url) || p.url.includes(activeUrl));
  }
  if (activePageIndex < 0 && remWatch) {
    for (let i = 0; i < pageSets.length; i += 1) {
      const u = pageSets[i].url;
      if (remWatch.activeUrls.has(u) || remWatch.pathMatchUrls.has(u)) {
        activePageIndex = i;
        break;
      }
    }
  }
  const phase = String(dashboardState.phase || '').toLowerCase();
  const pulseCol =
    activePageIndex >= 0 ? findFragmentCol(pageFragments, pageSets, activePageIndex) : -1;
  const activeRuleId = String(mapCtx.activeRuleId || '').trim();
  let pulseRow = -1;
  if (activeRuleId) {
    const rsId = resolveActiveRulesetId(rulesets.all, activeRuleId);
    pulseRow = rulesets.all.findIndex((rs) => rs.id === rsId);
  } else if (mapCtx.auditInFlight || mapCtx.scoringInFlight) {
    const scoringOrDetId =
      mapCtx.scoringInFlight
        ? mapCtx.defaultScoringRulesetId
        : rulesets.deterministic[0]?.id;
    pulseRow = rulesets.all.findIndex((rs) => rs.id === scoringOrDetId);
  } else if (mapCtx.aiAuditInFlight) {
    pulseRow = rulesets.all.findIndex((rs) => rs.id === mapCtx.defaultAiRulesetId);
  } else if (mapCtx.remediationActive && remWatch?.activePath) {
    const rsId = resolveActiveRulesetId(rulesets.all, guessRuleIdFromRepoPath(remWatch.activePath));
    pulseRow = rulesets.all.findIndex((rs) => rs.id === rsId);
  }
  const shouldPulse =
    mapCtx.auditInFlight
    || mapCtx.scoringInFlight
    || mapCtx.aiAuditInFlight
    || mapCtx.remediationActive;
  rulesetMatrix = rulesetMatrix.map((row) =>
    (row || []).map((cell) => toMapCellBaseStatus(/** @type {MapCellStatus} */ (cell))),
  );
  /** @type {import('./loop-watch-map-cell-model.js').MapCellOverlay | null} */
  let activeOverlay = null;
  if (shouldPulse && pulseCol >= 0 && pulseRow >= 0) {
    if (mapCtx.scoringInFlight) activeOverlay = 'scoring';
    else if (mapCtx.auditInFlight) activeOverlay = 'auditing';
    else if (mapCtx.aiAuditInFlight) activeOverlay = 'auditing';
    else if (mapCtx.remediationActive) activeOverlay = 'fixing';
  }
  const rulesetMatrixOverlay = buildOverlayMatrix(rulesetMatrix, {
    row: pulseRow,
    col: pulseCol,
    overlay: activeOverlay,
  });

  const activeRulesetIdRemediation =
    mapCtx.remediationActive && remWatch?.activePath
      ? resolveActiveRulesetId(rulesets.all, guessRuleIdFromRepoPath(remWatch.activePath))
      : null;
  const activeRulesetIdResolved =
    (pulseRow >= 0 ? rulesets.all[pulseRow]?.id : null)
    || activeRulesetIdRemediation
    || resolveActiveRulesetId(rulesets.all, activeRuleId);

  const rulesetDefectCols = buildRulesetDefectColumns(rulesets.all, { pages }, thresholds, {
    aiAuditComplete: mapCtx.aiAuditComplete,
  });
  const rulesetGateSegmentRows = buildRulesetGateSegmentRows(rulesets.all, { pages }, thresholds);
  const auditBar = computeAuditPhaseBar(dashboardState, audit, opts);
  const remediationBar = computeRemediationPhaseBar(dashboardState, outDir, audit, opts);

  const display = selectDisplayRuleRows(ruleRows, matrix, 10, 4);

  return {
    generatedAt: new Date().toISOString(),
    accumulatedPages: pages,
    accumulatedRulesetMatrix: rulesetMatrix,
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
    rulesetGateSegmentRows,
    scoringInFlight: mapCtx.scoringInFlight,
    auditInFlight: mapCtx.auditInFlight,
    pageSlotBars,
    ruleWorkerSlots,
    ruleRows: rulesets.all,
    matrix:     rulesetMatrix,
    rulesetMatrixOverlay,
    auditMapActive: mapCtx.auditMapActive,
    mapCtx,
    ruleRowsFull: ruleRows,
    matrixFull: matrix,
    detCount: rulesets.deterministic.length,
    aiCount: rulesets.ai.length,
    displaySample: display,
    activePageIndex,
    activeRulesetId:
      activeRulesetIdResolved
      || resolveActiveRulesetId(rulesets.all, String(prpForWorkers.ruleId || '')),
    remediationWatch: remWatch,
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
