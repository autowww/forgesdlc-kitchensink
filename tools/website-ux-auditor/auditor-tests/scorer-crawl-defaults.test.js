import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  DEFAULT_PAGE_CONCURRENCY,
  MAX_PAGE_CONCURRENCY,
} from '../lib/crawl.js';

const scoreMjs = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'score-website-ux.mjs');

test('crawl page concurrency exports', () => {
  assert.equal(DEFAULT_PAGE_CONCURRENCY, 1);
  assert.equal(MAX_PAGE_CONCURRENCY, 10);
});

test('score-website-ux.mjs documents scorer defaults (500 pages, 5 parallel)', () => {
  const text = readFileSync(scoreMjs, 'utf8');
  assert.match(text, /SCORER_DEFAULT_MAX_PAGES = 500/);
  assert.match(text, /SCORER_DEFAULT_PAGE_CONCURRENCY = 5/);
  assert.match(text, /SCORER_DEFAULT_MAX_LINK_DEPTH = null/);
  assert.match(text, /pageConcurrency: args\.pageConcurrency/);
});
