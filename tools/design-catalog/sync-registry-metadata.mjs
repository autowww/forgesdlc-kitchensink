#!/usr/bin/env node
/**
 * Ensure visual-registry.yaml rows include category and emits_html (phase-03 catalog completeness).
 * Run from repo root: node tools/design-catalog/sync-registry-metadata.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(__dirname, '../..');
const yamlPath = path.join(repo, 'docs/design/catalog/visual-registry.yaml');

/** Stable taxonomy aligned with registry `type` (extend when adding types). */
const CATEGORY_BY_TYPE = {
  layout: 'layout',
  page: 'page',
  'layout-preview': 'layout-preview',
  'chrome-region': 'chrome-region',
  'react-primitive': 'react-primitive',
  'primitive-family': 'primitive-family',
  'style-family': 'stylesheet-family',
  'visual-style': 'stylesheet',
  'script-family': 'interaction-family',
  'interaction-script': 'interaction',
  'diagram-family': 'diagram-family',
  'diagram-asset-group': 'diagram',
  'python-renderer-family': 'python-renderer-family',
  'python-component-module': 'python-renderer',
  'docs-family': 'design-documentation',
  'showcase-app-family': 'showcase-app',
  'desktop-interface': 'desktop-interface',
  'museum-chrome-asset': 'desktop-chrome-asset',
  'library-consumer': 'library-consumer',
};

/** Types that do not describe a single emitted HTML/SVG root (families, stylesheets, scripts). */
const EMITS_HTML_FALSE = new Set([
  'primitive-family',
  'style-family',
  'script-family',
  'diagram-family',
  'python-renderer-family',
  'docs-family',
  'showcase-app-family',
  'visual-style',
  'interaction-script',
]);

function emitsHtmlForType(type) {
  return !EMITS_HTML_FALSE.has(type);
}

const raw = fs.readFileSync(yamlPath, 'utf8');
const doc = YAML.parse(raw);
let changes = 0;
for (const e of doc.entries || []) {
  const typ = e.type || 'unset';
  const wantCat = CATEGORY_BY_TYPE[typ] ?? typ;
  if (!e.category || String(e.category).trim() === '') {
    e.category = wantCat;
    changes++;
  } else if (e.category !== wantCat) {
    // Keep authored category when present (e.g. legacy rows); only fill empties.
  }
  const wantEh = emitsHtmlForType(typ);
  if (e.emits_html !== wantEh) {
    e.emits_html = wantEh;
    changes++;
  }
}
fs.writeFileSync(yamlPath, YAML.stringify(doc, { lineWidth: 120, sortMapEntries: false }), 'utf8');
console.log(`sync-registry-metadata: wrote ${path.relative(repo, yamlPath)} (${doc.entries.length} entries, ${changes} field updates).`);
