import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { loadDesignStandard } from '../lib/design-standard.js';

test('loadDesignStandard parses front matter and stable sha256', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ks-ux-design-'));
  const p = join(dir, 'standard.md');
  const body = `---
id: forge.test.standard
updated: '2026-01-02'
---

# Body line
`;
  await writeFile(p, body, 'utf8');
  const meta = await loadDesignStandard(p);
  assert.equal(meta.id, 'forge.test.standard');
  assert.equal(meta.updated, '2026-01-02');
  assert.equal(typeof meta.sha256, 'string');
  assert.equal(meta.sha256.length, 64);
  assert.ok(meta.byteLength > 0);
  assert.ok(meta.rawSnippet.includes('# Body line'));
  await rm(dir, { recursive: true, force: true });
});

test('loadDesignStandard empty path uses rawFallback only', async () => {
  const meta = await loadDesignStandard('', '# Hello\n');
  assert.equal(meta.path, null);
  assert.ok(meta.rawFull.includes('Hello'));
  assert.equal(typeof meta.sha256, 'string');
});
