import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { runAppViteReactFixer } from '../lib/ux-deterministic-fixers/fixers/app-vite-react-fixer.mjs';

test('deterministic fixer report fields from app vite react fixer', async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ux-fixer-'));
  const htmlPath = path.join(tmp, 'index.html');
  await fs.writeFile(
    htmlPath,
    `<!DOCTYPE html><html><body><div data-demo><p>x</p></div></body></html>`,
    'utf8',
  );

  const result = await runAppViteReactFixer({
    ruleId: 'DET.APP.DEMO_DISCLOSURE',
    repoRoot: tmp,
    findings: [
      {
        ruleId: 'DET.APP.DEMO_DISCLOSURE',
        evidence: 'container="#demo-panel"',
        message: 'missing label',
      },
    ],
  });

  assert.equal(result.ruleId, 'DET.APP.DEMO_DISCLOSURE');
  assert.equal(result.applied, true);
  assert.ok(result.filesTouched >= 1);
  assert.ok(result.confidence != null);
  assert.ok(result.verifyCommand);
  assert.equal(result.fallbackReason, undefined);

  const html = await fs.readFile(htmlPath, 'utf8');
  assert.match(html, /studio-demo-label/i);
});
