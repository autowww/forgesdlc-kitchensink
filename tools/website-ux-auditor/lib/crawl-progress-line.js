/**
 * Crawl progress on stderr: one line per update (newline-terminated), suitable for logs and terminals.
 * Columns are fixed-width (space-padded / truncated) so layout stays stable in monospace.
 *
 * Layout (spaces between columns): label | runId | elapsed/~estTotal | pg idx/max | queue | ETA×3 | phase(URL)
 *   ETA triple = `cur/run/script` (compact slash-separated block; “—” replaces verbose “N/A”).
 *   Use “—” where an ETA is not available (replaces verbose “N/A”).
 *
 * Env:
 *   FORGE_UX_CRAWL_PROGRESS=1|always — force on even when stderr is not a TTY
 *   FORGE_UX_CRAWL_PROGRESS=0|off    — disable
 *   FORGE_UX_CRAWL_PROGRESS_HEARTBEAT_SEC — while idle between events, append the same row again every N sec (default 15; 0 = off).
 *   FORGE_UX_LOOP_WATCH_OUT_DIR — when set (matches crawl \\-\\-out): suppress stderr lines and merge snapshots into ux-loop-dashboard-state.json for loop-watch-dashboard.mjs.
 * opts.progressLogPath — append ISO-stamped crawl rows (auditor diagnostics; works even when stderr is consumed or watch mode hides TTY paint).
 */

import fs from 'node:fs';
import path from 'node:path';

import { mergeDashboardState } from './ux-loop-dashboard-state.js';

/**
 * @param {string} s
 * @param {number} w
 */
export function fixedLeft(s, w) {
  const t = String(s);
  if (t.length >= w) return t.slice(0, w);
  return t.padEnd(w, ' ');
}

/**
 * Right-aligned ellipsis truncate (phase / URL tail).
 * @param {string} s
 * @param {number} w
 */
export function fixedRightTruncate(s, w) {
  const t = String(s).replace(/\s+/g, ' ');
  if (w <= 0) return '';
  if (t.length <= w) return t.padEnd(w, ' ');
  if (w <= 1) return '…';
  return `…${t.slice(-(w - 1))}`;
}

/** Column widths — tuned for scorer (≤9999 pages, large queues). */
const COL = {
  LABEL: 14,
  RUN: 11,
  CLOCK: 18,
  PAGES: 9,
  QUEUE: 9,
};

/** Single ETA field `cur/run/script` (compact slashes, no padded cells). */
const ETA_BLOCK_LEN = 22;

/** Core columns + spaces between six gaps */
const FIXED_CORE_LEN = COL.LABEL + COL.RUN + COL.CLOCK + COL.PAGES + COL.QUEUE + ETA_BLOCK_LEN + 6;

/** Minimum terminal width assumed when columns unknown */
const MIN_TERM_COLS = 100;

/** @param {number} ms */
export function formatEtaMs(ms) {
  if (!Number.isFinite(ms) || ms < 0) return 'N/A';
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m}m${r}s` : `${m}m`;
}

/** @param {number} ms */
export function formatElapsedMs(ms) {
  if (!Number.isFinite(ms) || ms < 0) return '0s';
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m}m${r}s` : `${m}m`;
}

/**
 * Upper-bound-ish remaining pages: budget minus completed; queue hints early finish.
 * @param {{ completed: number, queueLen: number, maxPages: number }} st
 */
export function estimateRemainingPagesHeuristic(st) {
  const cap = Math.max(0, st.maxPages - st.completed);
  if (cap <= 0) return 0;
  if (st.queueLen <= 0) return Math.min(cap, st.completed > 0 ? 2 : 1);
  return Math.min(cap, st.queueLen + 1);
}

/**
 * @param {string} u
 * @param {number} [max]
 */
function truncateUrl(u, max = 52) {
  const s = String(u || '').replace(/\s+/g, ' ');
  if (s.length <= max) return s;
  return `…${s.slice(-(max - 1))}`;
}

/**
 * @param {{
 *   stream?: import('node:stream').Writable,
 *   label?: string,
 *   runDisplay?: string,
 *   maxPages: number,
 *   force?: boolean,
 *   progressLogPath?: string | null,
 * }} opts
 */
export function createCrawlProgressReporter(opts) {
  const stream = opts.stream ?? process.stderr;
  const label = opts.label ?? '[ux-crawl]';
  const runDisplay = opts.runDisplay ?? '—';
  const maxPages = opts.maxPages;
  const progressLogPathRaw = opts.progressLogPath != null ? String(opts.progressLogPath).trim() : '';
  const progressLogPath = progressLogPathRaw || null;
  const envForce = String(process.env.FORGE_UX_CRAWL_PROGRESS || '').trim();
  const watchOutDir = String(process.env.FORGE_UX_LOOP_WATCH_OUT_DIR || '').trim();
  /** Watch dashboard owns progress output — merge JSON only, no stderr lines. */
  const dashboardWatch = watchOutDir.length > 0;
  const enabled =
    opts.force === true
    || envForce === '1'
    || envForce === 'always'
    || dashboardWatch
    || (opts.force !== false && envForce !== '0' && envForce !== 'off' && stream.isTTY);

  /** File log can be the only sink (e.g. IDE swallowing crawl stderr). */
  const crawlHooksActive = enabled || Boolean(progressLogPath);

  const crawlStartMs = Date.now();
  /** @type {number | null} */
  let pageStartMs = null;
  /** @type {string} */
  let phaseDetail = 'starting';
  let pageInFlight = false;
  let workingOrdinal = 0;
  let completedPages = 0;
  let lastQueueLen = 0;
  /** @type {ReturnType<typeof setInterval> | null} */
  let heartbeatTimer = null;

  const hbRaw = process.env.FORGE_UX_CRAWL_PROGRESS_HEARTBEAT_SEC;
  const heartbeatSec =
    hbRaw === undefined || hbRaw === ''
      ? 15
      : Number(hbRaw);

  const samples = [];
  const SAMPLE_CAP = 14;

  function recordSample(ms) {
    if (!Number.isFinite(ms) || ms <= 0) return;
    samples.push(ms);
    while (samples.length > SAMPLE_CAP) samples.shift();
  }

  function avgMs() {
    if (!samples.length) return null;
    return samples.reduce((a, b) => a + b, 0) / samples.length;
  }

  function phaseColumnWidth() {
    const cols = stream.columns || MIN_TERM_COLS;
    return Math.max(12, cols - FIXED_CORE_LEN - 1);
  }

  /**
   * @param {number} now
   * @param {number} queueLen
   * @param {number | null | undefined} etaScriptMs
   */
  function computeProgressMetrics(now, queueLen, etaScriptMs) {
    lastQueueLen = queueLen;
    const elapsed = now - crawlStartMs;
    const av = avgMs();

    let etaCur = 'N/A';
    if (pageInFlight && pageStartMs != null && av != null) {
      etaCur = formatEtaMs(Math.max(0, av - (now - pageStartMs)));
    }

    const q = queueLen;
    const rem = estimateRemainingPagesHeuristic({
      completed: completedPages,
      queueLen: q,
      maxPages,
    });
    let etaRunStr = 'N/A';
    if (av != null && rem > 0) etaRunStr = formatEtaMs(rem * av);

    const estTailMs =
      av != null && completedPages < maxPages
        ? estimateRemainingPagesHeuristic({
          completed: completedPages,
          queueLen: q,
          maxPages,
        }) * av
        : 0;
    const estTotalMs = elapsed + estTailMs;
    const totalStr =
      completedPages >= maxPages || (q <= 0 && completedPages > 0 && !pageInFlight)
        ? formatElapsedMs(Math.max(elapsed, estTotalMs))
        : `~${formatEtaMs(estTotalMs)}`;

    const etaScriptStr =
      etaScriptMs != null && Number.isFinite(etaScriptMs)
        ? formatEtaMs(etaScriptMs)
        : 'N/A';

    const idxShow = pageInFlight ? workingOrdinal : completedPages;
    const idx = Math.min(idxShow, maxPages);
    const pgStr = `${idx}/${maxPages}`;
    const etaTripleRaw = [etaCur, etaRunStr, etaScriptStr]
      .map((e) => (e === 'N/A' ? '—' : e))
      .join('/');

    return {
      elapsed,
      totalStr,
      pgStr,
      q,
      etaTripleRaw,
      phaseDetail,
      elapsedClock: `${formatElapsedMs(elapsed)}/${totalStr}`,
    };
  }

  /**
   * @param {number} now
   * @param {number} queueLen
   * @param {number | null | undefined} etaScriptMs
   */
  function formatProgressRow(now, queueLen, etaScriptMs) {
    const m = computeProgressMetrics(now, queueLen, etaScriptMs);
    const etaSeg = fixedLeft(m.etaTripleRaw, ETA_BLOCK_LEN);
    const phaseW = phaseColumnWidth();
    const phaseCol = fixedRightTruncate(truncateUrl(m.phaseDetail, phaseW + 8), phaseW);

    return [
      fixedLeft(label, COL.LABEL),
      fixedLeft(runDisplay, COL.RUN),
      fixedLeft(m.elapsedClock, COL.CLOCK),
      fixedLeft(m.pgStr, COL.PAGES),
      fixedLeft(`q${m.q}`, COL.QUEUE),
      fixedLeft(etaSeg, ETA_BLOCK_LEN),
      phaseCol,
    ].join(' ');
  }

  /**
   * @param {number} now
   * @param {number} queueLen
   * @param {number | null | undefined} etaScriptMs
   */
  function appendProgressLog(line) {
    if (!progressLogPath) return;
    try {
      fs.mkdirSync(path.dirname(progressLogPath), { recursive: true });
      const safe = String(line).replace(/\r?\n/g, ' ');
      fs.appendFileSync(progressLogPath, `${new Date().toISOString()}\t${safe}\n`);
    } catch {
      /* ignore log fs errors */
    }
  }

  function pushDashboardSnapshot(now, queueLen, etaScriptMs) {
    if (!dashboardWatch) return;
    try {
      const m = computeProgressMetrics(now, queueLen, etaScriptMs);
      mergeDashboardState(watchOutDir, {
        crawl: {
          component: 'crawl',
          label,
          runDisplay,
          elapsedClock: m.elapsedClock,
          pages: m.pgStr,
          queueLen: m.q,
          etaTriple: m.etaTripleRaw,
          phaseDetail: String(m.phaseDetail || '').slice(0, 240),
          ts: now,
        },
      });
    } catch {
      /* ignore dashboard merge errors */
    }
  }

  function paint(line) {
    if (!enabled || dashboardWatch) return;
    stream.write(`${line}\n`);
  }

  /**
   * @param {{ now: number, queueLen: number, etaScriptMs?: number | null }} ctx
   * @param {{ skipPaint?: boolean }} [paintOpts]
   */
  function render(ctx, paintOpts = {}) {
    pushDashboardSnapshot(ctx.now, ctx.queueLen, ctx.etaScriptMs);
    const line = formatProgressRow(ctx.now, ctx.queueLen, ctx.etaScriptMs);
    appendProgressLog(line);
    if (!paintOpts.skipPaint) paint(line);
  }

  function emitHeartbeatLine() {
    const ts = Date.now();
    pushDashboardSnapshot(ts, lastQueueLen, undefined);
    const row = formatProgressRow(ts, lastQueueLen, undefined);
    appendProgressLog(row);
    paint(row);
  }

  function startHeartbeat() {
    if (!crawlHooksActive) return;
    if (!Number.isFinite(heartbeatSec) || heartbeatSec <= 0) return;
    stopHeartbeat();
    heartbeatTimer = setInterval(() => emitHeartbeatLine(), heartbeatSec * 1000);
    if (heartbeatTimer && typeof heartbeatTimer.unref === 'function') heartbeatTimer.unref();
  }

  function stopHeartbeat() {
    if (heartbeatTimer != null) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  if (crawlHooksActive && Number.isFinite(heartbeatSec) && heartbeatSec > 0) {
    startHeartbeat();
  }

  /** @param {{ phase?: string, href?: string, waveLabel?: string, durationMs?: number, pagesCompletedBefore?: number, pagesCompletedAfter?: number, pagesCompleted?: number, queueLen?: number }} ev */
  function onProgress(ev) {
    if (!crawlHooksActive || !ev) return;
    const now = Date.now();

    if (ev.phase === 'launch_start') {
      phaseDetail = 'launch Chromium';
      pageStartMs = null;
      pageInFlight = false;
      completedPages = 0;
      render({ queueLen: ev.queueLen ?? 0, now });
      return;
    }

    if (ev.phase === 'launch_end') {
      pageStartMs = null;
      pageInFlight = false;
      phaseDetail = 'browser ready';
      render({ queueLen: ev.queueLen ?? 0, now });
      return;
    }

    if (ev.phase === 'page_begin') {
      completedPages = ev.pagesCompletedBefore ?? completedPages;
      pageInFlight = true;
      pageStartMs = now;
      workingOrdinal = completedPages + 1;
      phaseDetail = truncateUrl(ev.href || '', Math.max(phaseColumnWidth(), 44));
      render({ queueLen: ev.queueLen ?? 0, now });
      return;
    }

    if (ev.phase === 'page_end') {
      recordSample(ev.durationMs ?? now - (pageStartMs ?? now));
      pageStartMs = null;
      pageInFlight = false;
      completedPages = ev.pagesCompletedAfter ?? completedPages;
      lastQueueLen = ev.queueLen ?? 0;
      phaseDetail = '';
      /* No stderr line for the idle between pages ("queued" was noisy); next page_begin refreshes metrics.
         Loop-watch dashboard + optional auditor progress log still get updates (skipPaint avoids stderr spam). */
      if (dashboardWatch || progressLogPath) {
        render({ queueLen: lastQueueLen, now }, { skipPaint: true });
      }
      return;
    }

    if (ev.phase === 'browser_close_start') {
      completedPages = ev.pagesCompleted ?? completedPages;
      pageInFlight = false;
      pageStartMs = null;
      phaseDetail = 'closing browser';
      render({ queueLen: ev.queueLen ?? 0, now });
    }
  }

  function finish() {
    stopHeartbeat();
    appendProgressLog(`${label} crawl_progress_reporter_finished`);
  }

  return { onProgress, finish, enabled };
}
