#!/usr/bin/env node
/**
 * Run UX AI.* prompts against audit context and optionally merge scoreable findings into audit-data.json.
 *
 * CI default: manifest-only (skip agent) unless FORGE_UX_ENABLE_AI_AUDIT=1 or --execute.
 * Score/gate merge: FORGE_UX_AI_MERGE_INTO_SCORE=1 and confidence >= FORGE_UX_AI_SCORE_CONFIDENCE_MIN.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildAiAuditBatchManifest,
  loadAiScoreGateOptionsFromEnv,
  mergeAiFindingsIntoAuditData,
} from './lib/ai-audit-batches.js';
import { listAiRulesFromRegistry, runAiRules, shouldSkipAiAgent } from './lib/ai-audit-run.mjs';
import { runAiFixers } from './lib/ux-ai-fixers/index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = __dirname;

function usage() {
  console.log(`usage: node run-website-ux-ai-audit.mjs --audit-data PATH [options]

Options:
  --repo PATH              Repository root (default: cwd)
  --site URL               Site origin for AI rule runner URLs
  --out-dir PATH           Output directory (default: dirname of audit-data)
  --only-ai-rule-ids IDS   Comma-separated AI rule ids
  --manifest-only          Write ai-audit/manifest.json only (no agent)
  --execute                Run agent / pluggable command (overrides manifest-only)
  --merge-score            Merge scoreable findings into audit-data.json
  --dry-run                List AI rules and exit
  --skip-agent             Do not invoke agent
  --help`);
}

function parseArgs(argv) {
  const opts = {
    auditData: '',
    repo: process.cwd(),
    site: '',
    outDir: '',
    onlyAiRuleIds: [],
    dryRun: false,
    skipAgent: shouldSkipAiAgent(),
    manifestOnly: process.env.FORGE_UX_ENABLE_AI_AUDIT !== '1' && process.env.FORGE_STUDIO_ENABLE_AI_AUDIT !== '1',
    execute: false,
    mergeScore: process.env.FORGE_UX_AI_MERGE_INTO_SCORE === '1',
  };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      usage();
      process.exit(0);
    } else if (a === '--audit-data' && argv[i + 1]) opts.auditData = path.resolve(argv[++i]);
    else if (a === '--repo' && argv[i + 1]) opts.repo = path.resolve(argv[++i]);
    else if (a === '--site' && argv[i + 1]) opts.site = argv[++i];
    else if (a === '--out-dir' && argv[i + 1]) opts.outDir = path.resolve(argv[++i]);
    else if (a === '--only-ai-rule-ids' && argv[i + 1]) {
      opts.onlyAiRuleIds = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    } else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--skip-agent') opts.skipAgent = true;
    else if (a === '--manifest-only') opts.manifestOnly = true;
    else if (a === '--execute') {
      opts.execute = true;
      opts.manifestOnly = false;
    } else if (a === '--merge-score') opts.mergeScore = true;
  }
  if (!opts.outDir && opts.auditData) opts.outDir = path.dirname(opts.auditData);
  if (opts.execute) opts.manifestOnly = false;
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.auditData) {
    console.error('run-website-ux-ai-audit: --audit-data required');
    usage();
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
  const aiOut = path.join(opts.outDir, 'ai-audit');
  await fs.mkdir(aiOut, { recursive: true });

  const manifest = await buildAiAuditBatchManifest({
    auditData: audit,
    repoRoot: opts.repo,
    batchSize: 1,
  });
  await fs.writeFile(path.join(aiOut, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  const site = opts.site || audit.site || '';
  const urls = site ? [site] : (audit.pages || []).map((p) => p.url).filter(Boolean).slice(0, 5);

  const skipAgent = opts.skipAgent || opts.manifestOnly || shouldSkipAiAgent();
  const result = await runAiRules({
    rules: aiRules,
    repoRoot: opts.repo,
    urls: urls.length ? urls : ['http://127.0.0.1/'],
    outDir: aiOut,
    auditDataPath: opts.auditData,
    skipAgent,
    verbose: true,
  });

  const scoreOpts = loadAiScoreGateOptionsFromEnv();
  const mergeScore = opts.mergeScore || scoreOpts.mergeIntoAuditData;

  audit.aiLaneExecuted = result.aiLaneExecuted;
  audit.aiAudit = {
    generatedAt: new Date().toISOString(),
    status: result.aiLaneExecuted ? 'executed' : 'manifest_only',
    rulesRun: result.rulesRun,
    findingsAdded: result.findings.length,
    skippedReason: result.skippedReason,
    manifestPath: path.join(aiOut, 'manifest.json'),
    mergeIntoScore: mergeScore,
  };

  if (mergeScore && result.findings.length) {
    mergeAiFindingsIntoAuditData(audit, result.findings, { minConfidence: scoreOpts.minConfidence });
  }

  await fs.writeFile(opts.auditData, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');

  const summaryPath = path.join(aiOut, 'ai-audit-summary.json');
  await fs.writeFile(
    summaryPath,
    `${JSON.stringify({ findings: result.findings, count: result.findings.length, mergeScore }, null, 2)}\n`,
    'utf8',
  );

  if (result.findings.length && mergeScore) {
    const { reportPath } = await runAiFixers({
      auditDataPath: opts.auditData,
      outDir: path.join(aiOut, 'fixers'),
      repoRoot: opts.repo,
    });
    console.error(`ux-ai-fixers: ${reportPath}`);
  }

  console.log(
    `run-website-ux-ai-audit: ${result.findings.length} findings · lane=${result.aiLaneExecuted ? 'executed' : 'manifest_only'} · merge=${mergeScore}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
