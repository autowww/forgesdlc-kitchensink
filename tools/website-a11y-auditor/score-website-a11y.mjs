#!/usr/bin/env node

/**
 * Sitewide accessibility scorecard — does NOT call analyze-website-a11y.mjs.
 */

import path from 'node:path';
import process from 'node:process';

import { writeFile, ensureDir } from '../website-ux-auditor/lib/files.js';
import { summarizeBySeverity } from '../website-ux-auditor/lib/severity.js';

import { DEFAULT_MAX_PAGES, DEFAULT_TIMEOUT_MS } from './lib/constants.js';
import { resolveA11yStandard, listStandardPresetIds } from './lib/a11y-standards.js';
import { detectKsFromRepo, detectKsFromDomPages, resolveRulesScope } from './lib/detect-ks-site.js';
import { createA11yRuleRuntime } from './lib/a11y-rule-runtime.js';
import { crawlAndAuditA11y } from './lib/a11y-crawl.js';

function usage() {
  return `Forge Website Accessibility Scorer (sitewide; no Major+ early stop)

Usage:
  node score-website-a11y.mjs --repo . --site http://127.0.0.1:8080 --out .cursor/reports/a11y-quality

Options mirror analyze-website-a11y.mjs for --standard, --rules-scope, --lanes, --axe-tags, --max-pages.
Default --max-pages: 60

Standards: ${listStandardPresetIds().join(' | ')}
`;
}

function parseArgs(argv) {
  const args = {
    repo: process.cwd(),
    site: null,
    out: path.join(process.cwd(), '.cursor/reports/a11y-quality'),
    standard: 'wcag22aa',
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

function scoreFromFindings(findings) {
  const summary = summarizeBySeverity(findings);
  const penalty =
    (summary.blocker || 0) * 25
    + (summary.critical || 0) * 15
    + (summary.major || 0) * 8
    + (summary.warn || 0) * 3
    + (summary.minor || 0) * 1;
  return Math.max(0, Math.min(100, 100 - penalty));
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.site) {
    console.error('--site is required for scoring');
    process.exit(1);
  }

  await ensureDir(args.out);
  const standards = resolveA11yStandard({
    standard: args.standard,
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

  const domKs = detectKsFromDomPages(crawlResult.pages);
  const overall = scoreFromFindings(crawlResult.findings);

  const payload = {
    generatedAt: new Date().toISOString(),
    standards,
    rulesScope: resolveRulesScope({
      rulesScope: args.rulesScope,
      repoScore: repoKs.score,
      domScore: domKs.score,
    }),
    ksDetection: { repo: repoKs, dom: domKs },
    overallScore: overall,
    severitySummary: summarizeBySeverity(crawlResult.findings),
    crawlSummary: crawlResult.crawlSummary,
    findingsCount: crawlResult.findings.length,
  };

  const jsonPath = path.join(args.out, 'a11y-quality-score.json');
  const mdPath = path.join(args.out, 'a11y-quality-score.md');
  await writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(
    mdPath,
    `# Accessibility quality score\n\nOverall: **${overall}** / 100\n\nStandard: ${standards.label}\n`,
  );
  console.log(`Wrote ${jsonPath} (score ${overall})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
