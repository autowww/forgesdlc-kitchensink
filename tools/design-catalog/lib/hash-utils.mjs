/**
 * Visual hash rules: /^[A-Za-z]{3}$/, three distinct letters unless waived in registry.
 */

export const HASH_RE = /^[A-Za-z]{3}$/;

export function isValidHashFormat(hash) {
  return typeof hash === 'string' && HASH_RE.test(hash);
}

export function lettersDistinct(hash) {
  if (!isValidHashFormat(hash)) return false;
  const a = hash[0];
  const b = hash[1];
  const c = hash[2];
  return a !== b && a !== c && b !== c;
}
