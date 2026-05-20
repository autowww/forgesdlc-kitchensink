/**
 * Per-severity quality gate for Forge Website UX remediation loops.
 * A run passes when each severity count is <= its threshold (site-wide on visited pages).
 */

import { SEVERITY_LEVELS } from './severity.js';

/** @typedef {'blocker'|'critical'|'major'|'warn'|'minor'|'trivial'|'cosmetic'} SeverityId */

/** Default remediation loop gate (counts must be <= threshold). */
export const DEFAULT_QUALITY_GATE_THRESHOLDS = {
  blocker: 0,
  critical: 0,
  major: 0,
  warn: 5,
  minor: 10,
  trivial: 15,
  cosmetic: 100,
};

/** Legacy Major+-only gate (Blocker/Critical/Major must be 0; lower severities uncapped). */
export const LEGACY_MAJOR_ONLY_QUALITY_GATE_THRESHOLDS = {
  blocker: 0,
  critical: 0,
  major: 0,
  warn: Number.MAX_SAFE_INTEGER,
  minor: Number.MAX_SAFE_INTEGER,
  trivial: Number.MAX_SAFE_INTEGER,
  cosmetic: Number.MAX_SAFE_INTEGER,
};

/** Short labels for dashboard / logs (order matches SEVERITY_LEVELS). */
export const SEVERITY_GATE_SHORT = {
  blocker: 'B',
  critical: 'C',
  major: 'Mj',
  warn: 'W',
  minor: 'Mi',
  trivial: 'Tr',
  cosmetic: 'Cos',
};

/**
 * @param {unknown} findings
 * @returns {Record<SeverityId, number>}
 */
export function countBySeverity(findings) {
  /** @type {Record<SeverityId, number>} */
  const counts = {};
  for (const id of SEVERITY_LEVELS) counts[id] = 0;
  for (const f of findings || []) {
    const k = String(f?.severity || 'major').toLowerCase();
    if (SEVERITY_LEVELS.includes(/** @type {SeverityId} */ (k))) {
      counts[/** @type {SeverityId} */ (k)] += 1;
    } else {
      counts.major += 1;
    }
  }
  return counts;
}

/**
 * @param {Record<string, unknown>} [raw]
 * @returns {Record<SeverityId, number>}
 */
export function normalizeThresholds(raw) {
  const base = { ...DEFAULT_QUALITY_GATE_THRESHOLDS };
  if (!raw || typeof raw !== 'object') return base;
  for (const id of SEVERITY_LEVELS) {
    const v = raw[id];
    if (v == null || v === '') continue;
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) base[id] = Math.floor(n);
  }
  return base;
}

/**
 * Parse `0,0,0,5,10,15,100` (blocker…cosmetic).
 * @param {string} csv
 */
export function parseQualityGateCsv(csv) {
  const parts = String(csv || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (parts.length !== SEVERITY_LEVELS.length) {
    throw new Error(
      `FORGE_UX_QUALITY_GATE must have ${SEVERITY_LEVELS.length} comma-separated integers (blocker…cosmetic); got ${parts.length}`,
    );
  }
  /** @type {Record<string, number>} */
  const out = {};
  SEVERITY_LEVELS.forEach((id, i) => {
    const n = Number(parts[i]);
    if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid quality gate threshold for ${id}: ${parts[i]}`);
    out[id] = Math.floor(n);
  });
  return normalizeThresholds(out);
}

/**
 * Load thresholds from env (FORGE_UX_QUALITY_GATE_JSON, FORGE_UX_QUALITY_GATE, or legacy major-only flag).
 */
export function loadQualityGateThresholdsFromEnv(env = process.env) {
  if (String(env.FORGE_UX_QUALITY_GATE_LEGACY_MAJOR_ONLY || '') === '1') {
    return { ...LEGACY_MAJOR_ONLY_QUALITY_GATE_THRESHOLDS };
  }
  const jsonRaw = String(env.FORGE_UX_QUALITY_GATE_JSON || '').trim();
  if (jsonRaw) {
    try {
      return normalizeThresholds(JSON.parse(jsonRaw));
    } catch (e) {
      throw new Error(`FORGE_UX_QUALITY_GATE_JSON: ${e?.message || String(e)}`);
    }
  }
  const csv = String(env.FORGE_UX_QUALITY_GATE || '').trim();
  if (csv) return parseQualityGateCsv(csv);
  return { ...DEFAULT_QUALITY_GATE_THRESHOLDS };
}

/**
 * @param {Record<SeverityId, number>} counts
 * @param {Record<SeverityId, number>} thresholds
 */
/**
 * Segment status for dashboard bars and crawl halt (matches renderGateThresholdCell fill).
 * @param {number} count
 * @param {number} threshold
 */
export function qualityGateSegmentStatus(count, threshold) {
  const c = Math.max(0, Number(count) || 0);
  const t = Math.max(0, Number(threshold) ?? 0);
  if (t === 0) return c > 0 ? 'over' : 'ok';
  if (c > t) return 'over';
  if (c === t) return 'at_cap';
  return 'ok';
}

/**
 * True when the gate “box” for this severity is full (count reached threshold).
 * @param {number} count
 * @param {number} threshold
 */
export function isQualityGateSegmentFilled(count, threshold) {
  const st = qualityGateSegmentStatus(count, threshold);
  return st === 'at_cap' || st === 'over';
}

/**
 * Halt crawl expansion when any severity segment is filled (sitewide counts).
 * @param {Record<string, number>} counts
 * @param {Record<string, number>} thresholds
 */
export function evaluateQualityGateCrawlHalt(counts, thresholds) {
  const thr = normalizeThresholds(thresholds);
  /** @type {Record<SeverityId, number>} */
  const cnt = {};
  for (const id of SEVERITY_LEVELS) {
    cnt[id] = Math.max(0, Number(counts?.[id] || 0));
  }
  for (const id of SEVERITY_LEVELS) {
    const c = cnt[id];
    const t = thr[id] ?? DEFAULT_QUALITY_GATE_THRESHOLDS[id];
    if (isQualityGateSegmentFilled(c, t)) {
      return { halt: true, severity: id, count: c, threshold: t };
    }
  }
  return { halt: false, severity: null, count: 0, threshold: 0 };
}

export function evaluateQualityGate(counts, thresholds) {
  const thr = normalizeThresholds(thresholds);
  /** @type {Record<SeverityId, number>} */
  const cnt = {};
  for (const id of SEVERITY_LEVELS) {
    cnt[id] = Math.max(0, Number(counts?.[id] || 0));
  }
  /** @type {Array<{ severity: SeverityId, count: number, threshold: number, overBy: number }>} */
  const violations = [];
  let total = 0;
  for (const id of SEVERITY_LEVELS) {
    const c = Number(cnt[id] || 0);
    total += c;
    const t = Number(thr[id] ?? DEFAULT_QUALITY_GATE_THRESHOLDS[id]);
    if (c > t) violations.push({ severity: id, count: c, threshold: t, overBy: c - t });
  }
  return {
    pass: violations.length === 0,
    counts: cnt,
    thresholds: thr,
    violations,
    total,
    majorPlus: (cnt.blocker || 0) + (cnt.critical || 0) + (cnt.major || 0),
  };
}

/**
 * `B0/0 C0/0 Mj0/0 W78/5 Mi0/10 Tr0/15 Cos0/100`
 * @param {Record<SeverityId, number>} counts
 * @param {Record<SeverityId, number>} thresholds
 */
export function formatQualityGateSlashPairs(counts, thresholds) {
  const thr = normalizeThresholds(thresholds);
  /** @type {Record<SeverityId, number>} */
  const cnt = {};
  for (const id of SEVERITY_LEVELS) {
    cnt[id] = Math.max(0, Number(counts?.[id] || 0));
  }
  return SEVERITY_LEVELS.map((id) => {
    const short = SEVERITY_GATE_SHORT[id];
    return `${short}${cnt[id]}/${thr[id]}`;
  }).join(' ');
}

/**
 * Flatten findings from audit-data `pages`.
 * @param {{ pages?: Array<{ findings?: unknown[] }> }} audit
 */
export function flattenAuditFindings(audit) {
  return (audit?.pages || []).flatMap((p) => p?.findings || []);
}

/**
 * @param {{ pages?: Array<{ findings?: unknown[], error?: string }> }} audit
 * @param {Record<SeverityId, number>} [thresholds]
 */
export function evaluateAuditQualityGate(audit, thresholds = loadQualityGateThresholdsFromEnv()) {
  const flat = flattenAuditFindings(audit);
  return evaluateQualityGate(countBySeverity(flat), thresholds);
}

/**
 * Page passes when its own findings meet the gate (per-page budgets).
 * @param {unknown[]} pageFindings
 * @param {Record<SeverityId, number>} [thresholds]
 */
export function pagePassesQualityGate(pageFindings, thresholds = loadQualityGateThresholdsFromEnv()) {
  return evaluateQualityGate(countBySeverity(pageFindings), thresholds).pass;
}
