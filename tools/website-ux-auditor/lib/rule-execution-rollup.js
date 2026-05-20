/**
 * Roll up per-page rule execution traces into crawl/audit coverage summaries.
 */

function emptyCounts() {
  return {
    ran: 0,
    skipped_no_findings_cache: 0,
    skipped_stub: 0,
    skipped_status: 0,
    import_error: 0,
    no_run: 0,
    threw: 0,
    zero_findings: 0,
    with_findings: 0,
  };
}

/** @param {string} status */
export function isDeterministicRuleSatisfiedStatus(status) {
  const s = String(status || '');
  return s === 'ran' || s === 'skipped_no_findings_cache';
}

/**
 * @param {Array<{ ruleExecution?: { legacy?: object[], deterministic?: object[] } }>} pages
 * @param {{ implementedRuleIds?: string[] }} registryMeta
 */
export function rollupRuleExecution(pages, registryMeta = {}) {
  const detByRule = new Map();
  const legacyByCheck = new Map();
  const pageErrors = [];

  for (const page of pages || []) {
    const url = page?.url || page?.metrics?.url || '';
    if (page?.error && !page?.ruleExecution) {
      pageErrors.push({ url, error: page.error });
    }
    for (const row of page?.ruleExecution?.legacy || []) {
      const id = String(row.checkId || '');
      if (!id) continue;
      if (!legacyByCheck.has(id)) legacyByCheck.set(id, { checkId: id, pagesRan: 0, totalFindings: 0 });
      const agg = legacyByCheck.get(id);
      if (row.status === 'ran') {
        agg.pagesRan += 1;
        agg.totalFindings += Number(row.findingsCount || 0);
      }
    }
    for (const row of page?.ruleExecution?.deterministic || []) {
      const id = String(row.ruleId || '');
      if (!id) continue;
      if (!detByRule.has(id)) {
        detByRule.set(id, {
          ruleId: id,
          registryStatus: row.registryStatus || null,
          implementationSource: row.implementationSource || null,
          ...emptyCounts(),
          pagesRan: 0,
        });
      }
      const agg = detByRule.get(id);
      const status = String(row.status || '');
      if (status in agg) agg[status] += 1;
      if (status === 'ran') {
        agg.pagesRan += 1;
        const n = Number(row.findingsCount || 0);
        if (n > 0) agg.with_findings += 1;
        else agg.zero_findings += 1;
      } else if (status === 'skipped_no_findings_cache') {
        agg.pagesRan += 1;
        agg.zero_findings += 1;
      }
    }
  }

  const implemented = registryMeta.implementedRuleIds || [...detByRule.keys()];
  const pagesVisited = (pages || []).filter((p) => !p?.error || p?.ruleExecution).length;
  const missingOnAnyPage = implemented.filter((ruleId) => {
    let satisfied = 0;
    for (const page of pages || []) {
      if (page?.error && !page?.ruleExecution) continue;
      const row = (page?.ruleExecution?.deterministic || []).find((r) => String(r.ruleId || '') === ruleId);
      if (row && isDeterministicRuleSatisfiedStatus(row.status)) satisfied += 1;
    }
    return satisfied < pagesVisited;
  });

  return {
    pagesVisited,
    pageLoadErrors: pageErrors,
    legacyChecks: [...legacyByCheck.values()].sort((a, b) => a.checkId.localeCompare(b.checkId)),
    deterministicRules: [...detByRule.values()].sort((a, b) => a.ruleId.localeCompare(b.ruleId)),
    registryImplementedCount: implemented.length,
    deterministicRanOnAllVisitedPages: missingOnAnyPage.length === 0 && pagesVisited > 0,
    deterministicMissingOnPages: missingOnAnyPage,
  };
}

export function formatExecutionCoverageMarkdown(coverage) {
  if (!coverage) return '_No rule execution telemetry for this run._';
  const lines = [
    `- **Pages with execution trace:** ${coverage.pagesVisited}`,
    `- **Registry implemented DET rules:** ${coverage.registryImplementedCount}`,
    `- **All implemented rules ran on every visited page:** ${coverage.deterministicRanOnAllVisitedPages ? 'yes' : 'no'}`,
  ];
  if (coverage.deterministicMissingOnPages?.length) {
    lines.push(`- **Rules not ran on every page:** ${coverage.deterministicMissingOnPages.join(', ')}`);
  }
  const importErrors = (coverage.deterministicRules || []).filter((r) => r.import_error > 0 || r.threw > 0);
  if (importErrors.length) {
    lines.push(`- **Rules with import/runtime errors:** ${importErrors.map((r) => r.ruleId).join(', ')}`);
  }
  return lines.join('\n');
}
