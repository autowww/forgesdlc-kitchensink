import assert from 'node:assert/strict';
import test from 'node:test';

import {
  defectPlanFileFromTodoContent,
  extractUrlsFromText,
  pageUrlsMatchingRepoPath,
  parseLastAgentToolHint,
  parseRemediationPlanTodoEntries,
} from '../lib/remediation-watch-progress.js';
import { classifyRulesetPageCell, guessRuleIdFromRepoPath } from '../lib/loop-watch-progress-map.js';

const THR = { blocker: 0, critical: 0, major: 0, warn: 5, minor: 10, trivial: 15, cosmetic: 100 };

test('parseRemediationPlanTodoEntries reads id status and defect plan file', () => {
  const md = `---
name: "test"
todos:
  - id: ux-01
    content: "Execute 03-defect-nav.md (priority #3)"
    status: in_progress
  - id: ux-02
    content: "Execute 04-defect-hero.md"
    status: pending
isProject: true
---
`;
  const entries = parseRemediationPlanTodoEntries(md);
  assert.equal(entries.length, 2);
  assert.equal(entries[0].id, 'ux-01');
  assert.equal(entries[0].status, 'in_progress');
  assert.equal(entries[0].planFile, '03-defect-nav.md');
});

test('parseLastAgentToolHint returns latest tool path', () => {
  const hint = parseLastAgentToolHint([
    '[ux-agent] → edit kitchensink/css/theme.css',
    '[ux-agent] ✓ edit ok',
    '[ux-agent] → write generator/build-site.py',
  ]);
  assert.equal(hint?.kind, 'write');
  assert.ok(hint?.path.includes('build-site.py'));
});

test('pageUrlsMatchingRepoPath matches slug in page url', () => {
  const urls = pageUrlsMatchingRepoPath('website/docs-operate-runbook.html', [
    'http://127.0.0.1:8080/docs-operate-301-02-operations-runbook.html',
    'http://127.0.0.1:8080/index.html',
  ]);
  assert.equal(urls.length, 1);
  assert.ok(urls[0].includes('runbook'));
});

test('classifyRulesetPageCell shows fixing on active remediation urls', () => {
  const rs = { lane: 'deterministic', label: 'accessibility', ruleIds: ['DET.A11Y.01'] };
  const page = {
    url: 'http://x/runbook.html',
    findings: [{ ruleId: 'DET.A11Y.01', severity: 'major', area: 'accessibility' }],
    ruleExecution: { deterministic: [{ ruleId: 'DET.A11Y.01', status: 'ran' }] },
  };
  const prior = new Map([[page.url, page]]);
  const st = classifyRulesetPageCell(
    {
      isRemediation: true,
      remediationActive: true,
      remediationActiveUrls: new Set([page.url]),
      priorPagesByUrl: prior,
    },
    rs,
    page.url,
    page,
    THR,
  );
  assert.equal(st, 'fixing-dim');
});

test('guessRuleIdFromRepoPath hints a11y paths', () => {
  assert.ok(guessRuleIdFromRepoPath('forge-a11y-checker/src/foo').startsWith('DET.A11Y'));
});

test('extractUrlsFromText finds http urls', () => {
  const urls = extractUrlsFromText('See http://127.0.0.1:8080/foo.html for detail.');
  assert.deepEqual(urls, ['http://127.0.0.1:8080/foo.html']);
});

test('defectPlanFileFromTodoContent parses execute line', () => {
  assert.equal(
    defectPlanFileFromTodoContent('Execute 02-defect-homepage.md (priority #2)'),
    '02-defect-homepage.md',
  );
});
