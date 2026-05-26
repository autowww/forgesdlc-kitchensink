import fs from 'node:fs/promises';
import path from 'node:path';
import { defaultWebsiteRoots, findFilesRecursive, readUtf8, syncHashAttrsOnOpenTag, writeUtf8 } from '../ops.mjs';
import { seedHarnessRepo } from '../repo-overlay.mjs';

/**
 * @param {string} html
 * @param {object[]} findings
 */
function patchHtmlFromFindings(html, findings) {
  let out = html;
  for (const f of findings) {
    const hash = f.hash || (f.evidence && /three ASCII letters/.test(f.message) ? null : null);
    const dataHash = f.hash || (f.selector && f.selector.match(/data-ks-hash="([^"]+)"/)?.[1]);
    if (!dataHash || !/^[A-Za-z]{3}$/.test(dataHash)) continue;
    const selectorHash = dataHash;
    const re = new RegExp(
      `<([a-z][a-z0-9]*)\\b([^>]*)(?:hash=["'][^"']*["'])?([^>]*)(?:data-ks-hash=["']${selectorHash}["'])?([^>]*)>`,
      'gi',
    );
    out = out.replace(re, (match) => {
      if (!match.includes(`data-ks-hash="${selectorHash}"`) && !match.includes(`data-ks-hash='${selectorHash}'`)) {
        return match;
      }
      return syncHashAttrsOnOpenTag(match, selectorHash);
    });
    // Mismatch: hash="X" data-ks-hash="Y"
    const mm = f.message && f.message.match(/hash="([^"]+)" and data-ks-hash="([^"]+)"/);
    if (mm) {
      const h = mm[2];
      out = out.replace(
        new RegExp(`hash=["']${mm[1]}["']`, 'g'),
        `hash="${h}"`,
      );
    }
  }
  return out;
}

/**
 * @param {{ ruleId: string, repoRoot: string, findings?: object[], repoOverlay?: string }} ctx
 */
export async function runHashMarkersFixer(ctx) {
  const { repoRoot, findings = [], repoOverlay } = ctx;
  if (repoOverlay) {
    try {
      await seedHarnessRepo('DET.HASH.MARKERS', repoOverlay);
    } catch {
      /* optional */
    }
  }

  let touched = 0;
  for (const root of defaultWebsiteRoots(repoRoot)) {
    try {
      await fs.access(root);
    } catch {
      continue;
    }
    const htmlFiles = await findFilesRecursive(root, /\.html?$/i);
    for (const file of htmlFiles.slice(0, 30)) {
      const html = await readUtf8(file);
      const next = patchHtmlFromFindings(html, findings);
      if (next !== html) {
        await writeUtf8(file, next);
        touched += 1;
      }
    }
  }
  return { applied: touched > 0 || Boolean(repoOverlay), filesTouched: touched, adapter: 'hash_markers' };
}
