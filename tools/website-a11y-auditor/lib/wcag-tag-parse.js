/**
 * Parse Deque axe-core wcagNNN tags into WCAG success criterion ids (e.g. wcag143 → 1.4.3).
 */

const WCAG_LEVEL_TAGS = new Set([
  'wcag2a',
  'wcag2aa',
  'wcag2aaa',
  'wcag21a',
  'wcag21aa',
  'wcag21aaa',
  'wcag22a',
  'wcag22aa',
  'wcag22aaa',
]);

/**
 * @param {string} tag
 * @returns {string | null}
 */
export function parseWcagCriterionFromAxeTag(tag) {
  const t = String(tag || '').trim().toLowerCase();
  if (!t.startsWith('wcag') || WCAG_LEVEL_TAGS.has(t)) return null;
  const rest = t.slice(4);
  if (!/^\d+$/.test(rest)) return null;

  if (rest.length === 3) {
    return `${rest[0]}.${rest[1]}.${rest[2]}`;
  }

  if (rest.length === 4) {
    return `${rest[0]}.${rest[1]}.${rest.slice(2)}`;
  }

  return null;
}

/**
 * @param {string[]} tags
 * @returns {string[]}
 */
export function wcagCriteriaFromAxeTags(tags) {
  const out = new Set();
  for (const tag of tags || []) {
    const sc = parseWcagCriterionFromAxeTag(tag);
    if (sc) out.add(sc);
  }
  return [...out].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

/**
 * @param {string[]} ruleTags
 * @param {string[]} profileAxeTags
 */
export function axeRuleEligibleForProfile(ruleTags, profileAxeTags) {
  const profileSet = new Set(profileAxeTags || []);
  return (ruleTags || []).some((t) => profileSet.has(String(t).trim()));
}
