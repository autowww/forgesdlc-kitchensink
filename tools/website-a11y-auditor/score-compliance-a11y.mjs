#!/usr/bin/env node

/**
 * Scoped compliance score vs a standards pack — does NOT call analyze-website-a11y.mjs.
 */

import path from 'node:path';
import process from 'node:process';

import { writeFile, ensureDir } from '../website-ux-auditor/lib/files.js';

import { DEFAULT_MAX_PAGES, DEFAULT_TIMEOUT_MS } from './lib/constants.js';
import { resolveA11yStandard, listStandardPresetIds } from './lib/a11y-standards.js';
import { detectKsFromRepo, detectKsFromDomPages, resolveRulesScope } from './lib/detect-ks-site.js';
import { createA11yRuleRuntime } from './lib/a11y-rule-runtime.js';
import { crawlAndAuditA11y } from './lib/a11y-crawl.js';
import {
  buildComplianceReport,
  loadStandardsPack,
  renderComplianceScoreMarkdown,
} from './lib/compliance-score.js';
import { resolveRtmProfileId } from './lib/build-traceability-matrix.js';

function usage() {
  return `Forge Website Accessibility Compliance Scorer

Usage:
  node score-compliance-a11y.mjs --compliance-profile wcag20aa --pack-only
  node score-compliance-a11y.mjs --repo . --site http://127.0.0.1:8080 --compliance-profile wcag20aa --out ./reports

Options:
  --compliance-profile / --standard   Profile id (e.g. wcag20aa, wcag20aaa, wcag21aa)
  --pack PATH                         Explicit .pack.json path
  --pack-only                         Design-time pack coverage only (no crawl)
  --repo, --site, --out, --lanes, --rules-scope, --max-pages  Same as analyze/score tools

Standards: ${listStandardPresetIds().join(' | ')}
`;
}

function parseArgs(argv) {
  const args = {
    repo: process.cwd(),
    site: null,
    out: path.join(process.cwd(), '.cursor/reports/a11y-compliance'),
    standard: 'wcag22aa',
    complianceProfile: null,
    packPath: null,
    packOnly: false,
    rulesScope: process.env.FORGE_A11Y_RULES_SCOPE || 'auto',
    lanes: new Set(['axe', 'det']),
    maxPages: 60,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    axeTags: null,
    wcagLevel: null,
    includeBestPractice: false,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const raw = argv[i];
    if (raw === '--help' || raw === '-h') {
      console.log(usage());
      process.exit(0);
    }
    if (raw === '--repo') args.repo = path.resolve(argv[++i] || '.');
    else if (raw === '--site' || raw === '--url') args.site = argv[++i] || null;
    else if (raw === '--out') args.out = path.resolve(argv[++i] || '');
    else if (raw === '--standard') args.standard = argv[++i] || 'wcag22aa';
    else if (raw === '--compliance-profile') args.complianceProfile = argv[++i] || null;
    else if (raw === '--pack') args.packPath = path.resolve(argv[++i] || '');
    else if (raw === '--pack-only') args.packOnly = true;
    else if (raw === '--rules-scope') args.rulesScope = argv[++i] || 'auto';
    else if (raw === '--lanes') {
      args.lanes = new Set(String(argv[++i] || 'axe,det').split(',').map((s) => s.trim()).filter(Boolean));
    } else if (raw === '--max-pages') args.maxPages = Number(argv[++i]) || 60;
    else if (raw === '--timeout-ms') args.timeoutMs = Number(argv[++i]) || DEFAULT_TIMEOUT_MS;
    else if (raw === '--axe-tags') {
      args.axeTags = String(argv[++i] || '').split(',').map((s) => s.trim()).filter(Boolean);
    } else if (raw === '--wcag-level') args.wcagLevel = argv[++i] || null;
    else if (raw === '--include-best-practice') args.includeBestPractice = true;
    else throw new Error(`Unknown flag: ${raw}`);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const profileId = args.complianceProfile || args.standard;
  const pack = args.packPath
    ? loadStandardsPack(args.packPath)
    : loadStandardsPack(profileId);

  if (args.packOnly || !args.site) {
    const report = buildComplianceReport(pack, null);
    await ensureDir(args.out);
    const jsonPath = path.join(args.out, 'compliance-score.json');
    const mdPath = path.join(args.out, 'compliance-score.md');
    const criteriaPath = path.join(args.out, 'criteria-results.json');
    await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
    await writeFile(criteriaPath, `${JSON.stringify(report.criteriaResults, null, 2)}\n`);
    await writeFile(mdPath, renderComplianceScoreMarkdown(report));
    console.log(
      `Wrote ${jsonPath} (automation coverage ${report.automationCoveragePercent}%, pack-only)`,
    );
    return;
  }

  const standards = resolveA11yStandard({
    standard: profileId,
    complianceProfile: profileId,
    axeTags: args.axeTags,
    wcagLevel: args.wcagLevel,
    includeBestPractice: args.includeBestPractice,
  });

  const repoKs = await detectKsFromRepo(args.repo);
  const rulesScope = resolveRulesScope({
    rulesScope: args.rulesScope,
    repoScore: repoKs.score,
    domScore: 0,
  });
  const runtime = await createA11yRuleRuntime({ rulesScopeResolved: rulesScope });

  const crawlResult = await crawlAndAuditA11y({
    siteUrl: args.site,
    repoRoot: args.repo,
    maxPages: args.maxPages,
    timeoutMs: args.timeoutMs,
    lanes: args.lanes,
    axeTags: standards.axeTags,
    standardsProfile: standards.standardsProfile,
    rulesScopeResolved: rulesScope,
    runtime,
    stopAfterMajorPlus: 999999,
    stopDisabled: true,
    verbose: false,
  });

  const rtmId = resolveRtmProfileId(profileId);
  const packForRtm = pack.packId === rtmId ? pack : loadStandardsPack(rtmId);
  const report = buildComplianceReport(packForRtm, crawlResult.findings);
  report.site = args.site;
  report.repo = args.repo;
  report.rtmProfileId = rtmId;
  report.findingsCount = crawlResult.findings.length;
  report.standards = {
    label: standards.label,
    axeTags: standards.axeTags,
    presetId: standards.presetId,
  };

  await ensureDir(args.out);
  const jsonPath = path.join(args.out, 'compliance-score.json');
  const mdPath = path.join(args.out, 'compliance-score.md');
  const criteriaPath = path.join(args.out, 'criteria-results.json');
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(criteriaPath, `${JSON.stringify(report.criteriaResults, null, 2)}\n`);
  await writeFile(mdPath, renderComplianceScoreMarkdown(report));
  console.log(`Wrote ${jsonPath} (compliance score ${report.complianceScore})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
