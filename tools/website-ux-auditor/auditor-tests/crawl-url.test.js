import assert from 'node:assert/strict';
import test from 'node:test';

import { isCrawlableUrl, normalizeCrawlHref } from '../lib/crawl.js';

test('normalizeCrawlHref strips hash', () => {
  assert.equal(normalizeCrawlHref('https://example.com/a#x'), 'https://example.com/a');
});
test('isCrawlableUrl allows same-origin HTML paths', () => {
  const o = 'https://example.com';
  assert.equal(isCrawlableUrl('https://example.com/', o), true);
  assert.equal(isCrawlableUrl('https://example.com/docs/a', o), true);
});

test('isCrawlableUrl rejects other origins and static assets', () => {
  const o = 'https://example.com';
  assert.equal(isCrawlableUrl('https://other.test/', o), false);
  assert.equal(isCrawlableUrl('https://example.com/x.png', o), false);
  assert.equal(isCrawlableUrl('https://example.com/app.js', o), false);
});
