import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { runAiFixers } from '../lib/a11y-ai-fixers/index.mjs';
import { resolveAiFixerId } from '../lib/a11y-ai-fixers/registry.mjs';

describe('a11y-ai-fixers', () => {
  it('resolveAiFixerId defaults to plan_only', () => {
    assert.equal(resolveAiFixerId('AI.A11Y.GENERIC.UNKNOWN'), 'plan_only');
  });

  it('resolveAiFixerId uses ai_apply_form_error for form errors', () => {
    assert.equal(resolveAiFixerId('AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION'), 'ai_apply_form_error');
  });

  it('resolveAiFixerId uses ai_apply_audio_control for audio control', () => {
    assert.equal(resolveAiFixerId('AI.A11Y.GENERIC.AUDIO_CONTROL'), 'ai_apply_audio_control');
  });

  it('runAiFixers writes ai-fixer-report.json for AI findings', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-fix-'));
    const auditPath = path.join(tmp, 'a11y-audit-data.json');
    await fs.writeFile(
      auditPath,
      `${JSON.stringify({
        findings: [
          {
            ruleId: 'AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW',
            severity: 'major',
            message: 'keyboard task flow issue',
          },
        ],
      })}\n`,
    );
    const { reportPath, report } = await runAiFixers({ auditDataPath: auditPath, outDir: tmp });
    assert.ok(reportPath.endsWith('ai-fixer-report.json'));
    assert.equal(report.summary.rulesProcessed, 1);
    const row = report.rules['AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW'];
    assert.equal(row.fixerId, 'plan_only');
    assert.match(String(row.suggestedAction || ''), /keyboard/i);
  });

  it('ai_apply_form_error fixer patches HTML when repo root provided', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-apply-'));
    const repo = path.join(tmp, 'site');
    await fs.mkdir(repo, { recursive: true });
    const htmlPath = path.join(repo, 'index.html');
    await fs.writeFile(
      htmlPath,
      '<!DOCTYPE html><html><body><form><input type="text" name="email"/><p class="error" id="err-email">Invalid</p></form></body></html>',
    );
    const auditPath = path.join(tmp, 'a11y-audit-data.json');
    await fs.writeFile(
      auditPath,
      `${JSON.stringify({
        findings: [
          {
            ruleId: 'AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION',
            severity: 'major',
            message: 'label not associated',
            url: 'file://' + htmlPath,
          },
        ],
      })}\n`,
    );
    const { report } = await runAiFixers({
      auditDataPath: auditPath,
      outDir: tmp,
      repoRoot: repo,
    });
    const row = report.rules['AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION'];
    assert.equal(row.fixerId, 'ai_apply_form_error');
    assert.equal(row.applied, true);
    const patched = await fs.readFile(htmlPath, 'utf8');
    assert.match(patched, /aria-describedby=["']err-email["']/);
  });

  it('remediation_note fixer applies and writes note file', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-note-'));
    const auditPath = path.join(tmp, 'a11y-audit-data.json');
    await fs.writeFile(
      auditPath,
      `${JSON.stringify({
        findings: [
          {
            ruleId: 'AI.A11Y.GENERIC.SENSORY_INSTRUCTIONS',
            severity: 'major',
            message: 'sensory-only instructions',
          },
        ],
      })}\n`,
    );
    const { report } = await runAiFixers({ auditDataPath: auditPath, outDir: tmp });
    const row = report.rules['AI.A11Y.GENERIC.SENSORY_INSTRUCTIONS'];
    assert.equal(row.fixerId, 'remediation_note');
    assert.equal(row.applied, true);
    assert.ok(row.notePath);
  });
});
