import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildThemeHexAllowlist,
  findingsFromTokenDriftReport,
  hexLiteralsInValue,
  isHexInVarFallback,
  isSanctionedHexUsage,
  isTokenDriftPolicyEnabled,
  normalizeHex,
  run,
  scanCssTextForTokenDrift,
} from '../design-rules/deterministic/generated/det-token-no-drift.check.js';

test('normalizeHex expands 3-digit and lowercases hex', () => {
  assert.equal(normalizeHex('#ABC'), '#aabbcc');
  assert.equal(normalizeHex('#06B6D4'), '#06b6d4');
});

test('isHexInVarFallback detects fallback literals', () => {
  const value = 'var(--forge-cyan, #06b6d4)';
  const idx = value.indexOf('#06b6d4');
  assert.equal(isHexInVarFallback(value, idx), true);
  assert.equal(isHexInVarFallback('color: #86efac', 7), false);
});

test('isSanctionedHexUsage allows theme packs, local tokens, var fallbacks, and allowlist', () => {
  assert.equal(isSanctionedHexUsage({
    prop: 'color',
    value: '#86efac',
    hex: '#86efac',
    hexIndex: 0,
    inThemePack: true,
    allowlist: new Set(),
  }), true);

  assert.equal(isSanctionedHexUsage({
    prop: '--ks-accent',
    value: '#123456',
    hex: '#123456',
    hexIndex: 0,
    inThemePack: false,
    allowlist: new Set(),
  }), true);

  assert.equal(isSanctionedHexUsage({
    prop: 'color',
    value: 'var(--forge-text, #f1f5f9)',
    hex: '#f1f5f9',
    hexIndex: 'var(--forge-text, #f1f5f9)'.indexOf('#f1f5f9'),
    inThemePack: false,
    allowlist: new Set(),
  }), true);

  assert.equal(isSanctionedHexUsage({
    prop: 'color',
    value: '#86efac',
    hex: '#86efac',
    hexIndex: 0,
    inThemePack: false,
    allowlist: new Set(['#86efac']),
  }), true);
});

test('scanCssTextForTokenDrift flags raw hex but not var() fallbacks', () => {
  const css = `
    .status-ok {
      color: var(--forge-text, #e5e7eb);
    }
    .status-bad {
      color: #86efac;
    }
    .token-def {
      --ks-accent: #123456;
    }
  `;
  const allowlist = new Set(['#e5e7eb']);
  const violations = scanCssTextForTokenDrift(css, 'css/feature.css', allowlist);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].selector, '.status-bad');
  assert.equal(violations[0].hex, '#86efac');
});

test('scanCssTextForTokenDrift skips theme pack files', () => {
  const css = `
    :root {
      --forge-cyan: #06B6D4;
      color: #ffffff;
    }
  `;
  const violations = scanCssTextForTokenDrift(css, 'css/forge-theme.css', new Set());
  assert.equal(violations.length, 0);
});

test('findingsFromTokenDriftReport maps violations to findings', () => {
  const findings = findingsFromTokenDriftReport({
    violations: [
      {
        kind: 'raw-hex',
        path: 'css/forge-react-primitives.css',
        selector: '.le-badge--success',
        property: 'color',
        hex: '#86efac',
      },
    ],
  }, 'https://example.test/primitives');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'warn');
  assert.ok(findings[0].message.includes('#86efac'));
  assert.ok(findings[0].evidence.includes('raw_hex_outside_allowlist'));
  assert.ok(findings[0].evidence.includes('url=https://example.test/primitives'));
});

test('isTokenDriftPolicyEnabled respects explicit disable and css dir presence', () => {
  assert.equal(isTokenDriftPolicyEnabled({ tokenNoDriftPolicy: false }, {}, '/tmp'), false);
  assert.equal(isTokenDriftPolicyEnabled({ tokenNoDriftPolicy: true }, {}, ''), true);
  assert.equal(
    isTokenDriftPolicyEnabled({}, {}, '/home/lzvyahin/Code/forgesdlc-kitchensink'),
    true,
  );
});

test('buildThemeHexAllowlist loads kitchensink theme tokens', () => {
  const allow = buildThemeHexAllowlist('/home/lzvyahin/Code/forgesdlc-kitchensink');
  assert.ok(allow.size > 10);
  assert.ok(allow.has('#06b6d4'));
});

test('run returns empty without policy or repo css', async () => {
  assert.deepEqual(await run({ metrics: {}, url: 'https://example.test/' }), []);
});

test('run uses metrics.tokenDriftReport when provided', async () => {
  const findings = await run({
    metrics: {
      url: 'https://example.test/page',
      tokenNoDriftPolicy: true,
      tokenDriftReport: {
        violations: [
          {
            kind: 'inline-raw-hex',
            selectorHint: 'div.hero',
            property: 'color',
            hex: '#112233',
          },
        ],
      },
    },
    url: 'https://example.test/page',
    ctx: { tokenNoDriftPolicy: true },
  });
  assert.equal(findings.length, 1);
  assert.ok(findings[0].remediation.includes('var(--forge'));
});

test('hexLiteralsInValue finds multiple gradient stops', () => {
  const literals = hexLiteralsInValue('linear-gradient(135deg, #22d3ee, #06b6d4)');
  assert.equal(literals.length, 2);
  assert.equal(literals[0].hex, '#22d3ee');
});
