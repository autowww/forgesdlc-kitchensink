#!/usr/bin/env node
/**
 * Run AI.A11Y prompts against page context and merge findings into a11y-audit-data.json.
 *
 * Usage:
 *   node run-website-a11y-ai-audit.mjs --audit-data OUT/a11y-audit-data.json --repo ROOT --site URL
 *   node run-website-a11y-ai-audit.mjs --dry-run --audit-data ...
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { mergeAiFindingsIntoAuditData, normalizeAiFinding } from './lib/ai-audit-batches.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = __dirname;

function parseArgs(argv) {
  const opts = {
    auditData: '',
    repo: process.cwd(),
    site: '',
    outDir: '',
    onlyAiRuleIds: [],
    dryRun: false,
    skipAgent: process.env.FORGE_A11Y_SKIP_AI_AGENT === '1',
  };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--audit-data' && argv[i + 1]) opts.auditData = path.resolve(argv[++i]);
    else if (a === '--repo' && argv[i + 1]) opts.repo = path.resolve(argv[++i]);
    else if (a === '--site' && argv[i + 1]) opts.site = argv[++i];
    else if (a === '--out-dir' && argv[i + 1]) opts.outDir = path.resolve(argv[++i]);
    else if (a === '--only-ai-rule-ids' && argv[i + 1]) {
      opts.onlyAiRuleIds = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    }
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--skip-agent') opts.skipAgent = true;
  }
  if (!opts.outDir && opts.auditData) opts.outDir = path.dirname(opts.auditData);
  return opts;
}

function runShell(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd, stdio: 'inherit' });
    proc.on('error', reject);
    proc.on('close', (code) => resolve(code ?? 1));
  });
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.auditData) {
    console.error('run-website-a11y-ai-audit: --audit-data required');
    process.exit(2);
  }

  const registry = JSON.parse(
    await fs.readFile(path.join(TOOL_ROOT, 'design-rules/registry.generated.json'), 'utf8'),
  );
  let aiRules = registry.aiRules || [];
  if (opts.onlyAiRuleIds.length) {
    const set = new Set(opts.onlyAiRuleIds);
    aiRules = aiRules.filter((r) => set.has(r.id));
  }

  if (opts.dryRun) {
    console.log('AI rules:', aiRules.map((r) => r.id).join(', '));
    process.exit(0);
  }

  const audit = JSON.parse(await fs.readFile(opts.auditData, 'utf8'));
  const site = opts.site || audit.site || '';
  const urls = site ? [site] : [];

  const allFindings = [];
  const runScript = path.join(TOOL_ROOT, 'design-rules/ai/run-design-ai-rule.sh');

  for (const rule of aiRules) {
    const promptPath = path.join(TOOL_ROOT, rule.promptPath);
    const ruleOut = path.join(opts.outDir, 'ai-runs', rule.id.replace(/\./g, '-'));
    await fs.mkdir(ruleOut, { recursive: true });

    if (opts.skipAgent) {
      console.log(`skip agent: ${rule.id}`);
      continue;
    }

    const rc = await runShell(
      'bash',
      [
        runScript,
        '--rule-id',
        rule.id,
        '--out-dir',
        ruleOut,
        opts.repo,
        promptPath,
        ...urls,
      ],
      TOOL_ROOT,
    );
    if (rc !== 0) {
      console.warn(`AI run failed for ${rule.id} (exit ${rc})`);
      continue;
    }
    const findingsPath = path.join(ruleOut, 'ai-findings.json');
    try {
      const payload = JSON.parse(await fs.readFile(findingsPath, 'utf8'));
      for (const f of payload.findings || []) {
        const n = normalizeAiFinding({ ...f, principleId: f.principleId || rule.id }, site);
        if (n) allFindings.push(n);
      }
    } catch {
      /* no findings file */
    }
  }

  mergeAiFindingsIntoAuditData(audit, allFindings);
  audit.aiAudit = {
    generatedAt: new Date().toISOString(),
    rulesRun: aiRules.map((r) => r.id),
    findingsAdded: allFindings.length,
  };
  await fs.writeFile(opts.auditData, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
  const aiOut = path.join(opts.outDir, 'ai-audit-summary.json');
  await fs.writeFile(
    aiOut,
    `${JSON.stringify({ findings: allFindings, count: allFindings.length }, null, 2)}\n`,
    'utf8',
  );
  console.log(`merged ${allFindings.length} AI findings → ${opts.auditData}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
