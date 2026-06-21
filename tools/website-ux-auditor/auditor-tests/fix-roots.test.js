import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import {
  resolveFixDisposition,
  resolveFixRoots,
  ruleAllowsExternalLibraryFix,
} from '../lib/fix-roots.mjs';

test('resolveFixRoots includes local and external', () => {
  const roots = resolveFixRoots('/app', { externalPaths: [path.resolve('/tmp')] });
  assert.equal(roots.length, 2);
  assert.equal(roots[0].id, 'local');
  assert.equal(roots[1].id, 'library1');
});

test('ruleAllowsExternalLibraryFix for DET.APP.PRIMITIVE_MARKERS', () => {
  assert.equal(ruleAllowsExternalLibraryFix('DET.APP.PRIMITIVE_MARKERS'), true);
  assert.equal(ruleAllowsExternalLibraryFix('DET.SECTION.HEADING'), false);
});

test('resolveFixDisposition external_library_required without path configured', () => {
  const app = path.resolve('/tmp/app');
  const ks = path.resolve('/tmp/ks');
  const roots = resolveFixRoots(app);
  const disp = resolveFixDisposition(
    { sources: [{ path: path.join(ks, 'react/Foo.tsx') }] },
    roots,
    'DET.APP.PRIMITIVE_MARKERS',
  );
  assert.equal(disp.disposition, 'local');
});
