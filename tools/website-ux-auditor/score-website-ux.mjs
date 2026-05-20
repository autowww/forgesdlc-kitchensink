#!/usr/bin/env node
/**
 * Forge UX quality scorer — full site crawl within --max-pages (no Major+ early stop).
 *
 * Computes design-standard-aligned dimension scores (log penalty + harmonic overall).
 */

import crypto from 'node:crypto';
import fsp from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { createCrawlProgressReporter } from './lib/crawl-progress-line.js';
import { crawlAndAnalyze } from './lib/crawl.js';
import { loadDesignStandard } from './lib/design-standard.js';
import {
  buildUxQualityScoreMarkdown,
  compareUxScores,
  computeUxScores,
  extractUxScoresFromSavedJson,
  formatUxScoreDisplay,
  formatUxScoreLoopDeltaMarkdownTables,
  formatUxScoreLoopDeltaVerbalParagraph,
} from './lib/design-ux-score.js';
import {
  buildScorerBacklogPatch,
  emptyAuditGatePlaceholder,
} from './lib/loop-watch-phase-source.js';
import { appendDashboardLog, mergeDashboardStateIfWatching } from './lib/ux-loop-dashboard-state.js';
import { ensureDir, writeFile, fileExists } from './lib/files.js';
import { appendUxScoringCsv, UX_SCORING_CSV_FILENAME } from './lib/ux-scoring-csv.js';
import { ensureBlockingStdio } from './lib/piped-stdio-flush.js';
import { applyDefaultForgeStandard, inferSiteKind, PRODUCT_PROFILES } from './lib/product-profiles.js';
import { importPlaywright } from './lib/playwright-import.js';
import { inventoryRepo } from './lib/repo-inventory.js';
import { startServer, stopStartedServer, waitForReady } from './lib/site-bootstrap.js';
import { summarizeVisualCatalogCoverage } from './lib/visual-catalog.js';
import { countBySeverity, evaluateQualityGate, loadQualityGateThresholdsFromEnv } from './lib/quality-gate.js';
import { DEFAULT_DESIGN_THEME_ID, loadDesignTheme, summarizeDesignTheme } from './lib/design-theme.js';

ensureBlockingStdio();

/** Default breadth for same-origin BFS; always bounded — there is no unbounded crawl. */
const SCORER_DEFAULT_MAX_PAGES = 120;

/** Default link-hop depth from `--site` (start URL = 0; **+2** ⇒ depths 0–2 inclusive). */
const SCORER_DEFAULT_MAX_LINK_DEPTH = 2;

const LOOP_DELTA_FILENAME = 'ux-quality-score-loop-delta.json';

function newRunMeta() {
  return {
    generatedAt: new Date().toISOString(),
    runId: crypto.randomBytes(8).toString('hex'),
    tool: 'forge-website-ux-scorer',
  };
}

function usage() {
  return `Forge Website UX scorer (sitewide design-standard scorecard)

Loads the Forge enterprise AI website standard, crawls **same-origin** pages up to
--max-pages with **no** Major+ early-stop (${SCORER_DEFAULT_MAX_PAGES} pages default —
still a safety budget, not infinite).

Usage:
  node score-website-ux.mjs \\
    --repo . \\
    --site http://localhost:3000 \\
    --theme default \\
    --standard docs/design/forge-enterprise-ai-website-standard.md

Optional:
  --start "npm run dev"     Start server before crawling
  --ready-url URL          Probe URL when --start is used (default: --site)
  --theme THEME            Design theme id under docs/design/themes/<id>. Default: ${DEFAULT_DESIGN_THEME_ID}
  --site-kind KIND         lenses | lcdl | fleet | platform | forgesdlc | generic | auto
  --max-pages N            Default ${SCORER_DEFAULT_MAX_PAGES}; hard cap prevents runaway crawl
  --max-link-depth N       Link hops from \`--site\` (start = 0). Default ${SCORER_DEFAULT_MAX_LINK_DEPTH}
                           (**root + 2 hops**). Use a large N for practical “no depth limit”.
  --timeout-ms MS          Navigation timeout (default 45000)
  --screenshots           Capture screenshots (default: off — faster scorer runs)
  --no-ux-csv             Skip appending repo-root ux-scoring.csv (default: append)
  --out DIR                Relative to repo; default \`.cursor/reports/forge-ux-quality\`

Progress (stderr, one line per update during crawl): enabled when stderr is a TTY.
  Rows are always appended to \`<out>/scorer-crawl-progress.log\` (ISO timestamps) for tails / IDE logs.
  FORGE_UX_PROGRESS_RUN_NO   Shown as [run …] (override). Remediation shell auto-sets 1, 2, … when unset.
  FORGE_UX_CRAWL_PROGRESS=1  Force progress without a TTY; =0 disables.
  FORGE_UX_CRAWL_PROGRESS_HEARTBEAT_SEC  While idle, append the same row every N sec (default 15; 0=off).

Remediation loop: copies existing ux-quality-score.json → ux-quality-score.previous.json before crawl,
then compares the new sitewide rollup to that snapshot (stderr + ux-quality-score.md appendix +
${LOOP_DELTA_FILENAME} for the auditor).
`;
}

function parseScoreArgs(argv) {
  const args = {
    repo: process.cwd(),
    site: null,
    standard: null,
    theme: DEFAULT_DESIGN_THEME_ID,
    siteKind: 'auto',
    out: null,
    start: null,
    readyUrl: null,
    maxPages: SCORER_DEFAULT_MAX_PAGES,
    timeoutMs: 45000,
    screenshots: false,
    url: null,
    uxCsv: true,
    maxLinkDepth: SCORER_DEFAULT_MAX_LINK_DEPTH,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const raw = argv[i];
    if (raw === '--help' || raw === '-h') {
      console.log(usage());
      process.exit(0);
    }
    if (raw === '--screenshots') {
      args.screenshots = true;
      continue;
    }
    if (raw === '--no-ux-csv') {
      args.uxCsv = false;
      continue;
    }
    if (!raw.startsWith('--')) throw new Error(`Unexpected positional argument: ${raw}`);
    const [flag, inlineValue] = raw.includes('=') ? raw.split(/=(.*)/s, 2) : [raw, null];
    const key = flag.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const needsValue = ['repo', 'site', 'url', 'standard', 'theme', 'siteKind', 'out', 'start', 'readyUrl', 'maxPages', 'maxLinkDepth', 'timeoutMs'];
    if (!needsValue.includes(key)) throw new Error(`Unknown flag: ${flag}`);
    const value = inlineValue ?? argv[++i];
    if (value === undefined) throw new Error(`Missing value for ${flag}`);
    args[key] = value;
  }
  if (args.url && !args.site) args.site = args.url;
  args.repo = path.resolve(args.repo);
  args.out = path.resolve(args.repo, args.out || '.cursor/reports/forge-ux-quality');
  if (args.standard) args.standard = path.resolve(args.repo, args.standard);
  args.maxPages = Number(args.maxPages);
  args.timeoutMs = Number(args.timeoutMs);
  args.maxLinkDepth = Number(args.maxLinkDepth);
  if (!Number.isFinite(args.maxPages) || args.maxPages < 1) args.maxPages = SCORER_DEFAULT_MAX_PAGES;
  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs < 5000) args.timeoutMs = 45000;
  if (!Number.isFinite(args.maxLinkDepth) || args.maxLinkDepth < 0) {
    args.maxLinkDepth = SCORER_DEFAULT_MAX_LINK_DEPTH;
  }
  return args;
}

async function main() {
  const args = parseScoreArgs(process.argv);
  if (args.readyUrl && !args.site) args.site = args.readyUrl;
  if (!args.site && !args.start) throw new Error('Provide --site URL or --start with --site / --ready-url.');
  const designTheme = await loadDesignTheme(args.theme || DEFAULT_DESIGN_THEME_ID);
  if (!args.standard && designTheme.designStandardAbsPath) args.standard = designTheme.designStandardAbsPath;
  await applyDefaultForgeStandard(args);

  const watchDashboardLogDir = (() => {
    const w = String(process.env.FORGE_UX_LOOP_WATCH_OUT_DIR || '').trim();
    if (!w) return '';
    return path.resolve(w) === path.resolve(args.out) ? path.resolve(args.out) : '';
  })();
  const scoreDiagStderr = (line) => {
    if (watchDashboardLogDir) appendDashboardLog(watchDashboardLogDir, line);
    else console.error(line);
  };
  const scoreWatchEmit = (line) => {
    if (watchDashboardLogDir) appendDashboardLog(watchDashboardLogDir, line);
    else console.log(line);
  };

  const runMeta = newRunMeta();
  const designStdMeta = await loadDesignStandard(args.standard ?? '');
  const inventory = await inventoryRepo(args.repo);
  const siteKind = inferSiteKind(args, inventory);
  const profile = PRODUCT_PROFILES[siteKind] || PRODUCT_PROFILES.generic;

  const jsonPath = path.join(args.out, 'ux-quality-score.json');
  const prevPath = path.join(args.out, 'ux-quality-score.previous.json');

  let server = null;
  let serverExited = false;
  try {
    await ensureDir(args.out);
    const scorerCrawlProgressLog = path.resolve(args.out, 'scorer-crawl-progress.log');
    scoreDiagStderr(`[ux-score] diag · scorerCrawlProgressLog=${scorerCrawlProgressLog}`);
    mergeDashboardStateIfWatching(args.out, {
      phase: 'scorer_crawl',
      qualityGate: emptyAuditGatePlaceholder(),
      auditProgress: { findingAccum: 0, majorPlusAccum: 0 },
      ...buildScorerBacklogPatch({}, { source: 'scorer_crawl', phase: 'scorer_crawl' }),
    });
    if (await fileExists(jsonPath)) {
      await fsp.copyFile(jsonPath, prevPath);
    }

    if (args.start) {
      if (!args.site) throw new Error('When using --start, also pass --site to the resolved entry URL.');
      server = startServer(args.start, args.repo);
      server.on('exit', () => { serverExited = true; });
      await waitForReady(args.readyUrl || args.site, args.timeoutMs);
      if (serverExited) throw new Error('The start command exited before the site was ready.');
    }

    const playwright = await importPlaywright();
    const envRunNo = String(process.env.FORGE_UX_PROGRESS_RUN_NO || '').trim();
    const runDisplay = envRunNo || runMeta.runId.slice(0, 8);
    const crawlProgress = createCrawlProgressReporter({
      label: '[ux-score]',
      runDisplay,
      maxPages: args.maxPages,
      progressLogPath: scorerCrawlProgressLog,
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
        stopAfterMajorPlus: null,
        stopDisabled: true,
        onProgress: crawlProgress.onProgress,
        maxLinkDepth: args.maxLinkDepth,
        repoRoot: path.resolve(args.repo),
        designTheme,
      });
    } finally {
      crawlProgress.finish();
    }

    /** @typedef {Awaited<ReturnType<computeUxScores>} UxScores */
    const uxScores = computeUxScores({
      pages: crawled.pages,
      crawlSummary: crawled.crawlSummary,
      staticOnly: false,
      siteKind,
    });

    const visualCatalogCoverage = summarizeVisualCatalogCoverage(crawled.pages, args.repo);

    const designPinned = designStdMeta
      ? {
        path: designStdMeta.path,
        id: designStdMeta.id,
        updated: designStdMeta.updated,
        sha256: designStdMeta.sha256,
      }
      : null;

    const jsonPayload = {
      runMeta,
      uxScores,
      crawlSummary: crawled.crawlSummary,
      profile: { name: profile.name, siteKindKey: siteKind },
      designStandard: designPinned,
      designTheme: summarizeDesignTheme(designTheme),
      visualCatalogCoverage,
      args: {
        repo: args.repo,
        site: args.site,
        standard: args.standard,
        theme: args.theme,
        siteKind: args.siteKind,
        maxPages: args.maxPages,
        maxLinkDepth: args.maxLinkDepth,
        timeoutMs: args.timeoutMs,
        screenshots: args.screenshots,
        out: args.out,
      },
      pagesBrief: crawled.pages.map((p) => ({
        url: p.url,
        findingCount: (p.findings || []).length,
        score: p.score,
      })),
    };

    let md = buildUxQualityScoreMarkdown({
      runMeta,
      profile,
      designStandard: designStdMeta || designPinned || {},
      uxScores,
      argsSummary:
        `- \`--repo\` \`${args.repo}\`\n- \`--site\` \`${args.site || ''}\`\n- \`--theme\` \`${designTheme.id || DEFAULT_DESIGN_THEME_ID}\`\n- **max-pages** \`${args.maxPages}\`\n- **max-link-depth** \`${args.maxLinkDepth}\` (link hops from start URL; **0** = start page only)\n- **Scorer crawl mode:** \`${crawled.crawlSummary.crawlMode}\` (${crawled.crawlSummary.stopReason})`,
      crawlSummary: crawled.crawlSummary,
      visualCatalogCoverage,
    });

    /** @type {ReturnType<typeof compareUxScores> | null} */
    let loopDelta = null;
    /** @type {string | null} */
    let verbalSummary = null;
    if (await fileExists(prevPath)) {
      try {
        const prevText = await fsp.readFile(prevPath, 'utf8');
        const prevParsed = JSON.parse(prevText);
        const priorUx = extractUxScoresFromSavedJson(prevParsed);
        loopDelta = compareUxScores(priorUx, uxScores);
        verbalSummary = formatUxScoreLoopDeltaVerbalParagraph(loopDelta);
        if (verbalSummary) {
          scoreDiagStderr(`[ux-scorer-loop] ${verbalSummary}`);
        }
        const tbl = formatUxScoreLoopDeltaMarkdownTables(loopDelta);
        if (tbl) {
          md += `\n## Vs prior loop snapshot (\`ux-quality-score.previous.json\`)\n\n${tbl}`;
        }
      } catch (e) {
        console.warn(`[ux-scorer-loop] Could not diff vs ux-quality-score.previous.json: ${String(e?.message ?? e)}`);
      }
    }

    const mdPath = path.join(args.out, 'ux-quality-score.md');
    await writeFile(jsonPath, `${JSON.stringify(jsonPayload, null, 2)}\n`);
    await writeFile(mdPath, `${md}`);

    const flatForProcess = crawled.pages.flatMap((p) => p?.findings || []);
    const qgScorer = evaluateQualityGate(countBySeverity(flatForProcess), loadQualityGateThresholdsFromEnv());
    mergeDashboardStateIfWatching(args.out, {
      phase: 'post_scorer',
      scoresPreview: { overall: uxScores.overall },
      qualityGate: emptyAuditGatePlaceholder(qgScorer.thresholds),
      ...buildScorerBacklogPatch(qgScorer.counts, {
        source: 'scorer',
        phase: 'post_scorer',
      }),
    });

    const loopDeltaPayload = {
      generatedAt: runMeta.generatedAt,
      scorerRunId: runMeta.runId,
      baselinePath: loopDelta ? 'ux-quality-score.previous.json' : null,
      delta: loopDelta,
      verbalSummary,
    };
    await writeFile(path.join(args.out, LOOP_DELTA_FILENAME), `${JSON.stringify(loopDeltaPayload, null, 2)}\n`);

    if (args.uxCsv) {
      try {
        await appendUxScoringCsv(args.repo, {
          generatedAt: runMeta.generatedAt,
          tool: 'score',
          runSegment: 'sitewide',
          siteKind,
          runId: runMeta.runId,
          siteUrl: args.site ?? '',
          uxScores,
          crawlSummary: crawled.crawlSummary,
        });
      } catch (e) {
        console.warn(`Append-only ${UX_SCORING_CSV_FILENAME} skipped: ${String(e?.message ?? e)}`);
      }
    }

    const deltaRel = path.relative(args.repo, path.join(args.out, LOOP_DELTA_FILENAME));
    scoreWatchEmit(
      `[ux-score] complete · run=${runMeta.runId} · score=${formatUxScoreDisplay(uxScores.overall)}/${formatUxScoreDisplay(100)} · `
      + `${crawled.pages.length}p · ${crawled.crawlSummary.crawlMode} · findingsEff=${uxScores.coverage.effectiveFindingCount} · `
      + `perfectEligible=${uxScores.coverage.perfectScoreEligible}`,
    );
    scoreWatchEmit(
      `[ux-score] wrote ${path.relative(args.repo, jsonPath)} · ${path.relative(args.repo, mdPath)} · ${deltaRel}`,
    );
  } finally {
    await stopStartedServer(server);
  }
}

main().catch((error) => {
  console.error(`\nERROR: ${error.message}`);
  process.exit(1);
});
