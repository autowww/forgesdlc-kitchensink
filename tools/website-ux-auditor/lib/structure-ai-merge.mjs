/**
 * Optional AI structure sidecar (ai-structure/structure-patches.json).
 * Never overwrites deterministic KS fields.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * @param {string} outDir
 * @param {object} structure
 */
export async function mergeStructureAiSidecar(outDir, structure) {
  const sidecarPath = path.join(outDir, 'ai-structure', 'structure-patches.json');
  let patches;
  try {
    patches = JSON.parse(await fs.readFile(sidecarPath, 'utf8'));
  } catch {
    return structure;
  }
  if (!patches?.pages || !Array.isArray(patches.pages)) return structure;

  const byUrl = new Map((structure.pages || []).map((p) => [p.url, p]));
  for (const patch of patches.pages) {
    const url = patch?.url;
    if (!url || !byUrl.has(url)) continue;
    const page = byUrl.get(url);
    if (patch.pageType && page.pageType?.confidence !== 'deterministic') {
      page.pageType = { ...patch.pageType, confidence: 'ai' };
    }
    if (patch.layout && page.layout && !page.layout.hash) {
      page.layout = { ...page.layout, ...patch.layout, confidence: 'ai' };
    }
    if (Array.isArray(patch.instances)) {
      for (const inst of patch.instances) {
        if (inst.confidence === 'ai') {
          page.instances = page.instances || [];
          page.instances.push(inst);
        }
      }
    }
  }
  return structure;
}

/**
 * Write a template sidecar when FORGE_UX_STRUCTURE_AI=1 (operator runs agent separately).
 * @param {string} outDir
 * @param {object} structure
 */
export async function writeStructureAiTemplate(outDir, structure) {
  if (process.env.FORGE_UX_STRUCTURE_AI !== '1') return;
  const dir = path.join(outDir, 'ai-structure');
  await fs.mkdir(dir, { recursive: true });
  const template = {
    note: 'Populate pageType/layout/instances with confidence ai; deterministic KS fields are ignored on merge.',
    pages: (structure.pages || []).slice(0, 20).map((p) => ({
      url: p.url,
      pageType: null,
      layout: null,
      instances: [],
    })),
  };
  await fs.writeFile(path.join(dir, 'structure-patches.json'), `${JSON.stringify(template, null, 2)}\n`);
}
