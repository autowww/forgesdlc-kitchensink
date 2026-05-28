#!/usr/bin/env node
/**
 * Scenario-driven Studio smoke audit (Playwright + UX checks + a11y lanes). No MCP, no BFS crawl.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { collectA11yDomMetrics } from '../website-a11y-auditor/lib/a11y-dom-metrics.js';
import { createA11yRuleRuntime } from '../website-a11y-auditor/lib/a11y-rule-runtime.js';
import { runAxeOnPage, findingsFromAxeResult } from '../website-a11y-auditor/lib/axe-lane.js';
import {
  detectKsFromDomPages,
  detectKsFromRepo,
  resolveRulesScope,
} from '../website-a11y-auditor/lib/detect-ks-site.js';
import { runAllChecksWithTrace } from '../website-ux-auditor/checks/index.js';
import { createDesignRuleRuntime } from '../website-ux-auditor/lib/design-rule-runtime.js';
import { collectDomMetrics } from '../website-ux-auditor/lib/dom-metrics.js';
import { importPlaywright } from '../website-ux-auditor/lib/playwright-import.js';
import { isMajorPlus } from '../website-ux-auditor/lib/severity.js';
import { buildAiAuditBatchManifest } from '../website-ux-auditor/lib/ai-audit-batches.js';

import { writeStudioRemediationPlan } from './lib/generate-studio-remediation-plan.mjs';
import { loadSmokePlan, scenarioMatchesTiers, scenarioUrl } from './lib/smoke-plan.mjs';
import { resolveScenarioLanes } from './lib/scenario-lanes.mjs';
import { studioUxDetRuntimeOpts } from './lib/studio-ux-det-policy.mjs';
import { evaluateStudioQualityGates } from './lib/studio-quality-gate.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const opts = {
    site: '',
    smokePlan: '',
    outDir: '',
    appRepo: '',
    tiers: ['smoke', 'demo'],
    lanes: ['axe', 'det', 'ux-det'],
    ux: true,
    rulesScope: 'app',
    timeoutMs: 60_000,
    noScreenshots: false,
    siteKind: 'a11y-studio',
    enableAiAudit: false,
    emitPlan: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--site' && argv[i + 1]) opts.site = argv[++i];
    else if (a === '--smoke-plan' && argv[i + 1]) opts.smokePlan = path.resolve(argv[++i]);
    else if (a === '--out-dir' && argv[i + 1]) opts.outDir = path.resolve(argv[++i]);
    else if (a === '--app-repo' && argv[i + 1]) opts.appRepo = path.resolve(argv[++i]);
    else if (a === '--tier' && argv[i + 1]) opts.tiers.push(argv[++i]);
    else if (a === '--tiers' && argv[i + 1]) {
      opts.tiers = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    } else if (a === '--lanes' && argv[i + 1]) {
      opts.lanes = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    } else if (a === '--rules-scope' && argv[i + 1]) opts.rulesScope = argv[++i];
    else if (a === '--site-kind' && argv[i + 1]) opts.siteKind = argv[++i];
    else if (a === '--timeout-ms' && argv[i + 1]) opts.timeoutMs = Number(argv[++i]) || 60_000;
    else if (a === '--no-screenshots') opts.noScreenshots = true;
    else if (a === '--no-ux') opts.ux = false;
    else if (a === '--enable-ai-audit') opts.enableAiAudit = true;
    else if (a === '--emit-plan') opts.emitPlan = true;
    else if (a === '-h' || a === '--help') {
      console.log(`Usage: node run-scenario-audit.mjs --site URL --smoke-plan PATH --out-dir DIR
  [--app-repo R] [--tiers smoke,demo] [--lanes axe,det,ux-det]
  [--site-kind a11y-studio] [--rules-scope app] [--enable-ai-audit] [--emit-plan]`);
      process.exit(0);
    }
  }
  return opts;
}

function safeSlug(s) {
  return String(s || 'page')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .slice(0, 80);
}

/**
 * @param {object} opts
 * @param {import('../website-a11y-auditor/lib/a11y-rule-runtime.js').A11yRuleRuntime | null} a11yRuntime
 * @param {Awaited<ReturnType<typeof createDesignRuleRuntime>> | null} uxRuntime
 */
async function runScenario(page, scenario, url, opts, a11yRuntime, uxRuntime, laneSet) {
  /** @type {object[]} */
  const findings = [];
  let metrics = null;
  let error = null;

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: opts.timeoutMs });
    const readyList = [
      ...(scenario.ready ? [scenario.ready] : []),
      ...(scenario.ready_selectors || []),
    ];
    for (const sel of readyList) {
      await page.waitForSelector(sel, { state: 'attached', timeout: 45_000 });
    }
    if (scenario.assert_text_contains) {
      const body = await page.locator('body').innerText();
      if (!body.includes(scenario.assert_text_contains)) {
        findings.push({
          checkId: 'scenario-assert',
          severity: 'major',
          area: 'smoke-plan',
          message: `Expected text not found: ${scenario.assert_text_contains}`,
          evidence: `scenarioId=${scenario.scenarioId}`,
          remediation: 'Fix copy or update smoke-plan assert_text_contains.',
        });
      }
    }

    for (const step of scenario.steps || []) {
      if (step?.click) {
        await page.locator(step.click).first().click({ timeout: 15_000 });
      }
      if (step?.wait_for) {
        await page.waitForSelector(step.wait_for, { state: 'attached', timeout: 15_000 });
      }
    }

    const ctx = {
      siteKind: opts.siteKind,
      repoRoot: opts.appRepo || process.cwd(),
      structure: {
        pageType: opts.siteKind === 'a11y-studio' || opts.siteKind === 'app-shell'
          ? 'app-shell'
          : 'generic',
      },
      scenario: {
        id: scenario.scenarioId,
        tier: scenario.tier || 'smoke',
        workspace: scenario.workspace || null,
        audit_lanes: scenario.audit_lanes || null,
        ux_expect: scenario.ux_expect || null,
      },
    };

    if (opts.ux) {
      const raw = await collectDomMetrics(page, url);
      metrics = raw;
      const { findings: uxFindings } = runAllChecksWithTrace(raw, url, ctx);
      findings.push(...uxFindings);

      if (laneSet.has('ux-det') && uxRuntime) {
        const { findings: uxDet } = await uxRuntime.runDeterministicRulesWithTrace({
          metrics: raw,
          url,
          page,
          repoRoot: opts.appRepo || process.cwd(),
          ctx,
        });
        findings.push(...uxDet);
      }
    } else {
      metrics = await collectA11yDomMetrics(page, url);
    }

    if (laneSet.has('axe')) {
      const axeResult = await runAxeOnPage(page, ['wcag2a', 'wcag2aa'], 'wcag22aa');
      findings.push(...findingsFromAxeResult(axeResult, url));
    }

    if (laneSet.has('det') && a11yRuntime) {
      const a11yMetrics = await collectA11yDomMetrics(page, url);
      const det = await a11yRuntime.runDeterministicRules({
        metrics: a11yMetrics,
        url,
        page,
        repoRoot: opts.appRepo || process.cwd(),
      });
      findings.push(...det.findings);
    }
  } catch (e) {
    error = String(e?.message || e);
    findings.push({
      checkId: 'scenario-load',
      severity: 'major',
      area: 'smoke-plan',
      message: 'Scenario failed to load or assert.',
      evidence: `${url} ${error}`,
      remediation: 'Fix routing, selectors in smoke-plan, or server health.',
    });
  }

  return { findings, metrics, error };
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.site || !opts.smokePlan || !opts.outDir) {
    console.error('run-scenario-audit: --site, --smoke-plan, --out-dir required');
    process.exit(2);
  }

  const plan = await loadSmokePlan(opts.smokePlan);
  const siteBase = (plan.baseUrl || opts.site).replace(/\/$/, '');
  const scenarios = plan.scenarios.filter((s) => scenarioMatchesTiers(opts.tiers, s));

  await fs.mkdir(opts.outDir, { recursive: true });
  const screenshotsDir = path.join(opts.outDir, 'screenshots');
  if (!opts.noScreenshots) await fs.mkdir(screenshotsDir, { recursive: true });

  const defaultLaneSet = new Set(opts.lanes.map((s) => s.toLowerCase()));
  const repoRoot = opts.appRepo || process.cwd();
  const ksRepo = await detectKsFromRepo(repoRoot);

  const playwright = await importPlaywright();
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(opts.timeoutMs);

  const needsA11yDet = scenarios.some((s) => resolveScenarioLanes(opts.lanes, s).has('det'));
  const needsUxDet = scenarios.some((s) => resolveScenarioLanes(opts.lanes, s).has('ux-det'));

  const rulesScopePre = resolveRulesScope({
    rulesScope: opts.rulesScope,
    repoScore: ksRepo.score,
    domScore: 0,
  });
  const a11yRuntime = needsA11yDet
    ? await createA11yRuleRuntime({ rulesScopeResolved: rulesScopePre })
    : null;
  const uxDetOpts = await studioUxDetRuntimeOpts(opts.siteKind);
  const uxRuntime =
    needsUxDet && opts.ux ? await createDesignRuleRuntime(uxDetOpts) : null;

  /** @type {object[]} */
  const pages = [];
  /** @type {object[]} */
  const allFindings = [];

  try {
    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      const url = scenarioUrl(scenario, siteBase);
      const laneSet = resolveScenarioLanes(opts.lanes, scenario);

      console.error(
        `[scenario-audit] ${i + 1}/${scenarios.length} ${scenario.scenarioId} lanes=${[...laneSet].join(',')}`,
      );

      const result = await runScenario(
        page,
        scenario,
        url,
        opts,
        a11yRuntime,
        uxRuntime,
        laneSet,
      );
      for (const f of result.findings) {
        f.scenarioId = scenario.scenarioId;
        f.planId = plan.planId;
      }
      allFindings.push(...result.findings);

      let screenshot = null;
      if (!opts.noScreenshots && !result.error) {
        screenshot = path.join(
          screenshotsDir,
          `${String(i + 1).padStart(2, '0')}-${safeSlug(scenario.scenarioId)}.png`,
        );
        await page.screenshot({ path: screenshot, fullPage: false });
      }

      pages.push({
        url,
        scenarioId: scenario.scenarioId,
        planId: plan.planId,
        tier: scenario.tier || 'smoke',
        doc_anchor: scenario.doc_anchor || null,
        lanesExecuted: [...laneSet],
        findings: result.findings,
        metrics: result.metrics || {},
        screenshot,
        error: result.error,
      });
    }
  } finally {
    await context.close();
    await browser.close();
  }

  const domKs = detectKsFromDomPages(pages);
  const rulesScopeFinal = resolveRulesScope({
    rulesScope: opts.rulesScope,
    repoScore: ksRepo.score,
    domScore: domKs.score,
  });

  const majorPlus = allFindings.filter((f) => isMajorPlus(f.severity)).length;
  const lanesExecuted = [...new Set(pages.flatMap((p) => p.lanesExecuted || []))];

  const waiversPath =
    process.env.FORGE_STUDIO_WAIVERS_PATH ||
    path.join(repoRoot, 'docs', 'studio', 'sealed-audit-waivers.yaml');
  const gates = await evaluateStudioQualityGates(allFindings, { waiversPath });
  const { mode: gateMode, pass: gatePass, qualityGate, uxQualityGate } = gates;

  const auditData = {
    schemaVersion: 2,
    auditMode: 'scenario-smoke',
    auditRunId: `scenario-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    planId: plan.planId,
    site: siteBase,
    siteKind: opts.siteKind,
    appRepo: repoRoot,
    lanesExecuted,
    rulesScope: rulesScopeFinal,
    ksDetection: { repo: ksRepo, dom: domKs },
    crawlSummary: {
      crawlMode: 'scenario_list',
      pagesVisited: pages.length,
      scenariosTotal: scenarios.length,
      majorPlusFindingCountTotal: majorPlus,
      qualityGatePass: qualityGate.pass,
      uxQualityGatePass: uxQualityGate.pass,
      gateMode,
      gatePass,
      gateableFindingCount: qualityGate.gateFindingCount,
      uxGateableFindingCount: uxQualityGate.gateFindingCount,
    },
    gateMode,
    gatePass,
    qualityGate,
    uxQualityGate,
    uxDetPolicy: uxDetOpts,
    pages,
    findings: allFindings,
  };

  if (opts.enableAiAudit) {
    const skipAi = process.env.FORGE_STUDIO_SKIP_AI_AGENT === '1';
    if (skipAi) {
      auditData.aiAudit = {
        status: 'skipped',
        reason: 'FORGE_STUDIO_SKIP_AI_AGENT=1 (deterministic CI default)',
      };
    } else {
      try {
        const manifest = await buildAiAuditBatchManifest({
          auditData,
          repoRoot,
          batchSize: 1,
        });
        const aiDir = path.join(opts.outDir, 'ai-audit');
        await fs.mkdir(aiDir, { recursive: true });
        await fs.writeFile(
          path.join(aiDir, 'manifest.json'),
          `${JSON.stringify(manifest, null, 2)}\n`,
          'utf8',
        );
        auditData.aiAudit = {
          status: 'manifest_ready',
          batchCount: manifest.batches?.length ?? 0,
          manifestPath: path.join(aiDir, 'manifest.json'),
        };
      } catch (e) {
        auditData.aiAudit = {
          status: 'error',
          reason: String(e?.message || e),
        };
      }
    }
  }

  const outPath = path.join(opts.outDir, 'audit-data.json');
  await fs.writeFile(outPath, `${JSON.stringify(auditData, null, 2)}\n`, 'utf8');

  if (opts.emitPlan || process.env.FORGE_STUDIO_EMIT_PLAN === '1') {
    const planPath = path.join(opts.outDir, 'forge-studio-remediation.plan.md');
    await writeStudioRemediationPlan(auditData, planPath);
    console.error(`run-scenario-audit: wrote ${planPath}`);
  }

  console.error(
    `run-scenario-audit: wrote ${outPath} scenarios=${scenarios.length} findings=${allFindings.length} majorPlus=${majorPlus} gateMode=${gateMode} gatePass=${gatePass ? 'pass' : 'fail'} a11yGate=${qualityGate.pass ? 'pass' : 'fail'} uxGate=${uxQualityGate.pass ? 'pass' : 'fail'}`,
  );
  if (!gatePass) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
