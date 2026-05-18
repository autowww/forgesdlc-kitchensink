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
