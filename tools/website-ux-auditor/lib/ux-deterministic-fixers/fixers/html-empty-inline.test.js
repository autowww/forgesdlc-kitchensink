import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { runHtmlEmptyInlineFixer } from './html-empty-inline.mjs';

describe('html-empty-inline fixer', () => {
  it('replaces empty strong tags in main', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ux-fix-'));
    const web = path.join(tmp, 'website');
    await fs.mkdir(web, { recursive: true });
    const file = path.join(web, 'page.html');
    await fs.writeFile(
      file,
      '<html><body><main id="main"><p>x <strong></strong> y</p></main></body></html>',
      'utf8',
    );
    const res = await runHtmlEmptyInlineFixer({
      repoRoot: tmp,
      findings: [{ url: 'file://' + file }],
    });
    assert.equal(res.applied, true);
    const out = await fs.readFile(file, 'utf8');
    assert.match(out, /<strong>—<\/strong>/);
  });
});
