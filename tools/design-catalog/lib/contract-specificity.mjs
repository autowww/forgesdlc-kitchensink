/**
 * Deterministic contract quality rules: generic "Expected look" detection,
 * thin state coverage notes, governance-heading hints, and cross-contract duplicate slabs.
 */

/** Lines that read like generic marketing boilerplate when repeated or used alone. */
const GENERIC_EXPECTED_LOOK_HINTS = [
  /clean and modern/i,
  /professional appearance/i,
  /looks professional/i,
  /visually appealing/i,
  /simple and intuitive/i,
  /great user experience/i,
  /enterprise[- ]grade look/i,
];

/** Repeated verbatim paragraph pasted across many KS contracts (phase 05 slab). */
const FORGE_CALM_ATMOSPHERE_SLAB =
  /Calm Forge enterprise atmosphere:\s*deep slate backgrounds/i;

const DUPLICATE_EXPECTED_LOOK_TYPES = new Set(['layout', 'page', 'chrome-region', 'layout-preview']);

/** Minimum normalized length to treat as duplicate slab (ignore short "Neutral." fixtures). */
const DUPLICATE_EXPECTED_LOOK_MIN_LEN = 90;

const STATEFUL_REGISTRY_TYPES = new Set(['layout', 'page', 'chrome-region', 'layout-preview']);

/**
 * @param {string} text full contract markdown
 * @returns {string} raw body under ## Expected look (may be empty)
 */
export function extractExpectedLookBody(text) {
  const secMatch = String(text || '').match(/^## Expected look\s*$([\s\S]*?)(?=^## |\Z)/m);
  return secMatch ? String(secMatch[1] || '').trim() : '';
}

/**
 * Normalize Expected look body for duplicate clustering.
 * @param {string} body
 */
export function normalizeExpectedLookBody(body) {
  return String(body || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Flag Expected look bodies duplicated across multiple contracts (same normalized text).
 * @param {{ relPath: string, registryTypes: string[], body: string }[]} fileSamples one row per contract file
 * @returns {string[]} error messages (repo-relative paths inside messages)
 */
export function analyzeDuplicateExpectedLookBodies(fileSamples) {
  /** @type {Map<string, string[]>} */
  const groups = new Map();
  for (const row of fileSamples) {
    const sensitive = (row.registryTypes || []).some((t) => DUPLICATE_EXPECTED_LOOK_TYPES.has(String(t)));
    if (!sensitive) continue;
    const norm = normalizeExpectedLookBody(row.body);
    if (norm.length < DUPLICATE_EXPECTED_LOOK_MIN_LEN) continue;
    const list = groups.get(norm) || [];
    list.push(row.relPath);
    groups.set(norm, list);
  }
  /** @type {string[]} */
  const errors = [];
  for (const rels of groups.values()) {
    if (rels.length < 2) continue;
    for (const rel of rels) {
      errors.push(
        `${rel}: Expected look duplicates ${rels.length - 1} other contract(s) — replace with element-specific anatomy/role guidance.`,
      );
    }
  }
  return errors;
}


/**
 * @param {string} text
 * @param {string} relPath repo-relative POSIX-ish path
 * @param {string} registryType registry entry type (may be empty)
 * @param {{ strictGovernanceHeadings?: boolean }} [opts]
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function analyzeContractSpecificity(text, relPath, registryType = '', opts = {}) {
  const strictGov = !!opts.strictGovernanceHeadings;
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];

  const rel = String(relPath || '').replace(/\\/g, '/');
  if (!rel.endsWith('.md')) return { errors, warnings };
  if (
    rel.endsWith('contract-template.md')
    || rel.endsWith('/ONTOLOGY.md')
    || rel.endsWith('/README.md')
    || rel.includes('/screenshots/')
  ) {
    return { errors, warnings };
  }

  const secMatch = text.match(/^## Expected look\s*$([\s\S]*?)(?=^## |\Z)/m);
  if (secMatch) {
    const body = String(secMatch[1] || '').trim();
    const wc = body ? body.split(/\s+/).filter(Boolean).length : 0;
    let genericHits = 0;
    for (const re of GENERIC_EXPECTED_LOOK_HINTS) {
      const m = body.match(re);
      if (m) genericHits += m.length;
    }
    if (wc > 0 && wc < 14 && genericHits >= 1) {
      errors.push(
        `${rel}: Expected look is thin (${wc} words) and relies on generic phrasing — make it element-specific per hash.`,
      );
    }
    if (genericHits >= 3 && wc < 40) {
      errors.push(`${rel}: Expected look stacks multiple generic stock phrases without concrete layout/anatomy cues.`);
    }
    if (DUPLICATE_EXPECTED_LOOK_TYPES.has(String(registryType || '')) && FORGE_CALM_ATMOSPHERE_SLAB.test(body)) {
      errors.push(
        `${rel}: Expected look uses duplicated Forge atmosphere slab — replace with hash-specific anatomy and visual role.`,
      );
    }
  }

  if (STATEFUL_REGISTRY_TYPES.has(String(registryType || ''))) {
    if (!/^## States\s*$/m.test(text)) {
      warnings.push(`${rel}: missing ## States section for a stateful catalog type (${registryType}).`);
    } else {
      const st = text.match(/^## States\s*$([\s\S]*?)(?=^## |\Z)/m);
      const blob = st ? String(st[1] || '') : '';
      const bullets = (blob.match(/^\s*-\s+/gm) || []).length;
      if (bullets < 2) {
        warnings.push(
          `${rel}: States section should enumerate multiple concrete states (found ${bullets} bullets; registry type ${registryType}).`,
        );
      }
    }

    const hasDeterministicHeading = /^#{2,3}[^\n]*\bdeterministic\b/im.test(text);
    const hasAiHeading =
      /^#{2,3}[^\n]*\bAI\b/im.test(text)
      || /^#{2,3}[^\n]*\bjudgment\b/im.test(text)
      || /^#{2,3}[^\n]*\bhuman review\b/im.test(text);
    if (strictGov && !hasDeterministicHeading) {
      warnings.push(
        `${rel}: missing a Deterministic checks/review heading — split repeatable signals from judgment-only review per KS governance.`,
      );
    }
    if (strictGov && !hasAiHeading) {
      warnings.push(
        `${rel}: missing an AI / judgment review heading — document model-review scope separately from deterministic gates.`,
      );
    }
  }

  return { errors, warnings };
}
