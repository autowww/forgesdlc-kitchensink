#!/usr/bin/env node
/**
 * Run AI.A11Y prompts against page context and merge findings into a11y-audit-data.json.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { mergeAiFindingsIntoAuditData } from './lib/ai-audit-batches.js';
import { listAiRulesFromRegistry, runAiRules, shouldSkipAiAgent } from './lib/ai-audit-run.mjs';

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
    } else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--skip-agent') opts.skipAgent = true;
  }
  if (!opts.outDir && opts.auditData) opts.outDir = path.dirname(opts.auditData);
  return opts;
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
  const aiRules = listAiRulesFromRegistry(registry, opts.onlyAiRuleIds);

  if (opts.dryRun) {
    console.log('AI rules:', aiRules.map((r) => r.id).join(', '));
    process.exit(0);
  }

  const audit = JSON.parse(await fs.readFile(opts.auditData, 'utf8'));
  const site = opts.site || audit.site || '';
  const urls = site ? [site] : [];

  const skipAgent = opts.skipAgent || shouldSkipAiAgent();
  const result = await runAiRules({
    rules: aiRules,
    repoRoot: opts.repo,
    urls,
    outDir: opts.outDir,
    skipAgent,
    verbose: true,
  });

  mergeAiFindingsIntoAuditData(audit, result.findings);
  audit.aiLaneExecuted = result.aiLaneExecuted;
  audit.aiAudit = {
    generatedAt: new Date().toISOString(),
    rulesRun: result.rulesRun,
    findingsAdded: result.findings.length,
    skippedReason: result.skippedReason,
  };
  await fs.writeFile(opts.auditData, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
  const aiOut = path.join(opts.outDir, 'ai-audit-summary.json');
  await fs.writeFile(
    aiOut,
    `${JSON.stringify({ findings: result.findings, count: result.findings.length }, null, 2)}\n`,
    'utf8',
  );
  console.log(`merged ${result.findings.length} AI findings → ${opts.auditData}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
