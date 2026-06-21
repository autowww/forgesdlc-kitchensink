/**
 * DET.APP.CLIENT_ERROR_LOG_CLEAN — scenario steps must not leave console/page errors after interactions.
 */

import { shouldIgnoreConsoleMessage } from './det-js-no-console-error.check.js';

export { shouldIgnoreConsoleMessage as shouldIgnoreScenarioConsoleMessage };

export const rule = {
  id: 'DET.APP.CLIENT_ERROR_LOG_CLEAN',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'interaction',
  scoreDimension: 'depthAndTechnicalDisclosure',
  defaultSeverity: 'major',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-app-client-error-log-clean',
};

/**
 * @param {{ errors?: Array<Record<string, unknown>>, scenarioId?: string, stepsExecuted?: number } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromClientErrorLogReport(report, url = '') {
  const errors = Array.isArray(report?.errors) ? report.errors : [];
  if (!errors.length) return [];

  const findings = [];
  const seen = new Set();

  for (const err of errors.slice(0, 12)) {
    const kind = String(err.kind || 'console');
    const text = String(err.text || '').replace(/\s+/g, ' ').trim().slice(0, 240);
    if (!text || shouldIgnoreConsoleMessage(text)) continue;
    const key = `${kind}:${text}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const evidenceParts = [`kind=${kind}`, `message="${text}"`];
    if (err.scenarioId) evidenceParts.push(`scenarioId=${err.scenarioId}`);
    if (err.scenarioStep != null) evidenceParts.push(`scenarioStep=${err.scenarioStep}`);
    if (report?.stepsExecuted != null) evidenceParts.push(`stepsExecuted=${report.stepsExecuted}`);
    if (err.location) evidenceParts.push(`location=${String(err.location).slice(0, 120)}`);

    findings.push({
      severity: 'major',
      area: 'interaction',
      message:
        kind === 'pageerror'
          ? 'Uncaught script error occurred after scenario step interactions.'
          : 'Browser console reported an error after scenario step interactions.',
      evidence: evidenceParts.join(' '),
      remediation:
        'Fix the exception thrown by the interaction path and re-run the scenario audit for this step.',
    });
  }

  if (url) {
    for (const finding of findings) {
      finding.evidence = `${finding.evidence} url=${url}`;
    }
  }

  return findings;
}

export async function run({ metrics, page, url }) {
  const report = metrics?.scenarioClientErrorReport ?? null;
  if (!report) {
    if (!page || !metrics?.scenario?.id) return [];
    return [];
  }
  if (!(report.errors || []).length) return [];
  return findingsFromClientErrorLogReport(report, url || metrics?.url || '');
}
