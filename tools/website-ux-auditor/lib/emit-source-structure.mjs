/**
 * Orchestrate source-structure.json + traceability for audit/scorer outputs.
 */

import { buildWebsiteTraceabilityIndex, mergeTraceabilityIntoCatalog, writeTraceabilityIndex } from './build-website-traceability.mjs';
import { buildSourceStructure, writeSourceStructureArtifacts } from './source-structure.js';
import { computeStructureScores } from './structure-ux-score.js';
import { mergeStructureAiSidecar, writeStructureAiTemplate } from './structure-ai-merge.mjs';

/**
 * @param {{
 *   outDir: string,
 *   repoRoot: string,
 *   siteUrl: string,
 *   siteKind: string,
 *   pages: Array<object>,
 *   crawlSummary?: object,
 *   inventory?: object,
 *   visitedUrls?: string[],
 *   parentByUrl?: Record<string, string>,
 * }} opts
 */
export async function emitSourceStructureBundle(opts) {
  const origin = (() => {
    try {
      return new URL(opts.siteUrl || '').origin;
    } catch {
      return '';
    }
  })();

  let structure = buildSourceStructure(opts.pages || [], {
    origin,
    siteKind: opts.siteKind || 'generic',
    crawlSummary: opts.crawlSummary || null,
  }, {
    visitedOrder: opts.visitedUrls || [],
    parentByUrl: opts.parentByUrl || {},
  });

  let traceability = null;
  try {
    traceability = await buildWebsiteTraceabilityIndex({
      websiteRepo: opts.repoRoot,
      inventory: opts.inventory || null,
    });
    await writeTraceabilityIndex(opts.outDir, traceability);
    structure.principalCatalog = mergeTraceabilityIntoCatalog(structure.principalCatalog, traceability);
  } catch {
    /* traceability optional */
  }

  structure = await mergeStructureAiSidecar(opts.outDir, structure);

  const structureScores = computeStructureScores(opts.pages || []);
  await writeSourceStructureArtifacts(opts.outDir, structure);
  await writeStructureAiTemplate(opts.outDir, structure);

  return { sourceStructure: structure, structureScores, traceability };
}
