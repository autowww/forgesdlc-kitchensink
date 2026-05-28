import assert from 'node:assert/strict';
import test from 'node:test';

import {
  patchAccessibleAuthHtml,
  patchConcurrentInputHtml,
  patchDraggingMovementsHtml,
  patchErrorPreventionHtml,
  patchGlossaryAbbrHtml,
  patchReadingLevelHtml,
  patchRedundantEntryHtml,
  patchReAuthenticationHtml,
} from '../../website-ux-auditor/lib/ux-deterministic-fixers/fixers/patches/a11y-supplemental.mjs';

test('patchGlossaryAbbrHtml adds title on abbr', () => {
  const out = patchGlossaryAbbrHtml('<abbr>API</abbr>');
  assert.match(out, /title=/i);
});

test('patchErrorPreventionHtml injects confirm checkbox', () => {
  const html =
    '<form><p>payment card checkout purchase</p><button type="submit">Buy</button></form>';
  const out = patchErrorPreventionHtml(html);
  assert.match(out, /name=["']user_confirm["']/i);
});

test('patchReadingLevelHtml splits long paragraph', () => {
  const words = Array.from({ length: 100 }, (_, i) => `w${i}`).join(' ');
  const out = patchReadingLevelHtml(`<p>${words}</p>`);
  assert.ok((out.match(/<p\b/gi) || []).length >= 2);
});

test('patchDraggingMovementsHtml removes draggable', () => {
  const out = patchDraggingMovementsHtml('<div draggable="true">x</div>');
  assert.ok(!/draggable\s*=\s*["']true["']/i.test(out));
});

test('patchRedundantEntryHtml renames duplicate input names', () => {
  const html = '<input name="email" /><input name="email" />';
  const out = patchRedundantEntryHtml(html);
  assert.match(out, /name=["']email-2["']/i);
});

test('patchAccessibleAuthHtml adds one-time-code field', () => {
  const html = '<form><p>Sign in with password</p><button type="submit">Log in</button></form>';
  const out = patchAccessibleAuthHtml(html);
  assert.match(out, /one-time-code/i);
});

test('patchReAuthenticationHtml clears session-expired copy', () => {
  const html = '<form><p>session expired log in again</p><input type="password" /></form>';
  const out = patchReAuthenticationHtml(html);
  assert.ok(!/session expired/i.test(out));
});

test('patchConcurrentInputHtml unblocks input', () => {
  const html = '<input inputmode="none" readonly aria-disabled="true" />';
  const out = patchConcurrentInputHtml(html);
  assert.ok(!/inputmode\s*=\s*["']none["']/i.test(out));
});
