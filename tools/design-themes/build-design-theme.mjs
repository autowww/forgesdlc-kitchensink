#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DEFAULT_DESIGN_THEME_ID,
  designThemeGeneratedPath,
  designThemeSourcePath,
  designThemesRoot,
  generatedThemePayloadFromParts,
} from '../website-ux-auditor/lib/design-theme.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KS_ROOT = path.resolve(__dirname, '../..');

function usage() {
  console.error('usage: node tools/design-themes/build-design-theme.mjs [--theme default]');
}

function parseArgs(argv) {
  const args = { theme: DEFAULT_DESIGN_THEME_ID };
  for (let i = 2; i < argv.length; i += 1) {
    const raw = argv[i];
    if (raw === '--help' || raw === '-h') {
      usage();
      process.exit(0);
    }
    if (raw === '--theme') {
      args.theme = argv[++i] || '';
      continue;
    }
    if (raw.startsWith('--theme=')) {
      args.theme = raw.slice('--theme='.length);
      continue;
    }
    throw new Error(`Unknown argument: ${raw}`);
  }
  return args;
}

function parseSimpleYaml(text) {
  const out = {};
  let activeList = null;
  for (const rawLine of String(text || '').split(/\r?\n/)) {
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;
    const listMatch = /^\s*-\s*(.*?)\s*$/.exec(rawLine);
    if (listMatch && activeList) {
      out[activeList].push(unquote(listMatch[1]));
      continue;
    }
    const kv = /^([A-Za-z0-9_]+):\s*(.*?)\s*$/.exec(rawLine);
    if (!kv) continue;
    const [, key, value] = kv;
    if (value === '') {
      out[key] = [];
      activeList = key;
    } else {
      out[key] = unquote(value);
      activeList = null;
    }
  }
  return out;
}

function unquote(value) {
  return String(value || '').trim().replace(/^["']|["']$/g, '');
}

function ksRelativeFromTheme(themeDir, relPath) {
  if (!relPath) return null;
  const abs = path.isAbsolute(relPath) ? relPath : path.resolve(themeDir, relPath);
  return path.relative(KS_ROOT, abs).replaceAll(path.sep, '/');
}

async function main() {
  const args = parseArgs(process.argv);
  const sourcePath = designThemeSourcePath(args.theme);
  const themeDir = path.dirname(sourcePath);
  const raw = await fs.readFile(sourcePath, 'utf8');
  const source = parseSimpleYaml(raw);
  const sourceFiles = [path.relative(KS_ROOT, sourcePath).replaceAll(path.sep, '/')];

  const rel = (value) => ksRelativeFromTheme(themeDir, value);
  const relList = (items) => (Array.isArray(items) ? items : []).map((item) => rel(item)).filter(Boolean);

  const payload = generatedThemePayloadFromParts({
    id: String(source.id || args.theme || DEFAULT_DESIGN_THEME_ID),
    name: String(source.name || source.id || args.theme || DEFAULT_DESIGN_THEME_ID),
    status: String(source.status || 'draft'),
    description: String(source.description || ''),
    source: String(source.source || ''),
    sourceUrl: String(source.source_url || ''),
    themeDir,
    designStandardPath: rel(source.design_standard_path || 'design-standard.md'),
    tokensPath: rel(source.tokens_path || 'tokens.json'),
    deterministicRulesPath: rel(source.deterministic_rules_path || 'deterministic-rules.md'),
    aiPrinciplesPath: rel(source.ai_principles_path || 'ai-principles.md'),
    contractOverlaysDir: rel(source.contract_overlays_dir || 'contracts'),
    cssFiles: relList(source.css_files),
    rulePacks: relList(source.rule_packs),
    sourceFiles,
  });

  const generatedPath = designThemeGeneratedPath(payload.id);
  await fs.mkdir(path.dirname(generatedPath), { recursive: true });
  await fs.writeFile(generatedPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  process.stdout.write(`${generatedPath}\n`);
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  console.error(`Themes root: ${designThemesRoot()}`);
  process.exit(1);
});
