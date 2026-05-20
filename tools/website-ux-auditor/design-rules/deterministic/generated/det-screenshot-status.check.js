/**
 * DET.SCREENSHOT.STATUS — registry screenshot_status must match on-disk catalog PNGs
 * and blocked/planned/missing rows must document why (url, notes, or screenshot_reason).
 *
 * Primary evidence: `docs/design/catalog/visual-registry.generated.json` + screenshot manifest dir.
 */

import fs from 'node:fs';
import path from 'node:path';

import { loadGeneratedRegistry } from '../../../lib/visual-catalog.js';

export const CATALOG_SCREENSHOT_DIR = 'docs/design/catalog/screenshots';
export const REGISTRY_JSON = 'docs/design/catalog/visual-registry.generated.json';

/** Cap findings per audit pass (full-registry screenshot scan). */
export const MAX_SCREENSHOT_STATUS_FINDINGS = 12;

const VALID_HASH = /^[A-Za-z]{3}$/;

const SCREENSHOT_STATUSES = new Set(['planned', 'captured', 'missing', 'not-applicable', 'blocked']);

const DOCUMENTED_NON_CAPTURED = new Set(['planned', 'missing', 'blocked']);

export const rule = {
  id: 'DET.SCREENSHOT.STATUS',
  lane: 'deterministic',
  phase: 'metrics',
  area: 'visual-catalog',
  scoreDimension: 'visualCatalogGovernance',
  defaultSeverity: 'warn',
  priorityWeight: 7,
  source: 'docs/design/ux-audit/deterministic-design-rules.md#det-screenshot-status',
};

/**
 * @param {string} repoRoot
 * @param {string} hash
 * @returns {string}
 */
export function catalogScreenshotPngPath(repoRoot, hash) {
  return path.join(repoRoot, CATALOG_SCREENSHOT_DIR, `${hash}.png`);
}

/**
 * @param {object | null | undefined} entry
 * @returns {boolean}
 */
export function hasScreenshotDocumentation(entry) {
  const su = String(entry?.screenshot_url || '').trim();
  const note = String(entry?.notes || '').trim();
  const sr = String(entry?.screenshot_reason || '').trim();
  return Boolean(su || note || sr);
}

/**
 * @param {string} repoRoot
 */
export function scanScreenshotStatus(repoRoot) {
  const reg = loadGeneratedRegistry(repoRoot);
  if (!reg?.entries?.length) {
    return { skipped: true, reason: 'no-registry', registryJson: REGISTRY_JSON, issues: [] };
  }

  /** @type {Array<{
   *   kind: string,
   *   hash: string,
   *   screenshotStatus?: string,
   *   catalogPng?: string,
   *   message: string,
   * }>} */
  const issues = [];

  for (const e of reg.entries) {
    const hash = String(e?.hash || '').trim();
    if (!VALID_HASH.test(hash)) continue;

    const ssRaw = e.screenshot_status;
    const ss = ssRaw != null && ssRaw !== '' ? String(ssRaw).trim() : '';

    if (ss && !SCREENSHOT_STATUSES.has(ss)) {
      issues.push({
        kind: 'unknown-status',
        hash,
        screenshotStatus: ss,
        message: `Registry row ${hash} has unknown screenshot_status "${ss}".`,
      });
      continue;
    }

    if (ss === 'captured') {
      const catalogPng = catalogScreenshotPngPath(repoRoot, hash);
      if (!fs.existsSync(catalogPng)) {
        issues.push({
          kind: 'captured-missing-png',
          hash,
          screenshotStatus: ss,
          catalogPng: path.relative(repoRoot, catalogPng).replace(/\\/g, '/'),
          message: `Registry marks ${hash} screenshot_status=captured but catalog PNG is missing at ${CATALOG_SCREENSHOT_DIR}/${hash}.png.`,
        });
      }
      if (!String(e.screenshot_url || '').trim()) {
        issues.push({
          kind: 'captured-missing-url',
          hash,
          screenshotStatus: ss,
          message: `Registry marks ${hash} screenshot_status=captured but screenshot_url is empty.`,
        });
      }
    }

    if (DOCUMENTED_NON_CAPTURED.has(ss) && !hasScreenshotDocumentation(e)) {
      issues.push({
        kind: 'undocumented-status',
        hash,
        screenshotStatus: ss,
        message: `Registry marks ${hash} screenshot_status=${ss} without screenshot_url, notes, or screenshot_reason.`,
      });
    }
  }

  issues.sort((a, b) => {
    const ha = a.hash || '';
    const hb = b.hash || '';
    if (ha !== hb) return ha.localeCompare(hb);
    return `${a.kind}:${a.screenshotStatus || ''}`.localeCompare(`${b.kind}:${b.screenshotStatus || ''}`);
  });

  return {
    skipped: false,
    registryJson: REGISTRY_JSON,
    catalogDir: CATALOG_SCREENSHOT_DIR,
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
 *     screenshotStatus?: string,
 *     catalogPng?: string,
 *     message: string,
 *   }>,
 *   registryJson?: string,
 *   catalogDir?: string,
 * }} report
 * @returns {object[]}
 */
export function findingsFromScreenshotStatusReport(report) {
  if (!report || report.skipped) return [];
  const issues = Array.isArray(report.issues) ? report.issues : [];
  if (!issues.length) return [];

  const findings = [];
  const seen = new Set();

  for (const issue of issues.slice(0, MAX_SCREENSHOT_STATUS_FINDINGS)) {
    const key = `${issue.kind}:${issue.hash}:${issue.screenshotStatus || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    let severity = 'warn';
    let remediation =
      'Run `node tools/design-catalog/capture-showcase-screenshots.mjs --repo . --serve-showcase --update-registry` or set an honest screenshot_status with screenshot_reason/notes.';

    if (issue.kind === 'captured-missing-png') {
      remediation =
        `Commit ${CATALOG_SCREENSHOT_DIR}/${issue.hash}.png (capture via tools/design-catalog/capture-showcase-screenshots.mjs) or change screenshot_status if capture is not yet possible.`;
    } else if (issue.kind === 'captured-missing-url') {
      severity = 'minor';
      remediation =
        'Set screenshot_url to the hosted PNG path (e.g. https://ks.forgesdlc.com/showcase/screenshots/{HASH}.png) when screenshot_status is captured.';
    } else if (issue.kind === 'undocumented-status') {
      severity = 'minor';
      remediation =
        'Add screenshot_reason (preferred for blocked), non-empty notes, or screenshot_url so auditors know why capture is deferred.';
    } else if (issue.kind === 'unknown-status') {
      severity = 'minor';
      remediation =
        'Use screenshot_status planned | captured | missing | blocked | not-applicable per docs/design/catalog/README.md.';
    }

    const hash = issue.hash ? String(issue.hash) : '';
    findings.push({
      severity,
      area: 'visual-catalog',
      hash: hash || undefined,
      message: issue.message,
      evidence: issue.catalogPng
        ? `hash=${hash} screenshot_status=${issue.screenshotStatus} catalog_png=${issue.catalogPng}`
        : `hash=${hash} screenshot_status=${issue.screenshotStatus || 'unset'} registry=${report.registryJson || REGISTRY_JSON}`,
      remediation,
    });
  }

  if (issues.length > MAX_SCREENSHOT_STATUS_FINDINGS) {
    findings.push({
      severity: 'minor',
      area: 'visual-catalog',
      message: `Additional screenshot status issues omitted (${issues.length - MAX_SCREENSHOT_STATUS_FINDINGS} more).`,
      evidence: `screenshot_status_total=${issues.length}`,
      remediation:
        'Run `node tools/design-catalog/check-visual-catalog.mjs --repo .` for the full screenshot manifest report.',
    });
  }

  return findings;
}

export async function run({ metrics, repoRoot, ctx }) {
  const root = String(repoRoot || ctx?.repoRoot || metrics?.repoRoot || '').trim();
  if (!root) return [];

  const report = metrics?.screenshotStatusReport ?? scanScreenshotStatus(root);
  return findingsFromScreenshotStatusReport(report);
}
