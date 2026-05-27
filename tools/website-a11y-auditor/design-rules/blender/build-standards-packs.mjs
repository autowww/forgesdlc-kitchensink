#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  STANDARDS_PACKS_DIR,
  buildAllStandardsPacks,
} from '../../lib/build-standards-pack.js';
import { RTM_PROFILE_IDS } from '../../lib/axe-rule-catalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {ReturnType<import('../../lib/build-traceability-matrix.js').buildStandardsTraceability>} matrix
 * @param {{ write?: boolean }} opts
 */
export async function writeStandardsPacks(matrix, opts = { write: true }) {
  const packs = buildAllStandardsPacks(matrix, RTM_PROFILE_IDS);
  if (opts.write !== false) {
    await fs.mkdir(STANDARDS_PACKS_DIR, { recursive: true });
    for (const [profileId, pack] of Object.entries(packs)) {
      const outPath = path.join(STANDARDS_PACKS_DIR, `${profileId}.pack.json`);
      await fs.writeFile(outPath, `${JSON.stringify(pack, null, 2)}\n`, 'utf8');
    }
  }
  return packs;
}

async function main() {
  const { buildTraceabilityFromRegistry } = await import('../../lib/build-traceability-matrix.js');
  const registryPath = path.resolve(__dirname, '../registry.generated.json');
  const registryRaw = await fs.readFile(registryPath, 'utf8');
  const registry = JSON.parse(registryRaw);
  const { matrix } = buildTraceabilityFromRegistry(registry);
  const packs = await writeStandardsPacks(matrix);
  for (const id of Object.keys(packs)) {
    console.log(`wrote ${path.join(STANDARDS_PACKS_DIR, `${id}.pack.json`)}`);
  }
}

import { pathToFileURL } from 'node:url';

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
