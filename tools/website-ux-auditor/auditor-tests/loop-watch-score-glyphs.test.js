import assert from 'node:assert/strict';
import test from 'node:test';

import {
  parseUxScoreForGlyphs,
  renderLargeUxScoreGlyphs,
} from '../lib/loop-watch-score-glyphs.js';
import { stripAnsi } from '../lib/terminal-ansi.js';

test('parseUxScoreForGlyphs formats tens, ones, frac', () => {
  const p = parseUxScoreForGlyphs(85.25);
  assert.equal(p.tens, 8);
  assert.equal(p.ones, 5);
  assert.equal(p.frac, 3);
  const low = parseUxScoreForGlyphs(3.0);
  assert.equal(low.tens, null);
  assert.equal(low.ones, 3);
  assert.equal(low.frac, 0);
  assert.equal(low.display, '3.0');
});

test('renderLargeUxScoreGlyphs is 7 rows wide enough for two digits', () => {
  const art = renderLargeUxScoreGlyphs(91, { useColor: false });
  assert.equal(art.height, 7);
  assert.ok(art.width >= 14);
  const plain = art.lines.map(stripAnsi).join('\n');
  assert.ok(plain.includes('█'));
});
