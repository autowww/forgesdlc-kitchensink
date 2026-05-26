import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { setDocumentTitle, setMetaDescription, syncHashAttrsOnOpenTag } from './ops.mjs';

describe('ux-deterministic-fixers ops', () => {
  it('setDocumentTitle replaces existing title', () => {
    const html = '<html><head><title>index</title></head><body></body></html>';
    const out = setDocumentTitle(html, 'Product overview');
    assert.match(out, /<title>Product overview<\/title>/);
    assert.doesNotMatch(out, /index/);
  });

  it('setMetaDescription injects meta tag', () => {
    const html = '<html><head></head><body></body></html>';
    const out = setMetaDescription(html, 'Forge handbook page.');
    assert.match(out, /name="description" content="Forge handbook page\."/);
  });

  it('syncHashAttrsOnOpenTag aligns hash attributes', () => {
    const tag = '<div data-ks-hash="Abx" hash="Xyz">';
    const out = syncHashAttrsOnOpenTag(tag, 'Abx');
    assert.match(out, /hash="Abx"/);
    assert.match(out, /data-ks-hash="Abx"/);
  });
});
