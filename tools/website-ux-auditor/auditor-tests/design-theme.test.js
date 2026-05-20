import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_DESIGN_THEME_ID,
  designThemeGeneratedPath,
  loadDesignTheme,
  summarizeDesignTheme,
} from '../lib/design-theme.js';
import { buildAiAuditBatches } from '../lib/ai-audit-batches.js';

test('design theme loader resolves the default generated theme', async () => {
  const theme = await loadDesignTheme();
  assert.equal(theme.id, DEFAULT_DESIGN_THEME_ID);
  assert.equal(theme.designStandardPath, 'docs/design/forge-enterprise-ai-website-standard.md');
  assert.equal(theme.generatedPath, designThemeGeneratedPath(DEFAULT_DESIGN_THEME_ID));
  assert.ok(theme.designStandardAbsPath.endsWith('docs/design/forge-enterprise-ai-website-standard.md'));
  assert.ok(theme.tokens?.palette?.accentPrimary);
  assert.ok(theme.fingerprint);

  const summary = summarizeDesignTheme(theme);
  assert.deepEqual(Object.keys(summary).sort(), [
    'aiPrinciplesPath',
    'designStandardPath',
    'deterministicRulesPath',
    'fingerprint',
    'generatedPath',
    'id',
    'name',
    'source',
    'status',
    'tokensPath',
  ].sort());
});

test('design theme loader reports missing non-default themes', async () => {
  await assert.rejects(() => loadDesignTheme('missing-theme-for-test'), /Design theme not found/);
});

test('AI audit batches carry design theme context', () => {
  const theme = { id: 'default', fingerprint: 'abc123', designStandardPath: 'docs/design/forge-enterprise-ai-website-standard.md' };
  const manifest = buildAiAuditBatches({
    auditData: {
      auditRunId: 'run-1',
      designTheme: theme,
      pages: [{ url: 'https://fixture.test/', metrics: { title: 'Home' }, findings: [] }],
    },
    inventory: { pageFiles: [], componentFiles: [], navCandidates: [], styleFiles: [], topFiles: [] },
    repoRoot: '/tmp/repo',
    designStandardPath: '/tmp/repo/docs/design/forge-enterprise-ai-website-standard.md',
    designTheme: theme,
  });
  assert.deepEqual(manifest.designTheme, theme);
  assert.deepEqual(manifest.batches[0].designTheme, theme);
});
