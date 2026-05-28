#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { writeFile, ensureDir } from '../website-ux-auditor/lib/files.js';
import { inventoryRepo } from '../website-ux-auditor/lib/repo-inventory.js';
import { summarizeBySeverity } from '../website-ux-auditor/lib/severity.js';

import { SCHEMA_VERSION, DEFAULT_MAX_PAGES, DEFAULT_TIMEOUT_MS, DEFAULT_STOP_AFTER_MAJOR_PLUS } from './lib/constants.js';
import { resolveA11yStandard, listComplianceProfileIds } from './lib/a11y-standards.js';
import {
  detectKsFromRepo,
  detectKsFromDomPages,
  resolveRulesScope,
} from './lib/detect-ks-site.js';
import { createA11yRuleRuntime } from './lib/a11y-rule-runtime.js';
import { crawlAndAuditA11y } from './lib/a11y-crawl.js';
import { resolveDefaultOutDir } from './lib/workbench-out.js';
import { buildA11yAuditReportMarkdown } from './lib/report.js';
import {
  loadTraceabilityMatrix,
  traceabilitySummaryForProfile,
} from './lib/build-traceability-matrix.js';

function usage() {
  return `Forge Website Accessibility Auditor

Usage:
  node tools/website-a11y-auditor/analyze-website-a11y.mjs \\
    --repo . \\
    --site http://127.0.0.1:8080 \\
    --standard wcag22aa \\
    --rules-scope auto \\
    --lanes axe,det \\
    --out workbench/a11y-auditor/campaign-01

Compliance profiles (--standard / --compliance-profile): ${listComplianceProfileIds().join(' | ')}
Rules scope: auto | generic | ks | all
Lanes: axe | det | ai (default: axe,det)

Optional:
  --url URL                  Alias for --site
  --static-only              Repo inventory only (no Playwright)
  --max-pages N              Default ${DEFAULT_MAX_PAGES}
  --timeout-ms N             Default ${DEFAULT_TIMEOUT_MS}
  --axe-tags tag1,tag2       Override axe runOnly tags
  --wcag-level a|aa|aaa      Derive axe tags from level
  --include-best-practice    Add best-practice axe tag
  --skip-axe | --skip-det
  --enable-ai                Include AI rule eligibility in report (no LLM call in this CLI)
  --only-deterministic-rule-ids DET.A11Y.GENERIC.LANG,...
  --only-ai-rule-ids AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW,...
  --stop-after-major-plus N  Default ${DEFAULT_STOP_AFTER_MAJOR_PLUS}
  --breadth-crawl            Disable Major+ early stop
  --verbose

Env: FORGE_A11Y_RULES_SCOPE, FORGE_A11Y_AXE_TAGS, FORGE_A11Y_ONLY_DETERMINISTIC_RULE_IDS,
     FORGE_A11Y_ENABLE_AI_AUDIT, FORGE_A11Y_AUDIT_WORKBENCH_ROOT
`;
}

function parseArgs(argv) {
  const args = {
    repo: process.cwd(),
    site: null,
    out: null,
    standard: 'wcag22aa',
    complianceProfile: null,
    rulesScope: process.env.FORGE_A11Y_RULES_SCOPE || 'auto',
    lanes: new Set(['axe', 'det']),
    staticOnly: false,
    maxPages: DEFAULT_MAX_PAGES,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    axeTags: null,
    wcagLevel: null,
    includeBestPractice: false,
    skipAxe: false,
    skipDet: false,
    enableAi: process.env.FORGE_A11Y_ENABLE_AI_AUDIT === '1',
    onlyDeterministicRuleIds: null,
    onlyAiRuleIds: null,
    stopAfterMajorPlus: DEFAULT_STOP_AFTER_MAJOR_PLUS,
    stopDisabled: false,
    verbose: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const raw = argv[i];
    if (raw === '--help' || raw === '-h') {
      console.log(usage());
      process.exit(0);
    }
    if (raw === '--repo') {
      args.repo = path.resolve(argv[++i] || '.');
      continue;
    }
    if (raw === '--site' || raw === '--url') {
      args.site = argv[++i] || null;
      continue;
    }
    if (raw === '--out') {
      args.out = path.resolve(argv[++i] || '');
      continue;
    }
    if (raw === '--standard') {
      args.standard = argv[++i] || 'wcag22aa';
      args.complianceProfile = args.standard;
      continue;
    }
    if (raw === '--compliance-profile') {
      args.complianceProfile = argv[++i] || 'wcag22aa';
      args.standard = args.complianceProfile;
      continue;
    }
    if (raw === '--rules-scope') {
      args.rulesScope = argv[++i] || 'auto';
      continue;
    }
    if (raw === '--lanes') {
      args.lanes = new Set(
        String(argv[++i] || 'axe,det')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      );
      continue;
    }
    if (raw === '--static-only' || raw === '--no-browser') {
      args.staticOnly = true;
      continue;
    }
    if (raw === '--max-pages') {
      args.maxPages = Number(argv[++i]) || DEFAULT_MAX_PAGES;
      continue;
    }
    if (raw === '--timeout-ms') {
      args.timeoutMs = Number(argv[++i]) || DEFAULT_TIMEOUT_MS;
      continue;
    }
    if (raw === '--axe-tags') {
      args.axeTags = String(argv[++i] || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      continue;
    }
    if (raw === '--wcag-level') {
      args.wcagLevel = argv[++i] || null;
      continue;
    }
    if (raw === '--include-best-practice') {
      args.includeBestPractice = true;
      continue;
    }
    if (raw === '--skip-axe') {
      args.skipAxe = true;
      args.lanes.delete('axe');
      continue;
    }
    if (raw === '--skip-det') {
      args.skipDet = true;
      args.lanes.delete('det');
      continue;
    }
    if (raw === '--enable-ai') {
      args.enableAi = true;
      continue;
    }
    if (raw === '--only-deterministic-rule-ids') {
      args.onlyDeterministicRuleIds = String(argv[++i] || '')
        .split(/[,\s]+/)
        .filter((id) => id.startsWith('DET.'));
      continue;
    }
    if (raw === '--only-ai-rule-ids') {
      args.onlyAiRuleIds = String(argv[++i] || '')
        .split(/[,\s]+/)
        .filter((id) => id.startsWith('AI.'));
      continue;
    }
    if (raw === '--stop-after-major-plus') {
      args.stopAfterMajorPlus = Number(argv[++i]) || DEFAULT_STOP_AFTER_MAJOR_PLUS;
      continue;
    }
    if (raw === '--breadth-crawl' || raw === '--stop-disable') {
      args.stopDisabled = true;
      continue;
    }
    if (raw === '--verbose') {
      args.verbose = true;
      continue;
    }
    throw new Error(`Unknown flag: ${raw}`);
  }

  if (process.env.FORGE_A11Y_AXE_TAGS) {
    args.axeTags = process.env.FORGE_A11Y_AXE_TAGS.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (process.env.FORGE_A11Y_ONLY_DETERMINISTIC_RULE_IDS) {
    args.onlyDeterministicRuleIds = process.env.FORGE_A11Y_ONLY_DETERMINISTIC_RULE_IDS.split(/[,\s]+/)
      .filter((id) => id.startsWith('DET.'));
  }
  if (args.skipAxe) args.lanes.delete('axe');
  if (args.skipDet) args.lanes.delete('det');
  if (args.enableAi) args.lanes.add('ai');

  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const outDir = resolveDefaultOutDir(args.repo, args.out);
  await ensureDir(outDir);

  const profileId = args.complianceProfile || args.standard;
  const standards = resolveA11yStandard({
    standard: profileId,
    complianceProfile: profileId,
    axeTags: args.axeTags,
    wcagLevel: args.wcagLevel,
    includeBestPractice: args.includeBestPractice,
  });

  const inventory = await inventoryRepo(args.repo, {
    progressLog: args.verbose,
    progressTag: '[a11y-audit]',
  });
  const repoKs = await detectKsFromRepo(args.repo);

  /** @type {object} */
  let crawlResult = { pages: [], findings: [], crawlSummary: { pagesVisited: 0 } };
  let ksDetection;
  let rulesScope;
  let runtimeFinal;

  const preCrawlScope = resolveRulesScope({
    rulesScope: args.rulesScope,
    repoScore: repoKs.score,
    domScore: 0,
  });

  async function buildRuntime(scopeResolved) {
    return createA11yRuleRuntime({
      rulesScopeResolved: scopeResolved,
      onlyDeterministicRuleIds: args.onlyDeterministicRuleIds,
      detStandardsTags: standards.detStandardsTags,
      verbose: args.verbose,
    });
  }

  runtimeFinal = await buildRuntime(preCrawlScope);

  const registryPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'design-rules/registry.generated.json',
  );
  const registryForAi = JSON.parse(await fs.readFile(registryPath, 'utf8'));

  if (!args.staticOnly && args.site) {
    crawlResult = await crawlAndAuditA11y({
      siteUrl: args.site,
      repoRoot: args.repo,
      maxPages: args.maxPages,
      timeoutMs: args.timeoutMs,
      lanes: args.lanes,
      axeTags: standards.axeTags,
      standardsProfile: standards.standardsProfile,
      rulesScopeResolved: preCrawlScope,
      runtime: runtimeFinal,
      stopAfterMajorPlus: args.stopAfterMajorPlus,
      stopDisabled: args.stopDisabled,
      verbose: args.verbose,
      aiRun: args.lanes.has('ai')
        ? {
            registry: registryForAi,
            outDir: path.join(outDir, 'ai-runs-crawl'),
            onlyAiRuleIds: args.onlyAiRuleIds || [],
            maxUrls: 3,
            skipAgent: process.env.FORGE_A11Y_SKIP_AI_AGENT === '1',
          }
        : null,
    });

    const domKs = detectKsFromDomPages(crawlResult.pages);
    rulesScope = resolveRulesScope({
      rulesScope: args.rulesScope,
      repoScore: repoKs.score,
      domScore: domKs.score,
    });
    ksDetection = {
      ksDriven: rulesScope.ksDriven,
      repo: repoKs,
      dom: domKs,
      rulesScope,
    };

    if (rulesScope.effectiveScope !== preCrawlScope.effectiveScope) {
      if (args.verbose) {
        console.error(
          `[a11y-audit] rules scope after crawl: ${rulesScope.effectiveScope} (was ${preCrawlScope.effectiveScope} pre-crawl)`,
        );
      }
      runtimeFinal = await buildRuntime(rulesScope);
    }
  } else {
    rulesScope = preCrawlScope;
    ksDetection = {
      ksDriven: rulesScope.ksDriven,
      repo: repoKs,
      dom: { score: 0, signals: {} },
      rulesScope,
    };
    if (args.staticOnly) {
      crawlResult.findings.push({
        checkId: 'a11y-audit',
        severity: 'warn',
        area: 'accessibility',
        message: 'Static-only mode: live axe and DOM deterministic checks were skipped.',
        evidence: 'Use --site for Playwright crawl.',
        remediation: 'Run against a local or deployed URL with --site.',
      });
    }
  }

  const aiRules = runtimeFinal.listAiRules();
  const aiEligible = args.enableAi
    ? aiRules
        .filter((r) => !args.onlyAiRuleIds?.length || args.onlyAiRuleIds.includes(r.id))
        .map((r) => r.id)
    : [];

  const lanesExecuted = {
    axe: args.lanes.has('axe') && !args.staticOnly && Boolean(args.site),
    det: args.lanes.has('det') && !args.staticOnly && Boolean(args.site),
    ai: Boolean(crawlResult.aiLaneExecuted),
  };
  const aiLaneRequested = args.lanes.has('ai') || args.enableAi;
  const aiLaneExecuted = Boolean(crawlResult.aiLaneExecuted);

  const complianceProfile = standards.complianceProfile || {
    id: standards.presetId,
    label: standards.label,
  };

  const traceabilityMatrix = loadTraceabilityMatrix();
  const traceabilitySummary = traceabilityMatrix
    ? traceabilitySummaryForProfile(traceabilityMatrix, complianceProfile.id || standards.presetId)
    : null;

  const auditData = {
    schemaVersion: SCHEMA_VERSION,
    auditRunId: crypto.randomBytes(8).toString('hex'),
    generatedAt: new Date().toISOString(),
    repo: path.resolve(args.repo),
    site: args.site,
    outDir,
    standards,
    complianceProfile,
    traceabilitySummary,
    coverageMap: {
      axeTags: standards.axeTags,
      detStandardsTags: standards.detStandardsTags,
      detRulesInScope: runtimeFinal.implementedRuleIds,
      detRulesExcluded: runtimeFinal.excludedDeterministicRuleIds || [],
      manualTestingRequired: complianceProfile.manualTestingRequired || [],
    },
    rulesScope,
    ksDetection,
    lanes: [...args.lanes],
    lanesExecuted,
    aiLaneRequested,
    aiLaneExecuted,
    aiFindingsAdded: crawlResult.aiFindingsAdded || 0,
    registryFingerprint: runtimeFinal.registryFingerprint,
    deterministicRuleIds: runtimeFinal.implementedRuleIds,
    excludedDeterministicRuleIds: runtimeFinal.excludedDeterministicRuleIds || [],
    aiRulesEligible: aiEligible,
    inventory: {
      framework: inventory.framework,
      packageName: inventory.packageName,
    },
    crawlSummary: crawlResult.crawlSummary,
    severitySummary: summarizeBySeverity(crawlResult.findings),
    findings: crawlResult.findings,
    pagesSampled: crawlResult.pages?.length || 0,
  };

  const jsonPath = path.join(outDir, 'a11y-audit-data.json');
  const mdPath = path.join(outDir, 'a11y-audit-report.md');
  await writeFile(jsonPath, `${JSON.stringify(auditData, null, 2)}\n`);
  await writeFile(mdPath, buildA11yAuditReportMarkdown(auditData));

  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${mdPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
