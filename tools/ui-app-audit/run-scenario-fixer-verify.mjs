#!/usr/bin/env node
/**
 * Per-scenario fixer verify: apply UX/a11y fixers for selected rules, re-audit impacted scenarios,
 * optionally promote to full smoke tiers when impacted scenarios pass.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

import {
  buildScenarioCoverage,
  filterScenariosByIds,
  impactedScenarioIdsFromFindings,
} from './lib/scenario-coverage.mjs';
import { loadSmokePlan } from './lib/smoke-plan.mjs';
import { buildSmokeFixPassScenarios, writeSmokeFixPass } from './lib/smoke-fix-pass.mjs';
import { parseExternalLibraryPathsFromArgs, resolveFixRoots } from '../website-ux-auditor/lib/fix-roots.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KS_ROOT = path.resolve(__dirname, '../..');

function parseArgs(argv) {
  const opts = {
    repoRoot: '',
    auditData: '',
    site: '',
    smokePlan: '',
    outDir: '',
    ruleIds: [],
    scenarioIds: [],
    promoteFullSmoke: false,
    skipFixers: false,
    lanes: 'axe,det,ux-det',
    tiers: 'smoke',
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo-root' && argv[i + 1]) opts.repoRoot = path.resolve(argv[++i]);
    else if (a === '--audit-data' && argv[i + 1]) opts.auditData = path.resolve(argv[++i]);
    else if (a === '--site' && argv[i + 1]) opts.site = argv[++i];
    else if (a === '--smoke-plan' && argv[i + 1]) opts.smokePlan = path.resolve(argv[++i]);
    else if (a === '--out-dir' && argv[i + 1]) opts.outDir = path.resolve(argv[++i]);
    else if (a === '--rule-id' && argv[i + 1]) opts.ruleIds.push(argv[++i]);
    else if (a === '--scenario-id' && argv[i + 1]) opts.scenarioIds.push(argv[++i]);
    else if (a === '--promote-full-smoke') opts.promoteFullSmoke = true;
    else if (a === '--skip-fixers') opts.skipFixers = true;
    else if (a === '--lanes' && argv[i + 1]) opts.lanes = argv[++i];
    else if (a === '--tiers' && argv[i + 1]) opts.tiers = argv[++i];
    else if (a === '-h' || a === '--help') {
      console.log(`Usage: node run-scenario-fixer-verify.mjs --repo-root R --audit-data A --site URL --smoke-plan P --out-dir O [options]

  --rule-id ID          Repeatable; default: all rules with findings on impacted scenarios
  --scenario-id ID      Repeatable; limit verify re-audit
  --promote-full-smoke  After impacted pass, re-run full plan tiers smoke,demo
  --skip-fixers         Re-audit only (no fixer pass)
  --lanes LIST          Default axe,det,ux-det
  --tiers LIST          Default smoke

Env (explicit opt-in):
  FORGE_STUDIO_UX_FIXERS=1       Run UX deterministic fixers (default 1 when fixers enabled)
  FORGE_STUDIO_A11Y_FIXERS=1     Run a11y deterministic fixers
  FORGE_STUDIO_A11Y_AI_FIXERS=1  Run a11y AI fixers (plan_only unless EXECUTE set)`);
      process.exit(0);
    }
  }
  if (!opts.outDir && opts.auditData) opts.outDir = path.join(path.dirname(opts.auditData), 'verify');
  return opts;
}

/**
 * @param {string} subsetPlanPath
 * @param {object} plan
 * @param {string[]} scenarioIds
 */
async function writeSubsetPlan(subsetPlanPath, plan, scenarioIds) {
  const subset = {
    planId: plan.planId,
    baseUrl: plan.baseUrl,
    scenarios: filterScenariosByIds(plan.scenarios, scenarioIds),
  };
  await fs.mkdir(path.dirname(subsetPlanPath), { recursive: true });
  await fs.writeFile(subsetPlanPath, yaml.dump(subset, { lineWidth: 120 }), 'utf8');
}

/**
 * @param {object} opts
 * @param {string} planPath
 * @param {string} label
 */
function runScenarioAudit(opts, planPath, label) {
  const auditScript = path.join(__dirname, 'run-scenario-audit.mjs');
  const args = [
    auditScript,
    '--site',
    opts.site,
    '--smoke-plan',
    planPath,
    '--out-dir',
    path.join(opts.outDir, label),
    '--app-repo',
    opts.repoRoot,
    '--lanes',
    opts.lanes,
    '--tiers',
    opts.tiers,
    '--emit-coverage',
  ];
  console.error(`[scenario-fixer-verify] audit ${label}`);
  const proc = spawnSync(process.execPath, args, { stdio: 'inherit', env: process.env });
  return proc.status ?? 1;
}

async function runUxFixers(opts, auditPath) {
  const fixer = path.join(KS_ROOT, 'tools/website-ux-auditor/lib/ux-deterministic-fixers/run-deterministic-fixers.mjs');
  const args = [
    fixer,
    '--repo-root',
    opts.repoRoot,
    '--audit-data',
    auditPath,
    '--out-dir',
    opts.outDir,
  ];
  for (const rid of opts.ruleIds) args.push('--rule-id', rid);
  console.error('[scenario-fixer-verify] UX fixers');
  const proc = spawnSync(process.execPath, args, { stdio: 'inherit' });
  return proc.status ?? 0;
}

async function runA11yFixers(opts, auditPath) {
  const fixer = path.join(KS_ROOT, 'tools/website-a11y-auditor/lib/a11y-deterministic-fixers/run-deterministic-fixers.mjs');
  const args = [
    fixer,
    '--repo-root',
    opts.repoRoot,
    '--audit-data',
    auditPath,
    '--out-dir',
    opts.outDir,
  ];
  for (const rid of opts.ruleIds) args.push('--rule-id', rid);
  console.error('[scenario-fixer-verify] a11y deterministic fixers');
  const proc = spawnSync(process.execPath, args, { stdio: 'inherit' });
  return proc.status ?? 0;
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.repoRoot || !opts.auditData || !opts.site || !opts.smokePlan || !opts.outDir) {
    console.error('run-scenario-fixer-verify: --repo-root, --audit-data, --site, --smoke-plan, --out-dir required');
    process.exit(2);
  }

  await fs.mkdir(opts.outDir, { recursive: true });
  const auditRaw = JSON.parse(await fs.readFile(opts.auditData, 'utf8'));
  const plan = await loadSmokePlan(opts.smokePlan);

  const impacted = impactedScenarioIdsFromFindings(
    auditRaw.findings || [],
    opts.ruleIds,
    opts.scenarioIds,
  );
  if (!impacted.length) {
    console.error('run-scenario-fixer-verify: no impacted scenarios (check rule-id / scenario-id / findings)');
    process.exit(2);
  }

  const report = {
    impactedScenarioIds: impacted,
    ruleIds: opts.ruleIds,
    fixers: { ux: false, a11y: false, a11yAi: false },
    verifyRc: null,
    promoteRc: null,
  };

  const fixRoots = resolveFixRoots(opts.repoRoot, {
    externalPaths: parseExternalLibraryPathsFromArgs(process.argv.slice(2)),
    envRoots: process.env.FORGE_UX_FIX_ROOTS || '',
  });

  if (!opts.skipFixers) {
    if (process.env.FORGE_STUDIO_UX_FIXERS !== '0') {
      report.fixers.ux = true;
      await runUxFixers(opts, opts.auditData);
    }
    if (process.env.FORGE_STUDIO_A11Y_FIXERS === '1') {
      report.fixers.a11y = true;
      await runA11yFixers(opts, opts.auditData);
    }
    if (process.env.FORGE_STUDIO_A11Y_AI_FIXERS === '1') {
      const aiFixer = path.join(KS_ROOT, 'tools/website-a11y-auditor/lib/a11y-ai-fixers/run-ai-fixers.mjs');
      console.error('[scenario-fixer-verify] a11y AI fixers');
      spawnSync(
        process.execPath,
        [aiFixer, '--repo-root', opts.repoRoot, '--audit-data', opts.auditData, '--out-dir', opts.outDir, '--mode', process.env.FORGE_STUDIO_A11Y_AI_FIXERS_MODE || 'plan_only'],
        { stdio: 'inherit' },
      );
      report.fixers.a11yAi = true;
    }
  }

  const subsetPlan = path.join(opts.outDir, 'smoke-plan.impacted.yaml');
  await writeSubsetPlan(subsetPlan, plan, impacted);

  report.verifyRc = runScenarioAudit(
    { ...opts, tiers: opts.tiers },
    subsetPlan,
    'impacted',
  );

  const impactedAuditPath = path.join(opts.outDir, 'impacted', 'audit-data.json');
  let impactedAudit = null;
  try {
    impactedAudit = JSON.parse(await fs.readFile(impactedAuditPath, 'utf8'));
  } catch {
    /* */
  }

  const coverage = buildScenarioCoverage({
    plan,
    auditData: impactedAudit,
    auditedScenarioIds: impacted,
  });
  await fs.writeFile(
    path.join(opts.outDir, 'scenario-coverage.verify.json'),
    `${JSON.stringify(coverage, null, 2)}\n`,
    'utf8',
  );

  if (report.verifyRc === 0 && opts.promoteFullSmoke) {
    console.error('[scenario-fixer-verify] promote → full smoke tiers');
    report.promoteRc = runScenarioAudit(
      { ...opts, tiers: 'smoke,demo' },
      opts.smokePlan,
      'full-smoke',
    );
  }

  await fs.writeFile(
    path.join(opts.outDir, 'scenario-fixer-verify.report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );

  const smokeScenarios = buildSmokeFixPassScenarios(auditRaw, plan, fixRoots);
  await writeSmokeFixPass(opts.outDir, {
    passId: `verify-${Date.now()}`,
    fixRoots,
    scenarios: smokeScenarios,
  });

  const exitRc = report.promoteRc != null ? report.promoteRc : report.verifyRc;
  if (exitRc !== 0) process.exit(exitRc);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
