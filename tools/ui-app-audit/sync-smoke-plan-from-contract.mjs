#!/usr/bin/env node
/**
 * Merge Automation test contract (studio-functionality.md) into smoke-plan.yaml.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

import {
  buildScenarioFromContract,
  expandContractRowsToScenarioIds,
  parseRelatedFilesSection,
} from './lib/contract-smoke-sync.mjs';
import { loadSmokePlan } from './lib/smoke-plan.mjs';
import { parseAutomationContractTable } from './lib/parse-contract-md.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const opts = {
    appRepo: '',
    smokePlan: '',
    contractMd: '',
    dryRun: false,
    force: false,
    prune: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--app-repo' && argv[i + 1]) opts.appRepo = path.resolve(argv[++i]);
    else if (a === '--smoke-plan' && argv[i + 1]) opts.smokePlan = path.resolve(argv[++i]);
    else if (a === '--contract-md' && argv[i + 1]) opts.contractMd = path.resolve(argv[++i]);
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--force') opts.force = true;
    else if (a === '--prune') opts.prune = true;
    else if (a === '-h' || a === '--help') {
      console.log(`Usage: node sync-smoke-plan-from-contract.mjs --app-repo R --smoke-plan P [options]

  --contract-md PATH   Default: <app-repo>/docs/studio-functionality.md
  --dry-run            Print diff summary only
  --force              Update implemented scenarios (navigate/ready/steps)
  --prune              Remove yaml scenarios not in contract (dangerous)`);
      process.exit(0);
    }
  }
  return opts;
}

/**
 * @param {object} existing
 * @param {object} proposed
 * @param {boolean} force
 */
function mergeScenario(existing, proposed, force) {
  if (!existing) return { scenario: proposed, action: 'add' };
  const status = String(existing.status || '');
  if (status === 'implemented' && !force) {
    return { scenario: existing, action: 'skip_implemented' };
  }
  const merged = { ...existing, ...proposed };
  if (status === 'implemented' && force) {
    merged.status = 'implemented';
  }
  return { scenario: merged, action: force ? 'update' : 'merge' };
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.appRepo || !opts.smokePlan) {
    console.error('sync-smoke-plan-from-contract: --app-repo and --smoke-plan required');
    process.exit(2);
  }
  const contractMd =
    opts.contractMd || path.join(opts.appRepo, 'docs', 'studio-functionality.md');
  const md = await fs.readFile(contractMd, 'utf8');
  const rows = parseAutomationContractTable(md);
  const related = parseRelatedFilesSection(md);
  const appRepoName = path.basename(opts.appRepo);
  const ctx = { appRepoName, related };

  let existingPlan;
  try {
    existingPlan = await loadSmokePlan(opts.smokePlan);
  } catch {
    existingPlan = { planId: 'forge-a11y-studio', baseUrl: null, scenarios: [] };
  }

  /** @type {Map<string, object>} */
  const byId = new Map(existingPlan.scenarios.map((s) => [s.scenarioId, s]));
  const contractIds = new Set();
  const summary = { add: 0, update: 0, skip: 0 };

  const expanded = expandContractRowsToScenarioIds(rows);
  for (const { scenarioId, row } of expanded) {
    contractIds.add(scenarioId);
    const proposed = buildScenarioFromContract(scenarioId, row, row.selectorCell || '', ctx);
    const existing = byId.get(scenarioId);
    const { scenario, action } = mergeScenario(existing, proposed, opts.force);
    byId.set(scenarioId, scenario);
    if (action === 'add') summary.add += 1;
    else if (action === 'update' || action === 'merge') summary.update += 1;
    else summary.skip += 1;
  }

  if (opts.prune) {
    for (const sid of [...byId.keys()]) {
      if (!contractIds.has(sid) && byId.get(sid)?.tier !== 'integration') {
        byId.delete(sid);
        summary.update += 1;
      }
    }
  }

  const scenarios = [...byId.values()].sort((a, b) => a.scenarioId.localeCompare(b.scenarioId));
  const outDoc = {
    planId: existingPlan.planId || 'forge-a11y-studio',
    baseUrl: existingPlan.baseUrl,
    scenarios,
  };

  const header = `# Generated/updated by sync-smoke-plan-from-contract.mjs — merge with docs/studio-functionality.md contract.\n`;
  const body = yaml.dump(outDoc, { lineWidth: 120, noRefs: true });

  console.error(
    `sync-smoke-plan-from-contract: add=${summary.add} update=${summary.update} skip_implemented=${summary.skip} total=${scenarios.length}`,
  );

  if (opts.dryRun) {
    console.log(header);
    console.log(body.slice(0, 2000));
    return;
  }

  await fs.mkdir(path.dirname(opts.smokePlan), { recursive: true });
  await fs.writeFile(opts.smokePlan, `${header}\n${body}`, 'utf8');
  console.error(`sync-smoke-plan-from-contract: wrote ${opts.smokePlan}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
