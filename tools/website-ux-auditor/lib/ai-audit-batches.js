import path from 'node:path';

import { inventoryRepo } from './repo-inventory.js';
import { compareFindingSeverity, isMajorPlus, legacySeverityFrom, severityRank, summarizeBySeverity } from './severity.js';

const KNOWN_SEVERITIES = new Set(['blocker', 'critical', 'major', 'warn', 'minor', 'trivial', 'cosmetic']);
const STOP_TOKENS = new Set([
  'html', 'htm', 'md', 'mdx', 'index', 'docs', 'doc', 'page', 'pages', 'content',
  'guide', 'start', 'learn', 'build', 'operate', 'reference', 'handbook', 'home',
]);

function uniqueStrings(items) {
  return [...new Set((items || []).map((x) => String(x || '')).filter(Boolean))];
}

function toRelative(repoRoot, maybePath) {
  if (!maybePath) return null;
  const abs = path.resolve(String(maybePath));
  const root = path.resolve(String(repoRoot || '.'));
  const rel = path.relative(root, abs).replaceAll(path.sep, '/');
  return rel && !rel.startsWith('..') ? rel : maybePath;
}

export function normalizeAiSeverity(level) {
  const sev = String(level || '').trim().toLowerCase();
  if (KNOWN_SEVERITIES.has(sev)) return sev;
  if (sev === 'high') return 'critical';
  if (sev === 'medium') return 'major';
  if (sev === 'low') return 'minor';
  return 'minor';
}

function urlPathname(url) {
  try {
    return new URL(String(url || '')).pathname || '/';
  } catch {
    return '/';
  }
}

function urlTokens(url) {
  const pathname = urlPathname(url);
  return uniqueStrings(
    pathname
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .map((x) => x.trim())
      .filter((x) => x && !STOP_TOKENS.has(x) && x.length >= 2),
  );
}

function deterministicPageSummary(page) {
  const findings = [...(page?.findings || [])].sort(compareFindingSeverity);
  const top = findings.slice(0, 6).map((f) => ({
    severity: f.severity,
    area: f.area || '',
    checkId: f.checkId || '',
    message: f.message || '',
    evidence: f.evidence || '',
  }));
  return {
    url: page?.url || '',
    title: page?.metrics?.title || '',
    wave: page?.auditWave || 'crawl',
    findingCount: findings.length,
    majorPlusCount: findings.filter((f) => isMajorPlus(f.severity)).length,
    deterministicTopFindings: top,
    screenshot: page?.screenshot || null,
    mobileScreenshot: page?.mobileScreenshot || null,
  };
}

function candidateScore(file, tokens, page, inventory) {
  const rel = String(file || '').toLowerCase();
  let score = 0;
  if (!rel) return score;
  if (inventory.pageFiles.includes(file)) score += 14;
  if (inventory.componentFiles.includes(file)) score += 9;
  if (inventory.navCandidates.includes(file)) score += 8;
  if (inventory.styleFiles.includes(file)) score += 6;
  if (page?.url && (urlPathname(page.url) === '/' || urlPathname(page.url) === '/index.html')) {
    if (/nav|header|sidebar|menu|layout|shell/i.test(file)) score += 5;
    if (/index|home|landing|hero/i.test(file)) score += 5;
  }
  for (const token of tokens) {
    if (rel.includes(`/${token}.`) || rel.endsWith(`/${token}`)) score += 8;
    else if (rel.includes(token)) score += 4;
  }
  return score;
}

export function selectLikelySourceFiles(page, inventory, limit = 12) {
  const tokens = urlTokens(page?.url || '');
  const pool = uniqueStrings([
    ...(inventory.pageFiles || []),
    ...(inventory.componentFiles || []),
    ...(inventory.navCandidates || []),
    ...(inventory.styleFiles || []),
  ]);
  const ranked = pool
    .map((file) => ({ file, score: candidateScore(file, tokens, page, inventory) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file));
  const picked = ranked.slice(0, limit).map((x) => x.file);
  if (picked.length >= limit) return picked;
  const filler = pool.filter((f) => !picked.includes(f)).slice(0, Math.max(0, limit - picked.length));
  return picked.concat(filler);
}

function chunk(items, size) {
  const out = [];
  const batchSize = Math.max(1, Math.floor(Number(size) || 1));
  for (let i = 0; i < items.length; i += batchSize) out.push(items.slice(i, i + batchSize));
  return out;
}

export function buildAiAuditBatches({ auditData, inventory, repoRoot, designStandardPath, batchSize = 5, homepageFirst = true }) {
  const pages = (auditData?.pages || []).filter((p) => p?.url && !p?.error);
  const homepage = pages.filter((p) => {
    const pathname = urlPathname(p.url);
    return pathname === '/' || pathname === '/index.html';
  });
  const rest = pages.filter((p) => !homepage.includes(p));
  const ordered = homepageFirst ? homepage.concat(rest) : pages;
  const groups = homepageFirst && homepage.length > 0
    ? [homepage.slice(0, 1), ...chunk(rest, batchSize)]
    : chunk(ordered, batchSize);

  const batches = groups
    .filter((items) => items.length > 0)
    .map((items, idx) => {
      const pageSummaries = items.map((page) => deterministicPageSummary(page));
      const likelySourceFiles = uniqueStrings(
        items.flatMap((page) => selectLikelySourceFiles(page, inventory, 8)),
      ).slice(0, 20);
      return {
        batchId: `ai-batch-${String(idx).padStart(2, '0')}`,
        label: idx === 0 && homepageFirst && homepage.length > 0 ? 'homepage' : `pages-${idx + 1}`,
        pageCount: items.length,
        urls: items.map((p) => p.url),
        likelySourceFiles,
        pageSummaries,
        designStandardPath: toRelative(repoRoot, designStandardPath),
      };
    });

  return {
    schemaVersion: 1,
    repoRoot: path.resolve(String(repoRoot || '.')),
    auditRunId: auditData?.auditRunId || null,
    generatedAt: new Date().toISOString(),
    totalVisitedPages: pages.length,
    totalBatches: batches.length,
    batchSize: Math.max(1, Math.floor(Number(batchSize) || 5)),
    homepageFirst,
    inventory: {
      framework: inventory?.framework || 'unknown',
      pageFiles: (inventory?.pageFiles || []).slice(0, 80),
      componentFiles: (inventory?.componentFiles || []).slice(0, 80),
      navCandidates: (inventory?.navCandidates || []).slice(0, 80),
      styleFiles: (inventory?.styleFiles || []).slice(0, 50),
    },
    batches,
  };
}

export async function buildAiAuditBatchManifest({ auditData, repoRoot, designStandardPath, batchSize = 5, homepageFirst = true }) {
  const inventory = await inventoryRepo(repoRoot);
  return buildAiAuditBatches({
    auditData,
    inventory,
    repoRoot,
    designStandardPath,
    batchSize,
    homepageFirst,
  });
}

export function extractJsonFromAgentText(rawText) {
  const raw = String(rawText || '').trim();
  if (!raw) return null;
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i);
  if (fenced) {
    try {
      return JSON.parse(fenced[1]);
    } catch {}
  }
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch {}
  }
  return null;
}

function normalizeSourceFiles(list) {
  return uniqueStrings((list || []).map((x) => String(x || '').trim()).filter(Boolean)).slice(0, 20);
}

export function normalizeAiFinding(rawFinding, fallbackUrl = '') {
  if (!rawFinding || typeof rawFinding !== 'object') return null;
  const severity = normalizeAiSeverity(rawFinding.severity);
  return {
    url: String(rawFinding.url || fallbackUrl || '').trim(),
    severity,
    legacySeverity: legacySeverityFrom(severity),
    guardrail: String(rawFinding.guardrail || rawFinding.area || '').trim(),
    title: String(rawFinding.title || rawFinding.message || '').trim(),
    evidence: String(rawFinding.evidence || '').trim(),
    whyMissedByDeterministic: String(rawFinding.whyMissedByDeterministic || '').trim(),
    remediation: String(rawFinding.remediation || '').trim(),
    confidence: String(rawFinding.confidence || '').trim() || 'medium',
    sourceFiles: normalizeSourceFiles(rawFinding.sourceFiles),
    source: 'ai-assisted',
  };
}

export function aggregateAiAuditResults({ auditData, manifest, batchArtifacts, generatedAt = new Date().toISOString() }) {
  const results = [];
  const parseErrors = [];
  for (const artifact of batchArtifacts || []) {
    const parsed = extractJsonFromAgentText(artifact.rawOutput || '');
    if (!parsed || typeof parsed !== 'object') {
      parseErrors.push({
        batchId: artifact.batchId,
        transcriptPath: artifact.transcriptPath || null,
        error: 'Could not parse JSON result from agent output.',
      });
      results.push({
        batchId: artifact.batchId,
        ok: false,
        transcriptPath: artifact.transcriptPath || null,
        urls: artifact.urls || [],
        findings: [],
        summary: '',
      });
      continue;
    }
    const normalized = (parsed.findings || [])
      .map((item) => normalizeAiFinding(item))
      .filter(Boolean)
      .filter((f) => f.url && f.title);
    results.push({
      batchId: artifact.batchId,
      ok: true,
      transcriptPath: artifact.transcriptPath || null,
      urls: uniqueStrings([...(artifact.urls || []), ...(parsed.inspectedUrls || [])]),
      summary: String(parsed.summary || '').trim(),
      findings: normalized,
    });
  }

  const findings = results.flatMap((x) => x.findings.map((f) => ({ ...f, batchId: x.batchId })));
  findings.sort((a, b) => compareFindingSeverity(a, b) || String(a.title || '').localeCompare(String(b.title || '')));
  const bySeverity = summarizeBySeverity(findings);

  const data = {
    schemaVersion: 1,
    kind: 'forge-ai-assisted-ux-audit',
    generatedAt,
    sourceAuditRunId: auditData?.auditRunId || null,
    deterministicAuditGeneratedAt: auditData?.generatedAt || null,
    totalFindings: findings.length,
    majorPlusFindingCount: findings.filter((f) => isMajorPlus(f.severity)).length,
    findingsBySeverity: bySeverity,
    parseErrors,
    batches: results.map((x) => ({
      batchId: x.batchId,
      ok: x.ok,
      urlCount: x.urls.length,
      findingCount: x.findings.length,
      transcriptPath: x.transcriptPath,
      summary: x.summary,
    })),
    findings,
  };

  const lines = [
    '# AI-assisted UX audit',
    '',
    `- Generated at: \`${generatedAt}\``,
    `- Source deterministic audit run: \`${auditData?.auditRunId || 'unknown'}\``,
    `- Batches: **${results.length}**`,
    `- AI findings: **${findings.length}**`,
    `- AI Major+: **${data.majorPlusFindingCount}**`,
    '',
    '## Severity summary',
    '',
    ...Object.entries(bySeverity).sort((a, b) => severityRank(a[0]) - severityRank(b[0])).map(([sev, count]) => `- **${sev}**: ${count}`),
  ];
  if (!Object.keys(bySeverity).length) lines.push('- No AI findings were parsed.');
  if (parseErrors.length) {
    lines.push('', '## Parse issues', '');
    for (const err of parseErrors) {
      lines.push(`- \`${err.batchId}\`: ${err.error}${err.transcriptPath ? ` (\`${err.transcriptPath}\`)` : ''}`);
    }
  }
  lines.push('', '## Findings', '');
  if (!findings.length) {
    lines.push('- No AI-assisted findings were captured.');
  } else {
    for (const f of findings) {
      lines.push(`### ${f.severity.toUpperCase()} — ${f.title}`);
      lines.push(`- URL: \`${f.url}\``);
      lines.push(`- Guardrail: ${f.guardrail || '—'}`);
      lines.push(`- Confidence: ${f.confidence}`);
      if (f.sourceFiles.length) lines.push(`- Likely source files: ${f.sourceFiles.map((x) => `\`${x}\``).join(', ')}`);
      if (f.evidence) lines.push(`- Evidence: ${f.evidence}`);
      if (f.whyMissedByDeterministic) lines.push(`- Why missed by deterministic pass: ${f.whyMissedByDeterministic}`);
      if (f.remediation) lines.push(`- Suggested remediation: ${f.remediation}`);
      lines.push('');
    }
  }

  return { data, markdown: `${lines.join('\n').trim()}\n` };
}
