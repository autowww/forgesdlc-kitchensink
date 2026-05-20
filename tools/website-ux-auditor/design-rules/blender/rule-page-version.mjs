#!/usr/bin/env node
/**
 * Rule handbook page versioning: contentVersion fingerprints, manifest, target selection.
 */

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '../..');
const KS_ROOT = path.resolve(TOOL_ROOT, '../..');
const REGISTRY_PATH = path.resolve(TOOL_ROOT, 'design-rules/registry.generated.json');
export const RULE_PAGES_DIR = path.resolve(KS_ROOT, 'docs/design/ux-audit/rule-pages');
export const MANIFEST_PATH = path.resolve(RULE_PAGES_DIR, 'rule-pages.manifest.json');
const SHOWCASE_RULE_PAGES_DIR = 'ux-audit-rules';

export function kebabFromRuleId(ruleId) {
  return String(ruleId || '')
    .toLowerCase()
    .replaceAll('.', '-')
    .replaceAll('_', '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function mdPathForRule(ruleId) {
  return path.join(RULE_PAGES_DIR, `${kebabFromRuleId(ruleId)}.md`);
}

export function htmlRelPathForRule(ruleId) {
  return `${SHOWCASE_RULE_PAGES_DIR}/${kebabFromRuleId(ruleId)}.html`;
}

function sha256(input) {
  return crypto.createHash('sha256').update(String(input || ''), 'utf8').digest('hex');
}

async function readFileHash(absPath) {
  try {
    const raw = await fs.readFile(absPath, 'utf8');
    return sha256(raw);
  } catch {
    return '';
  }
}

function parseFrontMatter(raw) {
  const text = String(raw || '');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { front: {}, body: text };
  const front = {};
  for (const line of m[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key) front[key] = val;
  }
  return { front, body: text.slice(m[0].length) };
}

export function registryRuleRows(registry) {
  const det = (registry.deterministicRules || []).map((r) => ({
    id: r.id,
    lane: 'deterministic',
    registryStatus: r.status || 'stub',
    modulePath: r.modulePath || '',
    promptPath: '',
    sourceRule: r.sourceRule || '',
    defaultSeverity: r.defaultSeverity || '',
    scoreDimension: r.scoreDimension || '',
    priorityWeight: r.priorityWeight ?? '',
    area: r.area || '',
  }));
  const ai = (registry.aiRules || []).map((r) => ({
    id: r.id,
    lane: 'ai',
    registryStatus: r.status || 'generated',
    modulePath: '',
    promptPath: r.promptPath || '',
    sourceRule: r.sourceRule || '',
    defaultSeverity: '',
    scoreDimension: '',
    priorityWeight: '',
    area: '',
  }));
  return [...det, ...ai];
}

export async function computeContentVersion(row, registry) {
  const laneVersion =
    row.lane === 'ai'
      ? registry.versioning?.aiRulesVersion || ''
      : registry.versioning?.deterministicRulesVersion || '';

  let implementationFingerprint = '';
  const rel = row.modulePath || row.promptPath;
  if (rel) {
    const abs = path.resolve(KS_ROOT, rel.startsWith('tools/') ? rel : path.join('tools/website-ux-auditor', rel));
    const alt = path.resolve(TOOL_ROOT, rel.replace(/^design-rules\//, 'design-rules/'));
    implementationFingerprint =
      (await readFileHash(abs)) || (await readFileHash(path.resolve(TOOL_ROOT, rel)));
  }

  return sha256(
    JSON.stringify({
      ruleId: row.id,
      lane: row.lane,
      registryStatus: row.registryStatus,
      modulePath: row.modulePath,
      promptPath: row.promptPath,
      sourceRule: row.sourceRule,
      laneRulesVersion: laneVersion,
      registryFingerprint: registry.fingerprint || '',
      implementationFingerprint,
    }),
  );
}

export async function evaluateRulePage(row, registry) {
  const contentVersion = await computeContentVersion(row, registry);
  const mdPath = mdPathForRule(row.id);
  const htmlPath = htmlRelPathForRule(row.id);
  let pageVersion = '';
  let generatedAt = '';
  let agentModel = '';
  let registryFingerprint = '';
  let mdExists = false;

  try {
    const raw = await fs.readFile(mdPath, 'utf8');
    mdExists = true;
    const { front } = parseFrontMatter(raw);
    pageVersion = String(front.page_version || '').trim();
    generatedAt = String(front.generated_at || '').trim();
    agentModel = String(front.agent_model || '').trim();
    registryFingerprint = String(front.registry_fingerprint || '').trim();
  } catch {
    mdExists = false;
  }

  let status = 'missing';
  if (mdExists) {
    status = pageVersion === contentVersion ? 'current' : 'stale';
  }

  return {
    id: row.id,
    lane: row.lane,
    registryStatus: row.registryStatus,
    mdPath: path.relative(KS_ROOT, mdPath).split(path.sep).join('/'),
    htmlPath,
    contentVersion,
    pageVersion,
    generatedAt,
    agentModel,
    registryFingerprint,
    sourceRule: row.sourceRule,
    modulePath: row.modulePath || row.promptPath || '',
    defaultSeverity: row.defaultSeverity,
    scoreDimension: row.scoreDimension,
    area: row.area,
    status,
  };
}

export async function buildManifest(registry) {
  const rules = [];
  for (const row of registryRuleRows(registry)) {
    rules.push(await evaluateRulePage(row, registry));
  }
  rules.sort((a, b) => a.id.localeCompare(b.id));
  const summary = {
    total: rules.length,
    deterministic: rules.filter((r) => r.lane === 'deterministic').length,
    ai: rules.filter((r) => r.lane === 'ai').length,
    current: rules.filter((r) => r.status === 'current').length,
    stale: rules.filter((r) => r.status === 'stale').length,
    missing: rules.filter((r) => r.status === 'missing').length,
  };
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    registryFingerprint: registry.fingerprint || null,
    registryGeneratedAt: registry.generatedAt || null,
    rulePagesDir: 'docs/design/ux-audit/rule-pages',
    showcaseHtmlDir: SHOWCASE_RULE_PAGES_DIR,
    summary,
    rules,
  };
}

export async function writeManifest(registry) {
  const manifest = await buildManifest(registry);
  await fs.mkdir(RULE_PAGES_DIR, { recursive: true });
  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return manifest;
}

export async function selectPagegenTargets({
  lane = 'both',
  maxRules = 0,
  onlyRules = [],
  overrideVersion = false,
  registryPath = REGISTRY_PATH,
}) {
  const registry = JSON.parse(await fs.readFile(registryPath, 'utf8'));
  const onlySet = new Set(onlyRules.filter(Boolean));
  const wantDet = lane === 'deterministic' || lane === 'both';
  const wantAi = lane === 'ai' || lane === 'both';

  const targets = [];
  for (const row of registryRuleRows(registry)) {
    if (row.lane === 'deterministic' && !wantDet) continue;
    if (row.lane === 'ai' && !wantAi) continue;
    if (onlySet.size && !onlySet.has(row.id)) continue;

    const evaluated = await evaluateRulePage(row, registry);
    const force = overrideVersion || onlySet.has(row.id);
    if (!force && evaluated.status === 'current') continue;

    targets.push({
      lane: row.lane,
      id: row.id,
      mdPath: evaluated.mdPath,
      htmlPath: evaluated.htmlPath,
      contentVersion: evaluated.contentVersion,
      sourceRule: row.sourceRule,
      modulePath: row.modulePath,
      promptPath: row.promptPath,
      registryStatus: row.registryStatus,
      status: evaluated.status,
    });
  }

  targets.sort((a, b) => a.id.localeCompare(b.id));
  if (maxRules > 0) return targets.slice(0, maxRules);
  return targets;
}

async function main() {
  const args = process.argv.slice(2);
  let writeManifestFlag = false;
  let listTargets = false;
  let lane = 'both';
  let maxRules = 0;
  let overrideVersion = false;
  const onlyRules = [];

  for (let i = 0; i < args.length; i += 1) {
    const raw = args[i];
    if (raw === '--write-manifest') writeManifestFlag = true;
    else if (raw === '--list-targets') listTargets = true;
    else if (raw === '--lane') {
      lane = args[++i] || 'both';
    } else if (raw === '--max-rules') {
      maxRules = Number(args[++i] || 0);
    } else if (raw === '--override-version') {
      overrideVersion = true;
    } else if (raw === '--only-rule') {
      onlyRules.push(args[++i] || '');
    } else if (raw === '--help' || raw === '-h') {
      console.log(
        'usage: node rule-page-version.mjs [--write-manifest] [--list-targets] [--lane both] [--max-rules N] [--override-version] [--only-rule ID]',
      );
      process.exit(0);
    }
  }

  const registry = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));

  if (writeManifestFlag) {
    const manifest = await writeManifest(registry);
    process.stdout.write(`${MANIFEST_PATH}\n`);
    process.stdout.write(
      `summary: total=${manifest.summary.total} current=${manifest.summary.current} stale=${manifest.summary.stale} missing=${manifest.summary.missing}\n`,
    );
  }

  if (listTargets) {
    const targets = await selectPagegenTargets({
      lane,
      maxRules,
      onlyRules,
      overrideVersion,
    });
    for (const t of targets) process.stdout.write(`${JSON.stringify(t)}\n`);
  }

  if (!writeManifestFlag && !listTargets) {
    const manifest = await writeManifest(registry);
    process.stdout.write(JSON.stringify(manifest.summary, null, 2));
    process.stdout.write('\n');
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  main().catch((err) => {
    console.error(err?.stack || String(err));
    process.exit(1);
  });
}
