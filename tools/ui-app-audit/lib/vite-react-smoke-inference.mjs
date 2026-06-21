import fs from 'node:fs/promises';
import path from 'node:path';

import yaml from 'js-yaml';

import { loadSmokePlan } from './smoke-plan.mjs';

/** @typedef {'react-router' | 'convention' | 'nav-link' | 'existing-anchor'} RouteSource */

/**
 * @typedef {object} InferredRoute
 * @property {string} routeKey stable dedupe key
 * @property {{ path?: string, hash?: string, query?: string }} navigate
 * @property {RouteSource} source
 * @property {string} [label]
 * @property {string} [file]
 */

const CONVENTION_DIRS = ['src/pages', 'src/routes', 'src/views', 'src/app'];

const ROUTE_PATH_ATTR_RE = /<Route[^>]*\spath\s*=\s*[{]?\s*['"`]([^'"`]+)['"`]/g;
const ROUTE_PATH_OBJ_RE = /\bpath\s*:\s*['"`]([^'"`]+)['"`]/g;

const NAV_HREF_RE =
  /<a\b[^>]*\bhref\s*=\s*['"]([^'"]+)['"][^>]*>([^<]{0,120})</gi;

/**
 * @param {string} content
 * @returns {string[]}
 */
export function extractReactRouterPaths(content) {
  const paths = new Set();
  let m;
  const attrRe = new RegExp(ROUTE_PATH_ATTR_RE.source, 'g');
  while ((m = attrRe.exec(content)) !== null) {
    paths.add(normalizePath(m[1]));
  }
  const objRe = new RegExp(ROUTE_PATH_OBJ_RE.source, 'g');
  while ((m = objRe.exec(content)) !== null) {
    paths.add(normalizePath(m[1]));
  }
  return [...paths].filter((p) => p && p !== '*');
}

/**
 * @param {string} p
 */
export function normalizePath(p) {
  const s = String(p || '').trim();
  if (!s || s === '*') return '';
  if (s.startsWith('#')) return s;
  const withSlash = s.startsWith('/') ? s : `/${s}`;
  return withSlash.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

/**
 * @param {string} name e.g. AboutPage.tsx
 */
export function pathFromPageFilename(name) {
  const base = name.replace(/\.(tsx|ts|jsx|js|vue)$/i, '');
  const stripped = base
    .replace(/^(page|route|view)-/i, '')
    .replace(/(Page|Route|View)$/i, '');
  if (!stripped || /^index$/i.test(stripped)) return '/';
  const kebab = stripped
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
  return normalizePath(`/${kebab}`);
}

/**
 * @param {string} appRoot
 * @returns {Promise<InferredRoute[]>}
 */
export async function scanConventionPageRoutes(appRoot) {
  /** @type {InferredRoute[]} */
  const out = [];
  for (const rel of CONVENTION_DIRS) {
    const dir = path.join(appRoot, rel);
    let entries;
    try {
      entries = await walkFiles(dir);
    } catch {
      continue;
    }
    for (const file of entries) {
      if (!/\.(tsx|ts|jsx|js|vue)$/i.test(file)) continue;
      const navPath = pathFromPageFilename(path.basename(file));
      const relFile = path.relative(appRoot, file);
      if (navPath === '/') continue;
      out.push({
        routeKey: `path:${navPath}`,
        navigate: { path: navPath },
        source: 'convention',
        label: path.basename(file, path.extname(file)),
        file: relFile,
      });
    }
  }
  return out;
}

/**
 * @param {string} dir
 */
async function walkFiles(dir) {
  /** @type {string[]} */
  const files = [];
  async function walk(d) {
    let names;
    try {
      names = await fs.readdir(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of names) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) await walk(full);
      else files.push(full);
    }
  }
  await walk(dir);
  return files;
}

/**
 * @param {string} html
 * @returns {InferredRoute[]}
 */
export function extractNavLinkRoutes(html) {
  /** @type {InferredRoute[]} */
  const out = [];
  let m;
  const re = new RegExp(NAV_HREF_RE.source, 'gi');
  while ((m = re.exec(html)) !== null) {
    const href = m[1].trim();
    const label = (m[2] || '').trim();
    if (!href || href.startsWith('javascript:') || href.startsWith('mailto:')) continue;
    const nav = hrefToNavigate(href);
    if (!nav) continue;
    out.push({
      routeKey: routeKeyFromNavigate(nav),
      navigate: nav,
      source: 'nav-link',
      label: label || undefined,
    });
  }
  return out;
}

/**
 * @param {string} href
 */
export function hrefToNavigate(href) {
  if (href.startsWith('#')) {
    return { hash: href.slice(1) };
  }
  try {
    const u = new URL(href, 'http://local.test');
    if (u.hash) {
      return { hash: u.hash.replace(/^#/, ''), path: u.pathname !== '/' ? u.pathname : undefined };
    }
    if (u.pathname && u.pathname !== '/') {
      return { path: normalizePath(u.pathname), query: u.search ? u.search.replace(/^\?/, '') : undefined };
    }
  } catch {
    if (href.startsWith('/')) return { path: normalizePath(href.split('?')[0]) };
  }
  return null;
}

/**
 * @param {{ path?: string, hash?: string, query?: string }} nav
 */
export function routeKeyFromNavigate(nav) {
  const parts = [];
  if (nav.path) parts.push(`path:${normalizePath(nav.path)}`);
  if (nav.hash) parts.push(`hash:${nav.hash.replace(/^#/, '')}`);
  if (nav.query) parts.push(`query:${nav.query}`);
  return parts.join('|') || 'root';
}

/**
 * @param {string} appRoot
 * @returns {Promise<InferredRoute[]>}
 */
export async function scanReactRouterSourceFiles(appRoot) {
  const srcDir = path.join(appRoot, 'src');
  /** @type {InferredRoute[]} */
  const out = [];
  let files;
  try {
    files = await walkFiles(srcDir);
  } catch {
    return out;
  }
  const routeLike = files.filter(
    (f) =>
      /routes?/i.test(f) ||
      /router/i.test(f) ||
      /App\.(tsx|jsx|ts|js)$/i.test(f) ||
      /main\.(tsx|jsx|ts|js)$/i.test(f),
  );
  for (const file of routeLike) {
    const content = await fs.readFile(file, 'utf8');
    for (const p of extractReactRouterPaths(content)) {
      const nav = p.startsWith('#') ? { hash: p.slice(1) } : { path: p };
      out.push({
        routeKey: routeKeyFromNavigate(nav),
        navigate: nav,
        source: 'react-router',
        file: path.relative(appRoot, file),
      });
    }
  }
  return out;
}

/**
 * @param {string} appRoot
 * @param {string[]} [shellPaths]
 */
export async function scanNavShellFiles(appRoot, shellPaths = []) {
  const defaults = [
    'index.html',
    'src/index.html',
    'forge_accessibility/static/index.html',
    'public/index.html',
  ];
  const candidates = [...new Set([...shellPaths.map((p) => path.resolve(appRoot, p)), ...defaults.map((p) => path.join(appRoot, p))])];
  /** @type {InferredRoute[]} */
  const out = [];
  for (const file of candidates) {
    let html;
    try {
      html = await fs.readFile(file, 'utf8');
    } catch {
      continue;
    }
    out.push(...extractNavLinkRoutes(html));
  }
  return out;
}

/**
 * @param {import('./smoke-plan.mjs').SmokeScenario[]} scenarios
 */
export function routeKeysFromScenarios(scenarios) {
  const keys = new Set();
  for (const s of scenarios) {
    const nav = s.navigate || {};
    keys.add(routeKeyFromNavigate(nav));
    if (s.doc_anchor) keys.add(`anchor:${s.doc_anchor}`);
  }
  return keys;
}

/**
 * @param {InferredRoute} route
 * @param {{ path?: string, hash?: string }} nav
 */
export function routeMatchesNavigate(route, nav) {
  return routeKeyFromNavigate(route.navigate) === routeKeyFromNavigate(nav);
}

/**
 * @param {InferredRoute} route
 */
export function scenarioIdFromRoute(route) {
  const nav = route.navigate || {};
  if (nav.hash) {
    const slug = nav.hash.replace(/^#/, '').replace(/-section$/, '').replace(/[^a-z0-9]+/gi, '-');
    return `route-${slug}`.replace(/-+/g, '-').replace(/^-|-$/g, '');
  }
  if (nav.path && nav.path !== '/') {
    const slug = nav.path.replace(/^\//, '').replace(/\//g, '-');
    return `route-${slug}`;
  }
  return `candidate-${route.routeKey.replace(/[|:]/g, '-')}`;
}

/**
 * @param {InferredRoute} route
 * @param {import('./smoke-plan.mjs').SmokeScenario} [template]
 */
export function candidateScenarioFromRoute(route, template) {
  const scenarioId = template?.scenarioId || scenarioIdFromRoute(route);
  return {
    scenarioId,
    doc_anchor: template?.doc_anchor || null,
    tier: template?.tier || 'smoke',
    status: 'candidate',
    navigate: { ...route.navigate },
    ready: template?.ready || '#main-content',
    ready_selectors: template?.ready_selectors,
    ownership: template?.ownership,
    audit_lanes: template?.audit_lanes,
    _inferred: {
      source: route.source,
      routeKey: route.routeKey,
      ...(route.file ? { file: route.file } : {}),
      ...(route.label ? { label: route.label } : {}),
    },
  };
}

/**
 * @param {object} params
 * @param {string} params.appRoot
 * @param {import('./smoke-plan.mjs').SmokeScenario[]} [params.existingScenarios]
 * @param {string[]} [params.shellPaths]
 */
export async function inferAllRoutes({ appRoot, existingScenarios = [], shellPaths = [] }) {
  const [router, convention, nav] = await Promise.all([
    scanReactRouterSourceFiles(appRoot),
    scanConventionPageRoutes(appRoot),
    scanNavShellFiles(appRoot, shellPaths),
  ]);
  const byKey = new Map();
  for (const list of [router, convention, nav]) {
    for (const r of list) {
      if (!byKey.has(r.routeKey)) byKey.set(r.routeKey, r);
    }
  }
  const covered = routeKeysFromScenarios(existingScenarios);
  const missing = [...byKey.values()].filter((r) => !covered.has(r.routeKey));
  return {
    all: [...byKey.values()],
    missing,
    bySource: {
      'react-router': router.length,
      convention: convention.length,
      'nav-link': nav.length,
    },
  };
}

/**
 * Merge inferred candidates into a plan document; preserve human-authored rows.
 * @param {object} planDoc parsed YAML root
 * @param {InferredRoute[]} missingRoutes
 */
export function mergeCandidatesIntoPlan(planDoc, missingRoutes) {
  const scenarios = Array.isArray(planDoc.scenarios) ? [...planDoc.scenarios] : [];
  const byId = new Map(scenarios.map((s) => [s.scenarioId, s]));
  const coveredKeys = routeKeysFromScenarios(scenarios);

  for (const route of missingRoutes) {
    if (coveredKeys.has(route.routeKey)) continue;
    const existing = [...byId.values()].find((s) => routeMatchesNavigate(route, s.navigate || {}));
    if (existing) {
      coveredKeys.add(route.routeKey);
      continue;
    }
    let sid = scenarioIdFromRoute(route);
    let n = 2;
    while (byId.has(sid)) {
      sid = `${scenarioIdFromRoute(route)}-${n}`;
      n += 1;
    }
    const candidate = candidateScenarioFromRoute({ ...route }, { scenarioId: sid });
    scenarios.push(candidate);
    byId.set(sid, candidate);
    coveredKeys.add(route.routeKey);
  }

  return { ...planDoc, scenarios };
}

/**
 * @param {string} smokePlanPath optional existing plan
 * @param {object} planDoc
 */
export function serializeSmokePlan(planDoc) {
  const header = planDoc._generatorHeader || [
    '# Generated/updated by generate-vite-react-smoke-plan.mjs',
    '# Inferred scenarios use status: candidate until reviewed.',
  ];
  const { _generatorHeader, ...bodyDoc } = planDoc;
  const body = yaml.dump(bodyDoc, { lineWidth: 120, noRefs: true });
  return `${header.join('\n')}\n\n${body}`;
}

/**
 * @param {string} filePath
 */
export async function loadPlanDocument(filePath) {
  const raw = await fs.readFile(path.resolve(filePath), 'utf8');
  const doc = yaml.load(raw);
  if (!doc || typeof doc !== 'object') throw new Error(`Invalid smoke plan: ${filePath}`);
  return doc;
}

/**
 * @param {string} appRoot
 * @param {string} [smokePlanPath]
 */
export async function generateViteReactSmokePlan({ appRoot, smokePlanPath, shellPaths = [] }) {
  let planDoc = { planId: 'vite-react-app', baseUrl: null, scenarios: [] };
  let existingScenarios = [];
  if (smokePlanPath) {
    try {
      planDoc = await loadPlanDocument(smokePlanPath);
      const loaded = await loadSmokePlan(smokePlanPath);
      existingScenarios = loaded.scenarios;
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  }
  const inferred = await inferAllRoutes({ appRoot, existingScenarios, shellPaths });
  const merged = mergeCandidatesIntoPlan(planDoc, inferred.missing);
  return {
    plan: merged,
    inferred,
    addedCount: merged.scenarios.length - existingScenarios.length,
  };
}
