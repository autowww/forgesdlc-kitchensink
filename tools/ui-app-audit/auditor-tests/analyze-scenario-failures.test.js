import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(__dirname, '..', 'analyze-scenario-failures.mjs');

test('analyze-scenario-failures emits Major+ table and first-run checklist', async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'analyze-scenario-'));
  const auditPath = path.join(tmp, 'audit-data.json');
  await fs.writeFile(
    auditPath,
    JSON.stringify({
      gateMode: 'ux',
      gatePass: false,
      uxQualityGate: { pass: false },
      pages: [
        {
          scenarioId: 'home-shell',
          url: 'http://127.0.0.1:8765/#dashboard-section',
          findings: [
            {
              stepId: 'land',
              ruleId: 'DET.APP.PRIMARY_CTA',
              severity: 'Major',
              message: 'CTA missing label',
              sources: [{ path: 'forge_accessibility/static/app/src/part-04.js' }],
            },
          ],
        },
      ],
      findings: [
        {
          stepId: 'land',
          ruleId: 'DET.APP.PRIMARY_CTA',
          severity: 'Major',
          message: 'CTA missing label',
        },
      ],
    }),
    'utf8',
  );

  const outPath = path.join(tmp, 'analysis.md');
  const proc = spawnSync(
    process.execPath,
    [
      SCRIPT,
      '--audit',
      auditPath,
      '--out',
      outPath,
      '--scenario-id',
      'home-shell',
      '--guided-first-run',
      '--cycle',
      '1',
    ],
    { encoding: 'utf8' },
  );
  assert.equal(proc.status, 0, proc.stderr || proc.stdout);

  const md = await fs.readFile(outPath, 'utf8');
  assert.match(md, /First-run checklist/);
  assert.match(md, /DET\.APP\.PRIMARY_CTA/);
  assert.match(md, /home-shell/);
  assert.match(md, /Suggested next actions/);

  await fs.rm(tmp, { recursive: true, force: true });
});
