#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  designThemeGeneratedPath,
  generatedThemePayloadFromParts,
} from '../website-ux-auditor/lib/design-theme.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KS_ROOT = path.resolve(__dirname, '../..');

function usage() {
  console.error(
    'usage: node tools/design-themes/extract-design-theme.mjs --fixture /path/to/capture --theme-id acme --out docs/design/themes/acme',
  );
}

function parseArgs(argv) {
  const args = { fixture: '', themeId: '', out: '' };
  for (let i = 2; i < argv.length; i += 1) {
    const raw = argv[i];
    if (raw === '--help' || raw === '-h') {
      usage();
      process.exit(0);
    }
    const [flag, inlineValue] = raw.includes('=') ? raw.split(/=(.*)/s, 2) : [raw, null];
    const value = inlineValue ?? argv[++i];
    if (flag === '--fixture') args.fixture = value || '';
    else if (flag === '--theme-id') args.themeId = value || '';
    else if (flag === '--out') args.out = value || '';
    else throw new Error(`Unknown argument: ${raw}`);
  }
  if (!args.fixture) throw new Error('Missing --fixture');
  if (!args.themeId) throw new Error('Missing --theme-id');
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(args.themeId)) throw new Error(`Invalid --theme-id: ${args.themeId}`);
  args.fixture = path.resolve(args.fixture);
  args.out = path.resolve(KS_ROOT, args.out || `docs/design/themes/${args.themeId}`);
  return args;
}

function countValues(values) {
  const counts = new Map();
  for (const raw of values || []) {
    const v = String(raw || '').trim();
    if (!v || v === 'rgba(0, 0, 0, 0)' || v === 'transparent') continue;
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ value, count }));
}

function topValues(values, limit = 8) {
  return countValues(values).slice(0, limit).map((x) => x.value);
}

function mode(values, fallback = '') {
  return topValues(values, 1)[0] || fallback;
}

function unique(values, limit = 20) {
  return [...new Set((values || []).map((v) => String(v || '').trim()).filter(Boolean))].slice(0, limit);
}

async function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function extractTokens(observations, themeId) {
  const pages = observations?.pages || [];
  const body = pages.map((p) => p.body || {});
  const headings = pages.flatMap((p) => p.headings || []);
  const buttons = pages.flatMap((p) => p.buttons || []);
  const surfaces = pages.flatMap((p) => p.surfaces || []);
  const colors = [
    ...body.flatMap((x) => [x.backgroundColor, x.color]),
    ...headings.map((x) => x.color),
    ...buttons.flatMap((x) => [x.backgroundColor, x.color]),
    ...surfaces.flatMap((x) => [x.backgroundColor, x.color, x.borderColor]),
  ];
  return {
    schemaVersion: 1,
    themeId,
    source: 'captured-fixture',
    palette: {
      observed: topValues(colors, 16),
      background: mode(body.map((x) => x.backgroundColor)),
      text: mode(body.map((x) => x.color)),
      accentCandidates: topValues(buttons.map((x) => x.backgroundColor), 6),
      surfaceCandidates: topValues(surfaces.map((x) => x.backgroundColor), 8),
    },
    typography: {
      body: mode(body.map((x) => x.fontFamily)),
      headingCandidates: topValues(headings.map((x) => x.fontFamily), 6),
      fontSizes: unique([...body.map((x) => x.fontSize), ...headings.map((x) => x.fontSize)]),
      lineHeights: unique([...body.map((x) => x.lineHeight), ...headings.map((x) => x.lineHeight)]),
    },
    spacing: {
      observedSectionPadding: topValues(surfaces.map((x) => x.padding), 12),
      observedSectionMargins: topValues(surfaces.map((x) => x.marginBottom), 12),
    },
    surfaces: {
      radius: topValues([...buttons.map((x) => x.borderRadius), ...surfaces.map((x) => x.borderRadius)], 10),
      shadows: topValues(surfaces.map((x) => x.boxShadow), 10),
      borders: topValues(surfaces.map((x) => x.borderColor), 10),
    },
    density: {
      sampledPages: pages.length,
      navLinkCountMedian: median(pages.map((p) => Number(p.navLinkCount || 0))),
      imageCountMedian: median(pages.map((p) => Number(p.imageCount || 0))),
      ctaLikeButtonCountMedian: median(pages.map((p) => (p.buttons || []).length)),
    },
  };
}

function median(values) {
  const nums = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!nums.length) return 0;
  return nums[Math.floor(nums.length / 2)];
}

function yamlList(items, indent = '  ') {
  return (items || []).map((item) => `${indent}- ${item}`).join('\n');
}

async function main() {
  const args = parseArgs(process.argv);
  const manifest = await readJson(path.join(args.fixture, 'manifest.json'), {});
  const observations = await readJson(path.join(args.fixture, 'extracted-design/observations.json'), { pages: [] });
  const tokens = extractTokens(observations, args.themeId);
  const themeDir = args.out;
  const relThemeDir = path.relative(KS_ROOT, themeDir).replaceAll(path.sep, '/');
  await fs.mkdir(path.join(themeDir, 'contracts'), { recursive: true });

  const themeYaml = `schema_version: 1
id: ${args.themeId}
name: ${args.themeId.replace(/[-_]+/g, ' ')}
status: draft
description: Draft theme scrubbed from captured fixture ${manifest.seedUrl || args.fixture}.
source: captured-fixture
source_url: ${manifest.seedUrl || ''}
design_standard_path: design-standard.md
tokens_path: tokens.json
deterministic_rules_path: deterministic-rules.md
ai_principles_path: ai-principles.md
contract_overlays_dir: contracts
css_files:
rule_packs:
  - ../../ux-audit/deterministic-design-rules.md
  - ../../ux-audit/ai-enabled-design-principles.md
`;
  await fs.writeFile(path.join(themeDir, 'theme.yaml'), themeYaml, 'utf8');
  await fs.writeFile(path.join(themeDir, 'tokens.json'), `${JSON.stringify(tokens, null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(themeDir, 'contracts/README.md'), `# ${args.themeId} Contract Overlays\n\nDraft overlays generated from fixture \`${manifest.seedUrl || args.fixture}\` should be reviewed before use.\n`, 'utf8');

  await fs.writeFile(path.join(themeDir, 'design-standard.md'), `---
id: ks.theme.${args.themeId}.design-standard
kind: design-theme-standard
status: draft
theme: ${args.themeId}
updated: ${new Date().toISOString().slice(0, 10)}
---

# ${args.themeId.replace(/[-_]+/g, ' ')} theme standard

Draft captured from ${manifest.seedUrl || args.fixture}.

## Scrubbed Takeaways

- Primary observed body font: \`${tokens.typography.body || 'unknown'}\`.
- Primary observed background: \`${tokens.palette.background || 'unknown'}\`.
- Primary observed text color: \`${tokens.palette.text || 'unknown'}\`.
- Accent candidates: ${tokens.palette.accentCandidates.map((x) => `\`${x}\``).join(', ') || 'none'}.
- Surface candidates: ${tokens.palette.surfaceCandidates.map((x) => `\`${x}\``).join(', ') || 'none'}.

This file is a draft. A maintainer should convert useful patterns into KS
tokens, components, layout variants, or contract overlays only after reviewing
the fixture evidence.
`, 'utf8');

  await fs.writeFile(path.join(themeDir, 'deterministic-rules.md'), `# ${args.themeId} Deterministic Rules

These draft checks were extracted from fixture observations and should be
reviewed before becoming quality gates.

| Rule area | Draft captured expectation |
|-----------|----------------------------|
| Palette | Allowed colors should be drawn from the observed palette in \`tokens.json\`. |
| Typography | Body font should match \`${tokens.typography.body || 'the captured body stack'}\`; headings should use one of the heading candidates. |
| Surfaces | Radius, shadow, border, and surface fills should align with the captured surface candidates. |
| Rhythm | Section padding and margin should stay close to the observed spacing clusters. |
| Density | Navigation, image, and CTA density should stay near the captured medians unless the page mode justifies variance. |

Candidate promotions: \`DET.THEME.FONT_STACK\`, \`DET.TOKEN.NO_DRIFT\`,
\`DET.VISUAL.RHYTHM\`, \`DET.SURFACE.ELEVATION_TOKEN\`,
\`DET.CTA.HIERARCHY\`, and \`DET.CONTEXT.BURDEN\`.
`, 'utf8');

  await fs.writeFile(path.join(themeDir, 'ai-principles.md'), `# ${args.themeId} AI Principles

Use the fixture screenshots and \`extracted-design/observations.json\` to judge
whether transformed pages preserve this theme's feel.

Review prompts:

- Does the page preserve the captured brand temperament without copying content
  or protected assets verbatim?
- Is the hierarchy similar to the fixture's heading scale, CTA prominence, and
  section rhythm?
- Do surfaces, imagery, and density feel like one system rather than a partial
  token swap?
- Which repeated judgment should become a deterministic \`DET.*\` rule?

Fixture pages:
${yamlList((manifest.pages || []).map((p) => p.url), '') || '- none'}
`, 'utf8');

  const payload = generatedThemePayloadFromParts({
    id: args.themeId,
    name: args.themeId.replace(/[-_]+/g, ' '),
    status: 'draft',
    description: `Draft theme scrubbed from captured fixture ${manifest.seedUrl || args.fixture}.`,
    source: 'captured-fixture',
    sourceUrl: manifest.seedUrl || '',
    themeDir,
    designStandardPath: `${relThemeDir}/design-standard.md`,
    tokensPath: `${relThemeDir}/tokens.json`,
    deterministicRulesPath: `${relThemeDir}/deterministic-rules.md`,
    aiPrinciplesPath: `${relThemeDir}/ai-principles.md`,
    contractOverlaysDir: `${relThemeDir}/contracts`,
    cssFiles: [],
    rulePacks: [
      'docs/design/ux-audit/deterministic-design-rules.md',
      'docs/design/ux-audit/ai-enabled-design-principles.md',
    ],
    sourceFiles: [`${relThemeDir}/theme.yaml`],
  });
  const generatedPath = designThemeGeneratedPath(args.themeId);
  if (path.resolve(generatedPath) !== path.resolve(path.join(themeDir, 'theme.generated.json'))) {
    throw new Error(`Theme output must live under docs/design/themes/<theme-id>: ${themeDir}`);
  }
  await fs.writeFile(generatedPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const summary = {
    themeId: args.themeId,
    fixture: args.fixture,
    themeDir,
    generatedPath,
    pagesSampled: tokens.density.sampledPages,
    nextSteps: [
      'Review draft tokens and AI principles.',
      'Promote stable patterns into KS components or contract overlays.',
      'Run audits with --theme after accepting the theme.',
    ],
  };
  await fs.writeFile(path.join(themeDir, 'extraction-summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  process.stdout.write(`${themeDir}\n`);
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
