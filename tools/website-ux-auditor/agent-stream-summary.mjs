#!/usr/bin/env node
/**
 * Turn Cursor `agent --output-format stream-json` NDJSON into one human line per
 * meaningful event (system init, tool start/done, thinking done, errors).
 * Does not print assistant token deltas or tool result payloads (those stay huge).
 *
 * Env:
 *   FORGE_UX_AGENT_RAW_JSONL — optional path: append every raw stdin line (full NDJSON) for deep forensics.
 *
 * stdin: agent stdout+stderr (NDJSON lines)
 * stdout: compact [ux-agent] lines only
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const rawPath = (process.env.FORGE_UX_AGENT_RAW_JSONL || '').trim();
let rawFd = null;
if (rawPath) {
  fs.mkdirSync(path.dirname(rawPath), { recursive: true });
  rawFd = fs.openSync(rawPath, 'a');
}

/** @param {string} s @param {number} max */
function trunc(s, max = 100) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** @param {unknown} tc */
function toolKindAndHint(tc) {
  if (!tc || typeof tc !== 'object') return { kind: 'tool', hint: '' };
  for (const [key, body] of Object.entries(tc)) {
    if (!key.endsWith('ToolCall') || !body || typeof body !== 'object') continue;
    const args = /** @type {Record<string, unknown>} */ (body.args) || {};
    const shortKind = key.replace(/ToolCall$/, '').toLowerCase();
    if (typeof args.path === 'string') return { kind: shortKind, hint: trunc(args.path, 120) };
    if (typeof args.targetDirectory === 'string') {
      const g = typeof args.globPattern === 'string' ? args.globPattern : '';
      return { kind: shortKind, hint: trunc(`${args.targetDirectory} ${g}`, 120) };
    }
    if (typeof args.command === 'string') return { kind: shortKind, hint: trunc(args.command, 100) };
    if (typeof args.query === 'string') return { kind: shortKind, hint: trunc(args.query, 80) };
    return { kind: shortKind, hint: '' };
  }
  return { kind: 'tool', hint: '' };
}

/** @param {unknown} j */
function toolOutcomeShort(j) {
  const tc = j?.tool_call;
  if (!tc || typeof tc !== 'object') return 'done';
  for (const body of Object.values(tc)) {
    if (!body || typeof body !== 'object') continue;
    if (body.error) return 'error';
    if ('result' in body) {
      const r = body.result;
      if (r && typeof r === 'object' && 'success' in r) return r.success ? 'ok' : 'fail';
      return 'ok';
    }
  }
  return 'done';
}

function out(line) {
  process.stdout.write(`${line}\n`);
}

let thinkingBuf = '';

const rl = readline.createInterface({ input: process.stdin, terminal: false });
for await (const line of rl) {
  if (rawFd != null) {
    fs.writeSync(rawFd, `${line}\n`);
  }
  if (!line.trim()) continue;
  let j;
  try {
    j = JSON.parse(line);
  } catch {
    out(`[ux-agent] (parse-skip) ${trunc(line, 90)}`);
    continue;
  }

  const t = j?.type;
  if (t === 'system' && j.subtype === 'init') {
    out(`[ux-agent] init model=${j.model || '—'} session=${trunc(j.session_id || '', 36)} cwd=${trunc(j.cwd || '', 80)}`);
    continue;
  }

  if (t === 'thinking') {
    if (j.subtype === 'delta' && typeof j.text === 'string') thinkingBuf += j.text;
    if (j.subtype === 'completed') {
      if (thinkingBuf.trim()) out(`[ux-agent] think ${trunc(thinkingBuf, 140)}`);
      thinkingBuf = '';
    }
    continue;
  }

  if (t === 'tool_call') {
    const st = j.subtype;
    const tc = j.tool_call;
    const { kind, hint } = toolKindAndHint(tc);
    if (st === 'started') {
      out(`[ux-agent] → ${kind}${hint ? ` ${hint}` : ''}`);
    } else if (st === 'completed') {
      const oc = toolOutcomeShort(j);
      out(`[ux-agent] ✓ ${kind} ${oc}`);
    } else {
      out(`[ux-agent] tool ${st || '—'} ${kind}`);
    }
    continue;
  }

  if (t === 'result' && j.subtype === 'error') {
    out(`[ux-agent] error ${trunc(JSON.stringify(j), 200)}`);
    continue;
  }

  if (t === 'assistant') {
    // Omit streaming assistant fragments (very noisy). Final-ish blocks sometimes repeat; skip.
    continue;
  }

  if (t === 'user') {
    continue;
  }

  if (t === 'message' || t === 'ping' || t === 'pong') {
    continue;
  }

  // Unknown / rare types: one short line so nothing is silently lost at high level
  out(`[ux-agent] ${t || 'event'}${j.subtype ? `/${j.subtype}` : ''}`);
}

if (rawFd != null) {
  fs.closeSync(rawFd);
}
