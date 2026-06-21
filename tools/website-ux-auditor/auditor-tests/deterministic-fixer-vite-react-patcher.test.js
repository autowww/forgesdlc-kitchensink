import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import {
  patchDemoDisclosureJsx,
  patchPrimaryCtaJsx,
  patchFontStackRule,
  ensureCssImportInTs,
  shouldRefusePatch,
  CONFIDENCE_MEDIUM,
} from '../lib/ux-deterministic-fixers/vite-react-patcher/index.mjs';
import { patchAppHtmlForRule } from '../lib/ux-deterministic-fixers/fixers/patches/app-dom.mjs';

const FIXTURE = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  'fixtures/vite-react-fixer/demo-disclosure-fail.html',
);

test('vite-react-patcher: demo disclosure HTML patch adds visible label', async () => {
  const before = await fs.readFile(FIXTURE, 'utf8');
  const after = patchAppHtmlForRule(before, 'DET.APP.DEMO_DISCLOSURE');
  assert.notEqual(before, after);
  assert.match(after, /studio-demo-label/i);
  assert.match(after, /demo sample/i);
});

test('vite-react-patcher: demo disclosure JSX patch adds badge', () => {
  const src = '<section data-demo={true}><p>Metrics</p></section>';
  const after = patchDemoDisclosureJsx(src);
  assert.match(after, /studio-demo-label/);
});

test('vite-react-patcher: primary CTA JSX demotes extras', () => {
  const src = `
    <button className="btn btn-primary">One</button>
    <button className="btn btn-primary">Two</button>
  `;
  const after = patchPrimaryCtaJsx(src);
  assert.match(after, /data-studio-primary-cta/);
  assert.match(after, /btn-secondary/);
  const primaries = after.match(/btn-primary/g) || [];
  assert.ok(primaries.length <= 1);
});

test('vite-react-patcher: CSS font stack patch replaces body rule', () => {
  const css = 'body { font-family: Arial, sans-serif; color: #fff; }';
  const after = patchFontStackRule(css, 'body', 'var(--forge-font-body)');
  assert.match(after, /var\(--forge-font-body\)/);
  assert.doesNotMatch(after, /Arial/);
});

test('vite-react-patcher: ensureCssImportInTs adds import', () => {
  const src = "import React from 'react';\nexport default function App() { return null; }\n";
  const after = ensureCssImportInTs(src, '../css/forge-react-primitives.css');
  assert.match(after, /forge-react-primitives\.css/);
});

test('vite-react-patcher: shouldRefusePatch guards low confidence', () => {
  assert.equal(shouldRefusePatch(0.2, CONFIDENCE_MEDIUM), true);
  assert.equal(shouldRefusePatch(0.75, CONFIDENCE_MEDIUM), false);
});
