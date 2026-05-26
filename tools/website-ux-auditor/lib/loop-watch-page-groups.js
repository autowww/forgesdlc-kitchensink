/**
 * Logical page categories for loop-watch defrag map (scorer URL scan).
 * Caps: each named category ≤10% of site pages; "other" ≤20%; few concise labels.
 */

import fs from 'node:fs';
import path from 'node:path';

/** @typedef {{ key: string, label: string, urls: Set<string>, count: number }} PageCategory */

export const PAGE_GROUP_MAX_CATEGORY_SHARE = 0.1;
export const PAGE_GROUP_MAX_OTHER_SHARE = 0.2;
export const PAGE_GROUP_MAX_CATEGORIES = 12;
export const PAGE_GROUP_MIN_NAMED_SHARE = 0.02;

/**
 * @param {string} url
 */
export function pathnameFromUrl(url) {
  const s = String(url || '').trim();
  if (!s) return '';
  try {
    const u = new URL(s);
    let p = u.pathname || '/';
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p;
  } catch {
    const q = s.indexOf('?');
    const path = q >= 0 ? s.slice(0, q) : s;
    return path.startsWith('/') ? path : `/${path}`;
  }
}

/**
 * @param {string} pathname
 */
export function leafSlug(pathname) {
  const p = String(pathname || '/').replace(/\/$/, '') || '/';
  if (p === '/') return '';
  const leaf = p.split('/').filter(Boolean).pop() || '';
  return leaf.replace(/\.html?$/i, '');
}

/**
 * Chapter-style key for flat handbook filenames (docs-learn-101-…).
 * @param {string} pathname
 */
export function chapterKeyFromPathname(pathname, coarse = false) {
  const parts = String(pathname || '/')
    .replace(/\/$/, '')
    .split('/')
    .filter(Boolean);
  if (!parts.length) return 'home';

  const leaf = parts[parts.length - 1].replace(/\.html?$/i, '');
  const topic = leaf.match(/^docs-([a-z]+)/i);
  if (coarse && topic) return `docs-${topic[1]}`.toLowerCase();

  const chapterMatch = leaf.match(/^(docs-[a-z]+-\d{3})(?:-|$)/i);
  if (chapterMatch) return chapterMatch[1].toLowerCase();

  if (parts.length >= 2) {
    const seg0 = parts[0].replace(/\.html?$/i, '');
    const seg1 = parts[1].replace(/\.html?$/i, '');
    const combined = `${seg0}/${seg1}`;
    const sub = leaf.match(new RegExp(`^${seg0}-(\\d{3})`));
    if (sub) return `${seg0}-${sub[1]}`.toLowerCase();
    return combined.toLowerCase();
  }

  if (topic) return `docs-${topic[1]}`.toLowerCase();

  const prefix = leaf.match(/^([a-z][a-z0-9]*(?:-[a-z0-9]+){0,2})/i);
  if (prefix && prefix[1].length >= 4) return prefix[1].toLowerCase();
  return leaf.toLowerCase() || parts[0].toLowerCase();
}

/**
 * Depth bucket for hierarchical sites.
 * @param {string} pathname
 */
export function depthKeyFromPathname(pathname) {
  const parts = String(pathname || '/')
    .replace(/\/$/, '')
    .split('/')
    .filter(Boolean);
  if (!parts.length) return 'd0';
  const depth = Math.min(4, parts.length);
  const head = parts.slice(0, Math.min(2, parts.length)).join('/');
  return `d${depth}:${head}`;
}

/**
 * @param {string} key
 * @param {'chapter'|'depth'} mode
 */
export function shortCategoryLabel(key, mode = 'chapter') {
  const k = String(key || '').trim();
  if (!k || k === 'home') return 'home';
  if (k === 'other') return 'oth';

  const base = k.split(':')[0];
  const doc = base.match(/^docs-([a-z]+)-(\d{3})$/i);
  if (doc) {
    const letter = doc[1].slice(0, 1).toUpperCase();
    const part = k.match(/~(\d+)$/);
    return part ? `${letter}${doc[2].slice(-2)}${part[1]}` : `${letter}${doc[2]}`;
  }

  const topic = base.match(/^docs-([a-z]+)/i);
  if (topic) {
    const abbrev = {
      learn: 'lrn',
      operate: 'opr',
      build: 'bld',
      maintainers: 'mnt',
      design: 'dsg',
      examples: 'exm',
      reference: 'ref',
      start: 'str',
      forge: 'frg',
    };
    const stem = abbrev[topic[1]] || topic[1].slice(0, 3);
    const part = k.match(/~(\d+)$/);
    return part ? `${stem}${part[1]}` : stem;
  }

  if (mode === 'depth') {
    const dm = k.match(/^d(\d+):(.+)$/);
    if (dm) {
      const head = dm[2].split('/').pop() || dm[2];
      return head.slice(0, 4) || `d${dm[1]}`;
    }
  }

  const slug = base.split('/').pop() || base;
  if (slug.length <= 4) return slug;
  return slug.slice(0, 4);
}

/**
 * @param {string[]} pathnames
 */
export function detectPageGroupingStrategy(pathnames) {
  const paths = (pathnames || []).map((p) => String(p || '').trim()).filter(Boolean);
  const n = paths.length;
  if (n < 4) return 'chapter';

  /** @type {Map<string, number>} */
  const chapterCounts = new Map();
  let docChapterHits = 0;
  for (const p of paths) {
    const key = chapterKeyFromPathname(p);
    chapterCounts.set(key, (chapterCounts.get(key) || 0) + 1);
    if (/^docs-[a-z]+-\d{3}/i.test(leafSlug(p))) docChapterHits += 1;
  }

  const maxChapter = Math.max(...chapterCounts.values(), 0);
  const maxChapterShare = maxChapter / n;
  const multiPageChapters = [...chapterCounts.values()].filter((c) => c >= 2).length;
  const sigChapters = [...chapterCounts.values()].filter((c) => c / n >= PAGE_GROUP_MIN_NAMED_SHARE).length;

  const segCounts = paths.map((p) => p.split('/').filter(Boolean).length);
  const depths = new Set(segCounts);
  const deepPaths = segCounts.filter((d) => d >= 3).length / n;
  const flatHandbook = depths.size <= 2 && maxChapterShare <= 0.15 && docChapterHits / n >= 0.4;

  if (deepPaths >= 0.5) return 'depth';
  if (flatHandbook && sigChapters >= 2) return 'chapter';
  if (sigChapters >= 3 && maxChapterShare <= 0.35) return 'chapter';
  if (multiPageChapters >= 2 && maxChapterShare < 0.5) return 'chapter';

  const depthSpread = depths.size >= 3 && Math.max(...segCounts) >= 3;
  if (depthSpread && maxChapterShare > 0.4) return 'depth';

  return docChapterHits / n >= 0.25 ? 'chapter' : 'depth';
}

/**
 * Split a category that exceeds maxPages into ≤maxPages chunks (stable short keys).
 * @param {string} baseKey
 * @param {string[]} pathnames
 * @param {number} maxPages
 */
function splitOversizedCategory(baseKey, pathnames, maxPages) {
  if (pathnames.length <= maxPages) return [{ key: baseKey, paths: pathnames }];
  /** @type {Array<{ key: string, paths: string[] }>} */
  const parts = [];
  for (let i = 0; i < pathnames.length; i += maxPages) {
    const slice = pathnames.slice(i, i + maxPages);
    const part = Math.floor(i / maxPages) + 1;
    parts.push({ key: `${baseKey}~${part}`, paths: slice });
  }
  return parts;
}

/**
 * @param {string[]} scorerUrls
 * @param {{ maxCategories?: number, maxCategoryShare?: number, maxOtherShare?: number }} [opts]
 */
export function buildPageGroupPlan(scorerUrls, opts = {}) {
  const maxCategories = opts.maxCategories ?? PAGE_GROUP_MAX_CATEGORIES;
  const maxCatShare = opts.maxCategoryShare ?? PAGE_GROUP_MAX_CATEGORY_SHARE;
  const maxOtherShare = opts.maxOtherShare ?? PAGE_GROUP_MAX_OTHER_SHARE;

  const pathnames = (scorerUrls || [])
    .map((u) => pathnameFromUrl(u))
    .filter(Boolean);
  const total = Math.max(1, pathnames.length);
  const maxPagesPerCat = Math.max(1, Math.floor(total * maxCatShare));
  const maxOtherPages = Math.max(1, Math.floor(total * maxOtherShare));
  const minNamedPages = Math.max(2, Math.ceil(total * PAGE_GROUP_MIN_NAMED_SHARE));

  const mode = detectPageGroupingStrategy(pathnames);
  const keyFn = mode === 'depth' ? depthKeyFromPathname : chapterKeyFromPathname;

  /** @type {Map<string, string[]>} */
  const byKey = new Map();
  for (const p of pathnames) {
    const key = keyFn(p);
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(p);
  }

  /** @type {Array<{ key: string, paths: string[] }>} */
  let buckets = [];
  for (const [key, paths] of byKey.entries()) {
    if (paths.length > maxPagesPerCat) {
      buckets.push(...splitOversizedCategory(key, paths, maxPagesPerCat));
    } else {
      buckets.push({ key, paths });
    }
  }

  buckets.sort((a, b) => b.paths.length - a.paths.length);

  /** @type {PageCategory[]} */
  let named = [];
  /** @type {string[]} */
  let otherPaths = [];

  for (const b of buckets) {
    if (b.paths.length >= minNamedPages && named.length < maxCategories - 1) {
      named.push({
        key: b.key,
        label: shortCategoryLabel(b.key, mode),
        urls: new Set(b.paths),
        count: b.paths.length,
      });
    } else {
      otherPaths.push(...b.paths);
    }
  }

  const promoteFromOther = () => {
    /** @type {Map<string, string[]>} */
    const promote = new Map();
    for (const p of otherPaths) {
      const k = keyFn(p);
      if (!promote.has(k)) promote.set(k, []);
      promote.get(k).push(p);
    }
    const candidates = [...promote.entries()].sort((a, b) => b[1].length - a[1].length);
    return candidates[0] || null;
  };

  while (otherPaths.length > maxOtherPages && named.length < maxCategories - 1) {
    const pick = promoteFromOther();
    if (!pick || pick[1].length < 1) break;
    const [key, paths] = pick;
    named.push({
      key,
      label: shortCategoryLabel(key, mode),
      urls: new Set(paths),
      count: paths.length,
    });
    const promoted = new Set(paths);
    otherPaths = otherPaths.filter((p) => !promoted.has(p));
  }

  if (otherPaths.length > maxOtherPages) {
    /** @type {Map<string, string[]>} */
    const coarse = new Map();
    for (const p of otherPaths) {
      const ck =
        mode === 'chapter' ? chapterKeyFromPathname(p, true) : depthKeyFromPathname(p);
      if (!coarse.has(ck)) coarse.set(ck, []);
      coarse.get(ck).push(p);
    }
    const rolled = [...coarse.entries()].sort((a, b) => b[1].length - a[1].length);
    otherPaths = [];
    for (const [key, paths] of rolled) {
      if (
        paths.length >= minNamedPages &&
        named.length < maxCategories - 1 &&
        paths.length <= maxPagesPerCat
      ) {
        named.push({
          key,
          label: shortCategoryLabel(key, mode),
          urls: new Set(paths),
          count: paths.length,
        });
      } else {
        otherPaths.push(...paths);
      }
    }
  }

  while (otherPaths.length > maxOtherPages && named.length < maxCategories) {
    const pick = promoteFromOther();
    if (!pick) break;
    const [key, paths] = pick;
    named.push({
      key,
      label: shortCategoryLabel(key, mode),
      urls: new Set(paths),
      count: paths.length,
    });
    const promoted = new Set(paths);
    otherPaths = otherPaths.filter((p) => !promoted.has(p));
  }

  if (otherPaths.length) {
    named.push({
      key: 'other',
      label: 'oth',
      urls: new Set(otherPaths),
      count: otherPaths.length,
    });
  }

  /** @type {PageCategory[]} */
  const capped = [];
  for (const cat of named) {
    if (cat.key === 'other' || cat.count <= maxPagesPerCat) {
      capped.push(cat);
      continue;
    }
    const paths = [...cat.urls];
    for (const part of splitOversizedCategory(cat.key, paths, maxPagesPerCat)) {
      capped.push({
        key: part.key,
        label: shortCategoryLabel(part.key, mode),
        urls: new Set(part.paths),
        count: part.paths.length,
      });
    }
  }
  named = capped.filter((c) => c.key !== 'other' || c.count > 0);
  const otherCat = capped.find((c) => c.key === 'other');
  if (otherCat && otherCat.count > maxOtherPages) {
    const paths = [...otherCat.urls];
    named = named.filter((c) => c.key !== 'other');
    otherPaths = paths;
    otherCat.urls = new Set();
    otherCat.count = 0;
    while (otherPaths.length > maxOtherPages && named.length < maxCategories) {
      const pick = promoteFromOther();
      if (!pick) break;
      const [key, pths] = pick;
      named.push({
        key,
        label: shortCategoryLabel(key, mode),
        urls: new Set(pths),
        count: pths.length,
      });
      const promoted = new Set(pths);
      otherPaths = otherPaths.filter((p) => !promoted.has(p));
    }
    if (otherPaths.length) {
      named.push({
        key: 'other',
        label: 'oth',
        urls: new Set(otherPaths),
        count: otherPaths.length,
      });
    }
  }

  while (named.length > maxCategories) {
    const otherIdx = named.findIndex((c) => c.key === 'other');
    let mergeIdx = -1;
    let minCount = Infinity;
    for (let i = 0; i < named.length; i += 1) {
      if (i === otherIdx) continue;
      const c = named[i];
      const n = c?.count ?? (c?.urls instanceof Set ? c.urls.size : 0);
      if (n < minCount) {
        minCount = n;
        mergeIdx = i;
      }
    }
    if (mergeIdx < 0) break;
    const [smallest] = named.splice(mergeIdx, 1);
    if (!smallest) break;
    const urlsToMerge =
      smallest.urls instanceof Set
        ? smallest.urls
        : new Set(Array.isArray(smallest.paths) ? smallest.paths : []);
    if (otherIdx >= 0) {
      const other = named[otherIdx];
      if (other?.urls instanceof Set) {
        for (const p of urlsToMerge) other.urls.add(p);
        other.count = other.urls.size;
      }
    } else {
      named.push({
        key: 'other',
        label: 'oth',
        urls: new Set(urlsToMerge),
        count: urlsToMerge.size,
      });
    }
  }

  named.sort((a, b) => b.count - a.count);

  const usedLabels = new Set();
  for (const cat of named) {
    let label = cat.label;
    if (usedLabels.has(label)) {
      label = `${label}${usedLabels.size}`;
    }
    usedLabels.add(label);
    cat.label = label;
  }

  const urlToCategory = new Map();
  for (const cat of named) {
    for (const p of cat.urls) {
      urlToCategory.set(p, cat.key);
    }
  }

  return {
    mode,
    total,
    maxPagesPerCat,
    maxOtherPages,
    categories: named,
    urlToCategory,
    legend: named.map((c) => c.label).join('·'),
  };
}

/**
 * @param {string} url
 * @param {ReturnType<typeof buildPageGroupPlan>} plan
 */
function categoryKeyForUrl(url, plan) {
  const path = pathnameFromUrl(url);
  if (!path) return 'other';
  return plan.urlToCategory.get(path) || 'other';
}

/**
 * Map crawl slots to logical fragments (columns ∝ category size on scorer scan).
 * @param {Array<{ url: string }>} pageSets
 * @param {number} budget
 * @param {number} mapCols
 * @param {string[]} scorerUrls
 */
export function buildPageFragmentsLogical(pageSets, budget, mapCols, scorerUrls) {
  const cols = Math.max(1, Math.min(56, mapCols));
  const plan = buildPageGroupPlan(scorerUrls);

  /** @type {string[]} */
  const slots = pageSets.map((p) => String(p.url || '').trim()).filter(Boolean);
  const remaining = Math.max(0, (Number(budget) || slots.length) - slots.length);
  for (let i = 0; i < remaining; i += 1) slots.push('');

  const categories = plan.categories.length
    ? plan.categories
    : [{ key: 'all', label: 'all', urls: new Set(), count: slots.filter(Boolean).length }];

  const displayCats = categories.slice(0, Math.min(categories.length, cols));
  const weights = displayCats.map((c) => Math.max(1, c.count));
  const weightSum = weights.reduce((a, b) => a + b, 0) || 1;

  let alloc = displayCats.map((c) => Math.max(1, Math.round((c.count / weightSum) * cols)));
  let sum = alloc.reduce((a, b) => a + b, 0);
  while (sum > cols) {
    const idx = alloc.indexOf(Math.max(...alloc));
    alloc[idx] -= 1;
    sum -= 1;
  }
  while (sum < cols && alloc.length) {
    const idx = weights.indexOf(Math.max(...weights));
    alloc[idx] += 1;
    sum += 1;
  }

  /** @type {Map<string, { urls: string[], indices: number[] }>} */
  const slotByCat = new Map();
  for (const cat of displayCats) {
    slotByCat.set(cat.key, { urls: [], indices: [] });
  }
  for (let i = 0; i < slots.length; i += 1) {
    const url = slots[i];
    if (!url) continue;
    const ck = categoryKeyForUrl(url, plan);
    const bucket = slotByCat.get(ck) || slotByCat.get('other');
    if (!bucket) continue;
    bucket.urls.push(url);
    bucket.indices.push(i);
  }

  /** @type {Array<{ col: number, startIdx: number, endIdx: number, urls: string[], label: string, groupKey?: string, logical?: boolean }>} */
  const fragments = [];
  let col = 0;

  for (let ci = 0; ci < displayCats.length && col < cols; ci += 1) {
    const cat = displayCats[ci];
    const bucket = slotByCat.get(cat.key) || { urls: [], indices: [] };
    const nCols = Math.min(alloc[ci] || 1, cols - col);
    const chunkSize = Math.max(1, Math.ceil(bucket.urls.length / nCols) || 1);

    for (let sub = 0; sub < nCols && col < cols; sub += 1) {
      const start = sub * chunkSize;
      const sliceUrls = bucket.urls.slice(start, start + chunkSize);
      const sliceIdx = bucket.indices.slice(start, start + chunkSize);
      const startIdx = sliceIdx.length ? Math.min(...sliceIdx) : ci;
      const endIdx = sliceIdx.length ? Math.max(...sliceIdx) + 1 : startIdx + 1;
      const label = nCols > 1 ? `${cat.label}${sub + 1}` : cat.label;
      fragments.push({
        col,
        startIdx,
        endIdx,
        urls: sliceUrls,
        label,
        groupKey: cat.key,
        logical: true,
      });
      col += 1;
    }
  }

  if (!fragments.length) {
    return buildPageFragmentsEven(pageSets, budget, mapCols);
  }

  return { fragments, plan };
}

/**
 * Legacy equal index slices (no scorer plan).
 * @param {Array<{ url: string }>} pageSets
 * @param {number} budget
 * @param {number} mapCols
 */
export function buildPageFragmentsEven(pageSets, budget, mapCols) {
  const cols = Math.max(1, Math.min(56, mapCols));
  /** @type {string[]} */
  const slots = pageSets.map((p) => String(p.url || '').trim()).filter(Boolean);
  const remaining = Math.max(0, (Number(budget) || slots.length) - slots.length);
  for (let i = 0; i < remaining; i += 1) slots.push('');
  const total = Math.max(1, slots.length);
  const perFrag = Math.max(1, Math.ceil(total / cols));
  /** @type {Array<{ col: number, startIdx: number, endIdx: number, urls: string[], label: string }>} */
  const fragments = [];
  for (let c = 0; c < cols; c += 1) {
    const startIdx = c * perFrag;
    if (startIdx >= total) break;
    const endIdx = Math.min(total, startIdx + perFrag);
    const slice = slots.slice(startIdx, endIdx);
    fragments.push({
      col: c,
      startIdx,
      endIdx,
      urls: slice.filter(Boolean),
      label: slice.length ? `${startIdx + 1}-${endIdx}` : '',
    });
  }
  return { fragments, plan: null };
}

/**
 * @param {Array<{ url: string }>} pageSets
 * @param {number} budget
 * @param {number} mapCols
 * @param {{ scorerUrls?: string[] }} [opts]
 */
/**
 * Static fixture HTML listing (before scorer finishes) from run-meta.json.
 * @param {string} outDir
 * @param {number} [maxUrls]
 */
export function discoverFixtureUrlCatalog(outDir, maxUrls = 2000) {
  /** @type {Record<string, unknown>} */
  let meta = {};
  try {
    meta = JSON.parse(fs.readFileSync(path.join(outDir, 'run-meta.json'), 'utf8'));
  } catch {
    return [];
  }
  const serve = String(meta.serve_target || meta.fixture_dir || '').trim();
  const siteUrl = String(meta.site_url || meta.siteUrl || '').trim();
  const repo = String(meta.website_repo || '').trim();
  if (!serve || !siteUrl) return [];

  /** @type {string[]} */
  const candidates = [];
  if (path.isAbsolute(serve)) candidates.push(serve);
  if (repo) {
    candidates.push(path.join(repo, 'website'));
    candidates.push(path.resolve(repo, serve));
    candidates.push(path.join(repo, path.basename(serve)));
  }
  candidates.push(path.resolve(serve));
  if (outDir) {
    candidates.push(path.resolve(outDir, '..', '..', '..', serve));
  }

  let fixtureRoot = '';
  for (const c of candidates) {
    try {
      const st = fs.statSync(c);
      if (st.isDirectory()) {
        fixtureRoot = fs.realpathSync(c);
        break;
      }
    } catch {
      /* try next */
    }
  }
  if (!fixtureRoot) return [];

  const base = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
  /** @type {string[]} */
  const urls = [];

  /** @param {string} dir */
  function walk(dir) {
    if (urls.length >= maxUrls) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (urls.length >= maxUrls) return;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === '.git' || ent.name === 'node_modules') continue;
        walk(full);
      } else if (/\.html?$/i.test(ent.name)) {
        const rel = path.relative(fixtureRoot, full).split(path.sep).join('/');
        try {
          urls.push(new URL(rel, base).href);
        } catch {
          /* skip */
        }
      }
    }
  }
  walk(fixtureRoot);
  return urls;
}

/**
 * Scorer pages + fixture catalog + audited pageSets (deduped).
 * @param {string} outDir
 * @param {Array<{ url?: string }>} pageSets
 */
export function collectMapUrlCatalog(outDir, pageSets = []) {
  /** @type {string[]} */
  const urls = [];
  const seen = new Set();
  const add = (u) => {
    const s = String(u || '').trim();
    if (!s || seen.has(s)) return;
    seen.add(s);
    urls.push(s);
  };

  for (const u of discoverFixtureUrlCatalog(outDir)) add(u);
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(outDir, 'ux-quality-score.json'), 'utf8'));
    for (const row of raw?.pagesBrief || raw?.pages || []) {
      add(row.url || row.href);
    }
  } catch {
    /* optional */
  }
  for (const ps of pageSets) add(ps.url);
  return urls;
}

/**
 * Compact legend when index-sliced columns would concatenate as `1-2021-40…`.
 * @param {Array<{ label?: string }>} fragments
 * @param {number} cols
 * @param {number} budget
 */
export function formatIndexFragmentLegend(fragments, cols, budget) {
  const n = Math.min(cols, fragments?.length || 0);
  if (n <= 0) return '…';
  if (n <= 6) {
    return fragments
      .slice(0, n)
      .map((f) => f.label || '·')
      .join('·');
  }
  const per = Math.max(1, Math.ceil((Number(budget) || n) / n));
  return `${n}×~${per}`;
}

export function buildPageFragments(pageSets, budget, mapCols, opts = {}) {
  const catalog = opts.scorerUrls || [];
  if (Array.isArray(catalog) && catalog.length >= 3) {
    const { fragments } = buildPageFragmentsLogical(pageSets, budget, mapCols, catalog);
    return fragments;
  }
  const even = buildPageFragmentsEven(pageSets, budget, mapCols);
  for (const f of even.fragments) {
    if (/^\d+-\d+$/.test(String(f.label || ''))) f.label = '';
  }
  return even.fragments;
}
