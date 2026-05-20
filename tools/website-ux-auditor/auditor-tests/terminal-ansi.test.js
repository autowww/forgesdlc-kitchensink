import assert from 'node:assert/strict';
import test from 'node:test';

import { clipPadAnsi, clipPadVisible, formatRulesetHeading, stripAnsi, visibleLength } from '../lib/terminal-ansi.js';

test('stripAnsi removes SGR codes', () => {
  assert.equal(stripAnsi('\x1b[32mok\x1b[0m'), 'ok');
});

test('visibleLength matches stripped length', () => {
  assert.equal(visibleLength('\x1b[31mabc\x1b[0m'), 3);
});

test('clipPadVisible truncates on visible width', () => {
  assert.equal(clipPadVisible('\x1b[32mhello\x1b[0m world', 8), 'hello w…');
});

test('clipPadAnsi preserves SGR codes when clipping', () => {
  const s = '\x1b[31m█\x1b[0m Maj+  \x1b[33m█\x1b[0m min';
  const clipped = clipPadAnsi(s, 12);
  assert.ok(clipped.includes('\x1b[31m'));
  assert.ok(clipped.includes('\x1b[33m'));
  assert.equal(stripAnsi(clipped).length, 12);
});

test('formatRulesetHeading right-aligns and pulses active label', () => {
  const inactive = formatRulesetHeading('accessibility', 16, { active: false, tick: 0 });
  assert.ok(inactive.includes('accessibility'));
  assert.match(inactive, /^\x1b\[2m/);
  const bright = formatRulesetHeading('accessibility', 16, { active: true, tick: 9 });
  const dim = formatRulesetHeading('accessibility', 16, { active: true, tick: 0 });
  assert.ok(bright.includes('\x1b[97m'));
  assert.ok(dim.includes('\x1b[90m'));
  assert.equal(stripAnsi(bright).trimStart(), 'accessibility');
});
