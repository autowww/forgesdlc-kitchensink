#!/usr/bin/env node
/**
 * Verify docs/studio-functionality.md Automation test contract ↔ smoke-plan.yaml.
 *
 * Usage:
 *   node check-smoke-plan-contract.mjs --app-repo PATH --smoke-plan PATH [--contract-md PATH]
 */
import fs from 'node:fs/promises';
import path from 'node:path';

import { loadSmokePlan } from './lib/smoke-plan.mjs';
import { parseAutomationContractTable } from './lib/parse-contract-md.mjs';

function parseArgs(argv) {
  const opts = { appRepo: '', smokePlan: '', contractMd: '' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--app-repo' && argv[i + 1]) opts.appRepo = path.resolve(argv[++i]);
    else if (a === '--smoke-plan' && argv[i + 1]) opts.smokePlan = path.resolve(argv[++i]);
    else if (a === '--contract-md' && argv[i + 1]) opts.contractMd = path.resolve(argv[++i]);
  }
  return opts;
}

const PRIMARY_ROUTE_SCENARIO_IDS = [
  'route-dashboard',
  'route-attention',
  'route-check',
  'route-registry',
  'route-run-hub',
  'route-insights',
  'route-test-plans',
  'route-triage',
  'route-remediation',
  'route-monitoring',
  'route-reports',
  'route-settings',
  'route-about',
];

/** Map contract table test ids to smoke-plan scenarioId conventions. */
function scenarioIdFromContractRow(row) {
  if (row.scenarioId) return row.scenarioId;
  const tid = row.testId || '';
  if (tid.includes('test_primary_routes')) return null;
  if (tid.includes('test_studio_home_loads')) return 'home-shell';
  if (tid.includes('test_studio_registry_partial')) return 'registry-overview';
  if (tid.includes('test_demo_run_hub')) return 'demo-run-hub';
  if (tid.includes('test_assistant_route_shows')) return 'assistant-route-mount';
  if (tid.includes('test_demo_insights_does_not_fetch')) return 'demo-insights-no-fetch';
  if (tid.includes('test_demo_insights_workspace_populated') || tid.includes('test_demo_insights_workspace')) {
    return 'demo-insights-populated';
  }
  if (tid.includes('test_demo_triage_does_not_fetch')) return 'demo-triage-no-fetch';
  if (tid.includes('test_demo_triage_workspace_populated') || tid.includes('test_demo_triage_workspace')) {
    return 'demo-triage-populated';
  }
  if (tid.includes('integration_real_run')) return null;
  if (tid.includes('e2e_audit_assistant')) return null;
  return null;
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.appRepo || !opts.smokePlan) {
    console.error('check-smoke-plan-contract: --app-repo and --smoke-plan required');
    process.exit(2);
  }
  const contractMd =
    opts.contractMd || path.join(opts.appRepo, 'docs', 'studio-functionality.md');
  const md = await fs.readFile(contractMd, 'utf8');
  const rows = parseAutomationContractTable(md).filter((r) => r.status === 'implemented');
  const plan = await loadSmokePlan(opts.smokePlan);
  const yamlIds = new Set(plan.scenarios.map((s) => s.scenarioId));

  const errors = [];
  for (const row of rows) {
    const tid = row.testId || '';
    if (tid.includes('test_primary_routes')) {
      for (const sid of PRIMARY_ROUTE_SCENARIO_IDS) {
        if (!yamlIds.has(sid)) {
          errors.push(`MD primary routes missing smoke-plan scenarioId=${sid}`);
        }
      }
      continue;
    }
    const fragments = tid.split(',').map((s) => s.trim()).filter(Boolean);
    const mapped = new Set();
    for (const frag of fragments.length ? fragments : [tid]) {
      const sid = scenarioIdFromContractRow({ ...row, testId: frag });
      if (sid) mapped.add(sid);
    }
    for (const sid of mapped) {
      if (!yamlIds.has(sid)) {
        errors.push(`MD contract missing smoke-plan scenarioId=${sid} (anchor=${row.docAnchor})`);
      }
    }
    if (!mapped.size && !tid.includes('integration') && !tid.includes('e2e_audit_assistant')) {
      errors.push(`MD contract row not mapped to smoke-plan: ${tid.slice(0, 80)}`);
    }
  }

  const mdMapped = new Set();
  for (const row of rows) {
    const tid = row.testId || '';
    const fragments = tid.split(',').map((s) => s.trim()).filter(Boolean);
    for (const frag of fragments.length ? fragments : [tid]) {
      const sid = scenarioIdFromContractRow({ ...row, testId: frag });
      if (sid) mdMapped.add(sid);
    }
  }
  for (const sid of PRIMARY_ROUTE_SCENARIO_IDS) mdMapped.add(sid);
  for (const s of plan.scenarios) {
    if (s.tier === 'integration' || s.tier === 'integration-e2e') continue;
    if (!mdMapped.has(s.scenarioId) && s.status !== 'planned') {
      errors.push(`smoke-plan scenario ${s.scenarioId} not mapped from MD contract table`);
    }
  }

  if (errors.length) {
    console.error('check-smoke-plan-contract: FAILED');
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`check-smoke-plan-contract: OK (${yamlIds.size} yaml scenarios, ${rows.length} md rows)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
