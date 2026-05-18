#!/usr/bin/env node
/**
 * List source files changed in git that typically affect visuals, and flag missing
 * registry/catalog doc updates (heuristic for PR review).
 *
 * Usage:
 *   node changed-visual-contracts.mjs --repo . --base origin/main
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const VISUAL_GLOBS = [
  /^components\/.*\.py$/,
  /^generator\/.*\.py$/,
  /^react\/.*\.tsx$/,
  /^css\/.*\.css$/,
  /^js\/.*\.js$/,
  /^assets\/svg\/.*\.svg$/,
  /^museum\/studio\//,
  /^showcase-react-app\/src\//,
];

function parseArgs(argv) {
  const o = { repo: process.cwd(), base: 'HEAD~1' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') o.repo = path.resolve(argv[++i] || '');
    else if (a === '--base') o.base = argv[++i] || 'HEAD~1';
  }
  return o;
}

function main() {
  const { repo, base } = parseArgs(process.argv);
  let names = [];
  try {
    names = execSync(`git diff --name-only ${base}...HEAD`, { cwd: repo, encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
  } catch {
    try {
      names = execSync('git diff --name-only HEAD', { cwd: repo, encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(Boolean);
    } catch (e) {
      console.error('git diff failed', e.message);
      process.exit(2);
    }
  }

  const visual = names.filter((n) => VISUAL_GLOBS.some((re) => re.test(n.replace(/\\/g, '/'))));
  const catalog = names.filter((n) => n.startsWith('docs/design/catalog/') && !n.endsWith('.generated.json'));

  console.log('## Visual-impacting paths in diff\n');
  if (!visual.length) {
    console.log('(none detected)');
  } else {
    for (const v of visual) console.log(`- ${v}`);
  }
  console.log('\n## Catalog/doc paths in diff\n');
  if (!catalog.length) {
    console.log('(none — consider updating visual-registry.yaml / contracts if visuals changed)');
  } else {
    for (const c of catalog) console.log(`- ${c}`);
  }
}

main();
