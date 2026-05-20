import fs from 'node:fs';
import path from 'node:path';

import { makeFinding } from '../lib/severity.js';
import {
  entryByHash,
  ksVisualHashReportFromMetrics,
  loadGeneratedRegistry,
  registryDuplicateHashes,
} from '../lib/visual-catalog.js';

export const checkId = 'visual-catalog-awareness';

const REG_DUP_CTX = '_forgeUxVisualCatalogRegistryDupOnce';

function loadCatalog(repoRoot) {
  const j = loadGeneratedRegistry(repoRoot);
  if (!j) return null;
  const entries = j.entries || [];
  return {
    byHash: entryByHash(entries),
    duplicateHashes: registryDuplicateHashes(entries),
  };
}

/**
 * Optional awareness when `--repo` points at a checkout that carries the KS design catalog.
 * @param {Record<string, unknown>} m
 * @param {string} url
 * @param {{ siteKind?: string, repoRoot?: string }} ctx
 */
export function runCheck(m, url, ctx = {}) {
  const repoRoot = ctx.repoRoot && String(ctx.repoRoot).trim() ? String(ctx.repoRoot) : '';
  const rep = ksVisualHashReportFromMetrics(m);
  const hasDomSignal =
    (rep.validUnique && rep.validUnique.length)
    || (rep.invalidRaw && rep.invalidRaw.length)
    || (rep.mismatches && rep.mismatches.length)
    || (rep.incompleteMarkers && rep.incompleteMarkers.length);

  if (!hasDomSignal) return [];

  const findings = [];
  const registryJson = 'docs/design/catalog/visual-registry.generated.json';

  for (const inv of rep.invalidRaw || []) {
    findings.push(
      makeFinding({
        id: 'visual-catalog-invalid-hash',
        checkId,
        severity: 'minor',
        area: 'visual-catalog',
        message: `Invalid KS visual hash marker value "${inv.value}" (${inv.source}) — expected exactly three ASCII letters.`,
        evidence: `${inv.source} attribute on rendered DOM (${url})`,
        remediation:
          'Use a three-letter Forge Kitchen Sink hash registered in the design catalog, or remove stray markers.',
      }),
    );
  }

  for (const mm of rep.mismatches || []) {
    findings.push(
      makeFinding({
        id: 'visual-catalog-hash-mismatch',
        checkId,
        severity: 'minor',
        area: 'visual-catalog',
        hash: mm.dataKsHash,
        selector: `[data-ks-hash="${mm.dataKsHash}"]`,
        message: `hash="${mm.hashAttr}" and data-ks-hash="${mm.dataKsHash}" disagree on the same <${mm.tag}> node.`,
        evidence: 'Mismatched governed hash attributes on one element',
        remediation:
          'Emit the same three-letter hash in both `hash="XYZ"` and `data-ks-hash="XYZ"` on each visual root.',
      }),
    );
  }

  for (const inc of rep.incompleteMarkers || []) {
    const h = inc.hash || inc.dataKsHash || '';
    findings.push(
      makeFinding({
        id: 'visual-catalog-incomplete-marker',
        checkId,
        severity: 'warn',
        area: 'visual-catalog',
        hash: String(h),
        selector: `[data-ks-hash="${h}"]`,
        message:
          inc.side === 'hash-missing'
            ? `data-ks-hash present without matching hash= on <${inc.tag}> (expected both attributes).`
            : `hash= present without data-ks-hash on <${inc.tag}> (expected both attributes).`,
        evidence: `Partial KS marker pair on ${url}`,
        remediation:
          'Add both `hash="XYZ"` and `data-ks-hash="XYZ"` on governed visual roots per KS visual catalog rules.',
      }),
    );
  }

  for (const [h, c] of Object.entries(rep.instanceCountByHash || {})) {
    if (Number(c) <= 1) continue;
    findings.push(
      makeFinding({
        id: 'visual-catalog-duplicate-emitted-hash',
        checkId,
        severity: 'warn',
        area: 'visual-catalog',
        hash: h,
        selector: `[data-ks-hash="${h}"]`,
        message: `KS visual hash ${h} appears on ${c} elements — verify this is intentional for reusable surfaces.`,
        evidence: `instanceCountByHash[${h}]=${c} in DOM scan`,
        remediation:
          'If multiple instances are unintended duplicates, dedupe visual roots; otherwise document repeated use in the catalog contract.',
      }),
    );
  }

  if (!repoRoot) {
    return findings;
  }

  const cat = loadCatalog(repoRoot);
  if (!cat) {
    findings.push(
      makeFinding({
        id: 'visual-catalog-registry-missing',
        checkId,
        severity: 'minor',
        area: 'visual-catalog',
        message: `KS visual hash markers were found in the DOM but ${registryJson} is missing or unreadable for this repo root.`,
        evidence: `Expected ${path.join(repoRoot, registryJson)}`,
        remediation:
          'Run the design-catalog JSON generator that emits visual-registry.generated.json, or copy a valid generated registry into the repo.',
      }),
    );
    return findings;
  }

  if (cat.duplicateHashes.length && !ctx[REG_DUP_CTX]) {
    /** @type {Record<string, unknown>} */
    const ctxMut = ctx;
    ctxMut[REG_DUP_CTX] = true;
    findings.push(
      makeFinding({
        id: 'visual-catalog-registry-duplicate-hash',
        checkId,
        severity: 'warn',
        area: 'visual-catalog',
        message: `Generated registry lists duplicate hash keys: ${cat.duplicateHashes.join(', ')}.`,
        evidence: registryJson,
        remediation: 'Fix docs/design/catalog/visual-registry.yaml (or the generator) so each hash appears once.',
      }),
    );
  }

  const { byHash } = cat;
  const seen = new Set();

  for (const hRaw of rep.validUnique || []) {
    const h = String(hRaw || '');
    if (!/^[A-Za-z]{3}$/.test(h) || seen.has(h)) continue;
    seen.add(h);

    const e = byHash.get(h);
    if (!e) {
      findings.push(
        makeFinding({
          id: 'visual-catalog-unknown-hash',
          checkId,
          severity: 'warn',
          area: 'visual-catalog',
          hash: h,
          selector: `[data-ks-hash="${h}"]`,
          message: `Rendered hash ${h} is not in ${registryJson}`,
          evidence: `DOM marker on ${url}`,
          remediation:
            'If this is a governed Forge Kitchen Sink surface, register it in docs/design/catalog/visual-registry.yaml and add a contract; otherwise remove the stray marker.',
          deterministicRule: 'DET.CATALOG.HASH_REGISTRY_UNKNOWN',
        }),
      );
      continue;
    }

    if (String(e.status || '').toLowerCase() === 'deprecated') {
      const aliasHint = Array.isArray(e.aliases) && e.aliases.length ? e.aliases.join(', ') : 'see registry aliases';
      const contract = e.contract || 'docs/design/catalog/README.md';
      findings.push(
        makeFinding({
          id: 'visual-catalog-deprecated-hash',
          checkId,
          severity: 'minor',
          area: 'visual-catalog',
          hash: h,
          selector: `[data-ks-hash="${h}"]`,
          message: `Deprecated KS visual hash still emitted: ${h} (${e.name || e.slug || 'catalog entry'})`,
          evidence: 'Deprecated status in visual-registry',
          remediation: `Migrate to successor hash (${aliasHint}). Design contract: ${contract}`,
        }),
      );
    }

    const contractStat = String(e.contract_status || '').toLowerCase();
    if (contractStat === 'missing') {
      findings.push(
        makeFinding({
          id: 'visual-catalog-contract-status-missing',
          checkId,
          severity: 'minor',
          area: 'visual-catalog',
          hash: h,
          selector: `[data-ks-hash="${h}"]`,
          message: `KS visual hash in DOM has contract_status missing in catalog: ${h}`,
          evidence: `contract_status missing in ${registryJson}`,
          remediation:
            'Set contract_status to own, family-covered, or not-applicable and add or link a design contract.',
        }),
      );
    }

    const needsContract = contractStat === 'own' || contractStat === 'family-covered';
    const contractPath = e.contract && String(e.contract).trim();
    if (needsContract && !contractPath) {
      findings.push(
        makeFinding({
          id: 'visual-catalog-missing-contract-ref',
          checkId,
          severity: 'minor',
          area: 'visual-catalog',
          hash: h,
          selector: `[data-ks-hash="${h}"]`,
          message: `Catalog entry for ${h} declares contract_status=${e.contract_status} but contract path is empty.`,
          evidence: registryJson,
          remediation:
            'Point contract to docs/design/catalog/... markdown or set contract_status to not-applicable with a justified family rule.',
        }),
      );
    }

    if (contractPath && needsContract) {
      const abs = path.join(repoRoot, contractPath);
      if (!fs.existsSync(abs)) {
        findings.push(
          makeFinding({
            id: 'visual-catalog-contract-file-missing',
            checkId,
            severity: 'minor',
            area: 'visual-catalog',
            hash: h,
            selector: `[data-ks-hash="${h}"]`,
            message: `Catalog lists contract for hash ${h} but file is missing: ${contractPath}`,
            evidence: 'contract path absent on disk for this repo checkout',
            remediation: 'Restore the Markdown contract or update the registry contract path.',
          }),
        );
      }
    }
  }

  return findings;
}
