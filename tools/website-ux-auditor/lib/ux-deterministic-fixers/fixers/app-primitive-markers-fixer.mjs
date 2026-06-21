import fs from 'node:fs/promises';
import path from 'node:path';

import { readUtf8, writeUtf8 } from '../ops.mjs';

const KS_REACT_PRIMITIVE_RE =
  /export const KS_REACT_PRIMITIVE = \{([\s\S]*?)\} as const/;

/**
 * Parse KS_REACT_PRIMITIVE rows from ksVisualAttrs.ts when present in repo.
 * @param {string} repoRoot
 */
async function loadPrimitiveMap(repoRoot) {
  const candidates = [
    path.join(repoRoot, 'react', 'ksVisualAttrs.ts'),
    path.join(repoRoot, 'kitchensink', 'react', 'ksVisualAttrs.ts'),
    path.join(repoRoot, 'forgesdlc-kitchensink', 'react', 'ksVisualAttrs.ts'),
  ];
  for (const p of candidates) {
    try {
      const text = await readUtf8(p);
      const block = text.match(KS_REACT_PRIMITIVE_RE);
      if (!block) continue;
      /** @type {Record<string, { hash: string, name: string }>} */
      const map = {};
      for (const line of block[1].split('\n')) {
        const m = line.match(/^\s*(\w+):\s*\{\s*hash:\s*'([^']+)',\s*name:\s*'([^']+)'/);
        if (m) map[m[1]] = { hash: m[2], name: m[3] };
      }
      return { map, ksAttrsPath: p };
    } catch {
      /* try next */
    }
  }
  return { map: {}, ksAttrsPath: null };
}

/**
 * Ensure react/*.tsx primitive components spread ksReactPrimitiveAttrs in source.
 * @param {{ ruleId: string, repoRoot: string, findings?: object[] }} ctx
 */
export async function runAppPrimitiveMarkersFixer(ctx) {
  const { repoRoot, findings = [] } = ctx;
  const { map, ksAttrsPath } = await loadPrimitiveMap(repoRoot);
  if (!ksAttrsPath || !Object.keys(map).length) {
    return {
      applied: false,
      error: 'KS_REACT_PRIMITIVE map not found — use agent remediation with sources[]',
    };
  }

  const reactDir = path.dirname(ksAttrsPath);
  let touched = 0;

  for (const componentKey of Object.keys(map)) {
    const tsxPath = path.join(reactDir, `${componentKey}.tsx`);
    try {
      let src = await readUtf8(tsxPath);
      if (src.includes('ksReactPrimitiveAttrs')) continue;
      if (!src.includes('data-ks-react-root') && !src.includes('react-primitive')) continue;

      if (!src.includes("from './ksVisualAttrs'") && !src.includes('from "./ksVisualAttrs"')) {
        src = `import { ksReactPrimitiveAttrs } from './ksVisualAttrs';\n${src}`;
      }
      const rootRe = new RegExp(
        `(<[a-zA-Z][a-zA-Z0-9]*)([^>]*)(data-ks-name=["']${map[componentKey].name}["'])([^>]*)>`,
        'i',
      );
      if (rootRe.test(src)) {
        src = src.replace(
          rootRe,
          `$1$2$3$4 {...ksReactPrimitiveAttrs('${componentKey}')}>`,
        );
        await writeUtf8(tsxPath, src);
        touched += 1;
      }
    } catch {
      /* missing file */
    }
  }

  if (touched > 0) {
    return { applied: true, filesTouched: touched, adapter: 'app_primitive_markers_source' };
  }

  if (findings.length) {
    return {
      applied: false,
      error:
        'No react/*.tsx sources patched — DOM violations may be static HTML; use hash_markers on static partials or agent with sources[]',
    };
  }

  return { applied: false, error: 'no DET.APP.PRIMITIVE_MARKERS findings' };
}
