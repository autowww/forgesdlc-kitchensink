import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { normalizeAiFinding } from './ai-audit-batches.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '..');

function runShell(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd, stdio: 'inherit' });
    proc.on('error', reject);
    proc.on('close', (code) => resolve(code ?? 1));
  });
}

/**
 * @param {object} registry
 * @param {string[]} [onlyAiRuleIds]
 */
export function listAiRulesFromRegistry(registry, onlyAiRuleIds = []) {
  let aiRules = registry.aiRules || [];
  if (onlyAiRuleIds?.length) {
    const set = new Set(onlyAiRuleIds);
    aiRules = aiRules.filter((r) => set.has(r.id));
  }
  return aiRules;
}

/**
 * @param {{
 *   rules: object[],
 *   repoRoot: string,
 *   urls: string[],
 *   outDir: string,
 *   skipAgent?: boolean,
 *   verbose?: boolean,
 * }} opts
 */
export async function runAiRules(opts) {
  const { rules, repoRoot, urls, outDir, skipAgent = false, verbose = false } = opts;
  const allFindings = [];
  const runScript = path.join(TOOL_ROOT, 'design-rules/ai/run-design-ai-rule.sh');
  const site = urls[0] || '';

  if (skipAgent) {
    if (verbose) console.error('[ai-audit-run] skip agent — no LLM execution');
    return { findings: [], rulesRun: [], aiLaneExecuted: false, skippedReason: 'skip_agent' };
  }

  let anyRun = false;
  for (const rule of rules) {
    const promptPath = path.join(TOOL_ROOT, rule.promptPath);
    const ruleOut = path.join(outDir, 'ai-runs', rule.id.replace(/\./g, '-'));
    await fs.mkdir(ruleOut, { recursive: true });

    const rc = await runShell(
      'bash',
      [runScript, '--rule-id', rule.id, '--out-dir', ruleOut, repoRoot, promptPath, ...urls],
      TOOL_ROOT,
    );
    if (rc !== 0) {
      if (verbose) console.warn(`[ai-audit-run] failed ${rule.id} (exit ${rc})`);
      continue;
    }
    anyRun = true;
    const findingsPath = path.join(ruleOut, 'ai-findings.json');
    try {
      const payload = JSON.parse(await fs.readFile(findingsPath, 'utf8'));
      for (const f of payload.findings || []) {
        const n = normalizeAiFinding({ ...f, principleId: f.principleId || rule.id, lane: 'ai' }, site);
        if (n) allFindings.push(n);
      }
    } catch {
      /* no findings file */
    }
  }

  return {
    findings: allFindings,
    rulesRun: rules.map((r) => r.id),
    aiLaneExecuted: anyRun,
    skippedReason: anyRun ? null : 'agent_unavailable_or_all_failed',
  };
}

/**
 * @param {object} [env]
 */
export function shouldSkipAiAgent(env = process.env) {
  if (env.FORGE_A11Y_SKIP_AI_AGENT === '1') return true;
  return false;
}
