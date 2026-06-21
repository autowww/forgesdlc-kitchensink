#!/usr/bin/env node
/**
 * Write docs/design/ux-audit/harness/CURRENT-COVERAGE.md from live registries.
 *
 * Usage:
 *   node scripts/write-harness-current-coverage.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildHarnessCoverageReport,
  renderHarnessCoverageMarkdown,
} from '../lib/harness-coverage-matrix.mjs';
import * as studioDynamic from '../../ui-app-audit/lib/studio-dynamic-ux-ruleset.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDITOR_ROOT = path.resolve(__dirname, '..');
const KS_ROOT = path.resolve(AUDITOR_ROOT, '../..');
const OUT_PATH = path.join(KS_ROOT, 'docs/design/ux-audit/harness/CURRENT-COVERAGE.md');
const REGISTRY_PATH = path.join(AUDITOR_ROOT, 'design-rules/registry.generated.json');

const checkMode = process.argv.includes('--check');

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
const report = buildHarnessCoverageReport({
  ksRoot: KS_ROOT,
  auditorRoot: AUDITOR_ROOT,
  registry,
  studioModule: studioDynamic,
});
const text = renderHarnessCoverageMarkdown(report);

if (checkMode) {
  let existing = '';
  try {
    existing = fs.readFileSync(OUT_PATH, 'utf8');
  } catch {
    console.error('CURRENT-COVERAGE.md missing — run without --check');
    process.exit(1);
  }
  if (existing !== text) {
    console.error('CURRENT-COVERAGE.md is stale — run write-harness-current-coverage.mjs');
    process.exit(1);
  }
  console.log('write-harness-current-coverage --check: OK');
  process.exit(report.ok ? 0 : 1);
}

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, text);
console.log(`Wrote ${OUT_PATH} (gates ok=${report.ok})`);
process.exit(report.ok ? 0 : 1);
