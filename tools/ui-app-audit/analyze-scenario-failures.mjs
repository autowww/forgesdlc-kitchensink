#!/usr/bin/env node
/**
 * Guided failure report for scenario smoke audits (no LLM).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveFixDisposition, resolveFixRoots } from '../website-ux-auditor/lib/fix-roots.mjs';
import { isMajorPlus } from '../website-ux-auditor/lib/severity.js';
import { loadSmokePlan } from './lib/smoke-plan.mjs';
import { filterScenariosByIds } from './lib/scenario-coverage.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const opts = {
    audit: '',
    smokePlan: '',
    appRepo: '',
    out: '',
    scenarioIds: [],
    guidedFirstRun: false,
    cycle: 1,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--audit' && argv[i + 1]) opts.audit = path.resolve(argv[++i]);
    else if (a === '--smoke-plan' && argv[i + 1]) opts.smokePlan = path.resolve(argv[++i]);
    else if (a === '--app-repo' && argv[i + 1]) opts.appRepo = path.resolve(argv[++i]);
    else if (a === '--out' && argv[i + 1]) opts.out = path.resolve(argv[++i]);
    else if (a === '--scenario-id' && argv[i + 1]) opts.scenarioIds.push(argv[++i]);
    else if (a === '--guided-first-run') opts.guidedFirstRun = true;
    else if (a === '--cycle' && argv[i + 1]) opts.cycle = Number(argv[++i]) || 1;
    else if (a === '-h' || a === '--help') {
      console.log(`Usage: node analyze-scenario-failures.mjs --audit A --smoke-plan P [options]

  --app-repo R           For fix disposition / external roots
  --out PATH             Write landing-e2e-analysis.md (default: dirname(audit))
  --scenario-id ID       Repeatable; filter pages
  --guided-first-run     Extra first-run checklist in output
  --cycle N              Cycle number for banner`);
      process.exit(0);
    }
  }
  if (!opts.out && opts.audit) opts.out = path.join(path.dirname(opts.audit), 'landing-e2e-analysis.md');
  return opts;
}

/**
 * @param {object} page
 */
function pageErrors(page) {
  const errs = [];
  if (page.error) errs.push(String(page.error));
  if (page.navigationError) errs.push(`navigation: ${page.navigationError}`);
  if (page.readyTimeout) errs.push('ready selector timeout');
  if (page.stepsExecuted != null && page.stepsExecuted === 0) errs.push('no steps executed');
  return errs;
}

/**
 * @param {string} disposition
 */
function suggestAction(disposition) {
  if (disposition === 'external_library_required') {
    return 'Configure --external-library-path1=./kitchensink or FORGE_UX_FIX_ROOTS, then re-run fixers.';
  }
  if (disposition === 'external_library') {
    return 'Run deterministic fixers (external library root configured).';
  }
  return 'Run deterministic fixers, then step agent if still Major+.';
}

/**
 * @param {object} opts
 * @param {object} auditData
 * @param {{ scenarios: object[] }} plan
 */
function buildReport(opts, auditData, plan) {
  const scenarioFilter = new Set(opts.scenarioIds);
  const roots = opts.appRepo
    ? resolveFixRoots(opts.appRepo, { envRoots: process.env.FORGE_UX_FIX_ROOTS || '' })
    : [];

  const lines = [
    `# Studio scenario failure analysis (cycle ${opts.cycle})`,
    '',
    `Generated: ${new Date().toISOString()}`,
    `Audit: \`${opts.audit}\``,
    `Gate mode: ${auditData.gateMode || process.env.FORGE_STUDIO_GATE_MODE || 'ux'}`,
    `gatePass: ${auditData.gatePass === true ? 'pass' : 'fail'}`,
    `uxQualityGate: ${auditData.uxQualityGate?.pass === true ? 'pass' : 'fail'}`,
    '',
  ];

  if (opts.guidedFirstRun) {
    lines.push(
      '## First-run checklist',
      '',
      '1. Read `audit-report.md` in the audit out dir.',
      '2. Open scenario screenshots under `pages/` (PNG per scenario).',
      '3. Run deterministic fixers (`run-scenario-fixer-verify.mjs`).',
      '4. If still failing, step agents use `render_roots` from smoke-plan (Composer 2.5).',
      '5. After code changes: `npm run build:studio-js` before the next cycle.',
      '',
    );
  }

  const pages = (auditData.pages || []).filter(
    (p) => !scenarioFilter.size || scenarioFilter.has(p.scenarioId),
  );

  lines.push('## Scenario status', '');
  for (const page of pages) {
    const errs = pageErrors(page);
    const major = (page.findings || []).filter((f) => isMajorPlus(f.severity)).length;
    lines.push(`### ${page.scenarioId || page.id || 'unknown'}`);
    lines.push(`- URL: ${page.url || '—'}`);
    lines.push(`- Major+ findings: ${major}`);
    if (errs.length) {
      lines.push('- Errors:');
      for (const e of errs) lines.push(`  - ${e}`);
    }
    lines.push('');
  }

  lines.push('## Major+ findings', '');
  lines.push('| Scenario | Step | Rule | Disposition | Message |');
  lines.push('| -------- | ---- | ---- | ----------- | ------- |');

  for (const page of pages) {
    for (const f of page.findings || []) {
      if (!isMajorPlus(f.severity)) continue;
      const ruleId = f.ruleId || f.checkId || '';
      const stepId = f.stepId || 'land';
      const disp = roots.length
        ? resolveFixDisposition(f, roots, ruleId).disposition
        : 'local';
      const msg = String(f.message || '').replace(/\|/g, '\\|').slice(0, 120);
      lines.push(`| ${page.scenarioId} | ${stepId} | ${ruleId} | ${disp} | ${msg} |`);
    }
  }

  lines.push('', '## Suggested next actions', '');
  const dispositions = new Set();
  for (const page of pages) {
    for (const f of page.findings || []) {
      if (!isMajorPlus(f.severity)) continue;
      const ruleId = f.ruleId || f.checkId || '';
      const d = roots.length ? resolveFixDisposition(f, roots, ruleId).disposition : 'local';
      dispositions.add(d);
    }
  }
  if (!dispositions.size) {
    lines.push('- No Major+ findings in filtered scenarios (check gate thresholds / waivers).');
  } else {
    for (const d of dispositions) {
      lines.push(`- **${d}:** ${suggestAction(d)}`);
    }
  }

  if (opts.scenarioIds.length && plan.scenarios) {
    const subset = filterScenariosByIds(plan.scenarios, opts.scenarioIds);
    lines.push('', '## Smoke plan scenarios in scope', '');
    for (const s of subset) {
      lines.push(`- \`${s.scenarioId}\`: ready=\`${s.ready || s.steps?.[0]?.ready || '—'}\``);
    }
  }

  return lines.join('\n') + '\n';
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.audit) {
    console.error('analyze-scenario-failures: --audit required');
    process.exit(2);
  }

  const auditData = JSON.parse(await fs.readFile(opts.audit, 'utf8'));
  let plan = { scenarios: [] };
  if (opts.smokePlan) {
    plan = await loadSmokePlan(opts.smokePlan);
  }

  const report = buildReport(opts, auditData, plan);
  if (opts.out) {
    await fs.writeFile(opts.out, report, 'utf8');
    console.error(`analyze-scenario-failures: wrote ${opts.out}`);
  }
  process.stderr.write(report);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
