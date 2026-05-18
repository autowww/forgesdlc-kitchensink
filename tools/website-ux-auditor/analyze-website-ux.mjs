#!/usr/bin/env node
/*
  Forge Website UX Auditor

  Deterministically inspects a website repo + running site against the Forge
  enterprise AI website standard and writes Cursor-ready remediation plans.

  This script intentionally does not call an LLM. It creates high-signal,
  reviewable plan prompts that Cursor Agent/Plan Mode can execute.
*/

import crypto from 'node:crypto';
import fsp from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import {
  SCHEMA_VERSION,
  TECHNICAL_TRANSLATIONS,
  TRUST_TERMS,
  ECOSYSTEM_TERMS,
  OUTCOME_TERMS,
  CTA_TERMS,
} from './lib/constants.js';
import {
  compareFindingSeverity,
  countMajorPlus,
  isMajorPlus,
  makeFinding,
  severityDefinitionsMarkdownTable,
  summarizeBySeverity,
} from './lib/severity.js';
import { scorePage } from './lib/scoring.js';
import { crawlAndAnalyze } from './lib/crawl.js';
import { createCrawlProgressReporter } from './lib/crawl-progress-line.js';
import { createLogger } from './lib/logger.js';
import {
  archiveAuditDataToPrevious,
  readAuditDataPrevious,
  readCrawlSession,
  writeCrawlSession,
  extractMajorPlusUrlsFromPriorAudit,
  buildRegressionWaveSummary,
} from './lib/incremental-audit.js';
import { loadDesignStandard, warnIfDesignStandardChanged } from './lib/design-standard.js';
import { writeRcaPromptBatch } from './lib/rca.js';
import { runAllChecks } from './checks/index.js';
import {
  computeUxScores,
  buildUxScoresAuditSnippet,
  extractUxScoresFromSavedJson,
  compareUxScores,
  buildUxQualityScoreMarkdown,
} from './lib/design-ux-score.js';
import { importPlaywright } from './lib/playwright-import.js';
import { applyDefaultForgeStandard, inferSiteKind, PRODUCT_PROFILES } from './lib/product-profiles.js';
import { inventoryRepo } from './lib/repo-inventory.js';
import { startServer, waitForReady } from './lib/site-bootstrap.js';
import { ensureDir, writeFile, fileExists, readMaybe } from './lib/files.js';
import { mergeDashboardStateIfWatching } from './lib/ux-loop-dashboard-state.js';
import { appendUxScoringCsv, UX_SCORING_CSV_FILENAME } from './lib/ux-scoring-csv.js';
import { ensureBlockingStdio } from './lib/piped-stdio-flush.js';

ensureBlockingStdio();

/** One shared identity for audit report, JSON, and all plan files emitted in a single invocation. */
function newAuditRunMeta() {
  return {
    generatedAt: new Date().toISOString(),
    auditRunId: crypto.randomBytes(8).toString('hex'),
  };
}

/**
 * UTC stamp safe for filenames across platforms (no ':' or '.' ambivalence in the body).
 * Example: 2026-05-17T14-35-24-012Z
 */
function utcStampForFilename(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}-${p(d.getUTCMinutes())}-${p(d.getUTCSeconds())}-${ms}Z`;
}

function rootMirrorPlanFilename(runMeta) {
  return `forge-ux-remediation__${utcStampForFilename(runMeta.generatedAt)}__${runMeta.auditRunId}.plan.md`;
}

function usage() {
  return `Forge Website UX Auditor

Usage:
  node tools/website-ux-auditor/analyze-website-ux.mjs \\
    --repo . \\
    --site http://localhost:3000 \\
    --standard docs/design/forge-enterprise-ai-website-standard.md \\
    --site-kind lenses \\
    --out .cursor/plans/forge-ux-remediation

  If --standard is omitted and the file exists:
  <repo>/docs/design/forge-enterprise-ai-website-standard.md

Default live crawl behavior (recommended):
  The remediation crawl stops expanding URLs after --stop-after-major-plus total Major+
  (blocker + critical + major) findings accumulate (default N=10). This keeps runtime aligned
  with remediation focus. Use breadth flags only when you need every page within --max-pages.

Optional:
  --start "npm run dev"        Start the local site before analysis.
  --ready-url URL              URL to probe when --start is used. Defaults to --site.
  --url URL                    Alias for --site.
  --static-only                Generate repo-only plans without Playwright/browser inspection.
  --no-browser                 Alias for --static-only.
  --max-pages 6                Crawl same-origin pages. Default: 5.
  --timeout-ms 45000           Navigation/startup timeout. Default: 45000.
  --no-screenshots             Disable screenshot capture.
  --install-rule               Also write a Cursor rule for remediation-plan execution.
  --no-mirror-root-plan        Skip copying forge-ux-remediation.plan.md to a uniquely named file under .cursor/plans/ (UTC stamp + audit_run_id)
  --no-refresh-plan-status     Reset all YAML todos in forge-ux-remediation.plan.md to pending (default is to merge statuses from the previous plan file in --out when present)
  --stop-after-major-plus N    Stop expanding crawl queue after N blocker/critical/major findings accumulate total (default: 10; live crawl only; ignored with breadth flags below).
  --stop-disable               Full breadth within --max-pages: disable Major+ queue stop (--full-crawl, --breadth-crawl aliases).
  --full-crawl                 Alias for --stop-disable.
  --breadth-crawl              Alias for --stop-disable.

UX score tracking (optional):
  --scores-first               Live audits only — run a sitewide score crawl (--scores-first-max-pages, no Maj+ stop) BEFORE the remediation crawl; writes ux-quality-score-audit-precrawl.{json,md}.
  --scores-first-max-pages N   Precrawl score budget when --scores-first (default: 120).
  --prior-ux-scores PATH       Path relative to repo (or absolute) to ux-quality-score.json or audit-data.json from a prior run; audit report + audit-data.json include Δ vs current rollup.
  --no-ux-csv                  Skip appending repo-root ux-scoring.csv (default: append each run for analysis).

Incremental campaign (reuse one --out folder across runs):
  --incremental                After archiving audit-data.json → audit-data.previous.json, re-check URLs that had Major+ in the prior snapshot and resume crawl-session.json queue when present (see README).
  --incremental-regression-max-pages N   Cap URLs pulled from audit-data.previous.json for the regression wave (default: 40).
  --verbose, --verbose=N       Stderr diagnostics ([incremental], [crawl], …); level 2 via N=2. Alias: --debug-log.
                               Env mirror: UX_AUDIT_VERBOSE=1|2.

Site kinds:
  forgesdlc | lcdl | fleet | lenses | platform | generic | auto
`;
}

function parseArgs(argv) {
  const args = {
    repo: process.cwd(),
    site: null,
    standard: null,
    siteKind: 'auto',
    out: null,
    start: null,
    readyUrl: null,
    maxPages: 5,
    timeoutMs: 45000,
    screenshots: true,
    installRule: false,
    staticOnly: false,
    mirrorRootPlan: true,
    /** When true (default), carry forward todo status from existing forge-ux-remediation.plan.md in --out. */
    refreshPlanStatus: true,
    stopAfterMajorPlus: 10,
    stopDisabled: false,
    scoresFirst: false,
    scoresFirstMaxPages: 120,
    priorUxScoresPath: null,
    uxCsv: true,
    incremental: false,
    incrementalRegressionMaxPages: 40,
    verbose: 0,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const raw = argv[i];
    if (raw === '--help' || raw === '-h') {
      console.log(usage());
      process.exit(0);
    }
    if (raw === '--no-screenshots') {
      args.screenshots = false;
      continue;
    }
    if (raw === '--install-rule') {
      args.installRule = true;
      continue;
    }
    if (raw === '--no-mirror-root-plan') {
      args.mirrorRootPlan = false;
      continue;
    }
    if (raw === '--no-refresh-plan-status') {
      args.refreshPlanStatus = false;
      continue;
    }
    if (raw === '--stop-disable' || raw === '--full-crawl' || raw === '--breadth-crawl') {
      args.stopDisabled = true;
      continue;
    }
    if (raw === '--scores-first') {
      args.scoresFirst = true;
      continue;
    }
    if (raw === '--incremental') {
      args.incremental = true;
      continue;
    }
    if (raw.startsWith('--verbose=')) {
      args.verbose = Number(raw.slice('--verbose='.length)) || 1;
      continue;
    }
    if (raw.startsWith('--debug-log=')) {
      args.verbose = Number(raw.slice('--debug-log='.length)) || 1;
      continue;
    }
    if (raw === '--verbose' || raw === '--debug-log') {
      args.verbose = 1;
      continue;
    }
    if (raw === '--no-ux-csv') {
      args.uxCsv = false;
      continue;
    }
    if (raw === '--static-only' || raw === '--no-browser') {
      args.staticOnly = true;
      continue;
    }
    if (!raw.startsWith('--')) {
      throw new Error(`Unexpected positional argument: ${raw}`);
    }
    const [flag, inlineValue] = raw.includes('=') ? raw.split(/=(.*)/s, 2) : [raw, null];
    const key = flag.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const needsValue = [
      'repo',
      'site',
      'url',
      'standard',
      'siteKind',
      'out',
      'start',
      'readyUrl',
      'maxPages',
      'timeoutMs',
      'stopAfterMajorPlus',
      'priorUxScoresPath',
      'scoresFirstMaxPages',
      'incrementalRegressionMaxPages',
    ];
    if (!needsValue.includes(key)) {
      throw new Error(`Unknown flag: ${flag}`);
    }
    const value = inlineValue ?? argv[++i];
    if (value === undefined) throw new Error(`Missing value for ${flag}`);
    args[key] = value;
  }
  if (args.url && !args.site) args.site = args.url;
  args.repo = path.resolve(args.repo);
  args.out = path.resolve(args.repo, args.out || '.cursor/plans/forge-ux-remediation');
  if (args.standard) args.standard = path.resolve(args.repo, args.standard);
  args.maxPages = Number(args.maxPages);
  args.timeoutMs = Number(args.timeoutMs);
  if (!Number.isFinite(args.maxPages) || args.maxPages < 1) args.maxPages = 5;
  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs < 5000) args.timeoutMs = 45000;
  args.stopAfterMajorPlus = Number(args.stopAfterMajorPlus);
  if (!Number.isFinite(args.stopAfterMajorPlus) || args.stopAfterMajorPlus < 1) args.stopAfterMajorPlus = 10;
  args.scoresFirstMaxPages = Number(args.scoresFirstMaxPages);
  if (!Number.isFinite(args.scoresFirstMaxPages) || args.scoresFirstMaxPages < 1) args.scoresFirstMaxPages = 120;
  args.incrementalRegressionMaxPages = Number(args.incrementalRegressionMaxPages);
  if (!Number.isFinite(args.incrementalRegressionMaxPages) || args.incrementalRegressionMaxPages < 1) {
    args.incrementalRegressionMaxPages = 40;
  }
  if (args.priorUxScoresPath) {
    args.priorUxScoresPath = path.isAbsolute(args.priorUxScoresPath)
      ? path.normalize(args.priorUxScoresPath)
      : path.resolve(args.repo, args.priorUxScoresPath);
  }
  return args;
}

function summarizeFindings(pages) {
  const all = pages.flatMap((p) => (p.findings || []).map((f) => ({ ...f, url: p.url })));
  const byArea = {};
  for (const f of all) byArea[f.area] = (byArea[f.area] || 0) + 1;
  const bySeverity = summarizeBySeverity(all);
  return { all, byArea, bySeverity };
}

function countMajorPlusOnPage(findings) {
  return (findings || []).filter((f) => isMajorPlus(f.severity)).length;
}

function formatSeverityTotals(bySeverity = {}) {
  const tiers = ['blocker', 'critical', 'major', 'minor', 'trivial', 'cosmetic'];
  const parts = tiers.map((t) => {
    const n = bySeverity[t] || 0;
    return n ? `${t}: ${n}` : null;
  }).filter(Boolean);
  return parts.length ? parts.join('; ') : 'none';
}

/** Markdown table: heuristic metrics per crawled/analyzed page. */
function buildMetricsTableMd(pages) {
  if (!pages || !pages.length) {
    return '_No URL-level metrics yet — e.g. static-only run with no sampled pages, or re-run with `--site` for live analysis._';
  }
  const rows = pages.map((p) => {
    const m = p.metrics || {};
    const h1 = m.firstH1 || {};
    const mj = countMajorPlusOnPage(p.findings);
    const rest = Math.max((p.findings || []).length - mj, 0);
    const sidebar = m.homepageShellMetricsPresent === true ? String(m.sidebarOffcanvasLinkCount ?? '—') : 'n/a';
    const hbTerms = m.homepageShellMetricsPresent === true ? String(m.handbookChromeTermHits ?? '—') : 'n/a';
    return `| ${markdownEscape(p.url)} | ${p.score ?? 'n/a'} | ${mj} | ${rest} | ${h1.words ?? '—'} | ${markdownEscape((h1.text || '').slice(0, 80))} | ${m.wordCount ?? '—'} | ${m.trustTermCount ?? '—'} | ${m.ecosystemTermCount ?? '—'} | ${m.navLinks?.length ?? '—'} | ${sidebar} | ${hbTerms} |`;
  }).join('\n');
  return `| URL | Score | Maj+ | Sub-maj | H1 words | H1 preview | Words (sample) | Trust terms | Ecosystem terms | Header nav links | Sidebar/offcanvas links | Handbook chrome hits |
|-----|-------|-----|---------|----------|-----------|----------------|-------------|-----------------|----------|------------|------------------------|
${rows}`;
}

/** Short markdown appendix: heuristic metrics + note about static vs Playwright. */
function sharedMetricsAppendix(pages) {
  return `## Quantitative signals (this audit run)

${buildMetricsTableMd(pages)}

Static-only audits use repo-derived text samples; re-run with \`--site\` for live DOM, **homepage-shell** metrics (sidebar/offcanvas links, handbook chrome labels), and screenshots.
`;
}

/** Rich body for forge-ux-remediation.plan.md — keeps Cursor overview field short; detail in markdown body. */
function auditSnapshotForBuildPlanBody({ pages, args, inventory, crawlSummary }) {
  const summary = summarizeFindings(pages);
  const crawl = crawlSummary || { stopReason: args.staticOnly ? 'static_only' : 'unknown' };
  const mode = args.staticOnly
    ? '**Mode:** static repository scan (no Playwright). Re-run with `--site` for layout, density, and screenshot evidence.'
    : `**Mode:** browser crawl (${pages.length} page(s))${args.site ? ` starting at ${args.site}` : ''}.`;
  const crawlLine = args.staticOnly
    ? '_Crawl omitted (static-only run)._'
    : [
      '**Crawl outcome:** ',
      `\`${String(crawl.stopReason)}\``,
      crawl.stopReason === 'major_plus_threshold'
        ? ' — paused for remediation after Major+ backlog threshold.'
        : '',
      ' — Major+ count ',
      `\`${String(crawl.majorPlusFindingCountTotal ?? '')}\``,
      '; queued URLs ',
      `\`${String(crawl.queuedRemainingAtStop ?? '')}\``,
      '; page capture budget ',
      `\`${String(crawl.pagesPlannedBudget ?? '')}\`.`,
      ' Use `--breadth-crawl` (alias `--stop-disable`) to crawl full `--max-pages` breadth regardless of backlog.',
    ].join('');
  const sev = summary.bySeverity;
  const sevLine = [
    '**Findings (by tier):** ',
    formatSeverityTotals(sev),
    '\n\nSeverity counts use schema v',
    String(SCHEMA_VERSION),
    ' (`audit-data.json`). See report appendix for the ladder definitions.',
  ].join('');
  const urls = pages.map((p) => `- ${p.url}`).join('\n') || '- (no URL — static repo only)';
  const top = [...summary.all]
    .sort(compareFindingSeverity)
    .slice(0, 10)
    .map((f) => `- **${f.severity}** [${f.area}] ${f.message}\n  - *Evidence:* ${f.evidence}`);
  const topBlock = top.length ? top.join('\n') : '- No structured findings; rely on manual review of `audit-report.md` and repo inventory.';
  const invHint = (inventory.pageFiles && inventory.pageFiles.length)
    ? formatList(inventory.pageFiles.slice(0, 18).map((x) => `\`${x}\``), 'None listed.')
    : '- No page-like paths detected in inventory heuristics.';
  const findingCount = summary.all.length;
  const breadthHint = args.staticOnly
    ? '_Structured findings (`--static-only`): see `audit-report.md` plus `audit-data.json`. Re-run with `--site` for the default Major+ crawl governor._'
    : crawl.stopDisabled
      ? `_Top ten preview; **${findingCount} findings** flattened in \`audit-report.md\` → **All findings this run** Major+ crawl governor **was off** (\`--breadth-crawl\`)._`
      : `_Top ten preview; **${findingCount} findings** flattened in \`audit-report.md\` → **All findings this run**. Default crawl expands until cumulative Major+ backlog ≥ \`${String(crawl.stopAfterMajorPlus ?? '—')}\`; use \`--breadth-crawl\` to scan within \`--max-pages\` without that stop._`;

  return `${mode}

${crawlLine}

${sevLine}

### Pages / sources

${urls}

### Top signals (max 10)

${topBlock}

${breadthHint}

### Candidate content paths (inventory)

${invHint}
`;
}

function formatList(items, empty = 'None detected.') {
  if (!items || !items.length) return empty;
  return items.map((x) => `- ${x}`).join('\n');
}

const PLAN_TODO_STATUSES = new Set(['pending', 'in_progress', 'completed', 'cancelled']);

/**
 * Parse `todos:` entries from an existing forge-ux-remediation.plan.md front matter.
 * Returns map id -> status for ux-* ids.
 */
function parseTodoStatusesFromPlanMd(text) {
  const map = new Map();
  const fmMatch = String(text || '').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return map;
  const fm = fmMatch[1];
  const todosIdx = fm.indexOf('todos:');
  if (todosIdx === -1) return map;
  const slice = fm.slice(todosIdx);
  const cut = slice.split(/\nisProject:\s*/)[0] || slice;
  const re = /\n\s*- id:\s*(ux-[0-9a-z-]+)[\s\S]*?\n\s+status:\s*(\S+)/g;
  let m;
  while ((m = re.exec(cut)) !== null) {
    const st = m[2].trim().toLowerCase();
    if (PLAN_TODO_STATUSES.has(st)) map.set(m[1], st);
  }
  return map;
}

function mergeTodoStatus(id, previous, refreshPlanStatus) {
  if (!refreshPlanStatus) return 'pending';
  const prev = previous.get(id);
  if (prev && PLAN_TODO_STATUSES.has(prev)) return prev;
  return 'pending';
}

function markdownEscape(text) {
  return String(text || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function relativeFromRepo(repo, filePath) {
  return path.relative(repo, filePath).replaceAll(path.sep, '/');
}

async function readPriorUxScoresSnapshot(absJsonPath) {
  let text;
  try {
    text = await fsp.readFile(absJsonPath, 'utf8');
  } catch (e) {
    throw new Error(`Could not read --prior-ux-scores (${absJsonPath}): ${String(e?.message ?? e)}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error(`Could not JSON-parse --prior-ux-scores (${absJsonPath}): ${String(e?.message ?? e)}`);
  }
  return extractUxScoresFromSavedJson(parsed);
}

async function emitAuditPrecrawlScoreSidecars({
  args,
  runMeta,
  siteKind,
  designStandard,
  profile,
  precrawlUxScores,
  precrawlCrawlSummary,
}) {
  const ds = designStandard || {};
  const designPinned = {
    path: ds.path ?? null,
    id: ds.id ?? null,
    updated: ds.updated ?? null,
    sha256: ds.sha256 ?? null,
    byteLength: ds.byteLength ?? null,
  };
  const jsonPayload = {
    auditRunId: runMeta.auditRunId,
    generatedAt: runMeta.generatedAt,
    tool: 'forge-website-ux-audit-precrawl',
    uxScores: precrawlUxScores,
    crawlSummary: precrawlCrawlSummary,
    profile: { name: profile.name, siteKindKey: siteKind },
    designStandard: designPinned,
    argsBrief: {
      repo: args.repo,
      site: args.site,
      scoresFirstMaxPages: args.scoresFirstMaxPages,
      timeoutMs: args.timeoutMs,
    },
  };
  await writeFile(path.join(args.out, 'ux-quality-score-audit-precrawl.json'), `${JSON.stringify(jsonPayload, null, 2)}\n`);
  const md = buildUxQualityScoreMarkdown({
    runMeta,
    profile,
    designStandard: ds,
    uxScores: precrawlUxScores,
    argsSummary:
      `Audit precrawl (\`--scores-first\`): \`${args.repo}\` · site \`${args.site || ''}\` · budget \`${String(precrawlCrawlSummary?.pagesPlannedBudget ?? '?')}\` (\`${String(precrawlCrawlSummary?.crawlMode ?? '')}\`, \`${String(precrawlCrawlSummary?.stopReason ?? '')}\`)`,
    crawlSummary: precrawlCrawlSummary || {},
  });
  await writeFile(path.join(args.out, 'ux-quality-score-audit-precrawl.md'), md);
}

function regressionWaveAppendixMd(regressionWave) {
  if (!regressionWave || !regressionWave.rows?.length) return '';
  const rows = regressionWave.rows
    .slice(0, 120)
    .map(
      (r) =>
        `| ${markdownEscape(r.url)} | ${r.priorMajorPlusCount ?? '—'} | ${r.currentMajorPlusCount} | ${r.deltaMajorPlus ?? '—'} |`,
    )
    .join('\n');
  return `## Previously Major+ URLs re-checked

Baseline artifact: **${markdownEscape(regressionWave.baselineArtifact || '')}** · URLs checked this wave: **${regressionWave.urlsChecked}**

| URL | Prior Maj+ count | Current Maj+ count | Δ Maj+ |
|-----|------------------|-------------------|--------|
${rows}

`;
}

function buildAuditReport({
  args,
  inventory,
  profile,
  pages,
  standardText,
  runMeta,
  designStandard,
  crawlSummary,
  uxScores,
  uxScoreSnippetExtras,
  regressionWave,
}) {
  const summary = summarizeFindings(pages);
  const crawl = crawlSummary || {};

  function pageSeverityCounts(findings = []) {
    const mj = countMajorPlus(findings);
    const rest = Math.max((findings || []).length - mj, 0);
    return { mj, rest };
  }

  const pageRows = pages
    .map((p) => {
      const { mj, rest } = pageSeverityCounts(p.findings);
      return [
        '| ',
        markdownEscape(p.url),
        ' | ',
        p.score ?? 'n/a',
        ' | ',
        mj,
        ' | ',
        rest,
        ' | ',
        p.metrics?.wordCount ?? 'n/a',
        ' | ',
        p.metrics?.navLinks?.length ?? 'n/a',
        ' |',
      ].join('');
    })
    .join('\n');

  const sortedAll = [...summary.all].sort(compareFindingSeverity);
  const priorityBatch = sortedAll.slice(0, 10);
  const priorityTableRows = priorityBatch
    .map(
      (f) =>
        `| ${markdownEscape(f.severity)} | ${markdownEscape(f.legacySeverity)} | ${markdownEscape(f.area)} | ${markdownEscape(f.url)} | ${markdownEscape(f.message.slice(0, 120))} |`,
    )
    .join('\n');

  const allFindingRows = sortedAll
    .map(
      (f) =>
        `| ${markdownEscape(f.severity)} | ${markdownEscape(f.legacySeverity)} | ${markdownEscape(f.area)} | ${markdownEscape(f.url)} | ${markdownEscape(f.message.slice(0, 100))} | ${markdownEscape((f.evidence || '').slice(0, 80))} |`,
    )
    .join('\n');

  const priorityBullets = priorityBatch.length
    ? priorityBatch
        .map((f) => `- **${f.severity.toUpperCase()} / ${f.area}** (${f.url}): ${f.message}\n  - Evidence: ${f.evidence}\n  - Remediation: ${f.remediation}`)
        .join('\n')
    : '';

  const crawlGovernorBullet = args.staticOnly
    ? '- **Crawl governor:** not applicable (static-only). Re-run with `--site` for a governed live crawl.'
    : crawl.stopDisabled
      ? `- **Crawl breadth:** **full** within \`--max-pages\` (\`--breadth-crawl\` / \`--stop-disable\`). **Priority batch** shows up to ten worst for readability (**${sortedAll.length}** in **All findings this run** and per-page arrays in \`audit-data.json\`).`
      : `- **Remediation crawl (default):** Major+ **queue governor on** — expand stops once total blocker+critical+major across visited pages reaches \`${crawl.stopAfterMajorPlus ?? '—'}\`. Already-captured findings are **not truncated** (**${sortedAll.length}** flattened below); priority batch lists the ten worst-first rows only.`;

  const crawlModeSection = args.staticOnly
    ? `This run used **static-only** mode — no Playwright crawl. Metrics are synthesized from sampled repo files.\n\n\`\`\`json\n${JSON.stringify(crawl, null, 2)}\n\`\`\`\n`
    : [
      'Live crawl ',
      crawl.stopReason === 'major_plus_threshold' ? '**stopped expanding the queue early**' : '**completed**',
      ' (`',
      String(crawl.stopReason ?? 'unknown'),
      '`, mode ',
      '`',
      String(crawl.crawlMode ?? ''),
      '`',
      '). Major+ backlog total ',
      '`',
      String(crawl.majorPlusFindingCountTotal ?? ''),
      '`',
      '; URLs queued but not visited ',
      '`',
      String(crawl.queuedRemainingAtStop ?? ''),
      '`',
      '; page capture budget ',
      '`',
      String(crawl.pagesPlannedBudget ?? ''),
      '`',
      '. Major+ threshold ',
      crawl.stopDisabled ? '**(off — breadth crawl)**' : '`' + String(crawl.stopAfterMajorPlus ?? '') + '`',
      ' — breadth: **`--breadth-crawl`** (alias **`--stop-disable`**).\n\n',
      `\`\`\`json\n${JSON.stringify(crawl, null, 2)}\n\`\`\`\n`,
    ].join('');

  const homepage = pages[0];
  const screenshots = pages.flatMap((p) => [p.screenshot, p.mobileScreenshot].filter(Boolean)).map((s) => `- ${s}`).join('\n') || 'None captured.';
  const ds = designStandard || {};
  const standardExcerpt = (ds.rawSnippet || standardText || '').split('\n').slice(0, 80).join('\n') || 'Standard file not provided.';

  return `---
title: Forge UX audit report
kind: ux-audit
site_kind: ${profile.name}
schema_version: ${SCHEMA_VERSION}
generated_at: ${runMeta.generatedAt}
audit_run_id: ${runMeta.auditRunId}
design_standard_sha256: ${markdownEscape(ds.sha256 || '')}
crawl_stop_reason: ${markdownEscape(String(crawl.stopReason || ''))}
---

# Forge UX audit report

## Scope

- Repo: \`${args.repo}\`
- Site URL: \`${args.site || 'not provided'}\`
- Product profile: **${profile.name}**
- Product one-liner: ${profile.oneLiner}
- Framework detected: ${inventory.framework}
- Files indexed: ${inventory.fileCount}
- URLs analyzed this run: **${pages.length}**
${crawlGovernorBullet}
- **Audit run id:** \`${runMeta.auditRunId}\` — **schema:** \`${SCHEMA_VERSION}\` (see \`audit-data.json\`)
- **Generated at (UTC):** \`${runMeta.generatedAt}\`
- **Design standard pin:** ${ds.path ? `\`${markdownEscape(ds.path)}\`` : '_not pinned_'} · id \`${markdownEscape(ds.id || '—')}\` · sha256 \`${markdownEscape(ds.sha256 || '—')}\`

## Crawl mode

${crawlModeSection}

## Severity ladder (schema v${SCHEMA_VERSION})

${severityDefinitionsMarkdownTable()}
Each structured finding carries **\`severity\`** and **\`legacySeverity\`** (\`high\` / \`medium\` / \`low\`) for older tooling during transition.

${uxScores ? buildUxScoresAuditSnippet(uxScores, uxScoreSnippetExtras || {}) + '\n' : ''}
## Scorecard

| Page | Score | Maj+ | Sub-maj | Words | Nav links |
|---|---:|---:|---:|---:|---:|
${pageRows || '| n/a | n/a | n/a | n/a | n/a | n/a |'}

Findings rollup: **${formatSeverityTotals(summary.bySeverity)}**

## Homepage / first analyzed URL — first-screen snapshot

- URL: ${markdownEscape(homepage?.url || '')}
- H1: ${homepage?.metrics?.firstH1?.text ? `"${homepage.metrics.firstH1.text}"` : 'No visible H1 found.'}
- Above-fold words: ${homepage?.metrics?.aboveFoldWordCount ?? 'n/a'}
- CTA-like items above fold: ${(homepage?.metrics?.topCtas || []).map((c) => `"${c.text}"`).join(', ') || 'None detected.'}
- Technical artifacts above fold: ${homepage?.metrics?.codeAboveFold ?? 'n/a'}
- Trust terms: ${homepage?.metrics?.trustTermCount ?? 'n/a'}
- Ecosystem terms: ${homepage?.metrics?.ecosystemTermCount ?? 'n/a'}

## Priority sample (worst first — rows capped at 10 for readability)

| Severity | Legacy | Area | URL | Finding |
|----------|--------|------|-----|---------|
${priorityTableRows || '| — | — | — | — | No structured findings |'}

${priorityBullets ? `\n### Priority detail\n\n${priorityBullets}` : ''}

## All findings this run (${sortedAll.length})

| Severity | Legacy | Area | URL | Finding | Evidence (trim) |
|----------|--------|------|-----|---------|----------------|
${allFindingRows || '| — | — | — | — | — | — |'}

## Repository inventory hints

### Likely page/content files

${formatList(inventory.pageFiles.slice(0, 60).map((f) => `\`${f}\``))}

### Likely components/layout files

${formatList(inventory.componentFiles.slice(0, 50).map((f) => `\`${f}\``))}

### Likely navigation/shell files

${formatList(inventory.navCandidates.slice(0, 50).map((f) => `\`${f}\``))}

### Likely style/theme files

${formatList(inventory.styleFiles.slice(0, 40).map((f) => `\`${f}\``))}

## Screenshots

${screenshots}

${regressionWaveAppendixMd(regressionWave)}
## Standard excerpt used for this audit

\`\`\`md
${standardExcerpt}
\`\`\`
`;
}

function findingBullets(pages, areas) {
  let items = summarizeFindings(pages).all.filter((f) => areas.includes(f.area));
  items = [...items].sort(compareFindingSeverity);
  if (!items.length) return '- No deterministic finding in this area. Still inspect the relevant pages manually.';
  return items.slice(0, 15).map((f) => `- **${f.severity}** ${f.message} (${f.url})\n  - Evidence: ${f.evidence}\n  - Remediation: ${f.remediation}`).join('\n');
}

function siteSpecificCopy(profile) {
  return `Recommended storyline for **${profile.name}**:

- One-liner: ${profile.oneLiner}
- Primary promise: ${profile.promise}
- Audience: ${profile.primaryAudience}
- Story spine: ${profile.preferredStory}
`;
}

function cursorPlanHeader(title, order, profile, runMeta, siteKind = 'generic', { emphasizePlatformShell = false } = {}) {
  let platformShell = '';
  if (emphasizePlatformShell && siteKind === 'platform') {
    platformShell = `
## Forge Platform — landing shell first

When \`homepage-shell\`, \`product-visual\`, or visual evidence shows handbook sidebars or docs trees before the hero, **Markdown copy alone is insufficient**. Split the \`/\` route from the generated handbook shell per **docs/design/forge-enterprise-ai-website-standard.md** (**Root Homepage Shell Contract**). Complete **Plan 02** shell/layout work before deep **Plan 03** storyline rewrites; use **Plan 04** for IA consolidation and **Plan 09** for screenshot acceptance.
`;

  }
  return `---
title: ${title}
kind: cursor-remediation-plan
order: ${order}
product: ${profile.name}
generated_at: ${runMeta.generatedAt}
audit_run_id: ${runMeta.auditRunId}
---

# ${title}

${siteSpecificCopy(profile)}

## Non-negotiable constraints

- Preserve canonical technical content. Move it to better depth instead of deleting it.
- Do not invent customers, certifications, integrations, benchmarks, compliance claims, or product capabilities.
- Keep marketing pages short, direct, and outcome-led.
- Keep docs/reference pages technically complete.
- Maintain existing build conventions, routing conventions, and component style unless the repo clearly supports a better shared pattern.
- Validate links, responsive layout, semantic headings, and basic accessibility before finishing.
- Do not respond to audits by **rewriting Markdown copy only**. First verify root \`/\` uses **product landing shell** vs **docs/handbook shell** per **docs/design/forge-enterprise-ai-website-standard.md**. When \`homepage-shell\`, \`product-visual\`, or \`storyline-flow\` findings indicate wrong shell or a missing hero visual slot, complete **Plan 02** (shell/layout separation) before hero copy work (**Plan 03**).
${platformShell}`;
}

function checklist(items, empty) {
  if (!items || !items.length) return empty;
  return items.map((x) => `- [ ] \`${x}\``).join('\n');
}

function candidateFileBlock(inventory) {
  return `## Candidate files to inspect first

Cursor Agent should verify these rather than assuming they are definitive.

### Pages/content
${checklist(inventory.pageFiles.slice(0, 45), '- [ ] Locate homepage, overview pages, docs pages, and generated content manually.')}

### Layout/navigation/components
${checklist(inventory.componentFiles.concat(inventory.navCandidates).slice(0, 50), '- [ ] Locate layout, header, nav, sidebar, card, CTA, and section components manually.')}

### Styles/tokens
${checklist(inventory.styleFiles.slice(0, 35), '- [ ] Locate global styles, theme tokens, Tailwind config, or design-system files manually.')}
`;
}

function hasShellVisualStoryGateSignals(pages) {
  const watch = new Set(['homepage-shell', 'product-visual', 'storyline-flow']);
  for (const p of pages || []) {
    for (const f of p.findings || []) {
      if (f && watch.has(f.checkId)) return true;
    }
  }
  return false;
}

function buildForgeUxRemediationDotPlanMd({ profile, args, inventory, pages, previousTodoStatuses, runMeta, crawlSummary }) {
  const name = `${profile.name} — Forge UX remediation (Build)`;
  const pgs = pages || [];
  const summary = summarizeFindings(pgs);
  const blk = summary.bySeverity.blocker || 0;
  const cri = summary.bySeverity.critical || 0;
  const maj = summary.bySeverity.major || 0;
  const min = summary.bySeverity.minor || 0;
  const tri = summary.bySeverity.trivial || 0;
  const cos = summary.bySeverity.cosmetic || 0;
  const prev = previousTodoStatuses || new Map();
  const refresh = args.refreshPlanStatus !== false;
  const mergedCount = refresh ? [...prev.values()].filter((s) => s && s !== 'pending').length : 0;
  let overview = `Ordered remediation for ${profile.name}. Run ${pgs.length} source(s) in this audit | ${blk} blocker, ${cri} critical, ${maj} major, ${min} minor, ${tri} trivial, ${cos} cosmetic. See body for snapshot, URLs, and top signals.`;
  if (refresh && mergedCount > 0) {
    overview += ` ${mergedCount} todo(s) carried forward as non-pending from the previous plan file.`;
  }
  const steps = [
    ['ux-00', 'Read 00-master-remediation-sequence.md and audit-report.md'],
    ['ux-01', 'Execute 01-site-inventory-and-content-map.md'],
    ['ux-02', 'Execute 02-homepage-shell-and-product-landing-mode.md'],
    ['ux-03', 'Execute 03-homepage-storyline-and-hero.md'],
    ['ux-04', 'Execute 04-information-architecture-and-navigation.md'],
    ['ux-05', 'Execute 05-page-depth-and-technical-content-pruning.md'],
    ['ux-06', 'Execute 06-trust-model-and-ecosystem-fit.md'],
    ['ux-07', 'Execute 07-visual-system-and-spacious-enterprise-polish.md'],
    ['ux-08', 'Execute 08-accessibility-responsive-link-and-build-qa.md'],
    ['ux-09', 'Execute 09-screenshot-and-homepage-shell-review.md'],
  ];
  const todoYaml = steps
    .map(([id, content]) => {
      const status = mergeTodoStatus(id, prev, refresh);
      return `  - id: ${id}\n    content: ${JSON.stringify(content)}\n    status: ${status}`;
    })
    .join('\n');

  const runIdentitySection = `## Run identity

| Field | Value |
|-------|-------|
| **audit_run_id** | \`${runMeta.auditRunId}\` |
| **generated_at (UTC)** | \`${runMeta.generatedAt}\` |

All generated artifacts in this folder from **this** invocation share this **audit_run_id**. Each audit run creates a **new** id and timestamp (including \`audit-report.md\`, \`audit-data.json\`, \`00\`–\`09\`, and this plan).

`;
  const refreshSection = refresh
    ? `## Plan status refresh

By default the auditor **merges prior YAML \`status:\` values** for each \`ux-*\` id from the previous \`forge-ux-remediation.plan.md\` in this \`--out\` folder, then regenerates the audit snapshot and body. To reset every todo to \`pending\`, run again with **\`--no-refresh-plan-status\`**.

`
    : `## Plan status

This run used **\`--no-refresh-plan-status\`**: all todos were written as \`pending\`.

`;
  const body = `# ${profile.name} — Forge UX remediation

This \`forge-ux-remediation.plan.md\` file is intended for Cursor's **plan UI** (todos + **Build**). The sibling \`00\`–\`09\` Markdown files carry the themed prompts; **this file adds the audit snapshot from the generator run** so the orchestrator is not context-free.

- After substantive edits, run your site's build command (e.g. \`python3 generator/build-site.py\` for generator-based sites).
- Re-run the auditor with \`--site\` when a dev server is available for Playwright evidence and richer DOM metrics.

${runIdentitySection}${refreshSection}## If the Build button does nothing

**Build** in Plan mode is meant to hand the plan to the **Agent** so it can implement. That handoff is mainly tested for plans **created in Plan Mode in the same session**. Auditor-generated \`.plan.md\` files are valid Markdown, but Cursor may not attach the same Build action to them (or to plans in a **nested** folder like \`forge-ux-remediation/\`).

Use this workflow instead:

1. Switch to **Agent** (not **Ask**), in the same workspace root as \`--repo\`.
2. In chat, attach this plan with **\@** (e.g. \`@forge-ux-remediation.plan.md\` or the path under \`.cursor/plans/\`).
3. Ask: **Execute the YAML todos in order (ux-00 … ux-09); after each todo summarize files touched and stop for review if the change is large.**
4. If you use a repo-level orchestrator in \`.cursor/plans/*.plan.md\`, attach that file instead — some Cursor builds wire **Build** more reliably for plans **directly under** \`.cursor/plans/\` than for nested copies.
5. With **\`--mirror-root-plan\`**, a **uniquely named copy** is written under \`.cursor/plans/\`: \`forge-ux-remediation__<UTC-stamp>__<audit_run_id>.plan.md\` (same YAML + body). It may still not enable **Build**; use **Agent \@** or \`cursor-agent-run-ux-plan.sh\` (see KS tool README).

## Audit snapshot (this run)

${hasShellVisualStoryGateSignals(pgs) ? `### Gate failures (shell / visual / storyline)\n\nThis audit reports \`homepage-shell\`, \`product-visual\`, and/or \`storyline-flow\` findings. Execute **02 - Homepage shell and product landing mode** before **03 - Homepage storyline and hero** unless you have verified root \`/\` already uses the correct **product landing shell** (not docs/handbook chrome).\n\n` : ''}
${auditSnapshotForBuildPlanBody({ pages: pgs, args, inventory, crawlSummary })}

## Quantitative metrics (per URL)

${buildMetricsTableMd(pgs)}

Static-only audits use repo-derived text samples; re-run with \`--site\` for live DOM, homepage-shell sidebar metrics, and screenshots.

## Files in this folder

| File | Role |
|------|------|
| \`audit-report.md\` | Full heuristic table and evidence |
| \`00-master-remediation-sequence.md\` | Sequence and constraints |
| \`01\`–\`09\` | Themed remediation prompts (each includes signals + findings for this run) |
`;
  return `---
name: ${JSON.stringify(name)}
overview: ${JSON.stringify(overview)}
generated_at: ${JSON.stringify(runMeta.generatedAt)}
audit_run_id: ${JSON.stringify(runMeta.auditRunId)}
todos:
${todoYaml}
isProject: true
---

${body}`;
}

function buildMasterPlan({ profile, runMeta, siteKind = 'generic' }) {
  let orderNotes = '\n> **Shell before copy:** when audits show \`homepage-shell\`, \`product-visual\`, or \`storyline-flow\` findings, complete **02 - Homepage shell** before **03 - Homepage storyline**.\n';
  if (siteKind === 'platform') {
    orderNotes += '> **Forge Platform:** root \`/\` must remain **mode 1** product/architecture landing; full handbook navigation belongs under Docs/Handbook/Reference — use **02**, **04**, and **09** before declaring UX done.\n';
  }
  return `${cursorPlanHeader('00 - Master remediation sequence', 0, profile, runMeta, siteKind, { emphasizePlatformShell: true })}

**Repo-level Build plan:** [\`../forge-platform-ux-remediation.plan.md\`](../forge-platform-ux-remediation.plan.md) — open from \`.cursor/plans/\` when this file exists (Forge Platform handbook workflow).

**Same-folder Build:** [\`forge-ux-remediation.plan.md\`](./forge-ux-remediation.plan.md)
${orderNotes}
## How to use this plan set

This folder contains ordered remediation plans generated from a deterministic UX audit. Use either workflow:

### Controlled workflow

Run one child plan at a time in Cursor Plan Mode, review the plan, build it, test it, then continue to the next plan.

### One-shot workflow

Ask Cursor Agent to read this master plan and execute child plans in order. This can work for smaller repos, but the controlled workflow is safer for public website redesigns.

## Plan tree

- [ ] **Foundation**
  - [ ] 01 - Site inventory and content map
  - [ ] 02 - Homepage shell and product landing mode
  - [ ] 03 - Homepage storyline and hero
- [ ] **Structure**
  - [ ] 04 - Information architecture and navigation
  - [ ] 05 - Page depth and technical-content pruning
- [ ] **Trust and enterprise feel**
  - [ ] 06 - Trust model and ecosystem fit
  - [ ] 07 - Visual system and spacious enterprise polish
- [ ] **Verification**
  - [ ] 08 - Accessibility, responsive, link, and build QA
  - [ ] 09 - Screenshot and homepage shell review

## Execution prompt for Cursor

Read every file in \`.cursor/plans/forge-ux-remediation/\`, starting with this file. Execute the child plans in numeric order. After each child plan, summarize files changed, UX impact, remaining risks, and validation performed. Stop before making risky product-claim changes that are not supported by existing repo content.

## Final acceptance criteria

- A first-time visitor can explain the product in one sentence after the first screen.
- Homepage has one dominant promise, one primary CTA, and one secondary CTA.
- Technical details are discoverable but not forced into the hero path.
- The site clearly shows what the product does, who it is for, where it fits in Forge, and why it is trustworthy.
- Navigation is curated, not a generated link wall.
- Visual hierarchy feels spacious, bold, AI-enabled, and enterprise-ready.
- Build, links, responsive layout, and accessibility checks pass or have documented exceptions.
`;
}

function buildPlan01({ inventory, pages, profile, runMeta, siteKind = 'generic' }) {
  return `${cursorPlanHeader('01 - Site inventory and content map', 1, profile, runMeta, siteKind)}

## Goal

Create a factual content map before redesigning. Identify what content is product landing content, what is docs/reference content, and what is generated or maintainer-only content.

${candidateFileBlock(inventory)}

${sharedMetricsAppendix(pages)}

## Audit findings to account for

${findingBullets(pages, ['page-depth', 'technical-depth', 'navigation', 'messaging'])}

## Tasks

- [ ] Locate the homepage route and primary layout shell.
- [ ] Locate product overview pages, quickstarts, docs/reference pages, operation pages, schema pages, and generated indexes.
- [ ] Create or update an internal planning note at \`.cursor/plans/forge-ux-remediation/content-map.md\` with:
  - [ ] Current primary routes.
  - [ ] Proposed product-layer routes.
  - [ ] Proposed technical-layer routes.
  - [ ] Content that should stay on homepage.
  - [ ] Content that should move deeper.
  - [ ] Content that should not be changed because it is canonical/reference material.
- [ ] Identify reusable components for hero, cards, section shell, ecosystem strip, trust block, and CTAs.
- [ ] Identify the build/test commands from package scripts or repo docs.

## Output expected

- A concise content map and implementation notes.
- No major UI rewrite yet unless required to make the content map actionable.

## Completion checklist

- [ ] The homepage source file is identified.
- [ ] Navigation source is identified.
- [ ] Technical content relocation targets are identified.
- [ ] Build/test commands are identified.
`;
}

function buildPlan02Shell({ inventory, pages, profile, runMeta, siteKind = 'generic' }) {
  return `${cursorPlanHeader('02 - Homepage shell and product landing mode', 2, profile, runMeta, siteKind, { emphasizePlatformShell: true })}

## Goal

Ensure root \`/\` uses a **product landing shell** (mode 1 in the design standard), not a generated **docs/handbook shell**, before investing in hero copy. **Forge Platform:** full handbook navigation belongs under **Docs / Handbook / Reference**, not the root first screen.

${candidateFileBlock(inventory)}

${sharedMetricsAppendix(pages)}

## Audit findings to account for

${findingBullets(pages, ['navigation', 'information-architecture', 'first-screen', 'product-story'])}

## Tasks

- [ ] Verify whether the homepage route mounts **product landing** vs **handbook/docs** chrome (sidebar, generated tree, duplicated nav before \`<main>\`).
- [ ] When \`homepage-shell\`, \`product-visual\`, or \`storyline-flow\` findings indicate wrong shell, missing hero visual slot, or docs-first story order, **fix layout/routing/section order first** — not Markdown-only edits.
- [ ] Split or template-separate \`/\` from handbook layouts; relocate full trees to \`/docs\`, \`/handbook\`, \`/reference\`, or maintainer routes.
- [ ] Preserve canonical technical content by moving depth and links, not deleting reference material.

## Completion checklist

- [ ] Root first screen reads as product/architecture landing (screenshot or local viewport sanity check).
- [ ] Ready to execute **03 - Homepage storyline and hero** without masking shell debt.

`;
}

function buildPlan03Storyline({ inventory, pages, profile, runMeta, siteKind = 'generic' }) {
  const platformLead = siteKind === 'platform'
    ? '- [ ] **Forge Platform:** Complete **Plan 02** shell/layout separation (and **Plan 09** screenshot review) before heavy **Plan 03** copy-only edits when `homepage-shell` or `product-visual` signals are present.\n'

    : '';
  return `${cursorPlanHeader('03 - Homepage storyline and hero', 3, profile, runMeta, siteKind, { emphasizePlatformShell: true })}

## Goal

Make the first 10 seconds clear: what this is, who it is for, what it does, why it matters, and what to do next.

${candidateFileBlock(inventory)}

${sharedMetricsAppendix(pages)}

## Audit findings to account for

${findingBullets(pages, ['hero', 'first-screen', 'conversion', 'messaging', 'metadata', 'navigation', 'information-architecture', 'product-story'])}

## Recommended homepage story

- Headline direction: **${profile.promise}**
- Subhead direction: Explain the product in 18-36 words using the one-liner and the governed/human-owned outcome.
- Primary CTA: a new-user action such as **Get started**, **Explore the framework**, or **Install and run**.
- Secondary CTA: a technical action such as **View docs**, **Read trust model**, or **See how it works**.
- Above-fold visual: product screenshot, architecture flow, or intent-to-evidence diagram.

## Tasks

${platformLead}- [ ] **Do not rewrite only Markdown copy** — confirm Plan **02** cleared shell/visual debt when \`homepage-shell\`, \`product-visual\`, or \`storyline-flow\` findings were present.
- [ ] Rewrite the homepage hero to contain:
  - [ ] One H1 with a 4-9 word outcome-led promise.
  - [ ] One explanatory subhead with no jargon before plain-language framing.
  - [ ] One primary CTA and one secondary CTA.
  - [ ] One visual or diagram slot.
- [ ] Add or refine the first three outcome cards. Each card should name an outcome before a mechanism.
- [ ] Ensure the first screen avoids code blocks, endpoint lists, generated indexes, tables, and long paragraphs.
- [ ] Add or update title/meta description using product truth from the repo.
- [ ] Preserve existing technical detail by moving it to docs/quickstart/reference links.

## Suggested copy starter

\`\`\`md
# ${profile.promise}

${profile.oneLiner} Forge helps teams turn intent into structured, reviewable execution without losing judgment, ownership, or control.

Primary CTA: Get started
Secondary CTA: See how it works
\`\`\`

Adjust wording to match the exact product truth in this repo.

## Completion checklist

- [ ] One clear H1.
- [ ] Above-fold copy is short and outcome-led.
- [ ] CTA hierarchy is obvious.
- [ ] Hero does not expose deep technical content too early.
- [ ] Metadata is updated.
`;
}

function buildPlan04InformationArchitecture({ inventory, pages, profile, runMeta, siteKind = 'generic' }) {
  return `${cursorPlanHeader('04 - Information architecture and navigation', 4, profile, runMeta, siteKind, { emphasizePlatformShell: true })}

## Goal

Replace exhaustive navigation with curated product navigation while keeping all documentation discoverable.

${candidateFileBlock(inventory)}

${sharedMetricsAppendix(pages)}

## Audit findings to account for

${findingBullets(pages, ['navigation', 'information-architecture', 'ecosystem', 'page-depth'])}

## Target IA

Use two layers:

- Product layer: Overview, How it works, Use cases, Trust, Docs, Ecosystem.
- Technical layer: Quickstart, Guides, API/CLI reference, Operations, Schemas, Maintainer notes.

Recommended global ecosystem nav:

- ForgeSDLC
- Lenses
- LCDL
- Fleet
- Platform
- Blueprints

Recommended product-local nav:

- Overview
- How it works
- Trust
- Quickstart
- Docs

## Tasks

- [ ] Inspect current header, footer, sidebar, generated nav, and docs index behavior.
- [ ] Reduce top-level nav to a curated set of 4-7 links/groups.
- [ ] Add an ecosystem strip or footer module showing where this product fits in Forge.
- [ ] Keep full docs/reference trees available only in docs contexts.
- [ ] Avoid showing generated link walls on the homepage or above the fold.
- [ ] Add redirects/cross-links if content is moved.

## Completion checklist

- [ ] New users have a short product path.
- [ ] Technical users still have a complete docs/reference path.
- [ ] Header/nav works on mobile.
- [ ] Ecosystem relationships are visible.
`;
}

function buildPlan05PageDepth({ inventory, pages, profile, runMeta, siteKind = 'generic' }) {
  return `${cursorPlanHeader('05 - Page depth and technical-content pruning', 5, profile, runMeta, siteKind)}

## Goal

Shorten marketing/overview pages and move technical density into the right places without losing precision.

${candidateFileBlock(inventory)}

${sharedMetricsAppendix(pages)}

## Audit findings to account for

${findingBullets(pages, ['page-depth', 'technical-depth', 'readability', 'messaging'])}

## Tasks

- [ ] Review homepage and overview sections for mixed-purpose content.
- [ ] Split or relocate content into:
  - [ ] Overview/product page.
  - [ ] Quickstart.
  - [ ] Guides/tutorials.
  - [ ] API/CLI/reference.
  - [ ] Operations/runbooks.
  - [ ] Maintainer/generated-content notes.
- [ ] Translate technical terms the first time they appear:
${TECHNICAL_TRANSLATIONS.map(([term, plain]) => `  - [ ] \`${term}\` -> ${plain}`).join('\n')}
- [ ] Convert long paragraphs into short sections, cards, or linked detail pages.
- [ ] Keep homepage target near 700-1,200 words unless the repo's product constraints justify otherwise.

## Completion checklist

- [ ] Homepage is product-led, not docs-led.
- [ ] Technical content is still findable.
- [ ] Long paragraphs and long sections are reduced.
- [ ] Jargon appears only after a plain-language explanation.
`;
}

function buildPlan06TrustEcosystem({ inventory, pages, profile, runMeta, siteKind = 'generic' }) {
  return `${cursorPlanHeader('06 - Trust model and ecosystem fit', 6, profile, runMeta, siteKind)}

## Goal

Make enterprise trust concrete: what stays local, what executes where, what humans control, what evidence exists, and what the product is not.

${candidateFileBlock(inventory)}

${sharedMetricsAppendix(pages)}

## Audit findings to account for

${findingBullets(pages, ['trust', 'ecosystem', 'messaging'])}

## Trust block template

Add or refine a section titled **Designed for governed adoption** with rows/cards for:

- Data boundary: where data stays by default.
- Execution boundary: what runs locally, remotely, or on owned infrastructure.
- Human control: where approval, review, or ownership happens.
- Evidence: what is logged, validated, or reviewable.
- Admin/operator control: what can be configured or disabled.
- Out of scope: what the product is not meant to do.

## Ecosystem fit section

Add a compact strip explaining the relevant relationship to:

- ForgeSDLC: methodology and governance model.
- Lenses: local workspace/control-plane UX.
- LCDL: governed LLM task/contracts layer.
- Fleet: controlled job execution on owned infrastructure.
- Platform: integrated architecture and operating model.
- Blueprints: templates and practice library, only if present in repo/product truth.

## Tasks

- [ ] Gather existing truth from repo docs before writing trust claims.
- [ ] Add the trust block to homepage or trust page.
- [ ] Add ecosystem fit strip/module.
- [ ] Link to deeper security/operations docs if they exist.
- [ ] Remove or soften unsupported claims.

## Completion checklist

- [ ] Trust claims are concrete and supported by repo content.
- [ ] No invented compliance/security/customer claims.
- [ ] Users understand where the product fits in Forge.
- [ ] Security/operator readers have a deeper path.
`;
}

function buildPlan07VisualPolish({ inventory, pages, profile, runMeta, siteKind = 'generic' }) {
  return `${cursorPlanHeader('07 - Visual system and spacious enterprise polish', 7, profile, runMeta, siteKind, { emphasizePlatformShell: true })}

## Goal

Make the site feel bold, spacious, AI-enabled, enterprise-ready, and easier to scan.

${candidateFileBlock(inventory)}

${sharedMetricsAppendix(pages)}

## Audit findings to account for

${findingBullets(pages, ['first-screen', 'readability', 'accessibility', 'navigation', 'information-architecture'])}

## Design direction

- Larger hero type and stronger section hierarchy.
- Spacious vertical rhythm and fewer dense grids.
- Cards that emphasize outcomes over mechanisms.
- Product screenshot where real UI exists; otherwise a simple system diagram.
- Subtle AI/governance visual language: flows, nodes, boundaries, review gates, evidence trails.
- Avoid decorative robot/AI gimmicks.

## Tasks

- [ ] Inspect existing design tokens/global styles before changing visual design.
- [ ] Improve hero spacing, type scale, CTA hierarchy, and visual slot.
- [ ] Normalize section spacing and card rhythm across homepage sections.
- [ ] Create or refine reusable components only where it reduces duplication.
- [ ] Ensure diagrams/cards remain responsive and accessible.
- [ ] Keep color/contrast enterprise-grade and readable.

## Completion checklist

- [ ] Page feels lighter and easier to scan.
- [ ] Visual hierarchy makes the main promise obvious.
- [ ] Product/architecture visual supports comprehension.
- [ ] Reusable components are not over-engineered.
`;
}

function buildPlan08BuildQa({ inventory, pages, profile, runMeta, siteKind = 'generic' }) {
  return `${cursorPlanHeader('08 - Accessibility, responsive, link, and build QA', 8, profile, runMeta, siteKind)}

## Goal

Verify the remediation work before shipping.

${candidateFileBlock(inventory)}

${sharedMetricsAppendix(pages)}

## Audit findings to account for

${findingBullets(pages, ['accessibility', 'metadata', 'semantics', 'conversion', 'navigation', 'information-architecture', 'first-screen'])}

## Tasks

- [ ] Run the repo's build/check/test commands identified in Plan 01.
- [ ] Run the website locally and inspect the homepage at desktop and mobile widths.
- [ ] Confirm **no remaining** \`homepage-shell\` **blocker** after live re-audit with \`--site\` (sidebar/offcanvas link wall or handbook chrome labels before the hero).
- [ ] Verify:
  - [ ] One visible H1 on primary landing page.
  - [ ] Semantic heading order is sensible.
  - [ ] Keyboard focus states are visible.
  - [ ] Header/nav works on mobile.
  - [ ] CTA links work.
  - [ ] Moved content has working links.
  - [ ] Images have useful alt text or decorative empty alt.
  - [ ] Text contrast is readable.
  - [ ] No code/table/reference blocks appear above the fold on product pages.
- [ ] Re-run the UX auditor and compare the new report to the previous report.
- [ ] Document any remaining findings that are accepted tradeoffs.

## Completion checklist

- [ ] Build passes or failures are documented with root cause.
- [ ] Links and responsive nav pass manual checks.
- [ ] UX audit score improves or accepted exceptions are documented.
- [ ] Final summary groups changes by user-facing impact.
`;
}

function buildPlan09Screenshot({ inventory, pages, profile, runMeta, siteKind = 'generic' }) {
  return `${cursorPlanHeader('09 - Screenshot and homepage shell review', 9, profile, runMeta, siteKind, { emphasizePlatformShell: siteKind === 'platform' })}

## Goal

Validate **visual-first acceptance** aligned with **docs/design/forge-enterprise-ai-website-standard.md** (**Visual acceptance and screenshot-based review**) — first screen reads as product/architecture landing, not a documentation reader.

${candidateFileBlock(inventory)}

${sharedMetricsAppendix(pages)}

## Audit findings to account for

${findingBullets(pages, ['navigation', 'information-architecture', 'first-screen'])}

## Tasks

- [ ] Inspect \`screenshots/01-*.png\` (desktop) and \`screenshots/00-mobile-*.png\` from this run **when screenshots were captured** (omit if you used \`--no-screenshots\`).
- [ ] Confirm the hero sits in the **visual center**, the primary CTA is obvious, and dense sidebar/offcanvas/handbook clusters do not crowd the fold.
- [ ] Any remaining \`homepage-shell\` blocker must be cleared before declaring UX remediation done—iterate Plans **02**, **04**, and **07** rather than rewriting Markdown only.
- [ ] Re-run the auditor with \`--site\` and confirm sidebar/offcanvas counts and handbook chrome hits match expectation.

## Completion checklist

- [ ] Screenshots or staging capture shows landing/product posture; handbook chrome is delegated to deeper routes.

`;
}

function buildCursorRule(profile) {
  return `---
description: Execute Forge UX remediation plans generated by the KS website auditor.
alwaysApply: false
---

# Forge UX remediation plan runner

Use this rule when executing files under \`.cursor/plans/forge-ux-remediation/\`.

Product profile: ${profile.name}
Product one-liner: ${profile.oneLiner}

## Required behavior

- Execute remediation plans in numeric order unless the user gives a different order.
- Re-run the UX auditor from the website repo **without \`--no-refresh-plan-status\`** (default) after substantive remediation so \`forge-ux-remediation.plan.md\` **keeps YAML todo \`status:\` values** (\`completed\`, \`in_progress\`, …) across regenerations. Use **\`--no-refresh-plan-status\`** only when you intentionally want every todo reset to \`pending\`.
- Before editing, inspect the referenced source files and confirm the repo's actual framework/routing conventions.
- Preserve canonical technical content by relocating it to appropriate docs/reference depth instead of deleting it.
- Do not invent product capabilities, integrations, customers, certifications, compliance claims, or metrics.
- Keep public landing pages short, clear, spacious, and outcome-led.
- Keep docs/reference pages complete and precise.
- Do not satisfy shell or visual-slot failures by **rewriting Markdown copy only** — verify **product landing shell** vs **docs/handbook shell** on root \`/\` first (**Plan 02**).
- Execute todos **ux-00** through **ux-09** in order unless the user specifies otherwise.
- Validate with build/check commands where available.
- After each plan, report files changed, UX impact, validation performed, and unresolved risks.
`;
}


function plainTextFromSource(source) {
  return String(source || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`*_#>\[\]{}()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstHeadingFromSource(source) {
  const text = String(source || '');
  const md = text.match(/^#\s+(.+)$/m);
  if (md) return md[1].replace(/[`*_#]/g, '').trim();
  const html = text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (html) return plainTextFromSource(html[1]);
  return '';
}

function countIncludedTerms(terms, text) {
  const lower = String(text || '').toLowerCase();
  return terms.filter((term) => lower.includes(String(term).toLowerCase())).length;
}

async function analyzeStaticRepoOnly({ args, inventory }) {
  const siteKindResolved = inferSiteKind(args, inventory);
  const candidateFiles = inventory.pageFiles.slice(0, 80);
  const chunks = [];
  let firstH1 = '';
  for (const file of candidateFiles) {
    const source = await readMaybe(path.join(args.repo, file));
    if (!source) continue;
    if (!firstH1) firstH1 = firstHeadingFromSource(source);
    chunks.push(source);
  }
  const combinedSource = chunks.join('\n\n');
  const plain = plainTextFromSource(combinedSource);
  const words = plain.split(/\s+/).filter(Boolean);
  const lower = plain.toLowerCase();
  const technicalHits = TECHNICAL_TRANSLATIONS
    .map(([term, plainTerm]) => ({ term, plain: plainTerm, aboveFold: false, anywhere: lower.includes(term.toLowerCase()) }))
    .filter((x) => x.anywhere);
  const firstH1Words = firstH1.split(/\s+/).filter(Boolean).length;
  const metrics = {
    title: 'Static repository audit',
    metaDescription: '',
    lang: '',
    url: args.site || 'repo://static',
    allTextStart: plain.slice(0, 3000),
    aboveFoldText: plain.slice(0, 2500),
    wordCount: words.length,
    aboveFoldWordCount: Math.min(words.length, 999),
    scrollHeight: 0,
    viewportHeight: 0,
    headings: firstH1 ? [{ tag: 'h1', text: firstH1, top: 0, words: firstH1Words, fontSize: 0 }] : [],
    h1Count: firstH1 ? 1 : 0,
    firstH1: firstH1 ? { tag: 'h1', text: firstH1, top: 0, words: firstH1Words, fontSize: 0 } : null,
    links: [],
    navLinks: inventory.navCandidates,
    buttons: [],
    topCtas: [],
    paragraphs: [],
    sections: [],
    images: [],
    codeAboveFold: 0,
    tables: 0,
    preBlocks: 0,
    codeBlocks: 0,
    cards: 0,
    technicalHits,
    genericAiHits: ['ai-powered', 'powered by ai', 'agentic', 'ai enabled', 'ai-enabled'].filter((t) => lower.includes(t)),
    trustTermCount: countIncludedTerms(TRUST_TERMS, plain),
    trustTermsAboveFold: 0,
    ecosystemTermCount: countIncludedTerms(ECOSYSTEM_TERMS, plain),
    ecosystemTermsAboveFold: 0,
    outcomeTermCount: countIncludedTerms(OUTCOME_TERMS, plain),
    imagesMissingAlt: 0,
    lowContrast: [],
    ksVisualHashes: [],
  };
  const findings = [
    ...runAllChecks(metrics, metrics.url, { siteKind: siteKindResolved, repoRoot: path.resolve(args.repo) }),
  ];
  findings.unshift(
    makeFinding({
      checkId: 'static-only',
      severity: 'major',
      area: 'site-inspection',
      message: 'Static-only mode cannot verify rendered layout, spacing, screenshots, mobile behavior, or visual hierarchy.',
      evidence: 'No Playwright DOM/screenshot evidence was captured.',
      remediation: 'Run again with --site and Playwright after the website is running locally.',
    }),
  );
  if (!inventory.pageFiles.length) {
    findings.unshift(
      makeFinding({
        checkId: 'inventory',
        severity: 'critical',
        area: 'inventory',
        message: 'No likely page/content files were detected.',
        evidence: 'Repository inventory did not find common website page files.',
        remediation: 'Point --repo to the website root or extend the auditor page-file patterns.',
      }),
    );
  }
  const score = scorePage(metrics, findings);
  return { url: metrics.url, metrics, findings, score, staticOnly: true };
}

async function readUxQualityScoreLoopDelta(outDir) {
  const p = path.join(outDir, 'ux-quality-score-loop-delta.json');
  if (!(await fileExists(p))) return null;
  try {
    const raw = JSON.parse(await fsp.readFile(p, 'utf8'));
    return raw && typeof raw === 'object' ? raw : null;
  } catch {
    return null;
  }
}

async function writePlans({
  args,
  inventory,
  profile,
  pages,
  standardText,
  designStandard,
  crawlSummary,
  runMeta,
  siteKind,
  precrawlUxScores = null,
  precrawlCrawlSummary = null,
  priorUxScoresSnapshot = null,
  priorUxScoresSourceDisplay = null,
  regressionWave = null,
  uxQualityScoreLoopDelta = null,
  logger,
}) {
  const uxScores = computeUxScores({
    pages,
    crawlSummary,
    staticOnly: args.staticOnly,
    siteKind,
  });
  const uxScoreDeltaVsPrior = priorUxScoresSnapshot ? compareUxScores(priorUxScoresSnapshot, uxScores) : null;
  const uxScoreSnippetExtras = {
    precrawlUxScores,
    precrawlCrawlSummary,
    uxScoreDeltaVsPrior,
    priorUxScoresSourceDisplay,
    scorerLoopUxDelta: uxQualityScoreLoopDelta,
  };

  if (args.uxCsv) {
    try {
      await appendUxScoringCsv(args.repo, {
        generatedAt: runMeta.generatedAt,
        tool: 'audit',
        runSegment: 'rollup',
        siteKind,
        runId: runMeta.auditRunId,
        siteUrl: args.site ?? '',
        uxScores,
        crawlSummary,
      });
      if (precrawlUxScores && precrawlCrawlSummary) {
        await appendUxScoringCsv(args.repo, {
          generatedAt: runMeta.generatedAt,
          tool: 'audit',
          runSegment: 'precrawl_scores_first',
          siteKind,
          runId: runMeta.auditRunId,
          siteUrl: args.site ?? '',
          uxScores: precrawlUxScores,
          crawlSummary: precrawlCrawlSummary,
        });
      }
    } catch (e) {
      console.warn(`Append-only ${UX_SCORING_CSV_FILENAME}: ${String(e?.message ?? e)}`);
    }
  }

  const designStandardPinned = designStandard
    ? {
      path: designStandard.path,
      id: designStandard.id,
      updated: designStandard.updated,
      sha256: designStandard.sha256,
      byteLength: designStandard.byteLength,
    }
    : null;

  await ensureDir(args.out);
  if (precrawlUxScores && precrawlCrawlSummary) {
    await emitAuditPrecrawlScoreSidecars({
      args,
      runMeta,
      siteKind,
      designStandard,
      profile,
      precrawlUxScores,
      precrawlCrawlSummary,
    });
  }
  const report = buildAuditReport({
    args,
    inventory,
    profile,
    pages,
    standardText,
    runMeta,
    designStandard,
    crawlSummary,
    uxScores,
    uxScoreSnippetExtras,
    regressionWave,
  });
  const reportPath = path.join(args.out, 'audit-report.md');
  const jsonPath = path.join(args.out, 'audit-data.json');
  await writeFile(reportPath, report);
  await writeFile(
    jsonPath,
    JSON.stringify(
      {
        schemaVersion: SCHEMA_VERSION,
        generatedAt: runMeta.generatedAt,
        auditRunId: runMeta.auditRunId,
        designStandard: designStandardPinned,
        crawlSummary,
        uxScores,
        uxScoreDeltaVsPrior,
        precrawlUxScores: precrawlUxScores ?? null,
        precrawlCrawlSummary: precrawlCrawlSummary ?? null,
        priorUxScoresSource: priorUxScoresSourceDisplay,
        priorUxScoresSnapshot,
        uxQualityScoreLoopDelta,
        regressionWave,
        args,
        inventory,
        profile,
        pages,
      },
      null,
      2,
    ),
  );

  const rca = await writeRcaPromptBatch({
    outDir: args.out,
    pages,
    args,
    profile,
    runMeta,
    designStandard: designStandard || designStandardPinned,
    crawlSummary,
  });

  const planBuilders = [
    ['00-master-remediation-sequence.md', buildMasterPlan],
    ['01-site-inventory-and-content-map.md', buildPlan01],
    ['02-homepage-shell-and-product-landing-mode.md', buildPlan02Shell],
    ['03-homepage-storyline-and-hero.md', buildPlan03Storyline],
    ['04-information-architecture-and-navigation.md', buildPlan04InformationArchitecture],
    ['05-page-depth-and-technical-content-pruning.md', buildPlan05PageDepth],
    ['06-trust-model-and-ecosystem-fit.md', buildPlan06TrustEcosystem],
    ['07-visual-system-and-spacious-enterprise-polish.md', buildPlan07VisualPolish],
    ['08-accessibility-responsive-link-and-build-qa.md', buildPlan08BuildQa],
    ['09-screenshot-and-homepage-shell-review.md', buildPlan09Screenshot],
  ];
  const planCtx = { args, inventory, profile, pages, standardText, runMeta, siteKind };
  for (const [file, builder] of planBuilders) {
    await writeFile(path.join(args.out, file), builder(planCtx));
  }

  let previousTodoStatuses = new Map();
  const priorPlanPath = path.join(args.out, 'forge-ux-remediation.plan.md');
  if (args.refreshPlanStatus && (await fileExists(priorPlanPath))) {
    try {
      const prevText = await fsp.readFile(priorPlanPath, 'utf8');
      previousTodoStatuses = parseTodoStatusesFromPlanMd(prevText);
    } catch {
      previousTodoStatuses = new Map();
    }
  }
  logger?.verbose?.('[plans]', 'prior plan ux-* todo entries parsed', `${previousTodoStatuses.size}`);

  const buildPlanPath = path.join(args.out, 'forge-ux-remediation.plan.md');
  const buildPlanBody = buildForgeUxRemediationDotPlanMd({
    profile,
    args,
    inventory,
    pages,
    previousTodoStatuses,
    runMeta,
    crawlSummary,
  });
  await writeFile(buildPlanPath, buildPlanBody);

  let rootMirrorPlanPath = null;
  if (args.mirrorRootPlan && path.basename(args.out) === 'forge-ux-remediation') {
    const plansDir = path.join(args.repo, '.cursor', 'plans');
    await ensureDir(plansDir);
    rootMirrorPlanPath = path.join(plansDir, rootMirrorPlanFilename(runMeta));
    await writeFile(rootMirrorPlanPath, buildPlanBody);
  }

  if (args.installRule) {
    const rulePath = path.join(args.repo, '.cursor/rules/forge-ux-remediation-plan-runner.mdc');
    await writeFile(rulePath, buildCursorRule(profile));
  }

  const planFiles = [
    ...planBuilders.map(([f]) => path.join(args.out, f)),
    buildPlanPath,
  ];
  if (rootMirrorPlanPath) planFiles.push(rootMirrorPlanPath);
  const mergedNonPendingTodos = args.refreshPlanStatus
    ? [...previousTodoStatuses.values()].filter((s) => s && s !== 'pending').length
    : 0;
  logger?.verbose?.('[plans]', 'merged non-pending UX todos from prior forge-ux-remediation.plan.md', `${mergedNonPendingTodos}`);

  /** @type {string | null} */
  let precrawlJsonRel = null;
  /** @type {string | null} */
  let precrawlMdRel = null;
  if (precrawlUxScores && precrawlCrawlSummary) {
    precrawlJsonRel = relativeFromRepo(args.repo, path.join(args.out, 'ux-quality-score-audit-precrawl.json'));
    precrawlMdRel = relativeFromRepo(args.repo, path.join(args.out, 'ux-quality-score-audit-precrawl.md'));
  }

  return {
    reportPath,
    jsonPath,
    buildPlanPath,
    rootMirrorPlanPath,
    planFiles,
    mergedNonPendingTodos,
    auditRunId: runMeta.auditRunId,
    generatedAt: runMeta.generatedAt,
    rcaPromptCount: rca.count,
    rcaPromptDir: rca.dir,
    precrawlJsonRel,
    precrawlMdRel,
  };
}

/** UX audit phase breadcrumbs on stderr so they appear live next to `[ux-score]` / crawl rows (piped stdout can block-buffer). */
function uxAuditPhase(line) {
  console.error(line);
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.site && args.readyUrl) args.site = args.readyUrl;
  if (!args.staticOnly && !args.site && !args.start) {
    throw new Error('Provide --site http://localhost:PORT, --start "npm run dev" with --site, or --static-only for a repo-only plan set.');
  }
  if (!args.staticOnly && !args.site) throw new Error('Provide --site URL to inspect, or use --static-only.');

  uxAuditPhase('[ux-audit] phase=startup · loading Forge standard + repo inventory (large repos can sit here tens of seconds before [ux-audit] phase=run)');
  await applyDefaultForgeStandard(args);
  const designStdMeta = await loadDesignStandard(args.standard ?? '');
  const standardText = designStdMeta.rawFull;
  const inventory = await inventoryRepo(args.repo, { progressLog: true });
  const siteKind = inferSiteKind(args, inventory);
  const profile = PRODUCT_PROFILES[siteKind] || PRODUCT_PROFILES.generic;

  let server = null;
  let serverExited = false;
  try {
    const logger = createLogger(Math.max(Number(args.verbose) || 0, Number(process.env.UX_AUDIT_VERBOSE) || 0));
    await ensureDir(args.out);
    const auditorCrawlProgressLog = path.resolve(args.out, 'auditor-crawl-progress.log');
    uxAuditPhase(`[ux-audit] phase=diag · auditorCrawlProgressLog=${auditorCrawlProgressLog}`);
    await archiveAuditDataToPrevious(args.out, logger);
    await warnIfDesignStandardChanged(args.out, designStdMeta.sha256);

    let pages = [];
    let crawlSummary;
    let precrawlUxScores = null;
    let precrawlCrawlSummary = null;
    let regressionWave = null;

    /** @type {string[]} */
    let regressionUrls = [];
    /** @type {string[]} */
    let resumeVisitedUrls = [];
    /** @type {string[]} */
    let resumeQueuedUrls = [];
    /** @type {object|null} */
    let priorParsedForIncremental = null;

    const runMeta = newAuditRunMeta();
    const envRunNo = String(process.env.FORGE_UX_PROGRESS_RUN_NO || '').trim();
    const progressRunDisplay = envRunNo || runMeta.auditRunId.slice(0, 8);
    const autoSubphase = process.env.FORGE_UX_PROGRESS_RUN_AUTO === '1';
    const phaseBaseRaw = String(process.env.FORGE_UX_PROGRESS_PHASE_BASE || envRunNo || '').trim();
    const phaseBaseNum = Number(phaseBaseRaw);
    const hasNumericPhaseBase = phaseBaseRaw !== '' && Number.isFinite(phaseBaseNum);

    let precrawlRunDisplay = progressRunDisplay;
    let mainCrawlRunDisplay = progressRunDisplay;
    if (autoSubphase && hasNumericPhaseBase && args.scoresFirst) {
      precrawlRunDisplay = String(phaseBaseNum);
      mainCrawlRunDisplay = String(phaseBaseNum + 1);
    }

    uxAuditPhase(
      `[ux-audit] phase=run · auditRunId=${runMeta.auditRunId} · site=${args.site} · siteKind=${siteKind}`
      + ` · incremental=${args.incremental ? '1' : '0'} · staticOnly=${args.staticOnly ? '1' : '0'}`
      + ` · maxPages=${args.maxPages} · out=${relativeFromRepo(args.repo, args.out)}`
      + `${args.scoresFirst ? ` · scoresFirstMaxPages=${args.scoresFirstMaxPages}` : ''}`
      + ` · progressRuns precrawl=${precrawlRunDisplay} main=${mainCrawlRunDisplay}`,
    );

    let priorUxScoresSnapshot = null;
    let priorUxScoresSourceDisplay = null;
    if (args.priorUxScoresPath) {
      priorUxScoresSourceDisplay = relativeFromRepo(args.repo, args.priorUxScoresPath);
      priorUxScoresSnapshot = await readPriorUxScoresSnapshot(args.priorUxScoresPath);
    }

    if (!args.staticOnly && args.incremental) {
      priorParsedForIncremental = await readAuditDataPrevious(args.out);
      logger.verbose('[incremental]', 'baseline audit-data.previous.json', priorParsedForIncremental ? 'present' : 'absent');
      const crawlSessionSnap = await readCrawlSession(args.out);
      logger.verbose(
        '[incremental]',
        'crawl-session.json',
        crawlSessionSnap?.completed === true ? 'completed marker' : crawlSessionSnap ? 'resume snapshot' : 'absent',
      );
      if (priorParsedForIncremental) {
        regressionUrls = extractMajorPlusUrlsFromPriorAudit(priorParsedForIncremental, args.incrementalRegressionMaxPages);
        logger.verbose('[incremental]', 'regression wave candidate URLs', `${regressionUrls.length} (cap ${args.incrementalRegressionMaxPages})`);
      }
      if (crawlSessionSnap && crawlSessionSnap.completed !== true) {
        resumeVisitedUrls = crawlSessionSnap.visitedUrls || [];
        resumeQueuedUrls = crawlSessionSnap.queuedUrls || [];
        logger.verbose('[incremental]', 'resume crawl queue', `visited=${resumeVisitedUrls.length} queued=${resumeQueuedUrls.length}`);
      }
    }

    if (args.staticOnly) {
      mergeDashboardStateIfWatching(args.out, { phase: 'auditor_static_only' });
      uxAuditPhase('[ux-audit] phase=static_only · no Playwright crawl; generating repo-only analysis');
      if (args.scoresFirst) console.error('Note: --scores-first is ignored for static-only runs (no Playwright precrawl).');
      pages = [await analyzeStaticRepoOnly({ args, inventory })];
      const flat = pages.flatMap((p) => p.findings || []);
      crawlSummary = {
        crawlMode: 'static_only',
        stopReason: 'static_only',
        majorPlusFindingCountTotal: countMajorPlus(flat),
        queuedRemainingAtStop: 0,
        pagesCaptured: pages.length,
        stopAfterMajorPlus: null,
        pagesPlannedBudget: args.maxPages,
        stopDisabled: true,
      };
    } else {
      if (args.start) {
        uxAuditPhase(`[ux-audit] phase=site · action=start_cmd · waiting_ready · url=${args.readyUrl || args.site}`);
        server = startServer(args.start, args.repo);
        server.on('exit', () => { serverExited = true; });
        await waitForReady(args.readyUrl || args.site, args.timeoutMs);
        if (serverExited) throw new Error('The start command exited before the site was ready.');
        uxAuditPhase(`[ux-audit] phase=site · action=ready · url=${args.readyUrl || args.site}`);
      }

      uxAuditPhase('[ux-audit] phase=playwright · action=import');
      const playwright = await importPlaywright();
      uxAuditPhase('[ux-audit] phase=playwright · action=loaded');
      if (args.scoresFirst) {
        mergeDashboardStateIfWatching(args.out, { phase: 'auditor_precrawl' });
        uxAuditPhase(
          `[ux-audit-pre] phase=precrawl · maxPages=${args.scoresFirstMaxPages} · label=[ux-audit-pre] · run=${precrawlRunDisplay}`,
        );
        console.error('[scores-first] Sitewide precrawl UX score crawl (design-standard rollup)...');
        const precrawlProg = createCrawlProgressReporter({
          label: '[ux-audit-pre]',
          runDisplay: precrawlRunDisplay,
          maxPages: args.scoresFirstMaxPages,
        });
        /** @type {Awaited<ReturnType<typeof crawlAndAnalyze>>} */
        let precrawled;
        try {
          precrawled = await crawlAndAnalyze({
            playwright,
            startUrl: args.site,
            outDir: args.out,
            maxPages: args.scoresFirstMaxPages,
            timeoutMs: args.timeoutMs,
            screenshots: false,
            siteKind,
            stopAfterMajorPlus: null,
            stopDisabled: true,
            onProgress: precrawlProg.onProgress,
            repoRoot: path.resolve(args.repo),
          });
        } finally {
          precrawlProg.finish();
        }
        precrawlCrawlSummary = precrawled.crawlSummary;
        precrawlUxScores = computeUxScores({
          pages: precrawled.pages,
          crawlSummary: precrawled.crawlSummary,
          staticOnly: false,
          siteKind,
        });
        console.error(
          `[scores-first] Precrawl done: overall ${precrawlUxScores.overall}/100 · pages ${precrawled.pages.length} · effective findings ${precrawlUxScores.coverage.effectiveFindingCount}`,
        );
      }

      mergeDashboardStateIfWatching(args.out, { phase: 'auditor_main' });
      uxAuditPhase(
        `[ux-audit] phase=main_crawl · maxPages=${args.maxPages} · stopAfterMajorPlus=${args.stopAfterMajorPlus ?? '—'}`
        + ` · stopDisabled=${args.stopDisabled ? '1' : '0'} · label=[ux-audit] · run=${mainCrawlRunDisplay}`,
      );
      uxAuditPhase('[ux-audit] phase=main_crawl · action=launch_browser (next lines use crawl progress format)');
      const crawlProg = createCrawlProgressReporter({
        label: '[ux-audit]',
        runDisplay: mainCrawlRunDisplay,
        maxPages: args.maxPages,
        progressLogPath: auditorCrawlProgressLog,
      });
      /** @type {Awaited<ReturnType<typeof crawlAndAnalyze>>} */
      let crawled;
      try {
        crawled = await crawlAndAnalyze({
          playwright,
          startUrl: args.site,
          outDir: args.out,
          maxPages: args.maxPages,
          timeoutMs: args.timeoutMs,
          screenshots: args.screenshots,
          siteKind,
          stopAfterMajorPlus: args.stopAfterMajorPlus,
          stopDisabled: args.stopDisabled,
          regressionUrls,
          resumeVisitedUrls,
          resumeQueuedUrls,
          logger,
          onProgress: crawlProg.onProgress,
          repoRoot: path.resolve(args.repo),
        });
      } finally {
        crawlProg.finish();
      }
      pages = crawled.pages;
      crawlSummary = crawled.crawlSummary;

      if (priorParsedForIncremental && regressionUrls.length) {
        regressionWave = buildRegressionWaveSummary(
          priorParsedForIncremental,
          pages.filter((p) => p.auditWave === 'regression'),
        );
        logger.verbose('[incremental]', 'regression wave summary rows', `${regressionWave.rows?.length ?? 0}`);
      }

      const originUrl = new URL(args.site).origin;
      const sessionPayload =
        crawlSummary.stopReason === 'major_plus_threshold'
          ? {
              completed: false,
              origin: originUrl,
              startUrl: args.site,
              visitedUrls: crawled.visitedUrls,
              queuedUrls: crawled.queuedUrlsAtStop,
              majorPlusFindingCountTotal: crawlSummary.majorPlusFindingCountTotal,
              stopAfterMajorPlus: crawlSummary.stopAfterMajorPlus,
              pagesCaptured: crawlSummary.pagesCaptured,
              generatedAt: runMeta.generatedAt,
              auditRunId: runMeta.auditRunId,
              stopReason: crawlSummary.stopReason,
            }
          : {
              completed: true,
              generatedAt: runMeta.generatedAt,
              auditRunId: runMeta.auditRunId,
              origin: originUrl,
              startUrl: args.site,
              visitedUrls: crawled.visitedUrls,
              queuedUrls: [],
              crawlStopReason: crawlSummary.stopReason,
            };
      await writeCrawlSession(args.out, sessionPayload, logger);
    }

    const uxQualityScoreLoopDelta = await readUxQualityScoreLoopDelta(args.out);

    const written = await writePlans({
      args,
      inventory,
      profile,
      pages,
      standardText,
      designStandard: designStdMeta,
      crawlSummary,
      runMeta,
      siteKind,
      precrawlUxScores,
      precrawlCrawlSummary,
      priorUxScoresSnapshot,
      priorUxScoresSourceDisplay,
      regressionWave,
      uxQualityScoreLoopDelta,
      logger,
    });
    mergeDashboardStateIfWatching(args.out, {
      phase: 'audit_complete',
      auditRunId: written.auditRunId,
    });
    console.log('\nForge UX audit complete.');
    console.log(`Audit run id: ${written.auditRunId}`);
    console.log(`Generated at (UTC): ${written.generatedAt}`);
    if (!args.staticOnly && crawlSummary?.stopReason === 'major_plus_threshold') {
      console.log(`Crawl: stopped early after Major+ backlog reached threshold (${String(crawlSummary.stopAfterMajorPlus)}); ${String(crawlSummary.queuedRemainingAtStop)} queued URL(s) not visited`);
    }
    if (written.rcaPromptCount) console.log(`RCA prompts: ${written.rcaPromptCount} in ${relativeFromRepo(args.repo, path.join(args.out, 'rca-prompts'))}/`);
    console.log(`Report: ${relativeFromRepo(args.repo, written.reportPath)}`);
    console.log(`Data:   ${relativeFromRepo(args.repo, written.jsonPath)}`);
    if (!args.staticOnly) {
      console.log(`Session: ${relativeFromRepo(args.repo, path.join(args.out, 'crawl-session.json'))}`);
      if (args.incremental) {
        console.log(`Prior snapshot (incremental baseline): ${relativeFromRepo(args.repo, path.join(args.out, 'audit-data.previous.json'))}`);
      }
    }
    if (written.precrawlJsonRel && written.precrawlMdRel) {
      console.log(`Precrawl score (scores-first): ${written.precrawlJsonRel}`);
      console.log(`Precrawl score (scores-first): ${written.precrawlMdRel}`);
    }
    if (args.priorUxScoresPath && priorUxScoresSourceDisplay) {
      console.log(`Prior UX baseline (for deltas): ${priorUxScoresSourceDisplay}`);
    }
    if (uxQualityScoreLoopDelta?.verbalSummary) {
      console.log(`Sitewide scorer vs prior loop: ${uxQualityScoreLoopDelta.verbalSummary}`);
    }
    if (uxQualityScoreLoopDelta) {
      console.log(`Scorer loop sidecar: ${relativeFromRepo(args.repo, path.join(args.out, 'ux-quality-score-loop-delta.json'))}`);
    }
    if (written.buildPlanPath) {
      console.log(`Cursor Build: ${relativeFromRepo(args.repo, written.buildPlanPath)}`);
    }
    if (args.refreshPlanStatus && written.mergedNonPendingTodos > 0) {
      console.log(`Plan status: merged ${written.mergedNonPendingTodos} non-pending todo(s) from previous forge-ux-remediation.plan.md (--refresh-plan-status is default; use --no-refresh-plan-status to reset)`);
    } else if (!args.refreshPlanStatus) {
      console.log('Plan status: all todos written as pending (--no-refresh-plan-status)');
    }
    if (written.rootMirrorPlanPath) {
      console.log(`Root plan mirror (dated): ${relativeFromRepo(args.repo, written.rootMirrorPlanPath)}`);
    }
    console.log('Plans:');
    for (const plan of written.planFiles) console.log(`  - ${relativeFromRepo(args.repo, plan)}`);
    if (args.staticOnly) console.log('Mode: static-only repo analysis. Re-run with --site for Playwright evidence.');
    if (args.installRule) console.log('Cursor rule: .cursor/rules/forge-ux-remediation-plan-runner.mdc');
  } finally {
    if (server && !server.killed) {
      server.kill('SIGTERM');
      setTimeout(() => { if (!server.killed) server.kill('SIGKILL'); }, 1500).unref();
    }
  }
}

main().catch((error) => {
  console.error(`\nERROR: ${error.message}`);
  process.exit(1);
});
