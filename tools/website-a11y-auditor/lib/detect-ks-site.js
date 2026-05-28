import fs from 'node:fs/promises';
import path from 'node:path';

const KS_DOM_THRESHOLD = 0.35;
const KS_REPO_SCORE_THRESHOLD = 0.5;

/**
 * @param {string} repoRoot
 * @returns {Promise<{ score: number, signals: Record<string, boolean | number | string> }>}
 */
export async function detectKsFromRepo(repoRoot) {
  /** @type {Record<string, boolean | number | string>} */
  const signals = {};
  let score = 0;

  const ksPaths = [
    path.join(repoRoot, 'kitchensink', 'components'),
    path.join(repoRoot, 'kitchensink', 'forge-autodoc'),
    path.join(repoRoot, 'forgesdlc-kitchensink', 'components'),
  ];
  for (const p of ksPaths) {
    try {
      const st = await fs.stat(p);
      if (st.isDirectory()) {
        signals.ksSubmoduleLayout = true;
        score += 0.45;
        break;
      }
    } catch {
      /* continue */
    }
  }

  const genHints = [
    path.join(repoRoot, 'generator', 'build-site.py'),
    path.join(repoRoot, 'generator', 'build-handbook.py'),
  ];
  for (const g of genHints) {
    try {
      const raw = await fs.readFile(g, 'utf8');
      if (/kitchensink\.components|forge_autodoc|from kitchensink/i.test(raw)) {
        signals.generatorImportsKs = true;
        score += 0.35;
        break;
      }
    } catch {
      /* continue */
    }
  }

  const registryJson = [
    path.join(repoRoot, 'docs', 'design', 'catalog', 'visual-registry.generated.json'),
    path.join(repoRoot, 'kitchensink', 'docs', 'design', 'catalog', 'visual-registry.generated.json'),
  ];
  for (const r of registryJson) {
    try {
      await fs.access(r);
      signals.visualRegistryJson = true;
      score += 0.2;
      break;
    } catch {
      /* continue */
    }
  }

  return { score: Math.min(1, score), signals };
}

/**
 * @param {Array<{ metrics?: Record<string, unknown> }>} pages
 */
export function detectKsFromDomPages(pages) {
  const signals = {
    pagesSampled: pages.length,
    pagesWithKsHash: 0,
    pagesWithHandbookChapter: 0,
    pagesWithKsBreadcrumb: 0,
  };
  if (!pages.length) return { score: 0, signals };

  for (const p of pages) {
    const m = p.metrics || {};
    const rep = m.ksVisualHashReport || m.ksHashReport || null;
    const valid = rep?.validUnique?.length || rep?.instanceCountByHash
      ? Object.keys(rep.instanceCountByHash || {}).length
      : 0;
    if (valid > 0) signals.pagesWithKsHash += 1;
    if (m.hasHandbookChapter) signals.pagesWithHandbookChapter += 1;
    if (m.hasKsBreadcrumb) signals.pagesWithKsBreadcrumb += 1;
  }

  const ratio =
    (signals.pagesWithKsHash + signals.pagesWithHandbookChapter + signals.pagesWithKsBreadcrumb)
    / (pages.length * 3);
  const score = Math.min(1, ratio * 2.5);
  return { score, signals };
}

/**
 * @param {{
 *   rulesScope: 'auto' | 'generic' | 'ks' | 'all' | 'app',
 *   repoScore: number,
 *   domScore: number,
 * }} input
 */
export function resolveRulesScope(input) {
  const scope = input.rulesScope || 'auto';
  if (scope === 'generic') {
    return { effectiveScope: 'generic', ksDriven: false, reason: 'forced-generic' };
  }
  if (scope === 'app') {
    return { effectiveScope: 'app', ksDriven: false, reason: 'forced-app' };
  }
  if (scope === 'ks') {
    return { effectiveScope: 'ks', ksDriven: true, reason: 'forced-ks' };
  }
  if (scope === 'all') {
    return { effectiveScope: 'all', ksDriven: true, reason: 'forced-all' };
  }

  const repoDriven = input.repoScore >= KS_REPO_SCORE_THRESHOLD;
  const domDriven = input.domScore >= KS_DOM_THRESHOLD;
  const ksDriven = repoDriven || domDriven;
  return {
    effectiveScope: ksDriven ? 'ks' : 'generic',
    ksDriven,
    reason: repoDriven && domDriven
      ? 'repo-and-dom'
      : repoDriven
        ? 'repo'
        : domDriven
          ? 'dom'
          : 'below-threshold',
  };
}

/**
 * @param {string} scope - rule scope: generic | ks | universal
 * @param {{ effectiveScope: string, ksDriven: boolean }} resolved
 */
export function ruleScopeEnabled(scope, resolved) {
  const s = String(scope || 'generic').toLowerCase();
  if (s === 'universal') return true;
  if (resolved.effectiveScope === 'all') return true;
  if (resolved.effectiveScope === 'app') {
    if (s === 'ks') return false;
    return s === 'generic' || s === 'universal';
  }
  if (s === 'ks') return resolved.ksDriven || resolved.effectiveScope === 'ks';
  if (s === 'generic') return true;
  return true;
}
