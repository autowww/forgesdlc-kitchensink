import path from 'node:path';

import { writeFile as wf, ensureDir } from './files.js';
import { compareFindingSeverity, isMajorPlus } from './severity.js';

/**
 * Screenshots keyed by audited page URL so prompts can cite evidence paths.
 */
function screenshotByUrlMap(pages) {
  /** @type{Record<string, string|undefined>} */
  const map = {};
  for (const p of pages || []) {
    if (p?.url && p.screenshot) map[p.url] = p.screenshot;
  }
  return map;
}

/**
 * Writes up to ten RCA prompt Markdown files into `rca-prompts/` under the audit output folder.
 */
export async function writeRcaPromptBatch({
  outDir,
  pages,
  args,
  profile,
  runMeta,
  designStandard,
  crawlSummary,
}) {
  const shotMap = screenshotByUrlMap(pages);
  const all = (pages || []).flatMap((p) => (p.findings || []).map((f) => ({ ...f, url: p.url })));

  /** Prioritize remediation batch — worst severities first, prefer Major+ for operator focus. */
  const pool = [...all].sort((a, b) => {
    const aM = isMajorPlus(a.severity);
    const bM = isMajorPlus(b.severity);
    if (aM !== bM) return aM ? -1 : 1;
    return compareFindingSeverity(a, b);
  });
  const slice = pool.filter((x) => isMajorPlus(x.severity)).slice(0, 10);
  /** If fewer than 10 Major+, top up sorted list for operator convenience */
  let batch = slice;
  if (batch.length < 10) {
    const rest = pool.filter((f) => !batch.includes(f));
    batch = batch.concat(rest).slice(0, 10);
  }

  if (!batch.length) return { count: 0, dir: null };

  const dir = path.join(outDir, 'rca-prompts');
  await ensureDir(dir);

  let i = 0;
  const entries = [];
  for (const f of batch) {
    const nid = `${runMeta.auditRunId}-f${String(i).padStart(2, '0')}`;
    const relShot = shotMap[f.url];
    const filePath = path.join(dir, `${nid}.md`);

    const body = `---
finding_id: ${nid}
severity: ${f.severity}
legacy_severity_for_tools: ${f.legacySeverity}
area: ${f.area || ''}
url: ${f.url}
audit_run_id: ${runMeta.auditRunId}
check_id: ${f.checkId || 'unknown'}
---

# Root cause task — Forge UX (${f.severity})

## Scripted finding

- **URL:** ${f.url}
- **Severity:** ${f.severity}
- **Area:** ${f.area}
- **Message:** ${f.message}
- **Evidence:** ${f.evidence}

## Suggested remediation (heuristic only)

${f.remediation || '_None._'}

${relShot ? `## Screenshot capture (desktop)\n\nRelative path from audit output folder: \`${relShot}\`\n` : ''}

## Repo context for agent

- **Repository root (website consumer):** \`${args.repo}\`
- **Product profile:** ${profile.name}

## Pin — design standard (this run)

- **Path:** \`${designStandard?.path ?? 'unknown'}\`
- **id:** \`${designStandard?.id ?? '—'}\`
- **updated:** \`${designStandard?.updated ?? '—'}\`
- **sha256:** \`${designStandard?.sha256 ?? '—'}\`

## Crawl mode (when live site was audited)

\`\`\`json
${JSON.stringify(crawlSummary || {}, null, 2)}
\`\`\`

## Standard excerpt (first ~40 lines pinned at generation time — verify current file separately)

\`\`\`md
${(designStandard?.rawSnippet || '').split(/\r?\n/).slice(0, 40).join('\n')}
\`\`\`

## Your job (Cursor Agent)

Locate the minimal root cause in **this repo** versus the shared **kitchensink** submodule/layout/CSS.

- If multiple pages share one layout issue, prefer fixing **kitchensink** (then run **\`pytest forge-autodoc/tests -q\`** from the ks repo root before git/submodule work).
- If content or generator/site-specific routing is at fault, fix **every affected route/template** consistently.
- Propose edits only where supported by repo truth — do not invent product claims.

When done, summarize files changed and re-run **\`node …/analyze-website-ux.mjs\`** with \`--stop-disable\` if you want a broader crawl verification.
`;

    await wf(filePath, body);
    entries.push({
      findingId: nid,
      path: filePath,
      checkId: f.checkId || 'unknown',
      area: f.area || '',
      severity: f.severity || '',
      url: f.url || '',
    });
    i += 1;
  }

  return { count: batch.length, dir, entries };
}
