import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  appendLiveAuditPage,
  clearLiveAuditSnapshot,
  liveAuditDataPath,
  readLiveAuditPages,
} from '../lib/audit-live-snapshot.js';
import { mergeAuditPagesForMap } from '../lib/loop-watch-progress-map.js';

test('appendLiveAuditPage writes incremental pages before audit-data.json', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-live-'));
  try {
    appendLiveAuditPage(outDir, {
      url: 'http://127.0.0.1/a.html',
      findings: [{ ruleId: 'DET.A', severity: 'warn', area: 'accessibility' }],
      ruleExecution: { deterministic: [{ ruleId: 'DET.A', status: 'ran' }] },
    });
    assert.ok(fs.existsSync(liveAuditDataPath(outDir)));
    const pages = readLiveAuditPages(outDir);
    assert.equal(pages.length, 1);
    assert.equal(pages[0].url, 'http://127.0.0.1/a.html');
    assert.equal(pages[0].findings.length, 1);

    appendLiveAuditPage(outDir, {
      url: 'http://127.0.0.1/b.html',
      findings: [],
      ruleExecution: { deterministic: [] },
    });
    assert.equal(readLiveAuditPages(outDir).length, 2);

    clearLiveAuditSnapshot(outDir);
    assert.equal(readLiveAuditPages(outDir).length, 0);
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});

test('mergeAuditPagesForMap prefers final audit over live snapshot', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-merge-'));
  try {
    appendLiveAuditPage(outDir, {
      url: 'http://127.0.0.1/a.html',
      findings: [{ ruleId: 'DET.A', severity: 'warn', area: 'accessibility' }],
      ruleExecution: {},
    });
    const merged = mergeAuditPagesForMap(
      {
        pages: [
          {
            url: 'http://127.0.0.1/a.html',
            findings: [],
            ruleExecution: {},
          },
        ],
      },
      outDir,
    );
    assert.equal(merged.length, 1);
    assert.equal(merged[0].findings.length, 0);
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});
