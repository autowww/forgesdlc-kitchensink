/**
 * DET.JS.NO_CONSOLE_ERROR — scripted surfaces must not emit console/page errors on golden-path smoke.
 * Evidence: Playwright console + pageerror listeners during bounded interaction probes.
 */

const MAX_SMOKE_STEPS = 5;
const SMOKE_STEP_MS = 220;
const MAX_ERRORS = 12;

const SMOKE_SELECTORS = [
  '[data-bs-toggle="tab"]',
  '[data-bs-toggle="collapse"]',
  '[data-bs-toggle="pill"]',
  'details:not([open]) > summary',
  'button.theme-toggle, [data-theme-toggle], [data-bs-theme-value]',
  '.navbar-toggler[data-bs-toggle="collapse"]',
];

/** @param {string} text */
export function shouldIgnoreConsoleMessage(text) {
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

export const rule = {
  id: 'DET.JS.NO_CONSOLE_ERROR',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'interaction',
  scoreDimension: 'depthAndTechnicalDisclosure',
  defaultSeverity: 'major',
  priorityWeight: 8,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-js-no_console_error',
};

/**
 * @param {{ errorCount?: number, errors?: Array<Record<string, unknown>>, smokeSteps?: number } | null | undefined} report
 * @param {string} [url]
 */
export function findingsFromJsConsoleErrorReport(report, url = '') {
  const errors = Array.isArray(report?.errors) ? report.errors : [];
  if (!errors.length) return [];

  const findings = [];
  const seen = new Set();

  for (const err of errors.slice(0, MAX_ERRORS)) {
    const kind = String(err.kind || 'console');
    const text = String(err.text || '').replace(/\s+/g, ' ').trim().slice(0, 240);
    if (!text || shouldIgnoreConsoleMessage(text)) continue;
    const key = `${kind}:${text}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const location = String(err.location || err.url || '').slice(0, 160);
    const evidenceParts = [`kind=${kind}`, `message="${text}"`];
    if (location) evidenceParts.push(`location=${location}`);
    if (err.smokeStep != null) evidenceParts.push(`smokeStep=${err.smokeStep}`);

    findings.push({
      severity: kind === 'pageerror' ? 'major' : 'major',
      area: 'interaction',
      message:
        kind === 'pageerror'
          ? 'Uncaught script error occurred during page load or golden-path interaction smoke.'
          : 'Browser console reported a script error during page load or golden-path interaction smoke.',
      evidence: evidenceParts.join(' '),
      remediation:
        'Fix the underlying JavaScript exception, then re-run showcase or Playwright smoke on this route so scripted interactions complete without console errors.',
    });
  }

  if (url) {
    for (const finding of findings) {
      finding.evidence = `${finding.evidence} url=${url}`;
    }
  }

  return findings;
}

/**
 * Attach listeners before navigation when possible; call finish() after load/smoke.
 * @param {import('playwright').Page} page
 */
export function beginJsConsoleErrorCapture(page) {
  /** @type {Array<Record<string, unknown>>} */
  const errors = [];
  const seen = new Set();

  const push = (entry) => {
    const text = String(entry.text || '').trim();
    if (!text || shouldIgnoreConsoleMessage(text)) return;
    const key = `${entry.kind}:${text}:${entry.location || ''}`;
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
    /** @param {{ smokeSteps?: number }} [meta] */
    finish(meta = {}) {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
      return {
        errorCount: errors.length,
        errors: errors.slice(0, MAX_ERRORS),
        smokeSteps: Number(meta.smokeSteps || 0),
      };
    },
  };
}

/** @param {import('playwright').Page} page */
export async function runGoldenPathSmoke(page) {
  let steps = 0;
  for (const selector of SMOKE_SELECTORS) {
    if (steps >= MAX_SMOKE_STEPS) break;
    const loc = page.locator(selector);
    const count = await loc.count();
    if (!count) continue;
    for (let i = 0; i < Math.min(count, 2) && steps < MAX_SMOKE_STEPS; i += 1) {
      const target = loc.nth(i);
      try {
        if (!(await target.isVisible())) continue;
        await target.click({ timeout: 2500 });
        await page.waitForTimeout(SMOKE_STEP_MS);
        steps += 1;
      } catch {
        /* skip non-actionable controls */
      }
    }
  }
  return steps;
}

/**
 * @param {import('playwright').Page} page
 * @param {{ existingCapture?: ReturnType<typeof beginJsConsoleErrorCapture> | null, runSmoke?: boolean }} [opts]
 */
export async function collectJsConsoleErrorReport(page, opts = {}) {
  const runSmoke = opts.runSmoke !== false;
  const capture = opts.existingCapture || beginJsConsoleErrorCapture(page);
  const smokeSteps = runSmoke ? await runGoldenPathSmoke(page) : 0;
  return capture.finish({ smokeSteps });
}

export async function run({ metrics, page, url }) {
  const report = metrics?.jsConsoleErrorReport
    ?? (page ? await collectJsConsoleErrorReport(page) : null);
  if (!report || !(report.errors || []).length) return [];
  return findingsFromJsConsoleErrorReport(report, url || metrics?.url || '');
}
