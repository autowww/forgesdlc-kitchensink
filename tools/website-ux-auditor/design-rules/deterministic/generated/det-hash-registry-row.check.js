/**
 * DET.HASH.REGISTRY_ROW — each emitted KS hash must exist in visual-registry.generated.json
 * with registry `type` matching DOM `data-ks-type` when that attribute is present.
 */

import {
  entryByHash,
  generatedRegistryPath,
  ksVisualHashReportFromMetrics,
  loadGeneratedRegistry,
  registryDuplicateHashes,
} from '../../../lib/visual-catalog.js';

/** Cap findings per page pass (registry crosswalk). */
export const MAX_HASH_REGISTRY_ROW_FINDINGS = 12;

const REG_DUP_CTX = '_forgeUxDetHashRegistryDupOnce';

export const rule = {
  id: 'DET.HASH.REGISTRY_ROW',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'warn',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-hash-registry-row',
};

/**
 * @param {string} value
 * @returns {string}
 */
export function normalizeKsType(value) {
  return String(value || '').trim().toLowerCase();
}

/**
 * @param {Record<string, unknown> | null | undefined} metrics
 * @returns {{ hash: string, dataKsType: string, tag: string }[]}
 */
export function instancesFromMetrics(metrics) {
  const rep = ksVisualHashReportFromMetrics(metrics);
  if (Array.isArray(rep.instances) && rep.instances.length) {
    return rep.instances
      .map((row) => ({
        hash: String(row?.hash || '').trim(),
        dataKsType: String(row?.dataKsType || ''),
        tag: String(row?.tag || ''),
      }))
      .filter((row) => /^[A-Za-z]{3}$/.test(row.hash));
  }
  return (rep.validUnique || []).map((hash) => ({
    hash: String(hash),
    dataKsType: '',
    tag: '',
  }));
}

/**
 * @param {import('playwright').Page | null | undefined} page
 * @returns {Promise<{ hash: string, dataKsType: string, tag: string }[]>}
 */
export async function collectHashInstancesFromPage(page) {
  if (!page || typeof page.evaluate !== 'function') return [];
  return page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('[data-ks-hash], [hash]'));
    /** @type {{ hash: string, dataKsType: string, tag: string }[]} */
    const out = [];
    for (const el of nodes) {
      const dTrim = String(el.getAttribute('data-ks-hash') || '').trim();
      const hTrim = String(el.getAttribute('hash') || '').trim();
      const dValid = /^[A-Za-z]{3}$/.test(dTrim);
      const hValid = /^[A-Za-z]{3}$/.test(hTrim);
      if (dValid && hValid && dTrim !== hTrim) continue;
      const canon = dValid ? dTrim : (hValid ? hTrim : '');
      if (!canon) continue;
      out.push({
        hash: canon,
        dataKsType: String(el.getAttribute('data-ks-type') || ''),
        tag: el.tagName.toLowerCase(),
      });
    }
    return out;
  });
}

/**
 * @param {string} repoRoot
 * @param {{ hash: string, dataKsType: string, tag: string }[]} instances
 * @param {Record<string, unknown>} [ctx]
 */
export function buildHashRegistryRowReport(repoRoot, instances, ctx = {}) {
  const reg = loadGeneratedRegistry(repoRoot);
  const registryJson = 'docs/design/catalog/visual-registry.generated.json';

  if (!reg?.entries?.length) {
    const valid = instances.filter((i) => /^[A-Za-z]{3}$/.test(i.hash));
    return {
      skipped: true,
      reason: 'no-registry',
      registryJson,
      registryPath: generatedRegistryPath(repoRoot),
      issues: valid.length
        ? [{
            kind: 'registry-missing',
            hash: '',
            message: `KS visual hash markers were found but ${registryJson} is missing or unreadable for this repo root.`,
          }]
        : [],
    };
  }

  const byHash = entryByHash(reg.entries);
  const dupHashes = registryDuplicateHashes(reg.entries);
  /** @type {Array<{
   *   kind: string,
   *   hash: string,
   *   domType?: string,
   *   registryType?: string,
   *   name?: string,
   *   message: string,
   * }>} */
  const issues = [];

  if (dupHashes.length && !ctx[REG_DUP_CTX]) {
    ctx[REG_DUP_CTX] = true;
    issues.push({
      kind: 'registry-duplicate',
      hash: '',
      message: `Generated registry lists duplicate hash keys: ${dupHashes.join(', ')}.`,
    });
  }

  const unknownSeen = new Set();
  const deprecatedSeen = new Set();

  for (const inst of instances) {
    const h = String(inst.hash || '').trim();
    if (!/^[A-Za-z]{3}$/.test(h)) continue;

    const entry = byHash.get(h);
    if (!entry) {
      if (!unknownSeen.has(h)) {
        unknownSeen.add(h);
        issues.push({
          kind: 'unknown-hash',
          hash: h,
          message: `Rendered hash ${h} is not in ${registryJson}.`,
        });
      }
      continue;
    }

    if (String(entry.status || '').toLowerCase() === 'deprecated' && !deprecatedSeen.has(h)) {
      deprecatedSeen.add(h);
      const aliasHint = Array.isArray(entry.aliases) && entry.aliases.length
        ? entry.aliases.join(', ')
        : 'see registry aliases';
      issues.push({
        kind: 'deprecated',
        hash: h,
        name: String(entry.name || entry.slug || ''),
        message: `Deprecated KS visual hash still emitted: ${h} (${entry.name || entry.slug || 'catalog entry'}).`,
        remediationHint: aliasHint,
      });
    }

    const domType = normalizeKsType(inst.dataKsType);
    const registryType = normalizeKsType(entry.type);
    if (domType && registryType && domType !== registryType) {
      issues.push({
        kind: 'type-mismatch',
        hash: h,
        domType,
        registryType,
        message: `Hash ${h} emits data-ks-type="${inst.dataKsType.trim()}" but the registry row type is "${entry.type}".`,
      });
    }
  }

  issues.sort((a, b) => {
    const ha = a.hash || '';
    const hb = b.hash || '';
    if (ha !== hb) return ha.localeCompare(hb);
    return a.message.localeCompare(b.message);
  });

  return {
    skipped: false,
    registryJson,
    rowCount: reg.entries.length,
    issues,
  };
}

/**
 * @param {{
 *   skipped?: boolean,
 *   issues?: Array<{
 *     kind: string,
 *     hash: string,
 *     domType?: string,
 *     registryType?: string,
 *     name?: string,
 *     message: string,
 *     remediationHint?: string,
 *   }>,
 * }} report
 * @param {string} [url]
 * @returns {object[]}
 */
export function findingsFromHashRegistryRowReport(report, url = '') {
  if (!report) return [];
  const issues = Array.isArray(report.issues) ? report.issues : [];
  if (!issues.length) return [];

  const findings = [];
  const seen = new Set();

  for (const issue of issues.slice(0, MAX_HASH_REGISTRY_ROW_FINDINGS)) {
    const key = `${issue.kind}:${issue.hash}:${issue.domType || ''}:${issue.registryType || ''}:${issue.message}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const hash = issue.hash ? String(issue.hash) : '';
    let severity = 'warn';
    let remediation = '';

    if (issue.kind === 'registry-missing') {
      severity = 'minor';
      remediation =
        'Run the design-catalog JSON generator that emits visual-registry.generated.json, or copy a valid generated registry into the repo.';
    } else if (issue.kind === 'registry-duplicate') {
      severity = 'warn';
      remediation = 'Fix docs/design/catalog/visual-registry.yaml (or the generator) so each hash appears once.';
    } else if (issue.kind === 'unknown-hash') {
      severity = 'warn';
      remediation =
        'If this is a governed Forge Kitchen Sink surface, register it in docs/design/catalog/visual-registry.yaml and add a contract; otherwise remove the stray marker.';
    } else if (issue.kind === 'deprecated') {
      severity = 'minor';
      remediation = `Migrate to successor hash (${issue.remediationHint || 'see registry aliases'}). Update consumers and contracts.`;
    } else if (issue.kind === 'type-mismatch') {
      severity = 'minor';
      remediation =
        'Align `data-ks-type` on the visual root with the registry `type` field (see ks_hash_attrs / ks_catalog_hashes helpers).';
    }

    findings.push({
      severity,
      area: 'visual-catalog',
      hash: hash || undefined,
      selector: hash ? `[data-ks-hash="${hash}"]` : undefined,
      message: issue.message,
      evidence: hash
        ? [
            issue.kind === 'type-mismatch'
              ? `domType=${issue.domType} registryType=${issue.registryType}`
              : `hash=${hash}`,
            url ? `DOM marker on ${url}` : 'DOM marker on rendered page',
          ].filter(Boolean).join('; ')
        : (url ? `page=${url}` : 'visual-registry.generated.json'),
      remediation,
    });
  }

  if (issues.length > MAX_HASH_REGISTRY_ROW_FINDINGS) {
    findings.push({
      severity: 'minor',
      area: 'visual-catalog',
      message: `Additional registry crosswalk issues omitted (${issues.length - MAX_HASH_REGISTRY_ROW_FINDINGS} more).`,
      evidence: `hash_registry_row_total=${issues.length}`,
      remediation:
        'Run `node tools/design-catalog/check-visual-catalog.mjs --repo .` locally for the full registry report.',
    });
  }

  return findings;
}

export async function run({ metrics, url, page, repoRoot, ctx }) {
  const root = String(repoRoot || ctx?.repoRoot || metrics?.repoRoot || '').trim();
  if (!root) return [];

  let instances = metrics?.hashRegistryRowReport?.instances;
  if (!Array.isArray(instances) || !instances.length) {
    instances = instancesFromMetrics(metrics);
    const fromPage = await collectHashInstancesFromPage(page);
    if (fromPage.length) instances = fromPage;
  }

  const hasSignal = instances.some((i) => /^[A-Za-z]{3}$/.test(String(i.hash || '').trim()));
  if (!hasSignal) return [];

  const precomputed = metrics?.hashRegistryRowReport;
  const report = precomputed && Array.isArray(precomputed.issues)
    ? precomputed
    : buildHashRegistryRowReport(root, instances, ctx || {});

  const pageUrl = url || metrics?.url || '';
  return findingsFromHashRegistryRowReport(report, pageUrl);
}
