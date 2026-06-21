/**
 * Build source-structure.json v1 from crawl pages and IA parent links.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

export const SOURCE_STRUCTURE_SCHEMA_VERSION = 1;

const DEFAULT_MIN_SITE_REPEAT = 3;

/**
 * @param {string} childUrl
 * @param {string} parentUrl
 */
export function inferParentUrl(childUrl, parentUrl) {
  try {
    const child = new URL(childUrl);
    const parent = new URL(parentUrl);
    if (child.origin !== parent.origin) return null;
    const parentPath = parent.pathname.replace(/\/$/, '') || '/';
    const childPath = child.pathname.replace(/\/$/, '') || '/';
    if (childPath === parentPath) return null;
    if (childPath.startsWith(`${parentPath}/`) || (parentPath === '/' && childPath !== '/')) {
      return parent.href.replace(/#.*$/, '');
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * @param {Array<{ url: string, structure?: object }>} pages
 * @param {{ origin: string, siteKind: string, crawlSummary?: object, minSiteRepeat?: number }} siteMeta
 * @param {{ visitedOrder?: string[], parentByUrl?: Record<string, string> }} iaHints
 */
export function buildSourceStructure(pages, siteMeta, iaHints = {}) {
  const minRepeat = siteMeta.minSiteRepeat ?? DEFAULT_MIN_SITE_REPEAT;
  const pageCount = pages.filter((p) => p?.url && !p.error).length;

  /** @type {Map<string, { signatureId: string, hash: string | null, ksType: string | null, ksName: string | null, taxonomyLevel: string, urls: Set<string>, instanceCount: number }>} */
  const componentMap = new Map();
  /** @type {Map<string, { layoutId: string, pageTypes: Set<string>, urls: Set<string> }>} */
  const layoutMap = new Map();
  /** @type {Map<string, Set<string>>} */
  const pageTypeMap = new Map();

  /** @type {Array<object>} */
  const pageSnapshots = [];

  pages.forEach((page, pageIdx) => {
    const url = page?.url || '';
    if (!url || page.error) return;
    const structure = page.structure || {};
    const pageTypeId = structure.pageType?.id || 'generic';
    if (!pageTypeMap.has(pageTypeId)) pageTypeMap.set(pageTypeId, new Set());
    pageTypeMap.get(pageTypeId).add(url);

    const layoutId = structure.layout?.id || 'unknown';
    if (!layoutMap.has(layoutId)) {
      layoutMap.set(layoutId, { layoutId, pageTypes: new Set(), urls: new Set() });
    }
    const le = layoutMap.get(layoutId);
    le.pageTypes.add(pageTypeId);
    le.urls.add(url);

    const instances = structure.instances || [];
    for (const inst of instances) {
      const signatureId = inst.signatureId || 'unknown';
      if (!componentMap.has(signatureId)) {
        componentMap.set(signatureId, {
          signatureId,
          hash: inst.hash || null,
          ksType: inst.ksType || null,
          ksName: inst.ksName || null,
          taxonomyLevel: inst.taxonomyLevel || 'cards-surfaces',
          urls: new Set(),
          instanceCount: 0,
        });
      }
      const ce = componentMap.get(signatureId);
      ce.urls.add(url);
      ce.instanceCount += 1;
    }

    pageSnapshots.push({
      url,
      pageIdx,
      pageType: structure.pageType || { id: pageTypeId, confidence: 'heuristic' },
      layout: structure.layout || { id: layoutId },
      instances: (structure.instances || []).map((inst) => ({
        ...inst,
        nodeId: `pg${pageIdx}:${inst.nodeId || inst.signatureId}`,
      })),
    });
  });

  const principalComponents = [...componentMap.values()]
    .map((c) => {
      const pageSpread = c.urls.size;
      const principal =
        (c.hash && pageSpread >= 1) ||
        pageSpread >= minRepeat ||
        (pageCount > 0 && pageSpread / pageCount >= 0.1);
      return {
        signatureId: c.signatureId,
        hash: c.hash,
        ksType: c.ksType,
        ksName: c.ksName,
        taxonomyLevel: c.taxonomyLevel,
        pageCount: pageSpread,
        instanceCount: c.instanceCount,
        principal,
        sources: [],
      };
    })
    .sort((a, b) => b.pageCount - a.pageCount || b.instanceCount - a.instanceCount);

  const principalLayouts = [...layoutMap.values()]
    .map((l) => {
      const pageSpread = l.urls.size;
      const principal =
        l.pageTypes.size >= 2 || (pageCount > 0 && pageSpread / pageCount >= 0.1);
      return {
        layoutId: l.layoutId,
        pageTypeIds: [...l.pageTypes].sort(),
        pageCount: pageSpread,
        principal,
      };
    })
    .sort((a, b) => b.pageCount - a.pageCount);

  const pageTypes = [...pageTypeMap.entries()]
    .map(([id, urls]) => ({ id, pageCount: urls.size, principal: true }))
    .sort((a, b) => b.pageCount - a.pageCount);

  const visited = iaHints.visitedOrder || pages.map((p) => p.url).filter(Boolean);
  const parentByUrl = iaHints.parentByUrl || {};
  /** @type {Map<string, { url: string, depth: number, parentUrl: string | null, children: string[] }>} */
  const nodes = new Map();
  for (const url of visited) {
    if (!nodes.has(url)) {
      nodes.set(url, { url, depth: 0, parentUrl: parentByUrl[url] || null, children: [] });
    }
  }
  for (let i = 1; i < visited.length; i++) {
    const child = visited[i];
    const prev = visited[i - 1];
    if (!parentByUrl[child]) {
      const inferred = inferParentUrl(child, prev);
      if (inferred && nodes.has(inferred)) {
        parentByUrl[child] = inferred;
      }
    }
  }
  for (const [url, parent] of Object.entries(parentByUrl)) {
    if (!nodes.has(url)) nodes.set(url, { url, depth: 0, parentUrl: parent, children: [] });
    else nodes.get(url).parentUrl = parent;
  }
  for (const node of nodes.values()) {
    if (node.parentUrl && nodes.has(node.parentUrl)) {
      const p = nodes.get(node.parentUrl);
      if (!p.children.includes(node.url)) p.children.push(node.url);
    }
  }
  function depthOf(url, seen = new Set()) {
    if (seen.has(url)) return 0;
    seen.add(url);
    const n = nodes.get(url);
    if (!n?.parentUrl || !nodes.has(n.parentUrl)) return 0;
    return 1 + depthOf(n.parentUrl, seen);
  }
  const iaTree = [...nodes.values()]
    .map((n) => ({
      url: n.url,
      depth: depthOf(n.url),
      parentUrl: n.parentUrl,
      children: n.children.sort(),
    }))
    .sort((a, b) => a.depth - b.depth || a.url.localeCompare(b.url));

  return {
    schemaVersion: SOURCE_STRUCTURE_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    site: {
      origin: siteMeta.origin || '',
      siteKind: siteMeta.siteKind || 'generic',
      crawlSummary: siteMeta.crawlSummary || null,
      pageCount,
      minSiteRepeat: minRepeat,
    },
    iaTree,
    principalCatalog: {
      pageTypes,
      layouts: principalLayouts,
      components: principalComponents,
    },
    pages: pageSnapshots,
  };
}

/**
 * @param {string} outDir
 * @param {object} structure
 */
export async function writeSourceStructureArtifacts(outDir, structure) {
  const jsonPath = path.join(outDir, 'source-structure.json');
  await fs.writeFile(jsonPath, `${JSON.stringify(structure, null, 2)}\n`);
  const md = buildSourceStructureMarkdown(structure);
  await fs.writeFile(path.join(outDir, 'source-structure.md'), md);
  return { jsonPath };
}

/**
 * @param {object} structure
 */
export function buildSourceStructureMarkdown(structure) {
  const cat = structure.principalCatalog || {};
  const lines = [
    '# Source structure',
    '',
    `Generated: ${structure.generatedAt || ''}`,
    '',
    `**Pages analyzed:** ${structure.site?.pageCount ?? 0}`,
    '',
    '## Page types',
    '',
    '| Type | Pages |',
    '|------|-------|',
  ];
  for (const pt of cat.pageTypes || []) {
    lines.push(`| ${pt.id} | ${pt.pageCount} |`);
  }
  lines.push('', '## Principal layouts (top 15)', '', '| Layout | Pages | Page types |', '|--------|-------|------------|');
  for (const l of (cat.layouts || []).filter((x) => x.principal).slice(0, 15)) {
    lines.push(`| \`${l.layoutId}\` | ${l.pageCount} | ${(l.pageTypeIds || []).join(', ')} |`);
  }
  lines.push('', '## Principal components (top 20)', '', '| Signature | Hash | Pages | Instances |', '|-----------|------|-------|-----------|');
  for (const c of (cat.components || []).filter((x) => x.principal).slice(0, 20)) {
    lines.push(`| \`${c.signatureId}\` | ${c.hash || '—'} | ${c.pageCount} | ${c.instanceCount} |`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}
