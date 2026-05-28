#!/usr/bin/env node
/**
 * Read-only inventory of stubs and gaps in a11y scorers, auditors, and remediation.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RTM_PROFILE_IDS } from '../lib/axe-rule-catalog.js';
import { loadStandardsPack } from '../lib/compliance-score.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = path.resolve(__dirname, '..');
const KS_ROOT = path.resolve(TOOL_ROOT, '../..');
const OUT_MD = path.join(KS_ROOT, 'docs/design/a11y-audit/a11y-tooling-stub-inventory.md');
const OUT_JSON = path.join(KS_ROOT, 'docs/design/a11y-audit/a11y-tooling-stub-inventory.json');

async function walkMd(dir, acc = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walkMd(p, acc);
    else if (e.name.endsWith('.md')) acc.push(p);
  }
  return acc;
}

async function detectAiLaneInCrawl() {
  const crawlPath = path.join(TOOL_ROOT, 'lib/a11y-crawl.js');
  const crawlSrc = await fs.readFile(crawlPath, 'utf8');
  return /lanes\.has\(\s*['"]ai['"]\s*\)/.test(crawlSrc);
}

async function main() {
  const aiLaneInCrawl = await detectAiLaneInCrawl();

  const registry = JSON.parse(
    await fs.readFile(path.join(TOOL_ROOT, 'design-rules/registry.generated.json'), 'utf8'),
  );
  const pilot = JSON.parse(
    await fs.readFile(
      path.join(TOOL_ROOT, 'lib/a11y-deterministic-fixers/pilot-registry.json'),
      'utf8',
    ),
  );
  let aiFixerRegistry = { rules: [], defaultFixerId: 'plan_only' };
  try {
    aiFixerRegistry = JSON.parse(
      await fs.readFile(
        path.join(TOOL_ROOT, 'lib/a11y-ai-fixers/ai-fixer-registry.json'),
        'utf8',
      ),
    );
  } catch {
    /* optional until generated */
  }

  const detTotal = (registry.deterministicRules || []).filter((r) => r.status === 'implemented').length;
  const pilotCount = pilot.rules?.length || 0;
  const aiTotal = (registry.aiRules || []).filter((r) => r.status === 'implemented').length;
  const aiRegistryRows = aiFixerRegistry.rules?.length || 0;
  const detFixerIds = new Set((pilot.rules || []).map((r) => r.fixerId));
  const detNonHandbook = (pilot.rules || []).filter((r) => r.fixerId !== 'handbook_after').length;

  let axeWithDoc = 0;
  let axeUnmappable = 0;
  try {
    const axeCat = JSON.parse(
      await fs.readFile(path.join(TOOL_ROOT, 'design-rules/axe-catalog.generated.json'), 'utf8'),
    );
    for (const row of axeCat.rules || []) {
      const hasDoc = Object.keys(row.criteriaDocPaths || {}).length > 0;
      const unmappable = row.unmappable === true || !(row.wcagCriteria || []).length;
      if (hasDoc) axeWithDoc += 1;
      else if (unmappable) axeUnmappable += 1;
    }
  } catch {
    /* axe catalog optional at inventory time */
  }

  const seedFiles = [];
  try {
    const seeds = await fs.readdir(path.join(KS_ROOT, 'docs/design/a11y-audit/wcag/seeds'));
    seedFiles.push(...seeds.filter((f) => f.endsWith('.yaml') || f.endsWith('.yml')));
  } catch {
    /* no seeds dir */
  }

  const rulePagesDir = path.join(KS_ROOT, 'docs/design/a11y-audit/rule-pages');
  const rulePages = await walkMd(rulePagesDir);
  const placeholderPages = [];
  for (const p of rulePages) {
    const t = await fs.readFile(p, 'utf8');
    if (t.includes('Placeholder failing state') || t.includes('Placeholder passing state')) {
      placeholderPages.push(path.relative(KS_ROOT, p));
    }
  }

  const detChecksDir = path.join(TOOL_ROOT, 'design-rules/deterministic/generated');
  const detFiles = (await fs.readdir(detChecksDir)).filter((f) => f.endsWith('.check.js'));
  const heuristicChecks = [];
  for (const f of detFiles) {
    const t = await fs.readFile(path.join(detChecksDir, f), 'utf8');
    if (/heuristic|supplemental|manual review/i.test(t)) heuristicChecks.push(f);
  }

  const packGaps = {};
  for (const id of RTM_PROFILE_IDS) {
    try {
      const pack = loadStandardsPack(id);
      packGaps[id] = {
        uncovered: pack.validation?.uncoveredCriteria?.length || 0,
        manual: pack.criteria?.filter((c) => (c.tooling || []).includes('manual')).length || 0,
        automationProxy: pack.automationProxy || null,
      };
    } catch {
      packGaps[id] = { error: 'pack missing' };
    }
  }

  const catalog3 = JSON.parse(
    await fs.readFile(path.join(KS_ROOT, 'docs/design/a11y-audit/wcag3-outcomes-catalog.json'), 'utf8'),
  );
  const wcag3NoCrosswalk = (catalog3.requirements || []).filter(
    (r) => !(r.mapsToWcag22 || []).length,
  );

  const inventory = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    disclaimer: 'Inventory only — no fixes applied',
    detAuditor: {
      note: aiLaneInCrawl
        ? 'crawl runs axe + det; ai lane when --lanes includes ai and FORGE_A11Y_SKIP_AI_AGENT is unset'
        : 'analyze-website-a11y.mjs crawl runs axe + det only; --enable-ai lists eligibility without LLM',
      aiLaneInCrawl,
    },
    detScorer: {
      note: 'score-compliance-a11y.mjs default lanes: axe,det — no AI findings in crawl',
      aiInDefaultCrawl: false,
    },
    aiAuditor: {
      note: 'run-website-a11y-ai-audit.mjs requires run-design-ai-rule.sh + agent',
      separateCli: true,
    },
    aiScorer: {
      note: 'score-compliance-a11y.mjs --audit-data ingests merged AI findings; no AI in default crawl',
      dedicatedAiScorer: false,
      auditDataIngest: true,
      mergeScript: 'npm run merge-ai-audit',
    },
    qualityScorer: {
      note: 'score-website-a11y.mjs severity + optional standards rollup via buildComplianceReport (--include-compliance default on)',
      standardsPackAware: true,
      includeComplianceFlag: '--include-compliance',
    },
    detRemediation: {
      pilotFixerRules: pilotCount,
      implementedDetRules: detTotal,
      gap: detTotal - pilotCount,
      distinctFixerIds: [...detFixerIds].sort(),
      rulesWithNonHandbookFixer: detNonHandbook,
    },
    aiRemediation: {
      aiFixerModule: true,
      implementedAiRules: aiTotal,
      explicitRegistryRows: aiRegistryRows,
      registryCoversAllAiRules: aiRegistryRows >= aiTotal,
      defaultFixerId: aiFixerRegistry.defaultFixerId || 'plan_only',
      note: 'lib/a11y-ai-fixers/run-ai-fixers.mjs; plan_only or remediation_note per ai-fixer-registry.json',
    },
    mdCorpus: {
      wcagSeedYamlCount: seedFiles.length,
      axeRulesWithCriteriaDocPaths: axeWithDoc,
      axeRulesUnmappableBestPractice: axeUnmappable,
    },
    rulePages: { placeholderCount: placeholderPages.length, paths: placeholderPages },
    detChecks: { heuristicOrSupplementalCount: heuristicChecks.length, files: heuristicChecks },
    standardsPacks: packGaps,
    wcag3: {
      requirementsWithoutCrosswalk: wcag3NoCrosswalk.map((r) => r.id),
      draftProfiles: ['wcag30bronze', 'wcag30silver', 'wcag30gold'],
    },
  };

  const lines = [
    '# A11y tooling stub inventory',
    '',
    `Generated: ${inventory.generatedAt}`,
    '',
    '> Read-only gap report. Does not modify code or close gaps.',
    '',
    '## DET auditor (`analyze-website-a11y.mjs`)',
    '',
    aiLaneInCrawl
      ? '- Crawl executes **axe + det**; **ai** when `--lanes` includes `ai` and agent not skipped (`lib/a11y-crawl.js`).'
      : '- Crawl executes **axe + det** only (`lib/a11y-crawl.js`).',
    '- `--enable-ai` lists eligible AI rules; use `--lanes axe,det,ai` to run AI in crawl when allowed.',
    '',
    '## AI auditor (`run-website-a11y-ai-audit.mjs`)',
    '',
    '- Separate CLI after deterministic audit.',
    '- Depends on `run-design-ai-rule.sh` and agent availability.',
    '',
    '## DET scorer (`score-compliance-a11y.mjs`)',
    '',
    '- Default crawl lanes: **axe,det** — AI pack tooling not exercised in default site crawl.',
    '',
    '## AI scorer',
    '',
    '- **No** dedicated AI-only scorer CLI.',
    '- **Yes** merged path: `run-website-a11y-ai-audit.mjs` → `npm run merge-ai-audit` → `score-compliance-a11y.mjs --audit-data`.',
    '- Compliance criteria include `failingByLane` (axe / det / ai) when site findings exist.',
    '',
    '## Quality scorer (`score-website-a11y.mjs`)',
    '',
    '- Severity penalty from crawl findings **plus** optional standards pack rollup (`buildComplianceReport`, default `--include-compliance`).',
    '- Supports WCAG 2.x and WCAG 3 profiles via `--compliance-profile` / `--standard`.',
    '',
    '## DET remediation (`lib/a11y-deterministic-fixers/`)',
    '',
    `- Pilot fixers: **${pilotCount}** / **${detTotal}** implemented DET rules.`,
    `- Non–\`handbook_after\` fixers: **${detNonHandbook}** (distinct fixer ids: ${[...detFixerIds].join(', ') || '—'}).`,
    '',
    '## AI remediation',
    '',
    `- **${aiRegistryRows}** explicit registry rows / **${aiTotal}** implemented AI rules.`,
    '- **`lib/a11y-ai-fixers/`** — `run-ai-fixers.mjs` (`plan_only` or `remediation_note` per rule).',
    '- `run-website-a11y-remediation-loop.sh` calls AI fixers after DET fixers.',
    '',
    '## MD corpus',
    '',
    `- WCAG seed YAML files: **${seedFiles.length}**`,
    `- Axe catalog with \`criteriaDocPaths\`: **${axeWithDoc}**; unmappable (best-practice / no WCAG tag): **${axeUnmappable}**`,
    '',
    '',
    '## Rule pages with placeholder examples',
    '',
    `Count: **${placeholderPages.length}**`,
    '',
    ...placeholderPages.slice(0, 40).map((p) => `- \`${p}\``),
    ...(placeholderPages.length > 40 ? [`- … and ${placeholderPages.length - 40} more`] : []),
    '',
    '## DET checks flagged heuristic/supplemental in source',
    '',
    `Count: **${heuristicChecks.length}**`,
    '',
    ...heuristicChecks.slice(0, 30).map((f) => `- \`${f}\``),
    '',
    '## Standards packs (uncovered / manual)',
    '',
    '| Pack | Uncovered | Manual rows | automationProxy |',
    '|------|----------:|------------:|-----------------|',
    ...RTM_PROFILE_IDS.map((id) => {
      const g = packGaps[id];
      return `| ${id} | ${g.uncovered ?? '—'} | ${g.manual ?? '—'} | ${g.automationProxy ?? '—'} |`;
    }),
    '',
    '## WCAG 3 requirements without mapsToWcag22',
    '',
    wcag3NoCrosswalk.length
      ? wcag3NoCrosswalk.map((r) => `- \`${r.id}\``).join('\n')
      : '- (none in catalog)',
    '',
    '## Machine-readable',
    '',
    'See [`a11y-tooling-stub-inventory.json`](a11y-tooling-stub-inventory.json).',
    '',
  ];

  await fs.writeFile(OUT_JSON, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8');
  await fs.writeFile(OUT_MD, `${lines.join('\n')}\n`, 'utf8');
  console.log(`inventory-a11y-stubs: wrote ${path.relative(KS_ROOT, OUT_MD)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
