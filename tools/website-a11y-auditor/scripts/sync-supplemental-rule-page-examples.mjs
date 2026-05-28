#!/usr/bin/env node
/**
 * Sync Before/After HTML fences in supplemental DET rule pages from harness fixtures.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KS = path.resolve(__dirname, '../../..');
const RULE_PAGES = path.join(KS, 'docs/design/a11y-audit/rule-pages');
const FIXTURES = path.join(KS, 'tools/website-a11y-auditor/auditor-tests/fixtures');

const RULES = [
  ['DET.A11Y.GENERIC.GLOSSARY_ABBR', 'det-a11y-generic-glossary-abbr', patchGlossaryAbbrHtml],
  ['DET.A11Y.GENERIC.ERROR_PREVENTION', 'det-a11y-generic-error-prevention', patchErrorPreventionHtml],
  ['DET.A11Y.GENERIC.READING_LEVEL_HEURISTIC', 'det-a11y-generic-reading-level-heuristic', patchReadingLevelHtml],
  ['DET.A11Y.GENERIC.DRAGGING_MOVEMENTS', 'det-a11y-generic-dragging-movements', patchDraggingMovementsHtml],
  ['DET.A11Y.GENERIC.REDUNDANT_ENTRY', 'det-a11y-generic-redundant-entry', patchRedundantEntryHtml],
  ['DET.A11Y.GENERIC.ACCESSIBLE_AUTHENTICATION', 'det-a11y-generic-accessible-authentication', patchAccessibleAuthHtml],
  ['DET.A11Y.GENERIC.RE_AUTHENTICATION', 'det-a11y-generic-re-authentication', patchReAuthenticationHtml],
  ['DET.A11Y.GENERIC.CONCURRENT_INPUT', 'det-a11y-generic-concurrent-input', patchConcurrentInputHtml],
];

function extractMain(html) {
  const m = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1].trim() : html;
}

function replaceSection(md, sectionTitle, newBody) {
  const re = new RegExp(
    `(## ${sectionTitle}\\s*\\n\\n)\`\`\`html\\s*\\n[\\s\\S]*?\`\`\``,
    'i',
  );
  if (!re.test(md)) throw new Error(`missing section ${sectionTitle}`);
  return md.replace(re, `$1\`\`\`html\n${newBody}\n\`\`\``);
}

async function main() {
  for (const [, kebab, patchFn] of RULES) {
    const failPath = path.join(FIXTURES, `${kebab}-fail.html`);
    const mdPath = path.join(RULE_PAGES, `${kebab}.md`);
    const failHtml = await fs.readFile(failPath, 'utf8');
    const before = extractMain(failHtml);
    const after = extractMain(patchFn(failHtml));
    let md = await fs.readFile(mdPath, 'utf8');
    md = replaceSection(md, 'Before example', before);
    md = replaceSection(md, 'After example', after);
    await fs.writeFile(mdPath, md, 'utf8');
    console.log('updated', path.basename(mdPath));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
