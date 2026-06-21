import fs from 'node:fs/promises';
import path from 'node:path';

import { readUtf8, writeUtf8 } from '../ops.mjs';
import {
  buildPlanOnlyResult,
  locateSourceCandidates,
  locateViteEntry,
  patchJsxForRule,
  shouldRefusePatch,
  CONFIDENCE_MEDIUM,
  ensureCssImportInTs,
  patchFontStackRule,
  patchResponsiveOverflow,
} from '../vite-react-patcher/index.mjs';
import { fixerResult, defaultVerifyCommand } from './fixer-result.mjs';
import { patchAppHtmlForRule } from './patches/app-dom.mjs';
import { patchHtmlFiles } from './patches/shared.mjs';
import { themeVarHint } from '../../../design-rules/deterministic/generated/det-theme-font-stack.check.js';
import {
  parseExpectedRoleFromFinding,
  parseObservedFontFromFinding,
  parsePathFromFinding,
  parseSelectorFromFinding,
} from '../finding-parse.mjs';

const JSX_RULES = new Set([
  'DET.APP.DEMO_DISCLOSURE',
  'DET.APP.PRIMARY_CTA',
  'DET.APP.PRIMARY_STATE',
  'DET.APP.TAB_PANEL',
  'DET.APP.TILE_AFFORDANCE',
]);

const HTML_RULES = new Set([
  ...JSX_RULES,
  'DET.APP.PRIMITIVE_STYLES',
  'DET.APP.SHELL_INTEGRATION',
]);

/**
 * @param {string} repoRoot
 * @param {object[]} findings
 * @param {string} ruleId
 */
async function patchJsxSources(repoRoot, findings, ruleId) {
  const { candidates, confidence } = await locateSourceCandidates(repoRoot, findings);
  if (shouldRefusePatch(confidence)) {
    return { touched: 0, confidence, refused: true };
  }
  let touched = 0;
  /** @type {string[]} */
  const files = [];
  for (const c of candidates) {
    if (c.confidence < CONFIDENCE_MEDIUM) continue;
    try {
      const before = await readUtf8(c.abs);
      const after = patchJsxForRule(before, ruleId);
      if (after !== before) {
        await writeUtf8(c.abs, after);
        touched += 1;
        files.push(c.path);
      }
    } catch {
      /* skip */
    }
  }
  return { touched, confidence, files, refused: false };
}

/**
 * @param {string} repoRoot
 * @param {object[]} findings
 */
async function patchPrimitiveStylesSources(repoRoot, findings) {
  let touched = 0;
  /** @type {string[]} */
  const files = [];
  const entry = await locateViteEntry(repoRoot);
  if (entry && entry.confidence >= CONFIDENCE_MEDIUM) {
    try {
      const before = await readUtf8(entry.abs);
      let after = before;
      if (/\.tsx?$|\.jsx?$/i.test(entry.rel)) {
        after = ensureCssImportInTs(before, '../css/forge-react-primitives.css');
      } else if (/index\.html$/i.test(entry.rel)) {
        after = patchAppHtmlForRule(before, 'DET.APP.PRIMITIVE_STYLES');
      }
      if (after !== before) {
        await writeUtf8(entry.abs, after);
        touched += 1;
        files.push(entry.rel);
      }
    } catch {
      /* */
    }
  }
  if (!touched) {
    const htmlTouched = await patchHtmlFiles(repoRoot, findings, (html) =>
      patchAppHtmlForRule(html, 'DET.APP.PRIMITIVE_STYLES'),
    );
    touched += htmlTouched;
  }
  return { touched, confidence: entry?.confidence ?? 0.45, files };
}

/**
 * @param {string} repoRoot
 * @param {object[]} findings
 */
async function patchThemeFontStackVite(repoRoot, findings) {
  let touched = 0;
  const { candidates } = await locateSourceCandidates(repoRoot, findings, {
    extensions: /\.css$/i,
  });
  const seen = new Set();
  for (const f of findings) {
    const rel = parsePathFromFinding(f);
    const expectedRole = parseExpectedRoleFromFinding(f) || 'body';
    const selector = parseSelectorFromFinding(f);
    const token = themeVarHint(expectedRole);
    const targets = rel
      ? [{ abs: path.join(repoRoot, rel), path: rel, confidence: 0.8 }]
      : candidates;
    for (const c of targets) {
      const key = `${c.path}:${selector}:${expectedRole}`;
      if (seen.has(key)) continue;
      seen.add(key);
      try {
        const before = await readUtf8(c.abs);
        const after = patchFontStackRule(before, selector, token);
        if (after !== before) {
          await writeUtf8(c.abs, after);
          touched += 1;
        }
      } catch {
        /* */
      }
    }
  }
  return { touched, confidence: touched ? 0.75 : 0.3 };
}

/**
 * @param {{ ruleId: string, repoRoot: string, findings?: object[] }} ctx
 */
export async function runAppViteReactFixer(ctx) {
  const { ruleId, repoRoot, findings = [] } = ctx;
  const verifyCommand = defaultVerifyCommand(ruleId);

  if (!findings.length) {
    return fixerResult({
      ruleId,
      fixerId: 'app_vite_react',
      applied: false,
      fallbackReason: `no ${ruleId} findings`,
      verifyCommand,
    });
  }

  if (ruleId === 'DET.APP.PRIMITIVE_STYLES') {
    const { touched, confidence, files } = await patchPrimitiveStylesSources(repoRoot, findings);
    if (touched > 0) {
      return fixerResult({
        ruleId,
        fixerId: 'app_vite_react',
        applied: true,
        filesTouched: touched,
        confidence,
        verifyCommand,
        adapter: 'app_vite_react',
        patchedFiles: files,
      });
    }
    return buildPlanOnlyResult({
      ruleId,
      reason: 'Could not locate Vite entry or HTML shell to link forge-react-primitives.css',
      findings,
      confidence,
    });
  }

  if (ruleId === 'DET.THEME.FONT_STACK') {
    const vite = await patchThemeFontStackVite(repoRoot, findings);
    if (vite.touched > 0) {
      return fixerResult({
        ruleId,
        fixerId: 'app_vite_react',
        applied: true,
        filesTouched: vite.touched,
        confidence: vite.confidence,
        verifyCommand,
        adapter: 'app_vite_react_css',
      });
    }
    return fixerResult({
      ruleId,
      fixerId: 'app_vite_react',
      applied: false,
      confidence: vite.confidence,
      fallbackReason: 'No CSS sources patched — defer to repo_production catalog fixer',
      verifyCommand,
    });
  }

  if (ruleId === 'DET.RESPONSIVE.NO_HORIZONTAL_OVERFLOW') {
    const { candidates } = await locateSourceCandidates(repoRoot, findings, { extensions: /\.css$/i });
    let touched = 0;
    for (const c of candidates.slice(0, 3)) {
      try {
        const before = await readUtf8(c.abs);
        const after = patchResponsiveOverflow(before);
        if (after !== before) {
          await writeUtf8(c.abs, after);
          touched += 1;
        }
      } catch {
        /* */
      }
    }
    if (touched) {
      return fixerResult({
        ruleId,
        fixerId: 'app_vite_react',
        applied: true,
        filesTouched: touched,
        confidence: 0.65,
        verifyCommand,
        adapter: 'app_vite_react_css',
      });
    }
  }

  if (HTML_RULES.has(ruleId)) {
    const htmlTouched = await patchHtmlFiles(repoRoot, findings, (html) =>
      patchAppHtmlForRule(html, ruleId),
    );
    if (htmlTouched > 0) {
      return fixerResult({
        ruleId,
        fixerId: 'app_vite_react',
        applied: true,
        filesTouched: htmlTouched,
        confidence: 0.8,
        verifyCommand,
        adapter: 'app_dom_html',
      });
    }
  }

  if (JSX_RULES.has(ruleId)) {
    const jsx = await patchJsxSources(repoRoot, findings, ruleId);
    if (jsx.touched > 0) {
      return fixerResult({
        ruleId,
        fixerId: 'app_vite_react',
        applied: true,
        filesTouched: jsx.touched,
        confidence: jsx.confidence,
        verifyCommand,
        adapter: 'app_vite_react_jsx',
        patchedFiles: jsx.files,
      });
    }
    if (jsx.refused) {
      return buildPlanOnlyResult({
        ruleId,
        reason: 'Source confidence too low to patch JSX safely — add sources[] or fix manually',
        findings,
        confidence: jsx.confidence,
      });
    }
  }

  return buildPlanOnlyResult({
    ruleId,
    reason: `No safe auto-patch for ${ruleId} — review remediation in rule handbook`,
    findings,
    confidence: 0.2,
  });
}
