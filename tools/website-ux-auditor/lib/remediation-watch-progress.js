/**
 * Live remediation progress for FORGE_UX_LOOP_WATCH (plan todos + agent tool hints).
 */

import fs from 'node:fs';
import path from 'node:path';

import { mergeDashboardState, readDashboardStateSafe } from './ux-loop-dashboard-state.js';

const URL_RE = /https?:\/\/[^\s)\]>"]+/gi;
const PLAN_FILE_RE = /\b(0[0-9]-defect-[\w.-]+\.md)\b/i;

/**
 * @param {string} text
 */
export function extractUrlsFromText(text) {
  const out = new Set();
  const raw = String(text || '');
  let m;
  const re = new RegExp(URL_RE.source, URL_RE.flags);
  while ((m = re.exec(raw)) !== null) {
    const u = String(m[0] || '').replace(/[.,;]+$/, '').trim();
    if (u) out.add(u);
  }
  return [...out];
}

/**
 * @param {string} content todo YAML content field (JSON-string or plain)
 */
export function defectPlanFileFromTodoContent(content) {
  let raw = String(content || '').trim();
  if (raw.startsWith('"') && raw.endsWith('"')) {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = raw.slice(1, -1);
    }
  }
  const m = PLAN_FILE_RE.exec(raw);
  return m ? m[1] : '';
}

/**
 * @param {string} planText
 * @returns {Array<{ id: string, status: string, content: string, planFile: string }>}
 */
export function parseRemediationPlanTodoEntries(planText) {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(String(planText || ''));
  if (!fm) return [];
  const body = fm[1];
  const todosIdx = body.indexOf('todos:');
  if (todosIdx === -1) return [];
  const slice = body.slice(todosIdx);
  const cut = slice.split(/\nisProject:\s*/)[0] || slice;
  const re =
    /\n\s*- id:\s*(ux-[0-9a-z-]+)\s*\n\s+content:\s*(?:"((?:\\.|[^"\\])*)"|([^\n]+))\s*\n\s+status:\s*(\S+)/g;
  /** @type {Array<{ id: string, status: string, content: string, planFile: string }>} */
  const entries = [];
  let m;
  while ((m = re.exec(cut)) !== null) {
    const content = m[2] != null ? m[2].replace(/\\"/g, '"') : String(m[3] || '').trim();
    const status = String(m[4] || 'pending').toLowerCase();
    entries.push({
      id: m[1],
      status,
      content,
      planFile: defectPlanFileFromTodoContent(content),
    });
  }
  return entries;
}

/**
 * @param {string} outDir
 * @param {string} planFile
 */
export function readUrlsForDefectPlanFile(outDir, planFile) {
  const name = String(planFile || '').trim();
  if (!name) return [];
  const candidates = [
    path.join(outDir, name),
    path.join(outDir, 'forge-ux-remediation', name),
  ];
  for (const p of candidates) {
    try {
      const text = fs.readFileSync(p, 'utf8');
      return extractUrlsFromText(text);
    } catch {
      /* try next */
    }
  }
  return [];
}

/**
 * @param {string} repoPath
 * @param {string[]} pageUrls
 */
export function pageUrlsMatchingRepoPath(repoPath, pageUrls) {
  const hint = String(repoPath || '').trim().toLowerCase();
  if (!hint) return [];
  const base = path.basename(hint, path.extname(hint));
  const parts = hint.split(/[/\\]/).filter((x) => x.length > 2);
  const tokens = base.split(/[-._]+/).filter((x) => x.length > 3);
  return (pageUrls || []).filter((url) => {
    const u = String(url || '').toLowerCase();
    if (!u) return false;
    if (base.length > 3 && u.includes(base)) return true;
    let tokenHits = 0;
    for (const t of tokens) {
      if (u.includes(t)) tokenHits += 1;
    }
    if (tokenHits >= 2 || (tokens.length === 1 && tokens[0].length > 5 && u.includes(tokens[0]))) {
      return true;
    }
    for (const seg of parts) {
      if (seg.length > 3 && u.includes(seg)) return true;
    }
    return false;
  });
}

/**
 * @param {string[]} lines
 */
export function parseLastAgentToolHint(lines) {
  const arr = Array.isArray(lines) ? lines.map((x) => String(x ?? '')) : [];
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    const line = arr[i];
    const start = /\[ux-agent\]\s*→\s*(\w+)\s*(.*)$/.exec(line);
    if (start) {
      return { kind: start[1], path: String(start[2] || '').trim(), line };
    }
    const done = /\[ux-agent\]\s*✓\s*(\w+)/.exec(line);
    if (done) {
      return { kind: done[1], path: '', line, completed: true };
    }
  }
  return null;
}

/**
 * @param {string} outDir
 */
export function tailRemediationAgentLog(outDir, maxLines = 48) {
  const logPath = path.join(outDir, 'remediation-agent.log');
  try {
    const st = fs.statSync(logPath);
    const buf = Buffer.alloc(Math.min(st.size, 65536));
    const fd = fs.openSync(logPath, 'r');
    try {
      const start = Math.max(0, st.size - buf.length);
      fs.readSync(fd, buf, 0, buf.length, start);
    } finally {
      fs.closeSync(fd);
    }
    const raw = buf.toString('utf8');
    const complete = raw.endsWith('\n') ? raw : raw.replace(/\r?\n[^\n\r]*$/, '');
    return complete.split(/\r?\n/).filter((x) => x.trim().length > 0).slice(-maxLines);
  } catch {
    return [];
  }
}

/**
 * @param {string} outDir
 * @param {Record<string, unknown>} [state]
 * @param {Array<{ url: string }>} [pageSets]
 */
export function buildRemediationWatchContext(outDir, state = {}, pageSets = []) {
  const pageUrls = (pageSets || []).map((p) => String(p.url || '').trim()).filter(Boolean);
  /** @type {Array<{ id: string, status: string, content: string, planFile: string, urls: string[] }>} */
  let todos = [];
  try {
    const planPath = path.join(outDir, 'forge-ux-remediation.plan.md');
    const text = fs.readFileSync(planPath, 'utf8');
    todos = parseRemediationPlanTodoEntries(text).map((t) => ({
      ...t,
      urls: readUrlsForDefectPlanFile(outDir, t.planFile),
    }));
  } catch {
    todos = [];
  }

  const dashRem =
    state.remediationProgress && typeof state.remediationProgress === 'object'
      ? /** @type {Record<string, unknown>} */ (state.remediationProgress)
      : {};
  const logHint = parseLastAgentToolHint(tailRemediationAgentLog(outDir));
  const activePath = String(dashRem.activePath || logHint?.path || '').trim();
  const activeKind = String(dashRem.activeKind || logHint?.kind || '').trim();

  let activeTodoId = '';
  for (const t of todos) {
    if (t.status === 'in_progress' || t.status === 'in-progress') {
      activeTodoId = t.id;
      break;
    }
  }
  if (!activeTodoId) {
    const pending = todos.find((t) => t.status === 'pending');
    if (pending && activePath) activeTodoId = pending.id;
  }

  const activeUrls = new Set();
  const completedUrls = new Set();
  const pendingUrls = new Set();
  for (const t of todos) {
    const st = t.status;
    const bucket =
      st === 'completed' || st === 'complete' || st === 'done'
        ? completedUrls
        : st === 'in_progress' || st === 'in-progress'
          ? activeUrls
          : pendingUrls;
    for (const u of t.urls) bucket.add(u);
  }

  const pathMatchUrls = new Set(pageUrlsMatchingRepoPath(activePath, pageUrls));
  for (const u of pathMatchUrls) activeUrls.add(u);

  const activeTodo = todos.find((t) => t.id === activeTodoId) || null;
  let done = 0;
  let inProgress = 0;
  let pending = 0;
  for (const t of todos) {
    const st = t.status;
    if (st === 'completed' || st === 'complete' || st === 'done') done += 1;
    else if (st === 'in_progress' || st === 'in-progress') inProgress += 1;
    else pending += 1;
  }

  return {
    todos,
    total: todos.length,
    done,
    inProgress,
    pending,
    activeTodoId,
    activeTodoLabel: activeTodo
      ? String(activeTodo.content || activeTodo.id).slice(0, 72)
      : '',
    activePath,
    activeKind,
    activeUrls,
    completedUrls,
    pendingUrls,
    pathMatchUrls,
  };
}

/**
 * @param {string} outDir
 * @param {{ activeKind?: string, activePath?: string }} patch
 */
export function mergeRemediationToolProgress(outDir, patch) {
  const w = String(process.env.FORGE_UX_LOOP_WATCH_OUT_DIR || '').trim();
  if (!w || path.resolve(w) !== path.resolve(outDir)) return;
  const prev = readDashboardStateSafe(outDir);
  const prevRem =
    prev.remediationProgress && typeof prev.remediationProgress === 'object'
      ? /** @type {Record<string, unknown>} */ (prev.remediationProgress)
      : {};
  mergeDashboardState(outDir, {
    remediationProgress: {
      ...prevRem,
      ...patch,
      updatedAt: new Date().toISOString(),
    },
  });
}

/**
 * Refresh dashboard remediationProgress from agent log (dashboard poll).
 * @param {string} outDir
 */
export function syncRemediationProgressFromAgentLog(outDir) {
  const state = readDashboardStateSafe(outDir);
  const phase = String(state.phase || '').toLowerCase();
  if (!phase.includes('remediation_agent')) return;
  const hint = parseLastAgentToolHint(tailRemediationAgentLog(outDir));
  if (!hint || hint.completed) return;
  const prev =
    state.remediationProgress && typeof state.remediationProgress === 'object'
      ? /** @type {Record<string, unknown>} */ (state.remediationProgress)
      : {};
  if (String(prev.activePath || '') === hint.path && String(prev.activeKind || '') === hint.kind) {
    return;
  }
  const rem = buildRemediationWatchContext(outDir, state, []);
  mergeRemediationToolProgress(outDir, {
    activeKind: hint.kind,
    activePath: hint.path,
    activeTodoId: rem.activeTodoId || undefined,
  });
}
