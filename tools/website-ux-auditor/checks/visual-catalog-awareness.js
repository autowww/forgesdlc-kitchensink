import path from 'node:path';

import { makeFinding } from '../lib/severity.js';
import { entryByHash, loadGeneratedRegistry } from '../lib/visual-catalog.js';

export const checkId = 'visual-catalog-awareness';

function loadCatalog(repoRoot) {
  const j = loadGeneratedRegistry(repoRoot);
  if (!j) return null;
  const entries = j.entries || [];
  return { byHash: entryByHash(entries) };
}

/**
 * Optional awareness when `--repo` points at a checkout that carries the KS design catalog.
 * @param {Record<string, unknown>} m
 * @param {string} url
 * @param {{ siteKind?: string, repoRoot?: string }} ctx
 */
export function runCheck(m, url, ctx = {}) {
  const repoRoot = ctx.repoRoot && String(ctx.repoRoot).trim() ? String(ctx.repoRoot) : '';
  if (!repoRoot) return [];

  const raw = m?.ksVisualHashes;
  if (!Array.isArray(raw) || !raw.length) return [];

  const cat = loadCatalog(repoRoot);
  if (!cat) return [];

  const { byHash } = cat;
  const seen = new Set();
  const findings = [];

  for (const hRaw of raw) {
    const h = String(hRaw || '');
    if (!/^[A-Za-z]{3}$/.test(h) || seen.has(h)) continue;
    seen.add(h);

    const e = byHash.get(h);
    if (!e) {
      findings.push(
        makeFinding({
          checkId,
          severity: 'trivial',
          area: 'visual-catalog',
          message: `Unknown KS visual hash in DOM: ${h}`,
          evidence: 'hash or data-ks-hash attribute on a rendered element',
          remediation:
            'If this is a governed Forge Kitchen Sink surface, register it in docs/design/catalog/visual-registry.yaml and add a contract; otherwise remove the stray marker.',
        }),
      );
      continue;
    }

    if (String(e.status || '').toLowerCase() === 'deprecated') {
      const aliasHint = Array.isArray(e.aliases) && e.aliases.length ? e.aliases.join(', ') : 'see registry aliases';
      const contract = e.contract || 'docs/design/catalog/README.md';
      findings.push(
        makeFinding({
          checkId,
          severity: 'minor',
          area: 'visual-catalog',
          message: `Deprecated KS visual hash still emitted: ${h} (${e.name || e.slug || 'catalog entry'})`,
          evidence: 'Deprecated status in visual-registry.yaml',
          remediation: `Migrate to successor hash (${aliasHint}). Design contract: ${contract}`,
        }),
      );
    }

    const contractStat = String(e.contract_status || '').toLowerCase();
    if (contractStat === 'missing') {
      findings.push(
        makeFinding({
          checkId,
          severity: 'minor',
          area: 'visual-catalog',
          message: `KS visual hash in DOM has contract_status missing in catalog: ${h}`,
          evidence: 'contract_status missing in visual-registry.yaml / visual-registry.generated.json',
          remediation: 'Set contract_status to own, family-covered, or not-applicable and add or link a design contract.',
        }),
      );
    }

    const contractPath = e.contract && String(e.contract).trim();
    if (contractPath && (contractStat === 'own' || contractStat === 'family-covered')) {
      const abs = path.join(repoRoot, contractPath);
      if (!fs.existsSync(abs)) {
        findings.push(
          makeFinding({
            checkId,
            severity: 'minor',
            area: 'visual-catalog',
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
