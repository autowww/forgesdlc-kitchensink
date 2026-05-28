#!/usr/bin/env node
/**
 * Verify generated standards traceability Markdown matches blend output (stable hash).
 */
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildTraceabilityMarkdownBundle,
  stripVolatileTraceabilityMd,
} from '../lib/build-traceability-matrix.js';
import { RTM_PROFILE_IDS } from '../lib/axe-rule-catalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '..');
const KS_ROOT = path.resolve(TOOL_ROOT, '../..');
const REGISTRY_PATH = path.join(TOOL_ROOT, 'design-rules/registry.generated.json');
const MATRIX_MD = path.join(KS_ROOT, 'docs/design/a11y-audit/standards-traceability-matrix.md');
const STANDARDS_DIR = path.join(KS_ROOT, 'docs/design/a11y-audit/standards');

function stableHash(content) {
  return crypto.createHash('sha256').update(stripVolatileTraceabilityMd(content)).digest('hex');
}

async function readOrEmpty(p) {
  try {
    return await fs.readFile(p, 'utf8');
  } catch {
    return null;
  }
}

async function main() {
  const registry = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
  const { matrixMd, standardsIndexMd, manualPlaybooksMd, profileMdById } =
    buildTraceabilityMarkdownBundle(registry);

  let failed = 0;

  const expectedMatrix = stableHash(matrixMd);
  const onDiskMatrix = await readOrEmpty(MATRIX_MD);
  if (!onDiskMatrix || stableHash(onDiskMatrix) !== expectedMatrix) {
    console.error('check-standards-traceability-md: drift in standards-traceability-matrix.md');
    failed += 1;
  }

  const expectedIndex = stableHash(standardsIndexMd);
  const onDiskIndex = await readOrEmpty(path.join(STANDARDS_DIR, 'README.md'));
  if (!onDiskIndex || stableHash(onDiskIndex) !== expectedIndex) {
    console.error('check-standards-traceability-md: drift in standards/README.md');
    failed += 1;
  }

  const expectedManual = stableHash(manualPlaybooksMd);
  const onDiskManual = await readOrEmpty(path.join(STANDARDS_DIR, 'manual-test-playbooks.md'));
  if (!onDiskManual || stableHash(onDiskManual) !== expectedManual) {
    console.error('check-standards-traceability-md: drift in standards/manual-test-playbooks.md');
    failed += 1;
  }

  for (const profileId of RTM_PROFILE_IDS) {
    const expected = profileMdById[profileId];
    if (!expected) {
      console.error(`check-standards-traceability-md: missing generated profile ${profileId}`);
      failed += 1;
      continue;
    }
    const onDisk = await readOrEmpty(path.join(STANDARDS_DIR, `${profileId}.md`));
    if (!onDisk || stableHash(onDisk) !== stableHash(expected)) {
      console.error(`check-standards-traceability-md: drift in standards/${profileId}.md`);
      failed += 1;
    }
  }

  if (failed) {
    console.error('Run: cd tools/website-a11y-auditor && npm run blend-rules');
    process.exit(1);
  }
  console.log(
    `check-standards-traceability-md: OK (matrix + index + manual playbooks + ${RTM_PROFILE_IDS.length} profiles)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
