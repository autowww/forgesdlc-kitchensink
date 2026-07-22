#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { compareOracle } from './lib/compare-oracle.mjs';
import { canLaunchBrowser, runOracleScenarios } from './lib/run-scenario.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const url = String(args.url || '');
  const oraclePath = path.resolve(String(args.oracle || ''));

  if (!url || !args.oracle) {
    console.error('Usage: node run-oracle.mjs --url <page-url> --oracle <path-to-oracle.json>');
    process.exit(2);
  }

  const oracle = JSON.parse(await readFile(oraclePath, 'utf8'));
  const targetUrl = oracle.showcase_anchor ? `${url}${oracle.showcase_anchor}` : url;

  if (!(await canLaunchBrowser())) {
    console.error('Playwright Chromium is not available. Run: npm run install-browsers');
    process.exit(3);
  }

  const collected = await runOracleScenarios(oracle, { url: targetUrl });
  const report = compareOracle(oracle, collected);

  console.log(JSON.stringify({ hash: oracle.hash, slug: oracle.slug, ...report }, null, 2));
  process.exit(report.pass ? 0 : 1);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
