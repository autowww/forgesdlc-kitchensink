#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_EFFECTS_DIR = path.resolve(__dirname, '../../docs/design/spatial/effects');
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
 * @param {string} markdown
 * @returns {Set<string>}
 */
export function extractScenarioIdsFromMarkdown(markdown) {
  const ids = new Set();
  const fenced = markdown.matchAll(/`([a-z][a-z0-9_/-]*)`/g);
  for (const match of fenced) {
    if (match[1].includes('_')) {
      ids.add(match[1]);
    }
  }

  const bullets = markdown.matchAll(/^[-*]\s+`?([a-z][a-z0-9_/-]*)`?/gim);
  for (const match of bullets) {
    ids.add(match[1]);
  }

  const section = markdown.match(/##\s+Oracle scenarios([\s\S]*?)(?:\n##\s+|\n$)/i);
  if (section) {
    const lines = section[1].matchAll(/`([a-z][a-z0-9_/-]*)`/g);
    for (const match of lines) {
      ids.add(match[1]);
    }
  }

  return ids;
}

/**
 * @param {object} options
 * @param {string} [options.effectsDir]
 * @param {string} [options.oraclesDir]
 */
export async function checkOracleDocSync(options = {}) {
  const effectsDir = path.resolve(options.effectsDir || DEFAULT_EFFECTS_DIR);
  const oraclesDir = path.resolve(options.oraclesDir || DEFAULT_ORACLES_DIR);

  const oracleEntries = (await readdir(oraclesDir)).filter((name) => name.endsWith('.json'));
  /** @type {Array<{ slug: string, hash: string, missingInDoc: string[], extraInDoc: string[] }>} */
  const mismatches = [];

  for (const fileName of oracleEntries) {
    const oracle = JSON.parse(await readFile(path.join(oraclesDir, fileName), 'utf8'));
    const slug = oracle.slug;
    const docPath = path.join(effectsDir, `${slug}.md`);
    let markdown = '';
    try {
      markdown = await readFile(docPath, 'utf8');
    } catch {
      mismatches.push({
        slug,
        hash: oracle.hash,
        missingInDoc: (oracle.scenarios || []).map((scenario) => scenario.id),
        extraInDoc: [],
      });
      continue;
    }

    const docIds = extractScenarioIdsFromMarkdown(markdown);
    const oracleIds = new Set((oracle.scenarios || []).map((scenario) => scenario.id));
    const missingInDoc = [...oracleIds].filter((id) => !docIds.has(id));
    const extraInDoc = [...docIds].filter((id) => !oracleIds.has(id));

    if (missingInDoc.length > 0 || extraInDoc.length > 0) {
      mismatches.push({ slug, hash: oracle.hash, missingInDoc, extraInDoc });
    }
  }

  return {
    pass: mismatches.length === 0,
    checked: oracleEntries.length,
    mismatches,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = await checkOracleDocSync({
    effectsDir: args['effects-dir'] ? String(args['effects-dir']) : undefined,
    oraclesDir: args['oracles-dir'] ? String(args['oracles-dir']) : undefined,
  });

  console.log(JSON.stringify(report, null, 2));
  if (!report.pass) {
    process.exit(1);
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
