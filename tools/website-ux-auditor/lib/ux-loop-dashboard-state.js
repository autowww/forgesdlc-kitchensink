/**
 * Shared JSON state + append-only log for FORGE_UX_LOOP_WATCH terminal dashboard.
 */

import fs from 'node:fs';
import path from 'node:path';

export const UX_LOOP_DASHBOARD_STATE_FILE = 'ux-loop-dashboard-state.json';
export const UX_LOOP_DASHBOARD_LOG_FILE = 'ux-loop-dashboard.log';

/** @param {string} outDir */
export function dashboardStatePath(outDir) {
  return path.join(outDir, UX_LOOP_DASHBOARD_STATE_FILE);
}

/** @param {string} outDir */
export function dashboardLogPath(outDir) {
  return path.join(outDir, UX_LOOP_DASHBOARD_LOG_FILE);
}

/**
 * Best-effort read; corrupt or missing → `{}`.
 * @param {string} outDir
 */
export function readDashboardStateSafe(outDir) {
  const p = dashboardStatePath(outDir);
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const o = JSON.parse(raw);
    return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
}

/**
 * @param {Record<string, unknown>} prev
 * @param {Record<string, unknown>} patch
 */
export function shallowMergeDashboard(prev, patch) {
  /** @type {Record<string, unknown>} */
  let next = { ...prev };
  for (const [k, v] of Object.entries(patch)) {
    if (k === 'crawl' && v && typeof v === 'object' && !Array.isArray(v)) {
      const pc = next.crawl && typeof next.crawl === 'object' && !Array.isArray(next.crawl)
        ? /** @type {Record<string, unknown>} */ ({ ...next.crawl })
        : {};
      next = { ...next, crawl: { ...pc, .../** @type {Record<string, unknown>} */ (v) } };
    } else if (
      (k === 'loop'
        || k === 'processDefects'
        || k === 'qualityGate'
        || k === 'scorerBacklog'
        || k === 'progress'
        || k === 'auditProgress')
      && v
      && typeof v === 'object'
      && !Array.isArray(v)
    ) {
      const prevObj = next[k] && typeof next[k] === 'object' && !Array.isArray(next[k])
        ? /** @type {Record<string, unknown>} */ ({ .../** @type {Record<string, unknown>} */ (next[k]) })
        : {};
      next = { ...next, [k]: { ...prevObj, .../** @type {Record<string, unknown>} */ (v) } };
    } else {
      next[k] = v;
    }
  }
  return next;
}

/**
 * @param {string} outDir
 * @param {Record<string, unknown>} obj
 */
export function writeDashboardStateAtomic(outDir, obj) {
  const finalPath = dashboardStatePath(outDir);
  fs.mkdirSync(path.dirname(finalPath), { recursive: true });
  const tmp = `${finalPath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(obj, null, 2)}\n`);
  fs.renameSync(tmp, finalPath);
}

/**
 * Merge patch into persisted dashboard state (atomic write).
 * @param {string} outDir
 * @param {Record<string, unknown>} patch
 */
export function mergeDashboardState(outDir, patch) {
  const prev = readDashboardStateSafe(outDir);
  const next = shallowMergeDashboard(prev, patch);
  const sig = (o) => {
    const { updatedAt: _u, ...rest } = o && typeof o === 'object' && !Array.isArray(o) ? o : {};
    try {
      return JSON.stringify(rest);
    } catch {
      return '';
    }
  };
  if (sig(prev) === sig(next)) {
    return;
  }
  next.updatedAt = new Date().toISOString();
  writeDashboardStateAtomic(outDir, next);
}

/**
 * Merge only when `FORGE_UX_LOOP_WATCH_OUT_DIR` resolves to the same path as `outDirAbs`.
 * @param {string} outDirAbs
 * @param {Record<string, unknown>} patch
 */
export function mergeDashboardStateIfWatching(outDirAbs, patch) {
  const w = String(process.env.FORGE_UX_LOOP_WATCH_OUT_DIR || '').trim();
  if (!w || path.resolve(w) !== path.resolve(outDirAbs)) return;
  mergeDashboardState(outDirAbs, patch);
}

/**
 * Append one line to the dashboard log (plain text, no per-line ISO stamp).
 * Skips empty lines and dash-only placeholder lines.
 * @param {string} outDir
 * @param {string} line single line (newlines stripped)
 */
export function appendDashboardLog(outDir, line) {
  const p = dashboardLogPath(outDir);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const safe = String(line || '').replace(/\r?\n/g, ' ').trim();
  if (!safe.length) return;
  /** Skip placeholder-only lines (legacy stamped logs may still carry `[ISO]` elsewhere). */
  if (/^[\s\-–—\u2013\u2014]+$/.test(safe)) return;
  fs.appendFileSync(p, `${safe}\n`);
}
