/**
 * Pure layout helpers for loop-watch-dashboard.mjs (unit-testable).
 */

import { formatElapsedMs, stripCrawlProgressLineForWatchDisplay } from './crawl-progress-line.js';
import { isScorerSourcedQualityGate, isScorerWatchPhase } from './loop-watch-phase-source.js';
import { formatQualityGateSlashPairs } from './quality-gate.js';
import { renderLargeUxScoreGlyphs, scorePanelReserveCols } from './loop-watch-score-glyphs.js';
import { clipPadAnsi, clipPadVisible, stripAnsi, visibleLength } from './terminal-ansi.js';

/** @param {string} s */
/** @param {number} w */
export function clipPad(s, w) {
  return clipPadVisible(s, w);
}

/**
 * Top/bottom rule; optional centered title consumes interior dashes.
 * @param {number} cols outer width (characters)
 * @param {string} [title]
 * @param {'top'|'mid'|'bot'} edge
 */
export function boxEdgeLine(cols, title, edge) {
  const inner = Math.max(0, cols - 2);
  if (inner <= 0) return '';
  let mid = '─'.repeat(inner);
  const t = String(title || '').trim();
  if (t.length && t.length + 2 <= inner && edge === 'top') {
    const pad = inner - 2 - t.length;
    const left = Math.floor(pad / 2);
    const right = pad - left;
    mid = `${'─'.repeat(left)} ${t} ${'─'.repeat(right)}`;
    if (mid.length > inner) mid = mid.slice(0, inner);
    else mid = mid.padEnd(inner, '─');
  }
  const [TL, TR] =
    edge === 'bot'
      ? ['└', '┘']
      : edge === 'mid'
        ? ['├', '┤']
        : ['┌', '┐'];
  return `${TL}${mid.slice(0, inner)}${TR}`;
}

/** @param {number} cols */
/** @param {string} text */
export function boxRow(cols, text) {
  const inner = Math.max(0, cols - 2);
  const hasAnsi = String(text ?? '') !== stripAnsi(String(text ?? ''));
  const clip = hasAnsi ? clipPadAnsi : clipPad;
  return `│${clip(text, inner)}│`;
}

/**
 * Frame row with fixed-width left panel (score glyphs) and right text.
 * @param {number} cols
 * @param {string} leftPanel
 * @param {string} rightText
 */
export function boxRowWithLeftPanel(cols, leftPanel, rightText) {
  const inner = Math.max(0, cols - 2);
  const leftVis = visibleLength(leftPanel);
  const leftW = Math.min(inner, leftVis);
  const leftClip = leftVis > inner ? clipPadVisible(leftPanel, inner) : leftPanel.padEnd(leftW, ' ');
  const rightW = Math.max(0, inner - leftW);
  const right = rightW > 0 ? clipPadVisible(rightText || '', rightW) : '';
  return `│${leftClip}${right}│`;
}

/** Strip legacy `[ISO] ` prefix from dashboard log lines (watch activity milestone pane only). */
export function stripDashboardLogDisplayLine(line) {
  let s = String(line ?? '').trim();
  const legacy = /^\[\d{4}-\d{2}-\d{2}T[0-9:.-]+Z?]\s+/.exec(s);
  if (legacy) s = s.slice(legacy[0].length).trim();
  return s.replace(/\s+/g, ' ').trim();
}

/** Shell milestones may be written without a leading `[ISO]` stamp. */
function phaseMilestone(s, slug) {
  const t = String(s);
  return new RegExp(`(?:^|]\\s+)phase=${slug}\\b`).test(t);
}

/** Crawl grid / heartbeat row (elapsed + ETA), not a shell milestone. */
function looksLikeCrawlProgressGridLine(s) {
  return /\[(?:ux-score|ux-audit|ux-audit-pre)\][^\n]*\b\d+[smh]\/~/.test(String(s));
}

/** @param {string} line */
export function isWatchMajorMilestoneLine(line) {
  const s = String(line);
  if (looksLikeCrawlProgressGridLine(s)) return false;
  if (phaseMilestone(s, 'loop_start')) return true;
  if (phaseMilestone(s, 'scorer_begin')) return true;
  if (phaseMilestone(s, 'auditor_begin')) return true;
  if (phaseMilestone(s, 'remediation_agent_begin')) return true;
  if (phaseMilestone(s, 'ai_audit_begin')) return true;
  if (phaseMilestone(s, 'ai_audit_warn')) return true;
  if (phaseMilestone(s, 'until_major_clean_pass')) return true;
  if (phaseMilestone(s, 'until_quality_gate_pass')) return true;
  if (phaseMilestone(s, 'until_all_bars_pass')) return true;
  if (phaseMilestone(s, 'skip_cursor_agent')) return true;
  if (phaseMilestone(s, 'watch_exit')) return true;
  if (/\[ux-audit\] phase=startup\b/.test(s)) return true;
  if (/\[ux-audit\] phase=static_only\b/.test(s)) return true;
  if (/\[ux-audit\] phase=run\b/.test(s)) return true;
  if (/\[ux-audit-pre\] phase=precrawl\b/.test(s)) return true;
  if (/\[ux-audit\] phase=main_crawl\b/.test(s)) return true;
  if (/\[ux-score\].*\bcomplete\b/i.test(s)) return true;
  return false;
}

const WATCH_ACTIVITY_HISTORY_SLOTS = 6;
const WATCH_ACTIVITY_LIVE_SLOTS = 3;

/**
 * Split log tail into fixed-height milestone history + three “live” lines after the last major milestone.
 * @deprecated Prefer {@link extractWatchMilestoneHistory} + {@link formatWatchCrawlLiveSlots} for loop-watch.
 * @param {unknown[]} rawTail oldest→newest within the tail window
 * @returns {{ historyLines: string[], liveLines: string[] }} each liveLines length === 3
 */
export function partitionWatchActivityTail(rawTail) {
  const arr = Array.isArray(rawTail)
    ? rawTail.map((x) => String(x ?? '').trim()).filter((x) => x.length > 0)
    : [];
  let lastMajor = -1;
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    if (isWatchMajorMilestoneLine(arr[i])) {
      lastMajor = i;
      break;
    }
  }
  if (lastMajor < 0) {
    const live = arr.slice(-WATCH_ACTIVITY_LIVE_SLOTS);
    const padL = Math.max(0, WATCH_ACTIVITY_LIVE_SLOTS - live.length);
    const liveLines = [...Array(padL).fill(''), ...live].slice(-WATCH_ACTIVITY_LIVE_SLOTS);
    const histSrc = arr.slice(0, Math.max(0, arr.length - WATCH_ACTIVITY_LIVE_SLOTS));
    const hslice = histSrc.slice(-WATCH_ACTIVITY_HISTORY_SLOTS);
    const padH = Math.max(0, WATCH_ACTIVITY_HISTORY_SLOTS - hslice.length);
    const historyLines = [...Array(padH).fill(''), ...hslice].slice(-WATCH_ACTIVITY_HISTORY_SLOTS);
    return { historyLines, liveLines };
  }
  const history = arr.slice(0, lastMajor + 1);
  const after = arr.slice(lastMajor + 1);
  const hslice = history.slice(-WATCH_ACTIVITY_HISTORY_SLOTS);
  const padH = Math.max(0, WATCH_ACTIVITY_HISTORY_SLOTS - hslice.length);
  const historyLines = [...Array(padH).fill(''), ...hslice].slice(-WATCH_ACTIVITY_HISTORY_SLOTS);
  const liveRaw = after.slice(-WATCH_ACTIVITY_LIVE_SLOTS);
  const padL = Math.max(0, WATCH_ACTIVITY_LIVE_SLOTS - liveRaw.length);
  const liveLines = [...Array(padL).fill(''), ...liveRaw].slice(-WATCH_ACTIVITY_LIVE_SLOTS);
  return { historyLines, liveLines };
}

/**
 * Last N crawl progress log lines, padded with blank rows, for the activity “live” pane (timing columns stripped for display).
 * @param {unknown[]} rawCrawlTail
 * @param {number} [slots]
 */
export function formatWatchCrawlLiveSlots(rawCrawlTail, slots = WATCH_ACTIVITY_LIVE_SLOTS) {
  const arr = Array.isArray(rawCrawlTail)
    ? rawCrawlTail.map((x) => stripCrawlProgressLineForWatchDisplay(x)).filter((x) => x.length > 0)
    : [];
  const slice = arr.slice(-slots);
  const padL = Math.max(0, slots - slice.length);
  return [...Array(padL).fill(''), ...slice].slice(-slots);
}

/**
 * Milestone-only rows from the dashboard log (fixed height).
 * @param {unknown[]} dashboardTail
 */
export function extractWatchMilestoneHistory(dashboardTail) {
  const milestones = Array.isArray(dashboardTail)
    ? dashboardTail.map((x) => String(x ?? '').trim()).filter((x) => x.length > 0 && isWatchMajorMilestoneLine(x))
    : [];
  const hslice = milestones.slice(-WATCH_ACTIVITY_HISTORY_SLOTS);
  const padH = Math.max(0, WATCH_ACTIVITY_HISTORY_SLOTS - hslice.length);
  return [...Array(padH).fill(''), ...hslice].slice(-WATCH_ACTIVITY_HISTORY_SLOTS);
}

/**
 * @param {Record<string, unknown> | null | undefined} qg
 * @param {Record<string, unknown> | null | undefined} legacyPd
 */
function resolveWatchQualityGateDisplay(qg, legacyPd, phase = '', crawlLabel = '') {
  if (isScorerWatchPhase(phase, crawlLabel)) {
    return null;
  }
  if (qg && typeof qg === 'object' && qg.counts && qg.thresholds && !isScorerSourcedQualityGate(qg)) {
    return formatQualityGateSlashPairs(
      /** @type {Record<string, number>} */ (qg.counts),
      /** @type {Record<string, number>} */ (qg.thresholds),
    );
  }
  if (legacyPd?.counts && legacyPd?.thresholds) {
    return formatQualityGateSlashPairs(
      /** @type {Record<string, number>} */ (legacyPd.counts),
      /** @type {Record<string, number>} */ (legacyPd.thresholds),
    );
  }
  return null;
}

/**
 * @param {Record<string, unknown>} state
 * @param {{ campaignElapsedSec?: number, generatedAt?: string }} meta
 */
export function formatWatchProcessLine(state, meta) {
  const parts = [];
  const sec = Number(meta.campaignElapsedSec);
  parts.push(`elapsed ${Number.isFinite(sec) && sec >= 0 ? formatElapsedMs(sec * 1000) : '—'}`);
  const loop = state.loop && typeof state.loop === 'object' && !Array.isArray(state.loop)
    ? /** @type {Record<string, unknown>} */ (state.loop)
    : {};
  const it = loop.iteration;
  const mx = loop.maxIterations;
  if (it != null && String(it).length) {
    parts.push(`iter ${String(it)}${mx != null ? `/${String(mx)}` : ''}`);
  }
  const qg = state.qualityGate && typeof state.qualityGate === 'object' && !Array.isArray(state.qualityGate)
    ? /** @type {Record<string, unknown>} */ (state.qualityGate)
    : null;
  const pd = state.processDefects && typeof state.processDefects === 'object' && !Array.isArray(state.processDefects)
    ? /** @type {Record<string, unknown>} */ (state.processDefects)
    : null;
  const crawl =
    state.crawl && typeof state.crawl === 'object' && !Array.isArray(state.crawl)
      ? /** @type {Record<string, unknown>} */ (state.crawl)
      : {};
  const gate = resolveWatchQualityGateDisplay(
    qg,
    pd,
    String(state.phase || ''),
    String(crawl.label || ''),
  );
  if (gate) {
    parts.push(`Gate ${gate}`);
  } else {
    parts.push('Gate —');
  }
  return `Process : ${parts.join(' · ')}`;
}

/** @param {string} phase */
export function humanizeWatchDashboardPhase(phase) {
  const p = String(phase || '').toLowerCase();
  if (!p || p === '—') return '—';
  if (p.includes('loop_start')) return 'Loop start';
  if (p.includes('scorer')) return 'Scorer crawl';
  if (p.includes('post_scorer')) return 'Post-scorer';
  if (p.includes('auditor')) return 'Auditor crawl';
  if (p.includes('ai_audit')) return 'AI audit';
  if (p.includes('remediation')) return 'Remediation agent';
  if (p.includes('until_major')) return 'Until major-clean';
  if (p.includes('until_quality')) return 'Until quality gate';
  if (p.includes('until_all_bars')) return 'Until all bars pass';
  if (p.includes('watch_exit')) return 'Finishing';
  return phase;
}

/** @param {string} crawlPhase */
function humanizeWatchCrawlPhase(crawlPhase) {
  const c = String(crawlPhase || '').toLowerCase();
  if (c === 'page') return 'on page';
  if (c === 'launch') return 'launching browser';
  if (c === 'ready') return 'browser ready';
  if (c === 'close') return 'closing browser';
  if (c === 'idle') return 'between pages';
  return crawlPhase || '—';
}

/**
 * @param {Record<string, unknown>} crawl
 * @param {string} [dashboardPhase]
 */
export function formatWatchNowLine(crawl, dashboardPhase = '') {
  const ph = String(dashboardPhase || '').toLowerCase();
  if (ph.includes('remediation_agent')) {
    return 'Now     : Remediation agent — applying plan in repo';
  }
  if (ph.includes('ai_audit')) {
    const pg = crawl.pages != null ? String(crawl.pages) : '—';
    return `Now     : AI audit on crawl results · pages ${pg}`;
  }
  const cp = String(crawl.crawlPhase || '').toLowerCase();
  const url = String(crawl.phaseDetail || '').trim();
  const pages = crawl.pages != null ? String(crawl.pages) : '—';
  const q = crawl.queueLen != null ? ` · q${String(crawl.queueLen)}` : '';
  if (cp === 'page' && url) {
    return `Now     : Analyzing ${pages}${q} · ${url}`;
  }
  if (cp === 'launch') return 'Now     : Launching Chromium…';
  if (cp === 'close') return 'Now     : Closing browser…';
  if (cp === 'ready') return `Now     : Browser ready · ${pages}${q}`;
  if (url) return `Now     : ${url} · ${pages}${q}`;
  if (cp === 'idle' && pages !== '—') return `Now     : Queued next page · ${pages}${q}`;
  return 'Now     : —';
}

/**
 * @param {Record<string, unknown>} crawl
 * @param {string} [dashboardPhase] `state.phase` — used to avoid stale crawl ETA rows after crawl subprocess ends
 */
export function formatWatchRunLine(crawl, dashboardPhase = '') {
  const ph = String(dashboardPhase || '').toLowerCase();
  if (ph.includes('ai_audit')) {
    const pg = crawl.pages != null ? `pg ${crawl.pages}` : 'pg —';
    return `Run     : AI audit · crawl finished · ${pg}`;
  }
  if (ph.includes('remediation_agent')) {
    return 'Run     : Remediation agent (see milestones below)';
  }
  const runParts = [
    crawl.label != null ? String(crawl.label) : '',
    crawl.runDisplay != null ? `[run ${String(crawl.runDisplay)}]` : '',
    crawl.elapsedClock != null ? String(crawl.elapsedClock) : '',
    crawl.pages != null ? `pg ${crawl.pages}` : '',
    crawl.queueLen != null ? `q${String(crawl.queueLen)}` : '',
    crawl.etaTriple != null ? `ETA ${String(crawl.etaTriple)}` : '',
  ].filter(Boolean);
  return `Run     : ${runParts.join(' · ') || '—'}`;
}

/**
 * @param {string} phase
 * @param {string} crawlPhase
 */
export function formatWatchActivityLine(phase, crawlPhase) {
  const ph = humanizeWatchDashboardPhase(phase);
  const cp = humanizeWatchCrawlPhase(crawlPhase);
  return `Activity: ${ph} · ${cp}`;
}

/**
 * Last finished-page line from crawl log tail (url=…), if any.
 * @param {unknown[]} rawCrawlTail
 */
export function extractLastPageDoneFromCrawlTail(rawCrawlTail) {
  const arr = Array.isArray(rawCrawlTail) ? rawCrawlTail.map((x) => String(x ?? '')) : [];
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    const line = arr[i];
    if (!/\bphase=page_done\b/.test(line)) continue;
    const m = /\burl=(\S+)/.exec(line);
    if (m) return m[1];
    const disp = stripCrawlProgressLineForWatchDisplay(line);
    if (disp.length) return disp;
  }
  return '';
}

/**
 * @param {number} cols
 * @param {Record<string, unknown>} state
 * @param {string[]} dashboardLogTail milestone source (full tail; milestones are filtered)
 * @param {string[]} crawlLogTail last lines from scorer/auditor crawl progress log
 * @param {{
 *   websiteRepo?: string,
 *   siteUrl?: string,
 *   outDir?: string,
 *   scoreOverall?: string,
 *   deltaVerbal?: string,
 *   campaignElapsedSec?: number,
 *   generatedAt?: string,
 *   progressLines?: string[],
 *   campaignStatsLines?: string[],
 * }} meta
 */
export function buildWatchFrameLines(cols, state, dashboardLogTail, crawlLogTail, meta) {
  const lines = [];
  const c = Math.max(40, cols);
  lines.push(boxEdgeLine(c, 'Forge UX loop watch', 'top'));

  const scoreArt = renderLargeUxScoreGlyphs(meta.scoreOverall, { useColor: true });
  const panelW = scorePanelReserveCols(c, scoreArt.width);
  const padScore = (line) => {
    const vis = visibleLength(line);
    if (vis >= panelW) return line;
    return line + ' '.repeat(panelW - vis);
  };

  const crawl = state.crawl && typeof state.crawl === 'object' && !Array.isArray(state.crawl)
    ? /** @type {Record<string, unknown>} */ (state.crawl)
    : {};
  const phase = typeof state.phase === 'string' ? state.phase : '—';

  const deltaShort = String(meta.deltaVerbal ?? '').trim();
  const deltaClip =
    deltaShort.length > 48 ? `…${deltaShort.slice(-47)}` : deltaShort || '—';

  const headerRight = [
    ` Repo : ${meta.websiteRepo ?? '—'}`,
    ` Site : ${meta.siteUrl ?? '—'}`,
    ` OUT  : ${meta.outDir ?? '—'}`,
    formatWatchProcessLine(state, meta),
    formatWatchRunLine(crawl, phase),
    formatWatchNowLine(crawl, phase),
    formatWatchActivityLine(phase, String(crawl.crawlPhase ?? '')),
  ];

  for (let i = 0; i < scoreArt.height; i += 1) {
    const left = padScore(scoreArt.lines[i] || ' '.repeat(panelW));
    let right = headerRight[i] || '';
    if (i === scoreArt.height - 1 && deltaClip && deltaClip !== '—') {
      right = `${right} · ${deltaClip}`;
    }
    lines.push(boxRowWithLeftPanel(c, left, right));
  }

  const campaignStatsLines = Array.isArray(meta.campaignStatsLines) ? meta.campaignStatsLines : [];
  if (campaignStatsLines.length) {
    for (const row of campaignStatsLines) {
      lines.push(boxRow(c, row.startsWith(' ') ? row : ` ${row}`));
    }
  }

  lines.push(boxEdgeLine(c, '', 'mid'));

  const progressLines = Array.isArray(meta.progressLines) ? meta.progressLines : [];
  if (progressLines.length) {
    for (const pl of progressLines) {
      lines.push(boxRow(c, pl.startsWith(' ') ? pl : ` ${pl}`));
    }
    lines.push(boxEdgeLine(c, '', 'mid'));
  }

  const historyLines = extractWatchMilestoneHistory(dashboardLogTail);
  const liveLines = formatWatchCrawlLiveSlots(crawlLogTail);
  const lastDone = extractLastPageDoneFromCrawlTail(crawlLogTail);
  lines.push(boxRow(c, ' Log · milestones (last 6)'));
  for (const row of historyLines) {
    const inner = row.length
      ? stripCrawlProgressLineForWatchDisplay(stripDashboardLogDisplayLine(row))
      : '';
    lines.push(boxRow(c, inner.length ? ` ${inner}` : ''));
  }
  lines.push(boxRow(c, ' Log · recent crawl events'));
  lines.push(boxRow(c, ` Last done : ${lastDone || '—'}`));
  for (const row of liveLines) {
    const inner = row.length ? row : '';
    lines.push(boxRow(c, inner.length ? ` ${inner}` : ''));
  }
  lines.push(boxEdgeLine(c, '', 'bot'));
  return lines;
}
