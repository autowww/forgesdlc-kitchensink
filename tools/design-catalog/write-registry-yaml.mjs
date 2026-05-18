#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { entries } from './registry-data.mjs';
import { normalizeRegistryForJson } from './lib/parse-registry.mjs';

const repo = path.resolve(import.meta.dirname, '../..');
const catalog = path.join(repo, 'docs/design/catalog');
const yamlPath = path.join(catalog, 'visual-registry.yaml');
const jsonPath = path.join(catalog, 'visual-registry.generated.json');

fs.mkdirSync(catalog, { recursive: true });
fs.writeFileSync(yamlPath, YAML.stringify({ entries }, { lineWidth: 120, sortMapEntries: false }), 'utf8');
const normalized = normalizeRegistryForJson(repo, entries);
fs.writeFileSync(jsonPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
console.log(`Wrote ${path.relative(repo, yamlPath)} and ${path.relative(repo, jsonPath)} (${entries.length} entries)`);
