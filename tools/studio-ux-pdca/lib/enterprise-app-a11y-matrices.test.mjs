#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const matricesPath = join(__dirname, 'enterprise-app-a11y-matrices.json');

test('enterprise app a11y matrices schema', () => {
  const data = JSON.parse(readFileSync(matricesPath, 'utf8'));
  assert.equal(data.version, 1);
  assert.ok(Array.isArray(data.matrices));
  assert.ok(data.matrices.length >= 18);

  const hashes = new Set();
  for (const row of data.matrices) {
    assert.match(row.hash, /^[A-Za-z]{3}$/, `invalid hash ${row.hash}`);
    assert.equal(new Set(row.hash).size, 3, `hash must use three distinct letters: ${row.hash}`);
    assert.ok(!hashes.has(row.hash), `duplicate hash ${row.hash}`);
    hashes.add(row.hash);

    assert.ok(typeof row.name === 'string' && row.name.length > 0);
    assert.ok(Array.isArray(row.required_states) && row.required_states.length > 0);
    assert.ok(typeof row.keyboard === 'string' && row.keyboard.length > 0);
    assert.ok(typeof row.screen_reader === 'string' && row.screen_reader.length > 0);
    assert.ok(typeof row.reduced_motion === 'string' && row.reduced_motion.length > 0);
  }

  for (const required of ['Fpw', 'Fix', 'Fai', 'Fes']) {
    assert.ok(hashes.has(required), `missing required hash ${required}`);
  }
});
