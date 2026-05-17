import crypto from 'node:crypto';
import fsp from 'node:fs/promises';
import path from 'node:path';

import { readMaybe } from './files.js';

/**
 * Load design standard Markdown; parse minimal YAML front matter; hash raw file bytes.
 */
export async function loadDesignStandard(resolvedAbsolutePath, rawFallback = '') {
  let raw = '';
  const pathResolved = resolvedAbsolutePath || '';
  try {
    if (pathResolved) raw = await fsp.readFile(pathResolved, 'utf8');
    else raw = rawFallback;
  } catch {
    raw = rawFallback;
  }

  let id = '';
  let updated = '';
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (fm) {
    for (const line of fm[1].split(/\r?\n/)) {
      const mId = /^id:\s*(.+)$/.exec(line.trim());
      if (mId) id = mId[1].replace(/^["']|["']$/g, '').trim();
      const mUp = /^updated:\s*(.+)$/.exec(line.trim());
      if (mUp) updated = mUp[1].replace(/^["']|["']$/g, '').trim();
    }
  }

  const bytes = Buffer.from(raw, 'utf8');
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');

  return {
    path: pathResolved || null,
    id: id || null,
    updated: updated || null,
    sha256,
    byteLength: bytes.length,
    rawSnippet: raw.split('\n').slice(0, 80).join('\n'),
    rawFull: raw,
  };
}

/**
 * Warn if pinned standard changed vs previous audit-data.json under outDir (best-effort).
 */
export async function warnIfDesignStandardChanged(outDir, currentSha256) {
  try {
    const p = path.join(outDir, 'audit-data.json');
    const prev = await readMaybe(p);
    if (!prev.trim()) return;
    const prevJson = JSON.parse(prev);
    const prevSha = prevJson.designStandard?.sha256;
    if (prevSha && currentSha256 && prevSha !== currentSha256) {
      console.warn('\n[HINT] Design standard file SHA changed since last audit in this folder. Review check thresholds if intentional.\n');
    }
  } catch {
    /* ignore */
  }
}
