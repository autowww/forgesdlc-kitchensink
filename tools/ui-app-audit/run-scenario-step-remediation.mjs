#!/usr/bin/env node
/**
 * Step-scoped remediation orchestrator (one agent job per scenario×step).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { buildScenarioRemediationManifest } from './lib/scenario-remediation-manifest.mjs';
import { loadSmokePlan } from './lib/smoke-plan.mjs';
import { writeSmokeFixPass } from './lib/smoke-fix-pass.mjs';
import { resolveFixRoots } from '../website-ux-auditor/lib/fix-roots.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const opts = {
    appRepo: '',
    auditData: '',
    smokePlan: '',
    outDir: '',
    site: '',
    dryRun: false,
    legacySingleAgent: false,
    externalPaths: [],
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--app-repo' && argv[i + 1]) opts.appRepo = path.resolve(argv[++i]);
    else if (a === '--audit-data' && argv[i + 1]) opts.auditData = path.resolve(argv[++i]);
    else if (a === '--smoke-plan' && argv[i + 1]) opts.smokePlan = path.resolve(argv[++i]);
    else if (a === '--out-dir' && argv[i + 1]) opts.outDir = path.resolve(argv[++i]);
    else if (a === '--site' && argv[i + 1]) opts.site = argv[++i];
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--legacy-single-agent') opts.legacySingleAgent = true;
    else if (a.startsWith('--external-library-path') && a.includes('=')) {
      opts.externalPaths.push(a.split('=').slice(1).join('='));
    } else if (a === '-h' || a === '--help') {
      console.log(`Usage: node run-scenario-step-remediation.mjs --app-repo R --audit-data A --smoke-plan P --out-dir O [--site URL]`);
      process.exit(0);
    }
  }
  if (process.env.FORGE_UX_FIX_ROOTS) {
    opts.externalPaths.push(
      ...process.env.FORGE_UX_FIX_ROOTS.split(',').map((s) => s.trim()).filter(Boolean),
    );
  }
  return opts;
}

function runAgentScript(scriptPath, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(scriptPath, args, { stdio: 'inherit', env: { ...process.env, ...env } });
    child.on('close', (code) => resolve(code ?? 1));
    child.on('error', reject);
  });
}

async function main() {
  if (!process.env.FORGE_UX_CURSOR_AGENT_MODEL) {
    process.env.FORGE_UX_CURSOR_AGENT_MODEL = 'composer-2.5';
  }
  const opts = parseArgs(process.argv);
  if (!opts.appRepo || !opts.auditData || !opts.smokePlan || !opts.outDir) {
    console.error('run-scenario-step-remediation: --app-repo, --audit-data, --smoke-plan, --out-dir required');
    process.exit(2);
  }

  const auditRaw = JSON.parse(await fs.readFile(opts.auditData, 'utf8'));
  const plan = await loadSmokePlan(opts.smokePlan);
  const roots = resolveFixRoots(opts.appRepo, { externalPaths: opts.externalPaths });
  const manifest = buildScenarioRemediationManifest(auditRaw, plan, { roots });

  const manifestPath = path.join(opts.outDir, 'scenario-remediation-manifest.json');
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.error(`run-scenario-step-remediation: ${manifest.jobs.length} job(s) → ${manifestPath}`);

  if (opts.legacySingleAgent) {
    const legacy = path.join(opts.appRepo, 'scripts', 'run-studio-ux-agent-next.sh');
    try {
      await fs.access(legacy);
      const code = await runAgentScript(legacy, [opts.appRepo, opts.auditData], {});
      process.exit(code);
    } catch {
      console.error('run-scenario-step-remediation: legacy agent script not found');
      process.exit(1);
    }
  }

  const stepScript = path.join(opts.appRepo, 'scripts', 'cursor-agent-run-studio-step.sh');
  const results = [];

  for (const job of manifest.jobs) {
    const allowed = (job.render_roots || [])
      .map((r) => r.path)
      .filter(Boolean)
      .join('\n');
    console.error(
      `run-scenario-step-remediation: job ${job.scenarioId}/${job.stepId} findings=${job.findings.length}`,
    );
    if (opts.dryRun) {
      results.push({ ...job, status: 'dry_run' });
      continue;
    }
    try {
      await fs.access(stepScript);
      const code = await runAgentScript(
        stepScript,
        [opts.appRepo, opts.auditData, job.scenarioId, job.stepId],
        { FORGE_STUDIO_STEP_ALLOWED_PATHS: allowed },
      );
      results.push({ scenarioId: job.scenarioId, stepId: job.stepId, status: code === 0 ? 'ok' : 'failed', exitCode: code });
    } catch {
      console.error(
        `run-scenario-step-remediation: missing ${stepScript} — write manifest only; create product wrapper script.`,
      );
      results.push({ scenarioId: job.scenarioId, stepId: job.stepId, status: 'skipped_no_script' });
    }
  }

  const resultsPath = path.join(opts.outDir, 'step-agent-results.json');
  await fs.writeFile(resultsPath, `${JSON.stringify({ results }, null, 2)}\n`, 'utf8');

  await writeSmokeFixPass(opts.outDir, {
    passId: `step-agents-${Date.now()}`,
    fixRoots: roots,
    scenarios: results.map((r) => ({
      scenarioId: r.scenarioId,
      stepId: r.stepId,
      disposition: r.status,
      ruleIds: [],
    })),
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
