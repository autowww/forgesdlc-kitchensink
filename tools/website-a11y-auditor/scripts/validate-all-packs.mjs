#!/usr/bin/env node
/**
 * Validate all RTM standards packs with --strict (CI).
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RTM_PROFILE_IDS } from '../lib/axe-rule-catalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '..');
const VALIDATE = path.join(TOOL_ROOT, 'validate-standards-pack.mjs');

function main() {
  let failed = 0;
  for (const packId of RTM_PROFILE_IDS) {
    const r = spawnSync(process.execPath, [VALIDATE, '--pack', packId, '--strict'], {
      cwd: TOOL_ROOT,
      stdio: 'inherit',
    });
    if (r.status !== 0) {
      failed += 1;
      console.error(`validate-all-packs: FAIL ${packId}`);
    } else {
      console.error(`validate-all-packs: OK ${packId}`);
    }
  }
  if (failed) {
    console.error(`validate-all-packs: ${failed}/${RTM_PROFILE_IDS.length} failed`);
    process.exit(1);
  }
  console.log(`validate-all-packs: all ${RTM_PROFILE_IDS.length} packs passed`);
}

main();
