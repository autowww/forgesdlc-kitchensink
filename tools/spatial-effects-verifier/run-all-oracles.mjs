#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { compareOracle } from './lib/compare-oracle.mjs';
import { canLaunchBrowser, runOracleScenarios } from './lib/run-scenario.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ORACLES_DIR = path.resolve(__dirname, '../../docs/design/spatial/oracles');

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {Record<string, string|boolean>} */
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      out[key] = true;
      continue;
    }
    out[key] = next;
    i += 1;
  }
  return out;
}

/**
 * @param {string} showcaseDir
 * @param {string} baseUrl
 */
function buildShowcaseUrl(showcaseDir, baseUrl) {
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const page = path.join(showcaseDir, 'spatial-effects.html');
  if (page.endsWith('spatial-effects.html')) {
    return `${normalizedBase}/spatial-effects.html`;
  }
  return normalizedBase;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const strict = Boolean(args.strict);
  const showcaseDir = path.resolve(String(args['showcase-dir'] || args.showcaseDir || ''));
  const baseUrl = String(args['base-url'] || args.baseUrl || '');
  const oraclesDir = path.resolve(String(args['oracles-dir'] || DEFAULT_ORACLES_DIR));

  if (!showcaseDir || !baseUrl) {
    console.error(
      'Usage: node run-all-oracles.mjs --showcase-dir <path> --base-url <url> [--strict] [--oracles-dir <path>]',
    );
    process.exit(2);
  }

  let entries = [];
  try {
    entries = await readdir(oraclesDir);
  } catch (error) {
    console.error(`Oracle directory not found: ${oraclesDir}`);
    process.exit(strict ? 1 : 0);
  }

  const oracleFiles = entries.filter((name) => name.endsWith('.json')).sort();
  if (oracleFiles.length === 0) {
    console.log(`No oracle JSON files in ${oraclesDir}`);
    process.exit(0);
  }

  if (!(await canLaunchBrowser())) {
    console.error('Playwright Chromium is not available. Run: npm run install-browsers');
    process.exit(strict ? 1 : 0);
  }

  const pageUrl = buildShowcaseUrl(showcaseDir, baseUrl);
  /** @type {Array<{ hash: string, slug: string, pass: boolean, score: number }>} */
  const summary = [];
  let failed = 0;

  for (const fileName of oracleFiles) {
    const oraclePath = path.join(oraclesDir, fileName);
    const oracle = JSON.parse(await readFile(oraclePath, 'utf8'));
    const targetUrl = oracle.showcase_anchor ? `${pageUrl}${oracle.showcase_anchor}` : pageUrl;
    const collected = await runOracleScenarios(oracle, { url: targetUrl });
    const report = compareOracle(oracle, collected);
    summary.push({
      hash: oracle.hash,
      slug: oracle.slug,
      pass: report.pass,
      score: report.score,
    });
    if (!report.pass) {
      failed += 1;
      console.error(
        JSON.stringify({ file: fileName, hash: oracle.hash, slug: oracle.slug, ...report }, null, 2),
      );
    } else {
      console.log(`${oracle.hash} ${oracle.slug}: pass (score ${report.score.toFixed(2)})`);
    }
  }

  console.log(
    JSON.stringify(
      {
        total: summary.length,
        failed,
        passed: summary.length - failed,
        summary,
      },
      null,
      2,
    ),
  );

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
