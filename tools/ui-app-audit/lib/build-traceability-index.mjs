import fs from 'node:fs/promises';
import path from 'node:path';

import { gitHead } from './git-head.mjs';
import { loadSmokePlan } from './smoke-plan.mjs';
import { parseAutomationContractTable } from './parse-contract-md.mjs';

const HASH_RE = /^[A-Za-z]{3}$/;
const ID_ATTR_RE = /\bid=["']([a-zA-Z][\w-]*)["']/g;

/**
 * @param {string} ksRepo
 */
export async function parseKsReactPrimitives(ksRepo) {
  const tsPath = path.join(ksRepo, 'react', 'ksVisualAttrs.ts');
  const text = await fs.readFile(tsPath, 'utf8');
  /** @type {Record<string, { hash: string, name: string, tsx: string }>} */
  const map = {};
  const block = text.match(/export const KS_REACT_PRIMITIVE = \{([\s\S]*?)\} as const/);
  if (!block) return map;
  const entryRe = /(\w+):\s*\{\s*hash:\s*'([^']+)',\s*name:\s*'([^']+)'/g;
  let m;
  while ((m = entryRe.exec(block[1])) !== null) {
    const componentKey = m[1];
    const hash = m[2];
    const name = m[3];
    const tsx = path.join('react', `${componentKey}.tsx`);
    map[hash] = { hash, name, componentKey, tsx };
    map[componentKey] = { hash, name, componentKey, tsx };
  }
  return map;
}

/**
 * @param {string} appRepo
 * @param {number} cap
 */
export async function grepStableIds(appRepo, cap = 200) {
  const staticRoot = path.join(appRepo, 'forge_accessibility', 'static');
  /** @type {Set<string>} */
  const ids = new Set();

  async function walk(dir) {
    if (ids.size >= cap) return;
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (ids.size >= cap) return;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules' || ent.name === 'vendor') continue;
        await walk(full);
      } else if (/\.(html|js|mjs)$/i.test(ent.name)) {
        const text = await fs.readFile(full, 'utf8');
        let m;
        while ((m = ID_ATTR_RE.exec(text)) !== null) {
          const id = m[1];
          if (id.length > 2 && (id.includes('-') || id.endsWith('heading') || id.endsWith('section'))) {
            ids.add(id);
          }
        }
      }
    }
  }

  await walk(staticRoot);
  return [...ids].slice(0, cap);
}

/**
 * @param {string} registryPath
 */
async function loadRegistry(registryPath) {
  try {
    const raw = JSON.parse(await fs.readFile(registryPath, 'utf8'));
    return raw.rows || raw.entries || [];
  } catch {
    return [];
  }
}

/**
 * @param {{
 *   appRepo: string,
 *   ksRepo: string,
 *   smokePlanPath: string,
 *   contractMdPath?: string,
 *   appRepoName?: string,
 * }} opts
 */
export async function buildTraceabilityIndex(opts) {
  const appRepo = path.resolve(opts.appRepo);
  const ksRepo = path.resolve(opts.ksRepo);
  const appRepoName = opts.appRepoName || path.basename(appRepo);

  const plan = await loadSmokePlan(opts.smokePlanPath);
  const reactMap = await parseKsReactPrimitives(ksRepo);
  const stableIds = await grepStableIds(appRepo);

  const registryPath = path.join(ksRepo, 'docs/design/catalog/visual-registry.generated.json');
  const registryRows = await loadRegistry(registryPath);

  /** @type {Map<string, object>} */
  const entries = new Map();

  const addEntry = (id, partial) => {
    if (!entries.has(id)) {
      entries.set(id, {
        id,
        dom: {},
        scenarioIds: [],
        sources: [],
        docs: [],
      });
    }
    const e = entries.get(id);
    Object.assign(e.dom, partial.dom || {});
    if (partial.scenarioIds) {
      e.scenarioIds = [...new Set([...e.scenarioIds, ...partial.scenarioIds])];
    }
    if (partial.sources) {
      for (const s of partial.sources) {
        if (!e.sources.some((x) => x.path === s.path && x.role === s.role)) {
          e.sources.push(s);
        }
      }
    }
    if (partial.docs) {
      e.docs = [...new Set([...e.docs, ...partial.docs])];
    }
  };

  for (const scenario of plan.scenarios) {
    const tid = `a11y.studio.${scenario.scenarioId}`;
    const sources = (scenario.ownership || []).map((o) => ({
      repo: o.repo || appRepoName,
      path: o.path,
      role: o.role || 'implementation',
    }));
    const selectors = [];
    if (scenario.ready) selectors.push(scenario.ready);
    for (const s of scenario.ready_selectors || []) selectors.push(s);

    addEntry(tid, {
      dom: { selectors },
      scenarioIds: [scenario.scenarioId],
      sources,
      docs: scenario.doc_anchor
        ? [`docs/studio-functionality.md#${scenario.doc_anchor}`]
        : [],
    });

    for (const sel of selectors) {
      const m = sel.match(/#([\w-]+)/);
      if (m) {
        addEntry(`a11y.studio.selector.${m[1]}`, {
          dom: { selectors: [`#${m[1]}`] },
          scenarioIds: [scenario.scenarioId],
          sources,
        });
      }
    }
  }

  for (const row of registryRows) {
    const hash = row.hash || row.id;
    if (!hash || !HASH_RE.test(hash)) continue;
    const sources = (row.source_paths || row.sourcePaths || []).map((p) => ({
      repo: 'forgesdlc-kitchensink',
      path: p.replace(/^\//, ''),
      role: 'registry',
    }));
    const contract = row.contract_path || row.contractPath;
    if (contract) {
      sources.push({
        repo: 'forgesdlc-kitchensink',
        path: contract.replace(/^\//, ''),
        role: 'contract',
      });
    }
    addEntry(`ks.hash.${hash}`, {
      dom: { ksHash: hash, ksName: row.name || row.slug || null },
      sources,
      docs: contract ? [contract] : [],
    });
  }

  for (const [key, info] of Object.entries(reactMap)) {
    if (!info.hash) continue;
    if (key === info.hash || key === info.componentKey) {
      addEntry(`ks.react.${info.hash}`, {
        dom: { ksHash: info.hash, ksName: info.name },
        sources: [
          { repo: 'forgesdlc-kitchensink', path: info.tsx, role: 'canonical' },
          {
            repo: appRepoName,
            path: `forge_accessibility/static/`,
            role: 'consumer-static',
          },
        ],
      });
    }
  }

  for (const id of stableIds) {
    if (entries.has(`a11y.studio.selector.${id}`)) continue;
    addEntry(`a11y.studio.selector.${id}`, {
      dom: { selectors: [`#${id}`] },
      sources: [{ repo: appRepoName, path: 'forge_accessibility/static/', role: 'grep-id' }],
    });
  }

  if (opts.contractMdPath) {
    const md = await fs.readFile(opts.contractMdPath, 'utf8');
    const rows = parseAutomationContractTable(md);
    for (const row of rows) {
      if (!row.scenarioId) continue;
      const tid = `a11y.studio.${row.scenarioId}`;
      addEntry(tid, {
        docs: [`docs/studio-functionality.md#${row.docAnchor}`],
        scenarioIds: [row.scenarioId],
      });
    }
  }

  const entryList = [...entries.values()].sort((a, b) => a.id.localeCompare(b.id));

  /** @type {Record<string, string>} */
  const bySelector = {};
  /** @type {Record<string, string>} */
  const byKsHash = {};
  /** @type {Record<string, string>} */
  const byScenarioId = {};

  for (const e of entryList) {
    if (e.dom?.ksHash) byKsHash[e.dom.ksHash] = e.id;
    for (const sel of e.dom?.selectors || []) {
      bySelector[sel] = e.id;
      const m = sel.match(/#([\w-]+)/);
      if (m) bySelector[`#${m[1]}`] = e.id;
    }
  }
  for (const e of entryList) {
    for (const sid of e.scenarioIds || []) {
      if (e.id === `a11y.studio.${sid}`) {
        byScenarioId[sid] = e.id;
      } else if (!byScenarioId[sid]) {
        byScenarioId[sid] = e.id;
      }
    }
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    meta: {
      appRepo,
      ksRepo,
      smokePlanPath: opts.smokePlanPath,
      repos: {
        [appRepoName]: { gitHead: gitHead(appRepo) },
        'forgesdlc-kitchensink': { gitHead: gitHead(ksRepo) },
      },
    },
    entries: entryList,
    bySelector,
    byKsHash,
    byScenarioId,
  };
}
