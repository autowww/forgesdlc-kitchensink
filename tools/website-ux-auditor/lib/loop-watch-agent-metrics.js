/**
 * Agent run counts and token usage for loop-watch dashboard (Cursor + optional local/cloud LLM).
 */

import fs from 'node:fs';
import path from 'node:path';

import { mergeDashboardState, readDashboardStateSafe } from './ux-loop-dashboard-state.js';

export const AGENT_USAGE_EVENTS_FILE = 'agent-usage-events.jsonl';

/**
 * @returns {{
 *   runs: { total: number, ok: number, error: number, remediation: number, aiAudit: number },
 *   tokens: { cursor: number, local: number, cloud: number },
 *   lastRunAt: string | null,
 * }}
 */
export function emptyAgentMetrics() {
  return {
    runs: { total: 0, ok: 0, error: 0, remediation: 0, aiAudit: 0 },
    tokens: { cursor: 0, local: 0, cloud: 0 },
    lastRunAt: null,
  };
}

/**
 * @param {unknown} usage
 */
export function sumCursorUsageTokens(usage) {
  if (!usage || typeof usage !== 'object') return 0;
  const u = /** @type {Record<string, unknown>} */ (usage);
  const keys = ['inputTokens', 'outputTokens', 'cacheReadTokens', 'cacheWriteTokens'];
  let n = 0;
  for (const k of keys) {
    const v = Number(u[k]);
    if (Number.isFinite(v) && v > 0) n += v;
  }
  return n;
}

/**
 * @param {string} line
 * @returns {{ ok: boolean, usage?: Record<string, unknown>, requestId?: string } | null}
 */
export function parseCursorResultLine(line) {
  const s = String(line || '').trim();
  if (!s.startsWith('{')) return null;
  let j;
  try {
    j = JSON.parse(s);
  } catch {
    return null;
  }
  if (j?.type !== 'result') return null;
  const ok = j.subtype === 'success' && j.is_error !== true;
  const usage = j.usage && typeof j.usage === 'object' ? j.usage : undefined;
  const requestId =
    typeof j.request_id === 'string'
      ? j.request_id
      : typeof j.session_id === 'string'
        ? `${j.session_id}:${j.duration_ms ?? ''}`
        : undefined;
  return { ok, usage, requestId };
}

/**
 * @param {string} line
 */
export function parseUxAgentUsageSummaryLine(line) {
  const m = /\[ux-agent\]\s+usage\b/i.exec(String(line || ''));
  if (!m) return null;
  const s = String(line);
  /** @type {Record<string, number>} */
  const usage = {};
  for (const [, key, val] of s.matchAll(/\b(in|out|cacheR|cacheW)=(\d+)/gi)) {
    const k = key.toLowerCase();
    if (k === 'in') usage.inputTokens = Number(val);
    else if (k === 'out') usage.outputTokens = Number(val);
    else if (k === 'cacher') usage.cacheReadTokens = Number(val);
    else if (k === 'cachew') usage.cacheWriteTokens = Number(val);
  }
  if (!Object.keys(usage).length) return null;
  return { ok: true, usage, requestId: `summary:${sumCursorUsageTokens(usage)}:${s.length}` };
}

/**
 * @param {string} line
 */
export function parseUxLlmUsageLine(line) {
  const s = String(line || '');
  if (!/\[ux-llm\]/i.test(s)) return null;
  const provM = /\bprovider=(local|cloud)\b/i.exec(s);
  if (!provM) return null;
  const provider = provM[1].toLowerCase() === 'local' ? 'local' : 'cloud';
  let tokens = 0;
  for (const [, val] of s.matchAll(/\b(?:in|out|total)=(\d+)/gi)) {
    const v = Number(val);
    if (Number.isFinite(v) && v > 0) tokens += v;
  }
  return { provider, tokens };
}

/**
 * @param {number} n
 * @param {number} [maxLen]
 */
export function formatTokenCount(n, maxLen = 8) {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return '0';
  let s;
  if (v >= 1_000_000) s = `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  else if (v >= 10_000) s = `${Math.round(v / 1000)}k`;
  else if (v >= 1000) s = `${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  else s = String(Math.round(v));
  if (s.length > maxLen) return `${s.slice(0, maxLen - 1)}…`;
  return s;
}

/**
 * @param {ReturnType<typeof emptyAgentMetrics>} m
 * @param {number} [innerWidth]
 */
export function formatWatchAgentMetricsLines(m, innerWidth = 72) {
  const runs = m.runs || emptyAgentMetrics().runs;
  const tok = m.tokens || emptyAgentMetrics().tokens;
  const sub =
    runs.remediation > 0 || runs.aiAudit > 0
      ? ` rem${runs.remediation}·ai${runs.aiAudit}`
      : '';
  const line1 = ` Agents ${runs.total}${sub} · Cursor ${formatTokenCount(tok.cursor)}`;
  const line2 = ` LLM local ${formatTokenCount(tok.local)} · cloud ${formatTokenCount(tok.cloud)}`;
  const w = Math.max(20, innerWidth);
  const clip = (s) => (s.length <= w ? s : `${s.slice(0, w - 1)}…`);
  return [clip(line1), clip(line2)];
}

/**
 * @param {string} filePath
 * @param {number} maxBytes
 */
function readTailBytes(filePath, maxBytes = 4_194_304) {
  try {
    const st = fs.statSync(filePath);
    const start = Math.max(0, st.size - maxBytes);
    const buf = Buffer.alloc(st.size - start);
    const fd = fs.openSync(filePath, 'r');
    try {
      fs.readSync(fd, buf, 0, buf.length, start);
    } finally {
      fs.closeSync(fd);
    }
    return buf.toString('utf8');
  } catch {
    return '';
  }
}

/**
 * @param {string} text
 * @param {(line: string) => void} onLine
 */
function forEachLine(text, onLine) {
  const raw = String(text || '');
  const complete = raw.endsWith('\n') ? raw : raw.replace(/\r?\n[^\n\r]*$/, '');
  for (const line of complete.split(/\r?\n/)) {
    if (line.trim().length) onLine(line);
  }
}

/**
 * @param {string} outDir
 * @param {string} relPath
 * @param {'remediation' | 'aiAudit'} kind
 * @param {Set<string>} seen
 * @param {ReturnType<typeof emptyAgentMetrics>} acc
 */
function ingestLogFile(outDir, relPath, kind, seen, acc) {
  const fp = path.join(outDir, relPath);
  const text = readTailBytes(fp);
  forEachLine(text, (line) => {
    const parsed = parseCursorResultLine(line) || parseUxAgentUsageSummaryLine(line);
    if (!parsed) return;
    const key = parsed.requestId || `${kind}:${line.slice(0, 80)}`;
    if (seen.has(key)) return;
    seen.add(key);
    acc.runs.total += 1;
    if (kind === 'remediation') acc.runs.remediation += 1;
    else acc.runs.aiAudit += 1;
    if (parsed.ok) acc.runs.ok += 1;
    else acc.runs.error += 1;
    acc.tokens.cursor += sumCursorUsageTokens(parsed.usage);
    acc.lastRunAt = new Date().toISOString();
  });
}

/**
 * @param {Record<string, unknown>} state
 */
function metricsFromState(state) {
  const am = state.agentMetrics;
  if (!am || typeof am !== 'object' || Array.isArray(am)) return emptyAgentMetrics();
  const m = /** @type {Record<string, unknown>} */ (am);
  const runs = m.runs && typeof m.runs === 'object' ? m.runs : {};
  const tokens = m.tokens && typeof m.tokens === 'object' ? m.tokens : {};
  return {
    runs: {
      total: Number(runs.total) || 0,
      ok: Number(runs.ok) || 0,
      error: Number(runs.error) || 0,
      remediation: Number(runs.remediation) || 0,
      aiAudit: Number(runs.aiAudit) || 0,
    },
    tokens: {
      cursor: Number(tokens.cursor) || 0,
      local: Number(tokens.local) || 0,
      cloud: Number(tokens.cloud) || 0,
    },
    lastRunAt: typeof m.lastRunAt === 'string' ? m.lastRunAt : null,
  };
}

/** @type {Map<string, { sig: string, metrics: ReturnType<typeof emptyAgentMetrics> }>} */
const collectCache = new Map();

/**
 * @param {string} outDir
 * @param {{ state?: Record<string, unknown>, dashboardLogTail?: string[] }} [opts]
 */
export function collectAgentMetricsFromOutDir(outDir, opts = {}) {
  const state = opts.state && typeof opts.state === 'object' ? opts.state : {};

  /** @type {number[]} */
  const mtimes = [];
  const watchFiles = [
    'remediation-agent.log',
    path.join('ai-audit', 'ai-audit-agent.log'),
    AGENT_USAGE_EVENTS_FILE,
  ];
  for (const rel of watchFiles) {
    try {
      mtimes.push(fs.statSync(path.join(outDir, rel)).mtimeMs);
    } catch {
      mtimes.push(0);
    }
  }
  let transcriptCount = 0;
  const transcriptsDir = path.join(outDir, 'ai-audit', 'transcripts');
  try {
    transcriptCount = fs.readdirSync(transcriptsDir).filter((n) => n.endsWith('.log')).length;
  } catch {
    transcriptCount = 0;
  }
  const stateSig = JSON.stringify(metricsFromState(state));
  const sig = `${mtimes.join(':')}:tr${transcriptCount}:${stateSig}`;

  const cached = collectCache.get(outDir);
  if (cached && cached.sig === sig) return cached.metrics;

  /** @type {ReturnType<typeof emptyAgentMetrics>} */
  const acc = emptyAgentMetrics();
  const seen = new Set();

  forEachLine(readTailBytes(path.join(outDir, AGENT_USAGE_EVENTS_FILE), 512_000), (line) => {
    let j;
    try {
      j = JSON.parse(line);
    } catch {
      return;
    }
    const kind = j.kind === 'aiAudit' ? 'aiAudit' : 'remediation';
    const key = j.requestId || `${j.at}:${kind}:${sumCursorUsageTokens(j.usage)}`;
    if (seen.has(key)) return;
    seen.add(key);
    acc.runs.total += 1;
    if (kind === 'remediation') acc.runs.remediation += 1;
    else acc.runs.aiAudit += 1;
    if (j.ok !== false) acc.runs.ok += 1;
    else acc.runs.error += 1;
    acc.tokens.cursor += sumCursorUsageTokens(j.usage);
    acc.lastRunAt = typeof j.at === 'string' ? j.at : new Date().toISOString();
  });

  ingestLogFile(outDir, 'remediation-agent.log', 'remediation', seen, acc);
  ingestLogFile(outDir, path.join('ai-audit', 'ai-audit-agent.log'), 'aiAudit', seen, acc);
  try {
    for (const name of fs.readdirSync(transcriptsDir)) {
      if (!name.endsWith('.log')) continue;
      ingestLogFile(outDir, path.join('ai-audit', 'transcripts', name), 'aiAudit', seen, acc);
    }
  } catch {
    /* no dir */
  }

  const stateM = metricsFromState(state);
  acc.tokens.local += stateM.tokens.local;
  acc.tokens.cloud += stateM.tokens.cloud;

  for (const line of opts.dashboardLogTail || []) {
    const p = parseUxLlmUsageLine(line);
    if (!p) continue;
    if (p.provider === 'local') acc.tokens.local += p.tokens;
    else acc.tokens.cloud += p.tokens;
  }

  collectCache.set(outDir, { sig, metrics: acc });
  return acc;
}

/**
 * @param {string} outDir
 * @param {{ kind?: string, ok?: boolean, usage?: Record<string, unknown>, requestId?: string }} ev
 */
export function appendAgentUsageEvent(outDir, ev) {
  const fp = path.join(outDir, AGENT_USAGE_EVENTS_FILE);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  const row = {
    at: new Date().toISOString(),
    kind: ev.kind === 'aiAudit' ? 'aiAudit' : 'remediation',
    ok: ev.ok !== false,
    usage: ev.usage || {},
    requestId: ev.requestId || undefined,
  };
  fs.appendFileSync(fp, `${JSON.stringify(row)}\n`);
  collectCache.delete(path.resolve(outDir));
}

/**
 * @param {string} outDir
 */
export function refreshAgentMetricsInDashboardState(outDir) {
  const state = readDashboardStateSafe(outDir);
  const metrics = collectAgentMetricsFromOutDir(outDir, { state });
  mergeDashboardState(outDir, { agentMetrics: metrics });
  return metrics;
}
