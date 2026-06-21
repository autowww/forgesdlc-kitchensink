import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  buildThemeFontAllowlist,
  buildThemeFontAllowlistFromCssText,
  findingsFromFontStackReport,
  fontFamilyUsesThemeVar,
  isObservedFontAllowed,
  isStaticFontFamilyValueAllowed,
  primaryFontFace,
  run,
  scanCssTextForFontStackViolations,
  themeVarHint,
} from '../design-rules/deterministic/generated/det-theme-font-stack.check.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.join(__dirname, 'fixtures/det-theme-font-stack');
const KS_ROOT = path.resolve(__dirname, '../../..');

function readFixture(name) {
  return fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8');
}

test('primaryFontFace returns first non-generic face', () => {
  assert.equal(primaryFontFace('"Comic Sans MS", cursive'), 'comic sans ms');
  assert.equal(primaryFontFace('system-ui, sans-serif'), 'system-ui');
});

test('fontFamilyUsesThemeVar detects KS theme variables', () => {
  assert.equal(fontFamilyUsesThemeVar('var(--font-display)'), true);
  assert.equal(fontFamilyUsesThemeVar('var(--bs-body-font-family)'), true);
  assert.equal(fontFamilyUsesThemeVar('"Comic Sans MS", cursive'), false);
});

test('buildThemeFontAllowlistFromCssText extracts Forge token primaries', () => {
  const allowlist = buildThemeFontAllowlistFromCssText(readFixture('ks-theme-tokens.css'));
  assert.ok(allowlist.display.has('proxima nova black'));
  assert.ok(allowlist.body.has('open sans'));
  assert.ok(allowlist.mono.has('courier new'));
});

test('isStaticFontFamilyValueAllowed accepts theme vars and rejects drift', () => {
  const allowlist = buildThemeFontAllowlistFromCssText(readFixture('ks-theme-tokens.css'));
  assert.equal(isStaticFontFamilyValueAllowed('var(--font-display)', allowlist), true);
  assert.equal(isStaticFontFamilyValueAllowed('"Comic Sans MS", cursive', allowlist), false);
  assert.equal(isStaticFontFamilyValueAllowed('var(--font-display), system-ui, sans-serif', allowlist), true);
});

test('scanCssTextForFontStackViolations flags generic fail CSS', () => {
  const allowlist = buildThemeFontAllowlistFromCssText(readFixture('ks-theme-tokens.css'));
  const violations = scanCssTextForFontStackViolations(
    readFixture('generic-fail.css'),
    'css/feature.css',
    allowlist,
  );
  assert.ok(violations.length >= 2);
  assert.ok(violations.some((v) => v.observed === 'comic sans ms'));
  assert.ok(violations.some((v) => v.observed === 'georgia'));
});

test('scanCssTextForFontStackViolations passes token-only CSS', () => {
  const allowlist = buildThemeFontAllowlistFromCssText(readFixture('ks-theme-tokens.css'));
  const violations = scanCssTextForFontStackViolations(
    readFixture('generic-pass.css'),
    'css/feature.css',
    allowlist,
  );
  assert.deepEqual(violations, []);
});

test('scanCssTextForFontStackViolations flags Vite module CSS drift', () => {
  const allowlist = buildThemeFontAllowlistFromCssText(readFixture('ks-theme-tokens.css'));
  const violations = scanCssTextForFontStackViolations(
    readFixture('vite-fail.module.css'),
    'src/App.module.css',
    allowlist,
  );
  assert.ok(violations.length >= 1);
  assert.ok(violations.some((v) => String(v.path).includes('App.module.css')));
});

test('scanCssTextForFontStackViolations passes Vite global stylesheet with vars', () => {
  const allowlist = buildThemeFontAllowlistFromCssText(readFixture('vite-pass.css'));
  const violations = scanCssTextForFontStackViolations(
    readFixture('vite-pass.css'),
    'src/index.css',
    allowlist,
  );
  assert.deepEqual(violations, []);
});

test('buildThemeFontAllowlist loads KS forge-theme.css primaries', () => {
  const allowlist = buildThemeFontAllowlist(KS_ROOT);
  assert.ok(allowlist.union.size > 4);
  assert.ok(allowlist.display.has('proxima nova black') || allowlist.display.has('proxima nova'));
  assert.ok(allowlist.body.has('open sans'));
});

test('isObservedFontAllowed respects role-specific allowlist', () => {
  const allowlist = buildThemeFontAllowlistFromCssText(readFixture('ks-theme-tokens.css'));
  assert.equal(isObservedFontAllowed('"Open Sans", sans-serif', allowlist, 'body'), true);
  assert.equal(isObservedFontAllowed('"Comic Sans MS", cursive', allowlist, 'body'), false);
  assert.equal(isObservedFontAllowed('"Courier New", monospace', allowlist, 'mono'), true);
});

test('findingsFromFontStackReport maps violations with role and score fields', () => {
  const findings = findingsFromFontStackReport({
    violations: [
      {
        role: 'heading',
        expectedRole: 'display',
        selector: 'h1.drift-title',
        observed: 'comic sans ms',
        path: 'css/feature.css',
      },
    ],
  }, 'https://example.test/page');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
  assert.equal(findings[0].area, 'readability');
  assert.ok(findings[0].message.includes('comic sans ms'));
  assert.ok(findings[0].evidence.includes('font_stack_drift'));
  assert.ok(findings[0].evidence.includes('expectedRole=display'));
  assert.ok(findings[0].evidence.includes('role=heading'));
  assert.ok(findings[0].remediation.includes('var(--font-display)'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/page'));
});

test('themeVarHint maps roles to CSS variables', () => {
  assert.equal(themeVarHint('display'), 'var(--font-display)');
  assert.equal(themeVarHint('mono'), 'var(--font-mono)');
  assert.equal(themeVarHint('label'), 'var(--font-label)');
  assert.equal(themeVarHint('body'), 'var(--bs-body-font-family)');
});

test('run returns empty without metrics or repo violations', async () => {
  assert.deepEqual(await run({ metrics: {}, url: 'https://example.test/' }), []);
});

test('run uses metrics.fontStackReport when provided', async () => {
  const findings = await run({
    metrics: {
      fontStackReport: {
        violations: [
          {
            role: 'body',
            expectedRole: 'body',
            selector: 'p',
            observed: 'georgia',
          },
        ],
      },
    },
    url: 'https://example.test/',
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].evidence.includes('observed="georgia"'));
});
