import { runCheck as homepageShell } from './homepage-shell.js';
import { applies as handbookApplies } from './platform-handbook-inner.js';
import { runCheck as platformHandbook } from './platform-handbook-inner.js';
import { runCheck as heroHeadings } from './hero-headings.js';
import { runCheck as firstScreenDensity } from './first-screen-density.js';
import { runCheck as productVisual } from './product-visual.js';
import { runCheck as storylineFlow } from './storyline-flow.js';
import { runCheck as ctaTrustEco } from './cta-trust-ecosystem.js';
import { runCheck as technicalDepth } from './technical-depth.js';
import { runCheck as readabilityStructure } from './readability-structure.js';
import { runCheck as metadataA11y } from './metadata-a11y.js';
import { runCheck as visualCatalogAwareness } from './visual-catalog-awareness.js';

const generalChecks = [
  heroHeadings,
  firstScreenDensity,
  productVisual,
  storylineFlow,
  ctaTrustEco,
  technicalDepth,
  readabilityStructure,
  metadataA11y,
  visualCatalogAwareness,
];

const LEGACY_CHECK_RUNNERS = [
  { checkId: 'homepage-shell', run: homepageShell },
  { checkId: 'hero-headings', run: heroHeadings },
  { checkId: 'first-screen-density', run: firstScreenDensity },
  { checkId: 'product-visual', run: productVisual },
  { checkId: 'storyline-flow', run: storylineFlow },
  { checkId: 'cta-trust-ecosystem', run: ctaTrustEco },
  { checkId: 'technical-depth', run: technicalDepth },
  { checkId: 'readability-structure', run: readabilityStructure },
  { checkId: 'metadata-a11y', run: metadataA11y },
  { checkId: 'visual-catalog-awareness', run: visualCatalogAwareness },
];

/** Legacy check modules scheduled for this URL (for execution telemetry). */
export function legacyChecksPlannedForUrl(ctx = {}, url = '') {
  if (handbookApplies(ctx, url)) return ['platform-handbook-inner'];
  return LEGACY_CHECK_RUNNERS.map((c) => c.checkId);
}

/**
 * Aggregate findings from modular UX checks (design standard heuristic rules).
 */
export function runAllChecks(metrics, url, ctx = {}) {
  if (handbookApplies(ctx, url)) return platformHandbook(metrics, url) || [];

  let all = [];
  const shellBatch = homepageShell(metrics, url, ctx);
  if (Array.isArray(shellBatch)) {
    for (const f of shellBatch) if (f) all.push(f);
  }
  for (const run of generalChecks) {
    const batch = run(metrics, url, ctx);
    if (!Array.isArray(batch)) continue;
    for (const f of batch) {
      if (f) all.push(f);
    }
  }
  return all;
}

/**
 * @returns {{ findings: import('../lib/severity.js').Finding[], trace: object[] }}
 */
export function runAllChecksWithTrace(metrics, url, ctx = {}) {
  const trace = [];
  if (handbookApplies(ctx, url)) {
    const batch = platformHandbook(metrics, url) || [];
    trace.push({
      checkId: 'platform-handbook-inner',
      status: 'ran',
      findingsCount: Array.isArray(batch) ? batch.length : 0,
    });
    return { findings: batch, trace };
  }

  let all = [];
  for (const { checkId, run } of LEGACY_CHECK_RUNNERS) {
    const batch = run(metrics, url, ctx);
    const findings = Array.isArray(batch) ? batch.filter(Boolean) : [];
    trace.push({ checkId, status: 'ran', findingsCount: findings.length });
    for (const f of findings) if (f) all.push(f);
  }
  return { findings: all, trace };
}
