/**
 * Console/page-error capture for scenario steps (post-load interactions).
 */

/** @param {string} text */
export function shouldIgnoreScenarioConsoleMessage(text) {
  const t = String(text || '').trim();
  if (!t) return true;
  const lower = t.toLowerCase();
  if (/favicon\.ico/i.test(t)) return true;
  if (/resizeobserver loop/i.test(lower)) return true;
  if (/failed to load resource.*favicon/i.test(lower)) return true;
  if (/chrome-extension:\/\//i.test(t)) return true;
  if (/moz-extension:\/\//i.test(t)) return true;
  if (/devtools/i.test(t) && /source map/i.test(lower)) return true;
  return false;
}

/**
 * @param {import('playwright').Page} page
 */
export function beginScenarioClientErrorCapture(page) {
  /** @type {Array<Record<string, unknown>>} */
  const errors = [];
  const seen = new Set();

  const push = (entry) => {
    const text = String(entry.text || '').trim();
    if (!text || shouldIgnoreScenarioConsoleMessage(text)) return;
    const key = `${entry.kind}:${text}:${entry.location || ''}:${entry.scenarioStep ?? ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    errors.push(entry);
  };

  /** @param {import('playwright').ConsoleMessage} msg */
  const onConsole = (msg) => {
    if (msg.type() !== 'error') return;
    const loc = msg.location();
    push({
      kind: 'console',
      text: msg.text(),
      location: loc?.url ? `${loc.url}:${loc.lineNumber || 0}` : '',
    });
  };

  /** @param {Error} err */
  const onPageError = (err) => {
    push({ kind: 'pageerror', text: String(err?.message || err) });
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  return {
    /**
     * @param {{ scenarioId?: string, stepsExecuted?: number }} [meta]
     */
    finish(meta = {}) {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
      return {
        scenarioId: meta.scenarioId || null,
        stepsExecuted: Number(meta.stepsExecuted || 0),
        errorCount: errors.length,
        errors: errors.slice(0, 12),
      };
    },
  };
}

/**
 * Tag errors that occurred after scenario steps with step metadata.
 * @param {ReturnType<ReturnType<typeof beginScenarioClientErrorCapture>['finish']>} report
 * @param {{ stepsExecuted?: number, scenarioId?: string }} meta
 */
export function finalizeScenarioClientErrorReport(report, meta = {}) {
  const stepsExecuted = Number(meta.stepsExecuted || report?.stepsExecuted || 0);
  const scenarioId = meta.scenarioId || report?.scenarioId || null;
  const errors = (report?.errors || []).map((err) => ({
    ...err,
    scenarioStep: stepsExecuted > 0 ? stepsExecuted : err.scenarioStep ?? null,
    scenarioId: scenarioId || err.scenarioId || null,
  }));
  return {
    ...report,
    scenarioId,
    stepsExecuted,
    errors,
    errorCount: errors.length,
  };
}
