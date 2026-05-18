/**
 * Detect placeholder / template language in design contract Markdown.
 * Stub markers (TBD/TODO/FIXME) default to warnings unless strict mode.
 */

/**
 * @param {string} text
 * @param {string} relPath
 * @param {{ strict?: boolean }} opts
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function analyzeContractPlaceholders(text, relPath, opts = {}) {
  const strict = !!opts.strict;
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];

  if (!relPath.endsWith('.md')) return { errors, warnings };

  if (/lorem ipsum/i.test(text)) {
    errors.push(`${relPath}: placeholder language (lorem ipsum)`);
  }
  if (/\bexample-visual\b/i.test(text)) {
    errors.push(`${relPath}: template marker (example-visual)`);
  }
  if (/^#\s*XYZ\b/m.test(text)) {
    errors.push(`${relPath}: template heading still uses XYZ`);
  }
  if (/\[placeholder\]/i.test(text) || /<\s*insert\b/i.test(text)) {
    errors.push(`${relPath}: explicit placeholder insert marker`);
  }

  /** @type {string[]} */
  const stubs = [];
  if (/-\s*TBD\b/m.test(text)) stubs.push('TBD');
  if (/-\s*TODO\b/m.test(text)) stubs.push('TODO');
  if (/-\s*FIXME\b/m.test(text)) stubs.push('FIXME');
  if (stubs.length) {
    const kinds = [...new Set(stubs)].join(', ');
    const msg = `${relPath}: contract still uses stub bullets (${kinds})`;
    if (strict) errors.push(msg);
    else warnings.push(msg);
  }

  return { errors, warnings };
}
