import fs from 'node:fs/promises';

/**
 * @param {object} traceability
 * @param {object} finding
 * @param {string} [scenarioId]
 */
export function resolveTraceabilityForFinding(traceability, finding, scenarioId) {
  const selector = finding.selector || '';
  const hash =
    finding.hash ||
    (finding.evidence && finding.evidence.match(/data-ks-hash=([A-Za-z]{3})/)?.[1]) ||
    (selector.match(/data-ks-hash=["']([A-Za-z]{3})["']/)?.[1]);

  let traceabilityId = null;
  if (hash && traceability.byKsHash?.[hash]) {
    traceabilityId = traceability.byKsHash[hash];
  }
  if (!traceabilityId && selector && traceability.bySelector?.[selector]) {
    traceabilityId = traceability.bySelector[selector];
  }
  if (!traceabilityId && selector) {
    const m = selector.match(/#([\w-]+)/);
    if (m && traceability.bySelector?.[`#${m[1]}`]) {
      traceabilityId = traceability.bySelector[`#${m[1]}`];
    }
  }
  if (!traceabilityId && scenarioId && traceability.byScenarioId?.[scenarioId]) {
    traceabilityId = traceability.byScenarioId[scenarioId];
  }

  /** @type {object[]} */
  let sources = [];
  if (traceabilityId) {
    const entry = (traceability.entries || []).find((e) => e.id === traceabilityId);
    if (entry?.sources?.length) sources = [...entry.sources];
  }

  return { traceabilityId, sources };
}

/**
 * @param {object} auditData
 * @param {object} traceability
 */
export function enrichAuditData(auditData, traceability) {
  const pages = (auditData.pages || []).map((page) => {
    const scenarioId = page.scenarioId || null;
    const findings = (page.findings || []).map((f) => {
      const { traceabilityId, sources } = resolveTraceabilityForFinding(
        traceability,
        f,
        scenarioId,
      );
      return {
        ...f,
        ...(scenarioId ? { scenarioId } : {}),
        ...(traceabilityId ? { traceabilityId } : {}),
        ...(sources.length ? { sources } : {}),
      };
    });
    const pageSources =
      scenarioId && traceability.byScenarioId?.[scenarioId]
        ? (traceability.entries || []).find((e) => e.id === traceability.byScenarioId[scenarioId])
            ?.sources || []
        : [];
    return {
      ...page,
      findings,
      ...(pageSources.length ? { defaultSources: pageSources } : {}),
    };
  });

  return {
    ...auditData,
    schemaVersion: auditData.schemaVersion || 2,
    traceabilityRef: traceability.meta || null,
    pages,
    enriched: true,
  };
}

/**
 * @param {string} auditPath
 * @param {string} tracePath
 * @param {string} outPath
 */
export async function enrichAuditFile(auditPath, tracePath, outPath) {
  const audit = JSON.parse(await fs.readFile(auditPath, 'utf8'));
  const traceability = JSON.parse(await fs.readFile(tracePath, 'utf8'));
  const enriched = enrichAuditData(audit, traceability);
  await fs.writeFile(outPath, `${JSON.stringify(enriched, null, 2)}\n`, 'utf8');
  return enriched;
}
