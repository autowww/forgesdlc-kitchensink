/**
 * Build the same text frame as loop-watch-dashboard.mjs (for TTY UI or snapshot files).
 */

import fs from 'node:fs';
import path from 'node:path';

import { computeWatchCampaignStats, formatWatchCampaignStatsLines } from './loop-watch-campaign-stats.js';
import { buildWatchFrameLines } from './loop-watch-dashboard-frame.js';
import { colorEnabled, renderPhaseAndMapLines, renderProgressBarLines } from './loop-watch-ansi-bars.js';
import { buildLoopWatchProgressMap, refreshProgressMapArtifact } from './loop-watch-progress-map.js';
import { computeLoopWatchProgress } from './loop-watch-progress.js';
import { dashboardLogPath, readDashboardStateSafe } from './ux-loop-dashboard-state.js';

/**
 * @param {string} logFile
 * @param {number} maxLines
 * @param {number} maxBytes
 */
export function tailLogLines(logFile, maxLines = 10, maxBytes = 65536) {
  try {
    const st = fs.statSync(logFile);
    const start = Math.max(0, st.size - maxBytes);
    const buf = Buffer.alloc(st.size - start);
    const fd = fs.openSync(logFile, 'r');
    try {
      fs.readSync(fd, buf, 0, buf.length, start);
    } finally {
      fs.closeSync(fd);
    }
    const raw = buf.toString('utf8');
    /** Drop a torn trailing line when another writer appends concurrently (no trailing newline yet). */
    const complete = raw.endsWith('\n') ? raw : raw.replace(/\r?\n[^\n\r]*$/, '');
    const lines = complete.split(/\r?\n/).filter((x) => x.trim().length > 0);
    return lines.slice(-maxLines);
  } catch {
    return [];
  }
}

/** @param {string} outDir */
function readRunMetaSafe(outDir) {
  try {
    const raw = fs.readFileSync(path.join(outDir, 'run-meta.json'), 'utf8');
    const j = JSON.parse(raw);
    return j && typeof j === 'object' ? j : {};
  } catch {
    return {};
  }
}

/** @param {string} outDir */
function readScoreOverallSafe(outDir) {
  try {
    const raw = fs.readFileSync(path.join(outDir, 'ux-quality-score.json'), 'utf8');
    const j = JSON.parse(raw);
    const o = j?.uxScores?.overall;
    return o != null && Number.isFinite(Number(o)) ? String(o) : '';
  } catch {
    return '';
  }
}

/** @param {string} outDir */
function readAuditDataSafe(outDir) {
  try {
    const raw = fs.readFileSync(path.join(outDir, 'audit-data.json'), 'utf8');
    const j = JSON.parse(raw);
    return j && typeof j === 'object' ? j : null;
  } catch {
    return null;
  }
}

/** @param {string} outDir */
function readDeltaVerbalSafe(outDir) {
  try {
    const raw = fs.readFileSync(path.join(outDir, 'ux-quality-score-loop-delta.json'), 'utf8');
    const j = JSON.parse(raw);
    const v = j?.verbalSummary;
    return typeof v === 'string' ? v : '';
  } catch {
    return '';
  }
}

/**
 * Crawl progress file to tail for the activity “live” pane (scorer vs auditor).
 * @param {string} outDir
 * @param {string} phase dashboard `state.phase`
 */
export function pickActiveCrawlProgressLogPath(outDir, phase) {
  const aud = path.join(outDir, 'auditor-crawl-progress.log');
  const scr = path.join(outDir, 'scorer-crawl-progress.log');
  const low = String(phase || '').toLowerCase();

  const wantsAud =
    low.includes('auditor')
    || low === 'audit_complete'
    || low.includes('remediation')
    || low.includes('ai_audit')
    || low.includes('until_major')
    || low.includes('until_all_bars')
    || low.includes('skip_cursor')
    || low.includes('watch_exit')
    || low.includes('audit_only');

  const wantsScr =
    low === 'loop_start'
    || low.includes('scorer_crawl')
    || low === 'post_scorer';

  /** @param {string} f */
  function exists(f) {
    try {
      fs.accessSync(f);
      return true;
    } catch {
      return false;
    }
  }
  /** @param {string} f */
  function mtimeMs(f) {
    try {
      return fs.statSync(f).mtimeMs;
    } catch {
      return -1;
    }
  }

  if (wantsAud && !wantsScr) return exists(aud) ? aud : scr;
  if (wantsScr && !wantsAud) return exists(scr) ? scr : aud;

  const ma = mtimeMs(aud);
  const ms = mtimeMs(scr);
  if (ma < 0 && ms < 0) return aud;
  return ma >= ms ? aud : scr;
}

/**
 * @param {string} outDir absolute or resolved campaign / run directory
 * @param {number} cols terminal width used for box layout (snapshot files often use 100–132)
 * @returns {string[]} frame lines (no trailing newline array element)
 */
export function buildUxLoopDashboardSnapshotLines(outDir, cols) {
  const state = readDashboardStateSafe(outDir);
  const meta = readRunMetaSafe(outDir);
  const websiteRepo = typeof meta.website_repo === 'string' ? meta.website_repo : '';
  const siteUrl = typeof meta.site_url === 'string' ? meta.site_url : '';
  const outDisp = typeof meta.output_directory === 'string' ? meta.output_directory : outDir;
  const generatedAt = typeof meta.generatedAt === 'string' ? meta.generatedAt : '';

  const scoreOverall = readScoreOverallSafe(outDir);
  const deltaVerbal = readDeltaVerbalSafe(outDir);
  const logTail = tailLogLines(dashboardLogPath(outDir), 80, 65536);

  let campaignElapsedSec = 0;
  if (generatedAt) {
    const t0 = Date.parse(generatedAt);
    if (Number.isFinite(t0)) {
      campaignElapsedSec = Math.max(0, Math.floor((Date.now() - t0) / 1000));
    }
  }

  const phase = typeof state.phase === 'string' ? state.phase : '';
  const crawlLogPath = pickActiveCrawlProgressLogPath(outDir, phase);
  const crawlLogTail = tailLogLines(crawlLogPath, 32, 98304);

  const c = Math.max(40, cols);
  /** Progress bars: plain glyphs in boxed rows (width-safe). Map legend/grid may use ANSI when enabled. */
  const useColor = false;
  const mapUseColor = colorEnabled(true);
  let progressLines = [];
  try {
    const progress = computeLoopWatchProgress(outDir, state, { barWidth: Math.min(48, Math.max(12, c - 24)) });
    progressLines = renderProgressBarLines(progress, { useColor, innerWidth: progress.barWidth });
  } catch {
    progressLines = [' Progress', ' (progress unavailable)'];
  }

  const audit = readAuditDataSafe(outDir);
  let campaignStatsLines = [];
  try {
    const stats = computeWatchCampaignStats(outDir, state, audit);
    campaignStatsLines = formatWatchCampaignStatsLines(stats, {
      innerWidth: Math.max(40, c - 4),
      useColor: process.env.FORGE_UX_LOOP_WATCH_STATS_COLOR !== '0',
    });
  } catch {
    campaignStatsLines = [' Campaign stats unavailable'];
  }

  let mapLines = [];
  try {
    const mapModel = buildLoopWatchProgressMap(outDir, state, audit, {
      tick: Math.floor(Date.now() / 500),
    });
    refreshProgressMapArtifact(outDir, state, audit, { tick: mapModel.mapTick });
    mapLines = renderPhaseAndMapLines(mapModel, {
      innerWidth: Math.max(32, c - 4),
      useColor: mapUseColor,
    });
    if (mapLines.length) {
      progressLines = [...mapLines, '', ...progressLines];
    }
  } catch {
    mapLines = [];
  }

  return buildWatchFrameLines(c, state, logTail, crawlLogTail, {
    websiteRepo,
    siteUrl,
    outDir: outDisp,
    scoreOverall,
    deltaVerbal,
    campaignElapsedSec,
    generatedAt,
    progressLines,
    campaignStatsLines,
  });
}
