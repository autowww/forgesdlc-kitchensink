#!/usr/bin/env node
/**
 * Forge UX quality scorer — full site crawl within --max-pages (no Major+ early stop).
 *
 * Computes design-standard-aligned dimension scores (log penalty + harmonic overall).
 */

import crypto from 'node:crypto';
import path from 'node:path';
import process from 'node:process';

import { crawlAndAnalyze } from './lib/crawl.js';
import { loadDesignStandard } from './lib/design-standard.js';
import { buildUxQualityScoreMarkdown, computeUxScores } from './lib/design-ux-score.js';
import { ensureDir, writeFile } from './lib/files.js';
import { appendUxScoringCsv, UX_SCORING_CSV_FILENAME } from './lib/ux-scoring-csv.js';
import { applyDefaultForgeStandard, inferSiteKind, PRODUCT_PROFILES } from './lib/product-profiles.js';
import { importPlaywright } from './lib/playwright-import.js';
import { inventoryRepo } from './lib/repo-inventory.js';
import { startServer, waitForReady } from './lib/site-bootstrap.js';

/** Default breadth for same-origin BFS; always bounded — there is no unbounded crawl. */
const SCORER_DEFAULT_MAX_PAGES = 120;

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
    --standard docs/design/forge-enterprise-ai-website-standard.md

Optional:
  --start "npm run dev"     Start server before crawling
  --ready-url URL          Probe URL when --start is used (default: --site)
  --site-kind KIND         lenses | lcdl | fleet | platform | forgesdlc | generic | auto
  --max-pages N            Default ${SCORER_DEFAULT_MAX_PAGES}; hard cap prevents runaway crawl
  --timeout-ms MS          Navigation timeout (default 45000)
  --screenshots           Capture screenshots (default: off — faster scorer runs)
  --no-ux-csv             Skip appending repo-root ux-scoring.csv (default: append)
  --out DIR                Relative to repo; default \`.cursor/reports/forge-ux-quality\`
`;
}

function parseScoreArgs(argv) {
  const args = {
    repo: process.cwd(),
    site: null,
    standard: null,
    siteKind: 'auto',
    out: null,
    start: null,
    readyUrl: null,
    maxPages: SCORER_DEFAULT_MAX_PAGES,
    timeoutMs: 45000,
    screenshots: false,
    url: null,
    uxCsv: true,
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
    const needsValue = ['repo', 'site', 'url', 'standard', 'siteKind', 'out', 'start', 'readyUrl', 'maxPages', 'timeoutMs'];
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
  if (!Number.isFinite(args.maxPages) || args.maxPages < 1) args.maxPages = SCORER_DEFAULT_MAX_PAGES;
  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs < 5000) args.timeoutMs = 45000;
  return args;
}

async function main() {
  const args = parseScoreArgs(process.argv);
  if (args.readyUrl && !args.site) args.site = args.readyUrl;
  if (!args.site && !args.start) throw new Error('Provide --site URL or --start with --site / --ready-url.');
  await applyDefaultForgeStandard(args);

  const runMeta = newRunMeta();
  const designStdMeta = await loadDesignStandard(args.standard ?? '');
  const inventory = await inventoryRepo(args.repo);
  const siteKind = inferSiteKind(args, inventory);
  const profile = PRODUCT_PROFILES[siteKind] || PRODUCT_PROFILES.generic;

  let server = null;
  let serverExited = false;
  try {
    await ensureDir(args.out);
    if (args.start) {
      if (!args.site) throw new Error('When using --start, also pass --site to the resolved entry URL.');
      server = startServer(args.start, args.repo);
      server.on('exit', () => { serverExited = true; });
      await waitForReady(args.readyUrl || args.site, args.timeoutMs);
      if (serverExited) throw new Error('The start command exited before the site was ready.');
    }

    const playwright = await importPlaywright();
    const crawled = await crawlAndAnalyze({
      playwright,
      startUrl: args.site,
      outDir: args.out,
      maxPages: args.maxPages,
      timeoutMs: args.timeoutMs,
      screenshots: args.screenshots,
      siteKind,
      stopAfterMajorPlus: null,
      stopDisabled: true,
    });

    /** @typedef {Awaited<ReturnType<computeUxScores>} UxScores */
    const uxScores = computeUxScores({
      pages: crawled.pages,
      crawlSummary: crawled.crawlSummary,
      staticOnly: false,
    });

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
      args: {
        repo: args.repo,
        site: args.site,
        standard: args.standard,
        siteKind: args.siteKind,
        maxPages: args.maxPages,
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

    const md = buildUxQualityScoreMarkdown({
      runMeta,
      profile,
      designStandard: designStdMeta || designPinned || {},
      uxScores,
      argsSummary:
        `- \`--repo\` \`${args.repo}\`\n- \`--site\` \`${args.site || ''}\`\n- **max-pages** \`${args.maxPages}\`\n- **Scorer crawl mode:** \`${crawled.crawlSummary.crawlMode}\` (${crawled.crawlSummary.stopReason})`,
      crawlSummary: crawled.crawlSummary,
    });

    const jsonPath = path.join(args.out, 'ux-quality-score.json');
    const mdPath = path.join(args.out, 'ux-quality-score.md');
    await writeFile(jsonPath, `${JSON.stringify(jsonPayload, null, 2)}\n`);
    await writeFile(mdPath, `${md}`);

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

    console.log('\nForge UX quality score complete.');
    console.log(`Run id: ${runMeta.runId}`);
    console.log(`Overall design UX score (heuristic): ${uxScores.overall} / 100`);
    console.log(JSON.stringify({
      crawlMode: crawled.crawlSummary.crawlMode,
      pagesAnalyzed: crawled.pages.length,
      effectiveFindingCount: uxScores.coverage.effectiveFindingCount,
      perfectScoreEligible: uxScores.coverage.perfectScoreEligible,
    }));
    console.log(`Written: ${path.relative(args.repo, jsonPath)}`);
    console.log(`Written: ${path.relative(args.repo, mdPath)}`);
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
