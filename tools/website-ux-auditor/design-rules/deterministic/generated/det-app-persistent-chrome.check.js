/**
 * DET.APP.PERSISTENT_CHROME — shell regions stable across routes when contract promises persistence.
 * Route crawl: fingerprints header/nav/aside/footer (and data-shell-region) per origin and compares.
 */

/** @type {Map<string, { baseline: { regions: object[] }, baselineUrl: string }>} */
const routeCrawlByOrigin = new Map();

export const rule = {
  id: 'DET.APP.PERSISTENT_CHROME',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'informationArchitecture',
  scoreDimension: 'informationArchitecture',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-persistent-chrome',
};

/** @param {string} [url] */
function originKeyFromUrl(url) {
  try {
    return new URL(String(url || '')).origin;
  } catch {
    return 'unknown';
  }
}

/**
 * @param {{ role?: string, id?: string, ksHash?: string, linkSignature?: string }} region
 */
export function regionFingerprintKey(region) {
  const role = String(region.role || 'region');
  const id = String(region.id || '').trim();
  if (id) return `${role}::id:${id}`;
  const hash = String(region.ksHash || '').trim();
  if (hash) return `${role}::hash:${hash}`;
  const sig = String(region.linkSignature || '').trim().slice(0, 48);
  return `${role}::sig:${sig || 'empty'}`;
}

/**
 * @param {{ regions?: object[] }} baseline
 * @param {{ regions?: object[] }} current
 * @returns {Array<Record<string, unknown>>}
 */
export function diffPersistentChromeRegions(baseline, current) {
  const baseRegions = Array.isArray(baseline?.regions) ? baseline.regions : [];
  const curRegions = Array.isArray(current?.regions) ? current.regions : [];
  if (!baseRegions.length) return [];

  const curByKey = new Map();
  for (const r of curRegions) curByKey.set(regionFingerprintKey(r), r);

  /** @type {Array<Record<string, unknown>>} */
  const violations = [];

  for (const base of baseRegions) {
    const key = regionFingerprintKey(base);
    const cur = curByKey.get(key);
    if (!cur) {
      violations.push({
        kind: 'missing-region',
        role: base.role,
        id: base.id,
        ksHash: base.ksHash,
        baselineLinkSignature: base.linkSignature,
      });
      continue;
    }
    if (String(base.ksHash || '') && String(cur.ksHash || '') && base.ksHash !== cur.ksHash) {
      violations.push({
        kind: 'hash-drift',
        role: base.role,
        id: base.id,
        baselineHash: base.ksHash,
        currentHash: cur.ksHash,
      });
    }
    if (base.linkSignature && cur.linkSignature && base.linkSignature !== cur.linkSignature) {
      violations.push({
        kind: 'nav-drift',
        role: base.role,
        id: base.id,
        baselineLinks: base.linkSignature,
        currentLinks: cur.linkSignature,
      });
    }
  }

  return violations.slice(0, 10);
}

/**
 * @param {{ promisesPersistence?: boolean, violations?: Array<Record<string, unknown>>, baselineUrl?: string } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromAppPersistentChromeReport(report, url = '') {
  const violations = Array.isArray(report?.violations) ? report.violations : [];
  if (!violations.length) return [];

  const findings = [];
  const seen = new Set();

  for (const v of violations.slice(0, 8)) {
    const kind = String(v.kind || 'unknown');
    const key = `${kind}:${v.role || ''}:${v.id || ''}:${v.baselineHash || v.baselineLinks || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (kind === 'missing-region') {
      findings.push({
        severity: 'major',
        area: 'informationArchitecture',
        message: 'Persistent shell region present on the baseline route is missing on this route.',
        evidence: `role=${v.role || '?'} id="${String(v.id || '')}" ksHash=${v.ksHash || '—'} baselineLinks="${String(v.baselineLinkSignature || '').slice(0, 120)}"`,
        remediation:
          'Keep contracted shell regions (header, nav, aside, footer, or data-shell-region roots) mounted across routes; swap only the main/workspace pane.',
      });
      continue;
    }

    if (kind === 'hash-drift') {
      findings.push({
        severity: 'warn',
        area: 'informationArchitecture',
        message: 'Shell region KS hash changed between routes despite a persistent chrome contract.',
        evidence: `role=${v.role || '?'} id="${String(v.id || '')}" baseline=${v.baselineHash} current=${v.currentHash}`,
        remediation:
          'Reuse the same visual root hash for persistent chrome across routes, or document a new hash when the shell anatomy intentionally changes.',
      });
      continue;
    }

    if (kind === 'nav-drift') {
      findings.push({
        severity: 'warn',
        area: 'informationArchitecture',
        message: 'Primary shell navigation link set changed between crawled routes.',
        evidence: `role=${v.role || '?'} id="${String(v.id || '')}" baseline="${String(v.baselineLinks || '').slice(0, 100)}" current="${String(v.currentLinks || '').slice(0, 100)}"`,
        remediation:
          'Stabilize global nav labels and href targets across routes, or scope route-specific links to the workspace pane—not the persistent shell.',
      });
      continue;
    }

    if (kind === 'promised-no-regions') {
      findings.push({
        severity: 'minor',
        area: 'informationArchitecture',
        message: 'Page declares persistent chrome contract but no measurable shell regions were found outside main.',
        evidence: String(v.detail || 'no header/nav/aside/footer or data-shell-region outside main'),
        remediation:
          'Emit shell landmarks (header, nav, aside) with stable ids/hashes outside main, or mark data-shell-region on persistent roots per the desktop-interface contract.',
      });
    }
  }

  if (url) {
    for (const finding of findings) {
      finding.evidence = `${finding.evidence} url=${url}`;
      if (report?.baselineUrl) finding.evidence += ` baseline=${report.baselineUrl}`;
    }
  }

  return findings;
}

/** @param {import('playwright').Page} page */
export async function collectAppPersistentChromeReport(page) {
  return page.evaluate(() => {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const visible = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden'
        && style.display !== 'none' && Number(style.opacity || 1) > 0.05;
    };
    const textOf = (el) => norm(el.innerText || el.textContent || el.getAttribute('aria-label') || '');

    const main = document.querySelector('main#main') || document.querySelector('main');
    const isOutsideMain = (el) => {
      if (!main) return true;
      return !main.contains(el);
    };

    const promisesPersistence = (() => {
      if (document.querySelector('[data-shell-persistent="true"], [data-persistent-chrome="true"]')) return true;
      const rc = document.querySelector('[data-route-contract]');
      if (rc && /persistent/i.test(rc.getAttribute('data-route-contract') || '')) return true;
      if (document.querySelector('[data-shell-regions], [data-shell-region]')) return true;
      if (document.querySelector('[data-ks-type="desktop-interface"]')) return true;
      const bodyCls = norm(document.body?.className || '').toLowerCase();
      if (/app-shell|forge-studio|museum-studio|ks-app-shell|workspace-lens/.test(bodyCls)) return true;
      return false;
    })();

    /** @type {Array<{ role: string, id: string, ksHash: string, linkSignature: string }>} */
    const regions = [];
    const seen = new Set();

    /** @param {HTMLElement} el @param {string} role */
    const addRegion = (el, role) => {
      if (!(el instanceof HTMLElement) || seen.has(el) || !isOutsideMain(el)) return;
      seen.add(el);
      const navLinks = [...el.querySelectorAll('a[href]')]
        .filter((a) => visible(a))
        .map((a) => textOf(a).toLowerCase())
        .filter((t) => t.length >= 2)
        .sort()
        .slice(0, 24);
      regions.push({
        role,
        id: el.id || '',
        ksHash: el.getAttribute('data-ks-hash') || el.getAttribute('hash') || '',
        linkSignature: navLinks.join('|'),
      });
    };

    for (const el of document.querySelectorAll('[data-shell-region]')) {
      if (!(el instanceof HTMLElement)) continue;
      addRegion(el, el.getAttribute('data-shell-region') || 'shell-region');
    }
    for (const sel of ['header', 'nav', 'aside', 'footer']) {
      for (const el of document.querySelectorAll(sel)) addRegion(el, sel);
    }

    /** @type {Array<Record<string, unknown>>} */
    const violations = [];
    if (promisesPersistence && !regions.length) {
      violations.push({ kind: 'promised-no-regions', detail: 'contract signals without shell regions' });
    }

    return {
      promisesPersistence,
      regions,
      violations,
    };
  });
}

export function resetRouteCrawlStateForTests() {
  routeCrawlByOrigin.clear();
}

/**
 * @param {{ promisesPersistence?: boolean, regions?: object[], violations?: object[], url?: string }} snapshot
 * @param {string} url
 * @param {string} [baselineUrl]
 */
export function mergeRouteCrawlViolations(snapshot, url, baselineUrl = '') {
  const violations = Array.isArray(snapshot.violations) ? [...snapshot.violations] : [];
  if (!snapshot.promisesPersistence) return { ...snapshot, violations, baselineUrl };

  const origin = originKeyFromUrl(url);
  const state = routeCrawlByOrigin.get(origin);

  if (!state) {
    routeCrawlByOrigin.set(origin, {
      baseline: { regions: snapshot.regions || [] },
      baselineUrl: url,
    });
    return { ...snapshot, violations, baselineUrl: url };
  }

  violations.push(...diffPersistentChromeRegions(state.baseline, snapshot));
  return {
    ...snapshot,
    violations,
    baselineUrl: state.baselineUrl || baselineUrl,
  };
}

export async function run({ metrics, page, url }) {
  const pageUrl = url || metrics?.url || '';
  let snapshot = metrics?.appPersistentChromeReport
    ?? (page ? await collectAppPersistentChromeReport(page) : null);
  if (!snapshot) return [];
  if (pageUrl) snapshot = { ...snapshot, url: pageUrl };

  const merged = mergeRouteCrawlViolations(snapshot, pageUrl);
  if (!(merged.violations || []).length) return [];
  return findingsFromAppPersistentChromeReport(merged, pageUrl);
}
