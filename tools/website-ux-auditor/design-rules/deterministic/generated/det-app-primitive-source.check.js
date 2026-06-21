/**
 * DET.APP.PRIMITIVE_SOURCE — Every KS_REACT_PRIMITIVE .tsx spreads ksReactPrimitiveAttrs().
 */

import fs from 'node:fs';
import path from 'node:path';

/** Cap findings per repo scan. */
export const MAX_APP_PRIMITIVE_SOURCE_FINDINGS = 12;

const KS_REACT_PRIMITIVE_RE =
  /export const KS_REACT_PRIMITIVE = \{([\s\S]*?)\} as const/;

export const rule = {
  id: 'DET.APP.PRIMITIVE_SOURCE',
  lane: 'deterministic',
  phase: 'repo',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'minor',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-primitive_source',
};

/**
 * @param {string} repoRoot
 * @returns {{ skipped: boolean, issues: Array<{ path: string, message: string }> }}
 */
export function scanAppPrimitiveSource(repoRoot) {
  const candidates = [
    path.join(repoRoot, 'react', 'ksVisualAttrs.ts'),
    path.join(repoRoot, 'kitchensink', 'react', 'ksVisualAttrs.ts'),
  ];

  let reactDir = '';
  let primitiveKeys = [];

  for (const attrsPath of candidates) {
    if (!fs.existsSync(attrsPath)) continue;
    const text = fs.readFileSync(attrsPath, 'utf8');
    const block = text.match(KS_REACT_PRIMITIVE_RE);
    if (!block) continue;
    reactDir = path.dirname(attrsPath);
    for (const line of block[1].split('\n')) {
      const m = line.match(/^\s*(\w+):/);
      if (m) primitiveKeys.push(m[1]);
    }
    break;
  }

  if (!reactDir || !primitiveKeys.length) {
    return { skipped: true, issues: [] };
  }

  /** @type {Array<{ path: string, message: string }>} */
  const issues = [];

  for (const key of primitiveKeys) {
    const rel = `react/${key}.tsx`;
    const abs = path.join(reactDir, `${key}.tsx`);
    if (!fs.existsSync(abs)) {
      issues.push({
        path: rel,
        message: `Primitive component ${rel} is listed in KS_REACT_PRIMITIVE but missing on disk.`,
      });
      continue;
    }
    const src = fs.readFileSync(abs, 'utf8');
    if (!/\bksReactPrimitiveAttrs\s*\(/.test(src)) {
      issues.push({
        path: rel,
        message: `${rel} does not spread ksReactPrimitiveAttrs() on the primitive root.`,
      });
    }
  }

  issues.sort((a, b) => a.path.localeCompare(b.path));
  return { skipped: false, issues };
}

/**
 * @param {{ skipped?: boolean, issues?: Array<{ path: string, message: string }> }} report
 */
export function findingsFromAppPrimitiveSourceReport(report) {
  if (!report || report.skipped) return [];
  const issues = Array.isArray(report.issues) ? report.issues : [];
  if (!issues.length) return [];

  const findings = [];
  for (const issue of issues.slice(0, MAX_APP_PRIMITIVE_SOURCE_FINDINGS)) {
    findings.push({
      severity: 'minor',
      area: 'visual-catalog',
      message: issue.message,
      evidence: `tsx_source=${issue.path}`,
      remediation:
        'Import `ksReactPrimitiveAttrs` from `./ksVisualAttrs` and spread it on each primitive root per FAM-react-primitives.md.',
    });
  }

  if (issues.length > MAX_APP_PRIMITIVE_SOURCE_FINDINGS) {
    findings.push({
      severity: 'minor',
      area: 'visual-catalog',
      message: `Additional primitive source issues omitted (${issues.length - MAX_APP_PRIMITIVE_SOURCE_FINDINGS} more).`,
      evidence: `app_primitive_source_total=${issues.length}`,
      remediation: 'Audit all files under react/*.tsx listed in KS_REACT_PRIMITIVE.',
    });
  }

  return findings;
}

export async function run({ metrics, repoRoot, ctx }) {
  const root = String(repoRoot || ctx?.repoRoot || metrics?.repoRoot || '').trim();
  if (!root) return [];

  const report = metrics?.appPrimitiveSourceReport ?? scanAppPrimitiveSource(root);
  return findingsFromAppPrimitiveSourceReport(report);
}
