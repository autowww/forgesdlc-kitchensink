import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '..');
const MERGE_BIN = path.join(TOOL_ROOT, 'scripts/merge-ai-audit-findings.mjs');

describe('merge-ai-audit-findings', () => {
  it('appends normalized AI findings and sets aiLaneExecuted', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'a11y-merge-'));
    const auditPath = path.join(tmp, 'a11y-audit-data.json');
    const aiPath = path.join(tmp, 'ai.json');
    await fs.writeFile(
      auditPath,
      `${JSON.stringify({
        site: 'http://example.test/',
        findings: [{ ruleId: 'DET.A11Y.GENERIC.LANG', severity: 'major', message: 'lang' }],
        lanes: ['axe', 'det'],
      })}\n`,
    );
    await fs.writeFile(
      aiPath,
      `${JSON.stringify({
        findings: [
          {
            principleId: 'AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW',
            severity: 'major',
            message: 'keyboard task',
          },
        ],
      })}\n`,
    );
    const rc = spawnSync(
      process.execPath,
      [MERGE_BIN, '--audit-data', auditPath, '--ai-findings', aiPath],
      { encoding: 'utf8' },
    );
    assert.equal(rc.status, 0, rc.stderr || rc.stdout);
    const merged = JSON.parse(await fs.readFile(auditPath, 'utf8'));
    assert.equal(merged.findings.length, 2);
    assert.equal(merged.aiLaneExecuted, true);
    assert.ok(merged.findings.some((f) => String(f.ruleId).startsWith('AI.')));
  });
});
