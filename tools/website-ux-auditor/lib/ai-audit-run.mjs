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
  return aiRules.filter((r) => r.status === 'implemented' || r.promptPath);
}

/**
 * @param {{
 *   rules: object[],
 *   repoRoot: string,
 *   urls: string[],
 *   outDir: string,
 *   auditDataPath?: string,
 *   skipAgent?: boolean,
 *   agentCommand?: string,
 *   verbose?: boolean,
 * }} opts
 */
export async function runAiRules(opts) {
  const {
    rules,
    repoRoot,
    urls,
    outDir,
    auditDataPath,
    skipAgent = false,
    agentCommand,
    verbose = false,
  } = opts;
  const allFindings = [];
  const runScript = path.join(TOOL_ROOT, 'design-rules/ai/run-design-ai-rule.sh');
  const site = urls[0] || '';
  const contextFile = auditDataPath && (await fileExists(auditDataPath)) ? auditDataPath : '';

  if (skipAgent || shouldSkipAiAgent()) {
    if (verbose) console.error('[ux-ai-audit-run] skip agent — manifest-only / CI default');
    return {
      findings: [],
      rulesRun: rules.map((r) => r.id),
      aiLaneExecuted: false,
      skippedReason: skipAgent ? 'skip_agent' : 'skip_agent_env',
    };
  }

  const customCmd = String(agentCommand || process.env.FORGE_UX_AI_AGENT_COMMAND || '').trim();
  let anyRun = false;
  for (const rule of rules) {
    const promptPath = path.join(TOOL_ROOT, rule.promptPath);
    const ruleOut = path.join(outDir, 'ai-runs', rule.id.replace(/\./g, '-'));
    await fs.mkdir(ruleOut, { recursive: true });

    let rc;
    if (customCmd) {
      rc = await runShell('bash', ['-lc', customCmd], repoRoot);
    } else {
      const args = [
        runScript,
        '--rule-id',
        rule.id,
        '--out-dir',
        ruleOut,
        ...(contextFile ? ['--context', contextFile] : []),
        repoRoot,
        promptPath,
        ...urls,
      ];
      rc = await runShell('bash', args, TOOL_ROOT);
    }
    if (rc !== 0) {
      if (verbose) console.warn(`[ux-ai-audit-run] failed ${rule.id} (exit ${rc})`);
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

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {object} [env]
 */
export function shouldSkipAiAgent(env = process.env) {
  if (env.SKIP_CURSOR_AGENT === '1') return true;
  if (env.FORGE_UX_SKIP_AI_AGENT === '1') return true;
  if (env.FORGE_STUDIO_SKIP_AI_AGENT === '1') return true;
  return false;
}
