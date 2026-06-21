import path from 'node:path';

import { readUtf8, writeUtf8 } from '../ops.mjs';
import { buildPlanOnlyResult } from '../vite-react-patcher/index.mjs';
import { fixerResult, defaultVerifyCommand } from './fixer-result.mjs';

const KS_REACT_PRIMITIVE_RE =
  /export const KS_REACT_PRIMITIVE = \{([\s\S]*?)\} as const/;

/**
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
      return { map, ksAttrsPath: p, confidence: 0.9 };
    } catch {
      /* try next */
    }
  }
  return { map: {}, ksAttrsPath: null, confidence: 0 };
}

/**
 * DET.APP.PRIMITIVE_SOURCE — ensure react/*.tsx spreads ksReactPrimitiveAttrs().
 * @param {{ ruleId: string, repoRoot: string, findings?: object[] }} ctx
 */
export async function runAppPrimitiveSourceFixer(ctx) {
  const { ruleId, repoRoot, findings = [] } = ctx;
  const verifyCommand = defaultVerifyCommand(ruleId);
  const { map, ksAttrsPath, confidence } = await loadPrimitiveMap(repoRoot);

  if (!ksAttrsPath || !Object.keys(map).length) {
    return buildPlanOnlyResult({
      ruleId,
      reason: 'KS_REACT_PRIMITIVE map not found — cannot patch primitive source reliably',
      findings,
      confidence,
    });
  }

  const reactDir = path.dirname(ksAttrsPath);
  let touched = 0;
  /** @type {string[]} */
  const patchedFiles = [];

  for (const componentKey of Object.keys(map)) {
    const tsxPath = path.join(reactDir, `${componentKey}.tsx`);
    const rel = path.relative(repoRoot, tsxPath).replace(/\\/g, '/');
    try {
      let src = await readUtf8(tsxPath);
      if (src.includes('ksReactPrimitiveAttrs(')) continue;

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
        patchedFiles.push(rel);
      }
    } catch {
      /* missing component file */
    }
  }

  if (touched > 0) {
    return fixerResult({
      ruleId,
      fixerId: 'app_primitive_source',
      applied: true,
      filesTouched: touched,
      confidence: 0.88,
      verifyCommand,
      adapter: 'app_primitive_source',
      patchedFiles,
    });
  }

  return buildPlanOnlyResult({
    ruleId,
    reason:
      'No react/*.tsx sources patched — verify component files exist and expose data-ks-name roots',
    findings,
    confidence: 0.35,
  });
}
