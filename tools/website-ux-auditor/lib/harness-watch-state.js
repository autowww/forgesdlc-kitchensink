/**
 * Campaign-level JSON state + log for DET ruleset harness watch board.
 */

import fs from 'node:fs';
import path from 'node:path';

export const HARNESS_DASHBOARD_STATE_FILE = 'harness-dashboard-state.json';
export const HARNESS_DASHBOARD_LOG_FILE = 'harness-dashboard.log';
export const HARNESS_DASHBOARD_SNAPSHOT_FILE = 'harness-dashboard-snapshot.txt';

/** @param {string} outDir */
export function harnessStatePath(outDir) {
  return path.join(outDir, HARNESS_DASHBOARD_STATE_FILE);
}

/** @param {string} outDir */
export function harnessLogPath(outDir) {
  return path.join(outDir, HARNESS_DASHBOARD_LOG_FILE);
}

/** @param {string} outDir */
export function harnessSnapshotPath(outDir) {
  return path.join(outDir, HARNESS_DASHBOARD_SNAPSHOT_FILE);
}

/** @param {string} outDir */
export function readHarnessStateSafe(outDir) {
  const p = harnessStatePath(outDir);
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
export function shallowMergeHarness(prev, patch) {
  /** @type {Record<string, unknown>} */
  let next = { ...prev };
  for (const [k, v] of Object.entries(patch)) {
    if (k === 'outcomes' && v && typeof v === 'object' && !Array.isArray(v)) {
      const po =
        next.outcomes && typeof next.outcomes === 'object' && !Array.isArray(next.outcomes)
          ? /** @type {Record<string, unknown>} */ ({ ...next.outcomes })
          : {};
      next = { ...next, outcomes: { ...po, .../** @type {Record<string, unknown>} */ (v) } };
    } else if (k === 'currentRule' && v && typeof v === 'object' && !Array.isArray(v)) {
      const pc =
        next.currentRule &&
        typeof next.currentRule === 'object' &&
        !Array.isArray(next.currentRule)
          ? /** @type {Record<string, unknown>} */ ({ ...next.currentRule })
          : {};
      next = { ...next, currentRule: { ...pc, .../** @type {Record<string, unknown>} */ (v) } };
    } else {
      next[k] = v;
    }
  }
  return next;
}

/** @param {string} outDir */
export function writeHarnessStateAtomic(outDir, obj) {
  const finalPath = harnessStatePath(outDir);
  fs.mkdirSync(path.dirname(finalPath), { recursive: true });
  const tmp = `${finalPath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(obj, null, 2)}\n`);
  fs.renameSync(tmp, finalPath);
}

/** @param {string} outDir */
export function mergeHarnessState(outDir, patch) {
  const prev = readHarnessStateSafe(outDir);
  const next = shallowMergeHarness(prev, patch);
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
  writeHarnessStateAtomic(outDir, next);
}

/** @param {string} outDir */
export function appendHarnessLog(outDir, line) {
  const p = harnessLogPath(outDir);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const safe = String(line || '').replace(/\r?\n/g, ' ').trim();
  if (!safe.length) return;
  fs.appendFileSync(p, `${safe}\n`);
}
