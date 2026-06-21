#!/usr/bin/env node
/**
 * Infer Vite/React smoke-plan candidates from routes, conventions, and nav shell.
 * Preserves human-authored scenarios; adds status: candidate rows only for gaps.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  generateViteReactSmokePlan,
  serializeSmokePlan,
} from './lib/vite-react-smoke-inference.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const opts = {
    appRepo: '',
    smokePlan: '',
    shellPath: [],
    dryRun: false,
    json: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--app-repo' && argv[i + 1]) opts.appRepo = path.resolve(argv[++i]);
    else if ((a === '--smoke-plan' || a === '--out') && argv[i + 1]) opts.smokePlan = path.resolve(argv[++i]);
    else if (a === '--shell' && argv[i + 1]) opts.shellPath.push(argv[++i]);
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--json') opts.json = true;
    else if (a === '-h' || a === '--help') {
      console.log(`Usage: node generate-vite-react-smoke-plan.mjs --app-repo PATH [options]

  --smoke-plan PATH     Read/write smoke-plan.yaml (merge mode)
  --out PATH            Alias for --smoke-plan
  --shell PATH          Extra HTML shell for nav-link inference (repeatable)
  --dry-run             Print summary only; do not write
  --json                Print inference summary JSON to stdout`);
      process.exit(0);
    }
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.appRepo) {
    console.error('generate-vite-react-smoke-plan: --app-repo required');
    process.exit(2);
  }

  const result = await generateViteReactSmokePlan({
    appRoot: opts.appRepo,
    smokePlanPath: opts.smokePlan || undefined,
    shellPaths: opts.shellPath,
  });

  const summary = {
    addedCandidates: result.addedCount,
    totalScenarios: result.plan.scenarios.length,
    inferred: result.inferred.bySource,
    missingRouteKeys: result.inferred.missing.map((r) => r.routeKey),
  };

  if (opts.json) {
    console.log(JSON.stringify({ summary, plan: result.plan }, null, 2));
  } else {
    console.error(
      `generate-vite-react-smoke-plan: added=${result.addedCount} total=${result.plan.scenarios.length} sources=${JSON.stringify(result.inferred.bySource)}`,
    );
  }

  if (opts.dryRun) return;

  if (!opts.smokePlan) {
    console.error('generate-vite-react-smoke-plan: --smoke-plan required to write (or use --dry-run)');
    process.exit(2);
  }

  result.plan._generatorHeader = [
    '# Generated/updated by generate-vite-react-smoke-plan.mjs',
    '# Inferred scenarios use status: candidate until reviewed.',
  ];
  await fs.mkdir(path.dirname(opts.smokePlan), { recursive: true });
  await fs.writeFile(opts.smokePlan, serializeSmokePlan(result.plan), 'utf8');
  console.error(`generate-vite-react-smoke-plan: wrote ${opts.smokePlan}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
