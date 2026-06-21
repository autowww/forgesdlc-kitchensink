#!/usr/bin/env node
/**
 * Scenario coverage report: routes, tiers, audited scenarios, missing candidates, failures by lane.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

import { loadSmokePlan } from './lib/smoke-plan.mjs';
import { buildScenarioCoverage, formatCoverageSummary } from './lib/scenario-coverage.mjs';
import { inferAllRoutes } from './lib/vite-react-smoke-inference.mjs';

function parseArgs(argv) {
  const opts = { smokePlan: '', audit: '', appRepo: '', out: '', json: true };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--smoke-plan' && argv[i + 1]) opts.smokePlan = path.resolve(argv[++i]);
    else if (a === '--audit' && argv[i + 1]) opts.audit = path.resolve(argv[++i]);
    else if (a === '--app-repo' && argv[i + 1]) opts.appRepo = path.resolve(argv[++i]);
    else if (a === '--out' && argv[i + 1]) opts.out = path.resolve(argv[++i]);
    else if (a === '--text') opts.json = false;
    else if (a === '-h' || a === '--help') {
      console.log(`Usage: node report-scenario-coverage.mjs --smoke-plan PATH [options]

  --audit PATH          audit-data.json from run-scenario-audit
  --app-repo PATH       Infer missing route candidates from app tree
  --out PATH            Write scenario-coverage.json (default stdout JSON)
  --text                Human-readable summary to stdout`);
      process.exit(0);
    }
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.smokePlan) {
    console.error('report-scenario-coverage: --smoke-plan required');
    process.exit(2);
  }

  const plan = await loadSmokePlan(opts.smokePlan);
  let auditData = null;
  if (opts.audit) {
    auditData = JSON.parse(await fs.readFile(opts.audit, 'utf8'));
  }

  let inferredRoutes = [];
  if (opts.appRepo) {
    const inferred = await inferAllRoutes({
      appRoot: opts.appRepo,
      existingScenarios: plan.scenarios,
    });
    inferredRoutes = inferred.all;
  }

  const coverage = buildScenarioCoverage({
    plan,
    auditData,
    inferredRoutes,
  });

  const payload = `${JSON.stringify(coverage, null, 2)}\n`;
  if (opts.out) {
    await fs.mkdir(path.dirname(opts.out), { recursive: true });
    await fs.writeFile(opts.out, payload, 'utf8');
    console.error(`report-scenario-coverage: wrote ${opts.out}`);
  } else if (opts.json) {
    process.stdout.write(payload);
  } else {
    console.log(formatCoverageSummary(coverage));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
