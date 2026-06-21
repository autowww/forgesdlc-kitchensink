#!/usr/bin/env node
/**
 * Post-invoke coverage report for Learn 101 DET-only campaigns.
 * Reads shared-check/audit-data.json, state.jsonl, ux-audit-rule-page-trace.json.
 *
 * Usage:
 *   node analyze-learn-101-det-coverage.mjs <OUT_DIR>
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { collectLayoutGridConsistencyReport } from '../design-rules/deterministic/generated/det-layout-grid-consistency.check.js';
import { collectNavInPageTocReport } from '../design-rules/deterministic/generated/det-nav-in-page-toc.check.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KS_ROOT = path.resolve(__dirname, '../../..');
const REGISTRY = path.join(
  KS_ROOT,
  'tools/website-ux-auditor/design-rules/registry.generated.json',
);

const outDir = process.argv[2] || process.env.UX_AUDIT_OUT_DIR;
if (!outDir) {
  console.error('Usage: node analyze-learn-101-det-coverage.mjs <OUT_DIR>');
  process.exit(2);
}

const shared = path.join(outDir, 'shared-check');
const auditPath = path.join(shared, 'audit-data.json');
const statePath = path.join(outDir, 'state.jsonl');
const tracePath = path.join(shared, 'ux-audit-rule-page-trace.json');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const registry = readJson(REGISTRY);
const detRules = registry.deterministicRules.map((r) => r.id).sort();
const audit = readJson(auditPath);
const page = audit.pages?.[0] || {};
const m = page.metrics || {};

const stateByRule = new Map();
if (fs.existsSync(statePath)) {
  for (const line of fs.readFileSync(statePath, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const row = JSON.parse(line);
    if (row.lane === 'deterministic') stateByRule.set(row.ruleId, row);
  }
}

const traceByRule = new Map();
if (fs.existsSync(tracePath)) {
  const trace = readJson(tracePath);
  for (const e of trace.entries || []) {
    traceByRule.set(e.ruleId, e);
  }
}

/** @type {Record<string, (metrics: Record<string, unknown>) => string>} */
const metricSummary = {
  'DET.CONTEXT.BURDEN': () =>
    `preMainH1Links=${m.preMainFirstH1LinkCount}/10 headerNav=${m.outsideMainHeaderNavLinkCount}/7 chromeBands=${m.navChromeContainerCount}/4 firstVpLinks=${m.firstViewportLinkCount}/28`,
  'DET.LAYOUT.GRID_CONSISTENCY': () => {
    const lg = m.layoutGridConsistencyReport;
    const hb = lg?.handbookLayout;
    if (hb) {
      return `violations=${(lg.violations || []).length} gapSidebarToProse=${hb.gapSidebarToProsePx}px mxAuto=${hb.docContentUsesMxAuto ? 'yes' : 'no'}`;
    }
    return `violations=${(lg?.violations || []).length ?? 'n/a'}`;
  },
  'DET.NAV.IN_PAGE_TOC': () => {
    const r = m.navInPageTocReport;
    if (!r) return 'no report';
    return `tocPresent=${r.tocPresent} railW=${r.tocRailWidthPx}px minLinkW=${r.minTocLinkWidthPx}px outline=${r.outlineHeadingCount}`;
  },
  'DET.NAV.FOCUS_ORDER': () => {
    const r = m.navFocusOrderReport;
    if (!r) return 'no report';
    return `tabStops=${r.tabStopCount ?? '?'} violations=${(r.violations || []).length}`;
  },
  'DET.NAV.DEDUP': () => {
    const r = m.navDedupReport;
    return r ? `dupTexts=${(r.duplicateTexts || []).length}` : 'no report';
  },
  'DET.NAV.BREADCRUMB': () => {
    const r = m.navBreadcrumbReport;
    return r ? `present=${r.breadcrumbPresent} markers=${r.hasKbcMarker ? 'Kbc' : '?'}` : 'no report';
  },
  'DET.VISUAL.RHYTHM': () => {
    const r = m.visualRhythmReport;
    if (!r) return `sectionMedianGap=${m.sectionMedianGapPx ?? 'null'}`;
    return `sections=${r.sectionCount} medianGap=${r.sectionMedianGapPx}px adhoc=${(r.adhocSpacingSamples || []).length}`;
  },
  'DET.PROSE.LENGTH': () =>
    `words=${m.wordCount} aboveFold=${m.aboveFoldWordCount} heroMain=${m.heroMainWordCount}`,
  'DET.HTML.EMPTY_INLINE': () => {
    const r = m.emptyInlineReport;
    return r ? `emptyStrong=${r.emptyStrongCount} emptyEm=${r.emptyEmCount}` : 'no report';
  },
  'DET.HASH.MARKERS': () => {
    const r = m.ksVisualHashReport;
    return r ? `valid=${(r.validUnique || []).join(',')} invalid=${(r.invalidRaw || []).length}` : 'no report';
  },
  'DET.DIAGRAM.ALT': () => {
    const r = m.diagramAltReport;
    return r ? `diagrams=${r.diagramCount ?? '?'} violations=${(r.violations || []).length}` : 'no report';
  },
  'DET.DIAGRAM.LABELS': () => {
    const r = m.diagramLabelsReport;
    return r ? `violations=${(r.violations || []).length} repoIssues=${(r.repoIssues || []).length}` : 'no report';
  },
  'DET.PAGE.TITLE': () => `title="${m.title || ''}"`,
  'DET.PAGE.VIEWPORT': () => `viewport="${m.metaViewport || ''}"`,
  'DET.PAGE.LANG': () => `lang="${m.lang || ''}"`,
  'DET.JS.NO_CONSOLE_ERROR': () => {
    const r = m.jsConsoleReport;
    return r ? `errors=${(r.errors || []).length}` : 'no report';
  },
};

/**
 * Known blind spots: pass is correct but human/AI may still care.
 * @type {Record<string, string>}
 */
const coverageNotes = {
  'DET.NAV.FOCUS_ORDER':
    'Tab sampling ignores tabindex="-1". Fleet handbook intentionally suppresses sidebar/TOC/breadcrumb tab stops when top nav is present.',
  'DET.DIAGRAM.LABELS':
    'ASCII mental-model uses figure.forge-diagram-ascii + aria-label; catalog key "linear" may pass without SVG legend nodes.',
  'DET.DIAGRAM.ASSET_REGISTRY':
    'Repo/template inventory rule; static HTML page may not exercise all catalog keys.',
  'DET.VISUAL.RHYTHM':
    'Measures section gap tokens, not subjective "premium" density or table-heavy first screen.',
  'DET.CONTEXT.BURDEN':
    'At thresholds (9/10 links, 27/28 viewport links). Chrome still feels busy though within caps.',
  'DET.CHROME.BOUNDARY':
    'Counts region boundaries, not visual weight of tables in main.',
  'DET.SCREENSHOT.STATUS':
    'Registry/planned screenshots — not live visual regression.',
  'DET.CATALOG.CONTRACT_SPECIFICITY': 'Repo YAML contracts — not rendered page DOM.',
  'DET.INVENTORY.CROSSWALK': 'Repo crosswalk — not page UX.',
  'DET.CONTRACT.PATH': 'Repo contract paths.',
  'DET.CONTRACT.PLACEHOLDERS': 'Repo placeholder scan.',
  'DET.HASH.REGISTRY_ROW': 'Repo registry rows.',
  'DET.PY.OPTIONAL_REGIONS': 'Python source optional regions.',
  'DET.PY.KS_HASH_ATTRS': 'Python ks hash attrs.',
  'DET.APP.PRIMITIVE_MARKERS': 'React primitive KS markers (N/A static HTML).',
  'DET.APP.CONTROL_A11Y': 'React primitive control a11y (N/A static HTML).',
  'DET.APP.PRIMITIVE_SOURCE': 'React primitive source scan (repo only).',
  'DET.APP.PRIMITIVE_STYLES': 'React primitive stylesheet bundle.',
  'DET.APP.SHELL_INTEGRATION': 'Bootstrap vs ks-fe integration in app shell.',
};

/** @type {Array<{ ruleId: string, status: string, findings: number, metrics: string, verdict: string, note: string }>} */
const rows = [];

for (const ruleId of detRules) {
  const st = stateByRule.get(ruleId);
  const tr = traceByRule.get(ruleId);
  const findings = st?.findingsCount ?? tr?.findingsCount ?? 0;
  let status = st?.status || (tr?.status === 'ran' ? 'pass' : 'missing');

  const metricsFn = metricSummary[ruleId];
  const metrics = metricsFn ? metricsFn(m) : '—';

  let verdict = 'ok';
  if (status === 'blocked-stub') verdict = 'stub';
  else if (findings > 0) verdict = 'fail';
  else if (coverageNotes[ruleId]) verdict = 'ok-with-gap-note';
  else if (
    ruleId.startsWith('DET.PY.')
    || ruleId.startsWith('DET.APP.PRIMITIVE')
    || ruleId.includes('CONTRACT')
    || ruleId.includes('INVENTORY')
    || ruleId.includes('CATALOG')
    || ruleId.includes('HASH.REGISTRY')
  ) {
    verdict = 'repo-scope';
  }

  rows.push({
    ruleId,
    status,
    findings,
    metrics,
    verdict,
    note: coverageNotes[ruleId] || '',
  });
}

const lines = [
  '# Learn 101 — all deterministic rules (DET-only coverage)',
  '',
  `- **OUT_DIR:** ${outDir}`,
  `- **Page:** ${page.url || m.url || '?'}`,
  `- **Generated:** ${new Date().toISOString()}`,
  `- **Mode:** no AI lane; invoker \`--check-only\``,
  '',
  '## Summary',
  '',
];

const pass = rows.filter((r) => r.findings === 0 && r.verdict !== 'stub').length;
const stub = rows.filter((r) => r.verdict === 'stub').length;
const gapNotes = rows.filter((r) => r.note).length;

lines.push(
  `| Metric | Count |`,
  `|--------|------:|`,
  `| DET rules in registry | ${detRules.length} |`,
  `| Pass (findings=0) | ${pass} |`,
  `| Stub | ${stub} |`,
  `| Documented coverage notes | ${gapNotes} |`,
  '',
  '## Per-rule table',
  '',
  '| Rule | Status | Findings | Verdict | Key metrics | Coverage note |',
  '|:-----|:-------|--------:|:--------|:------------|:--------------|',
);

for (const r of rows) {
  const note = r.note ? r.note.replace(/\|/g, '\\|').slice(0, 120) : '';
  lines.push(
    `| ${r.ruleId} | ${r.status} | ${r.findings} | ${r.verdict} | ${r.metrics.replace(/\|/g, '\\|').slice(0, 80)} | ${note} |`,
  );
}

lines.push(
  '',
  '## Page signals (shared metrics)',
  '',
  '```json',
  JSON.stringify(
    {
      preMainFirstH1LinkCount: m.preMainFirstH1LinkCount,
      outsideMainHeaderNavLinkCount: m.outsideMainHeaderNavLinkCount,
      navChromeContainerCount: m.navChromeContainerCount,
      firstViewportLinkCount: m.firstViewportLinkCount,
      wordCount: m.wordCount,
      aboveFoldWordCount: m.aboveFoldWordCount,
      layoutGrid: m.layoutGridConsistencyReport?.handbookLayout,
      navInPageToc: {
        tocRailWidthPx: m.navInPageTocReport?.tocRailWidthPx,
        minTocLinkWidthPx: m.navInPageTocReport?.minTocLinkWidthPx,
      },
      ksHashes: m.ksVisualHashReport?.validUnique,
    },
    null,
    2,
  ),
  '```',
  '',
  '## Re-run',
  '',
  '```bash',
  'export UX_AUDIT_OUT_DIR=.../learn-101-det-only-<UTC>',
  'SKIP_CURSOR_AGENT=1 bash tools/website-ux-auditor/auditor-tests/invoke-learn-101-per-rule-loop.sh --verbose --check-only',
  'node tools/website-ux-auditor/auditor-tests/analyze-learn-101-det-coverage.mjs "$UX_AUDIT_OUT_DIR"',
  '```',
);

/** @type {Record<string, unknown> | null} */
let liveProbe = null;
const pageUrl = process.env.LEARN_101_PAGE_URL
  || page.url
  || m.url
  || 'http://127.0.0.1:8766/docs-learn-101-01-what-is-fleet.html';
if (pageUrl && pageUrl.startsWith('http')) {
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch();
    const pw = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pw.goto(pageUrl, { waitUntil: 'domcontentloaded' });
    const layoutReport = await collectLayoutGridConsistencyReport(pw);
    const tocReport = await collectNavInPageTocReport(pw);
    const dom = await pw.evaluate(() => ({
      tabindexMinus1: document.querySelectorAll('[tabindex="-1"]').length,
      tabbable: document.querySelectorAll(
        'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])',
      ).length,
      asciiDiagram: Boolean(document.querySelector('figure.forge-diagram-ascii')),
      diagramKey: document.querySelector('[data-diagram-key]')?.getAttribute('data-diagram-key') || null,
    }));
    await browser.close();
    liveProbe = { layoutReport, tocReport, dom };
    const lgRow = rows.find((r) => r.ruleId === 'DET.LAYOUT.GRID_CONSISTENCY');
    const hb = layoutReport?.handbookLayout;
    if (lgRow && hb) {
      lgRow.metrics = `violations=${(layoutReport.violations || []).length} gap=${hb.gapSidebarToProsePx}px mxAuto=${hb.docContentUsesMxAuto ? 'yes' : 'no'}`;
    }
    const tocRow = rows.find((r) => r.ruleId === 'DET.NAV.IN_PAGE_TOC');
    if (tocRow && tocReport) {
      tocRow.metrics = `railW=${tocReport.tocRailWidthPx}px minLinkW=${tocReport.minTocLinkWidthPx}px present=${tocReport.tocPresent}`;
    }
    const focusRow = rows.find((r) => r.ruleId === 'DET.NAV.FOCUS_ORDER');
    if (focusRow && dom) {
      focusRow.metrics = `tabbable=${dom.tabbable} tabindex-1=${dom.tabindexMinus1}`;
    }
  } catch (err) {
    liveProbe = { error: String(err?.message || err) };
  }
}

// Rebuild markdown with updated rows if live probe ran
if (liveProbe) {
  const tableStart = lines.indexOf('| Rule | Status | Findings | Verdict | Key metrics | Coverage note |');
  if (tableStart >= 0) {
    lines.length = tableStart + 1;
    for (const r of rows) {
      const note = r.note ? r.note.replace(/\|/g, '\\|').slice(0, 120) : '';
      lines.push(
        `| ${r.ruleId} | ${r.status} | ${r.findings} | ${r.verdict} | ${r.metrics.replace(/\|/g, '\\|').slice(0, 80)} | ${note} |`,
      );
    }
  }
  lines.push(
    '',
    '## Live Playwright probe (post-pass verification)',
    '',
    '```json',
    JSON.stringify(liveProbe, null, 2),
    '```',
  );
}

const outMd = path.join(outDir, 'DET-ALL-RULES-COVERAGE.md');
fs.writeFileSync(outMd, `${lines.join('\n')}\n`);
console.log(`Wrote ${outMd}`);
console.log(`Pass: ${pass}/${detRules.length} (stub: ${stub})`);
