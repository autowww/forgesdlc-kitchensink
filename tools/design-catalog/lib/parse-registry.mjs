/**
 * Parse visual-registry.yaml into normalized entries for auditor/scorer/design-catalog checks.
 */

import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export function loadRegistry(registryPath) {
  const raw = fs.readFileSync(registryPath, 'utf8');
  const doc = YAML.parse(raw);
  const entries = Array.isArray(doc?.entries) ? doc.entries : [];
  return { entries, rawDoc: doc };
}

export function entryByHash(entries) {
  const map = new Map();
  for (const e of entries) {
    if (e?.hash) map.set(e.hash, e);
  }
  return map;
}

export function normalizeRegistryForJson(repoRoot, entries) {
  return {
    schemaVersion: 1,
    repoRoot: path.resolve(repoRoot),
    entries: entries.map((e) => ({
      hash: e.hash,
      name: e.name,
      slug: e.slug,
      type: e.type,
      category: e.category ?? null,
      family: e.family ?? null,
      status: e.status,
      emits_html: typeof e.emits_html === 'boolean' ? e.emits_html : null,
      source_paths: e.source_paths ?? [],
      source_symbols: e.source_symbols ?? [],
      root_selector: e.root_selector ?? null,
      contract: e.contract ?? null,
      /** Same as `contract`; emitted for checklist parity with docs that ask for `contract_path`. */
      contract_path: e.contract ?? null,
      contract_status: e.contract_status,
      showcase_url: e.showcase_url ?? null,
      screenshot_url: e.screenshot_url ?? null,
      screenshot_status: e.screenshot_status ?? null,
      screenshot_reason: e.screenshot_reason ?? null,
      aliases: e.aliases ?? [],
      parent_hash: e.parent_hash ?? null,
      child_hashes: e.child_hashes ?? [],
      design_standard_refs: e.design_standard_refs ?? [],
      accessibility_notes: e.accessibility_notes ?? null,
      responsive_notes: e.responsive_notes ?? null,
      owner: e.owner ?? null,
      last_reviewed: e.last_reviewed ?? null,
      notes: e.notes ?? null,
      hash_exception_reason: e.hash_exception_reason ?? null,
      emit_marker_in_showcase: e.emit_marker_in_showcase === true,
    })),
  };
}
