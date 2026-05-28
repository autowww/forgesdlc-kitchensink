#!/usr/bin/env node
/**
 * Generate docs/design/a11y-audit/wcag/ reference Markdown from catalogs + registry.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { resolveProfileCriteria } from '../lib/build-traceability-matrix.js';
import { resolveWcag3ProfileRequirements } from '../lib/build-traceability-matrix.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KS_ROOT = path.resolve(__dirname, '../../..');
const WCAG_DIR = path.join(KS_ROOT, 'docs/design/a11y-audit/wcag');
const CATALOG2_PATH = path.join(KS_ROOT, 'docs/design/a11y-audit/wcag-criteria-catalog.json');
const CATALOG3_PATH = path.join(KS_ROOT, 'docs/design/a11y-audit/wcag3-outcomes-catalog.json');
const REGISTRY_PATH = path.join(
  KS_ROOT,
  'tools/website-a11y-auditor/design-rules/registry.generated.json',
);
const MANIFEST_PATH = path.join(WCAG_DIR, 'reference-manifest.json');
const SEEDS_DIR = path.join(WCAG_DIR, 'seeds');

/**
 * @returns {Promise<Map<string, object>>}
 */
async function loadSeeds() {
  /** @type {Map<string, object>} */
  const map = new Map();
  let files;
  try {
    files = await fs.readdir(SEEDS_DIR);
  } catch {
    return map;
  }
  for (const name of files) {
    if (!name.endsWith('.yaml') && !name.endsWith('.yml')) continue;
    const raw = await fs.readFile(path.join(SEEDS_DIR, name), 'utf8');
    const idMatch = name.match(/^sc-(.+)\.ya?ml$/i);
    const wcag3Match = name.match(/^wcag3-(.+)\.ya?ml$/i);
    const id = idMatch?.[1] || wcag3Match?.[1];
    if (!id) continue;
    const body = {};
    for (const block of ['summary', 'operatorNotes']) {
      const re = new RegExp(`^${block}:\\s*\\|\\s*\\n([\\s\\S]*?)(?=\\n[a-zA-Z]|$)`, 'm');
      const m = raw.match(re);
      if (m) body[block] = m[1].replace(/^  /gm, '').trim();
    }
    const listMatch = raw.match(/^forgeRulesHighlight:\s*\n((?:\s+-\s+.+\n?)+)/m);
    if (listMatch) {
      body.forgeRulesHighlight = listMatch[1]
        .split('\n')
        .map((l) => l.replace(/^\s*-\s*/, '').trim())
        .filter(Boolean);
    }
    map.set(id, body);
  }
  return map;
}

function buildGuidelinesIndex(catalog3) {
  /** @type {Map<string, object[]>} */
  const byGuideline = new Map();
  for (const r of catalog3.requirements || []) {
    const g = r.guideline || 'Other';
    if (!byGuideline.has(g)) byGuideline.set(g, []);
    byGuideline.get(g).push(r);
  }
  const lines = [
    '# WCAG 3.0 draft — guidelines index',
    '',
    'Generated from `wcag3-outcomes-catalog.json`. Links to in-repo outcome pages.',
    '',
  ];
  for (const [guideline, reqs] of [...byGuideline.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`## ${guideline}`);
    lines.push('');
    for (const r of reqs) {
      const rel = `../outcomes/${r.id.toLowerCase()}-${slugify(r.title)}.md`;
      lines.push(`- [${r.id}](${rel}) — ${r.title}`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}`;
}

const PROFILE_VERSIONS = [
  { version: '2.0', profileId: 'wcag20aa' },
  { version: '2.1', profileId: 'wcag21aa' },
  { version: '2.2', profileId: 'wcag22aa' },
];

function slugify(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function understandingUrl(version, id, title) {
  const slug = slugify(title);
  const v = version.replace('.', '');
  return `https://www.w3.org/WAI/WCAG${v}/Understanding/${slug}`;
}

function specUrlForSc(version, id, title) {
  const base =
    version === '2.0'
      ? 'https://www.w3.org/TR/WCAG20/'
      : version === '2.1'
        ? 'https://www.w3.org/TR/WCAG21/'
        : 'https://www.w3.org/TR/WCAG22/';
  return `${base}#${slugify(title)}`;
}

/**
 * @param {object} registry
 */
function rulesForSc(registry, scId) {
  const det = [];
  const ai = [];
  for (const r of registry.deterministicRules || []) {
    if ((r.wcagCriteria || []).includes(scId)) det.push(r.id);
  }
  for (const r of registry.aiRules || []) {
    if ((r.wcagCriteria || []).includes(scId)) ai.push(r.id);
  }
  return { det, ai };
}

function buildScMarkdown(c, version, registry, seed) {
  const { det, ai } = rulesForSc(registry, c.id);
  const specUrl = c.specUrl || specUrlForSc(version, c.id, c.title);
  const manual = c.defaultCoverage === 'manual_only';
  const summaryBlock =
    seed?.summary ||
    `${c.title} (WCAG ${version} Level ${c.level}) ensures content remains perceivable, operable, understandable, or robust for people with disabilities. This page paraphrases the intent for Forge operators; see the normative [W3C specification](${specUrl}) for legal text.`;
  const operatorBlock = seed?.operatorNotes
    ? `\n## Operator notes\n\n${seed.operatorNotes}\n`
    : '';
  const highlight = seed?.forgeRulesHighlight?.length
    ? `\n**Highlighted Forge rules:** ${seed.forgeRulesHighlight.map((x) => `\`${x}\``).join(', ')}\n`
    : '';

  return `---
id: "${c.id}"
title: "${c.title.replace(/"/g, '\\"')}"
level: ${c.level}
wcagVersion: "${version}"
principle: ${c.principle ?? 'null'}
specUrl: "${specUrl}"
understandingUrl: "${understandingUrl(version, c.id, c.title)}"
forgeDetRules: [${det.map((x) => `"${x}"`).join(', ')}]
forgeAiRules: [${ai.map((x) => `"${x}"`).join(', ')}]
manualOnly: ${manual}
---

# ${c.id} ${c.title}

## Summary

${summaryBlock}
${highlight}
${operatorBlock}
## Intent

Users who rely on assistive technology, keyboard-only navigation, adjusted display settings, or plain language should be able to use the interface without losing information or functionality tied to this criterion.

## Requirements (checklist)

- Meet the success criterion as described in the W3C TR for **${c.id}**.
- Verify both visual presentation and programmatic exposure (names, roles, states, relationships).
- Document exceptions only when a documented essential exception applies.

## Common failures

- Automation passes partial checks but manual task completion still fails.
- Custom components omit required names, roles, or states.
- Instructions rely on a single sense (shape, color, sound) without alternatives.

## Forge automation

| Lane | Rules |
|------|-------|
| DET | ${det.length ? det.join(', ') : '—'} |
| AI | ${ai.length ? ai.join(', ') : '—'} |
| Manual | ${manual ? 'Expected — run manual test steps below' : 'Use axe + DET where mapped'} |

## Manual test steps

1. Identify pages or components in scope for **${c.id}**.
2. Exercise primary user tasks with keyboard only and with at least one screen reader.
3. Compare results against the W3C [Understanding](${understandingUrl(version, c.id, c.title)}) techniques where applicable.

## Remediation hints

- Prefer semantic HTML and native controls before ARIA overlays.
- Pair visual fixes with programmatic names/states so assistive tech stays in sync.
- Re-run \`analyze-website-a11y.mjs\` with the matching compliance profile after changes.

## Related

- Principle ${c.principle} — browse sibling criteria in \`wcag/${version}/sc/\`.
`;
}

function buildWcag3Markdown(r) {
  const maps = (r.mapsToWcag22 || []).join(', ');
  const docRel = `3.0/outcomes/${r.id.toLowerCase()}-${slugify(r.title)}.md`;
  return `---
id: "${r.id}"
title: "${r.title.replace(/"/g, '\\"')}"
conformanceTier: "${(r.tiers || []).join(', ')}"
wcagVersion: "3.0"
specUrl: "https://www.w3.org/TR/wcag-3.0/"
mapsToWcag22: [${(r.mapsToWcag22 || []).map((x) => `"${x}"`).join(', ')}]
manualOnly: ${r.defaultCoverage === 'manual_only'}
---

# ${r.id} — ${r.title}

## Summary

Draft WCAG 3.0 requirement under guideline **${r.guideline || '—'}**. Tier: **${(r.tiers || []).join(', ')}**. This is not a WCAG 2.x success criterion; conformance uses Bronze / Silver / Gold.

## Intent

Address functional user needs described in the [WCAG 3.0 Working Draft](https://www.w3.org/TR/wcag-3.0/). Bronze is closest to WCAG 2.2 AA in migration guidance — not equivalent to Level A.

## Requirements (checklist)

- Satisfy the draft requirement using applicable core/supplemental methods in the TR.
- Where \`mapsToWcag22\` is listed (${maps || 'none'}), also verify mapped WCAG 2.2 success criteria for automation proxy coverage.

## Forge automation

- **Automation proxy:** axe/DET packs use WCAG 2.2 tag bundles; see [wcag-3.0-profiles.md](../wcag-3.0-profiles.md).
- **Crosswalk:** ${maps || 'WCAG 3–only — manual / AI judgment expected'}.

## Manual test steps

1. Read the draft requirement and linked methods in the TR.
2. Validate with assistive technology and task-based walkthroughs.
3. For Silver/Gold tiers, include holistic review with people with disabilities where applicable.

## Remediation hints

- Do not claim WCAG 3 legal conformance from Forge automation alone.
- Improve mapped 2.2 criteria when crosswalk IDs are present.

## Related

- [WCAG 3.0 profiles](../wcag-3.0-profiles.md)
`;
}

async function main() {
  const checkOnly = process.argv.includes('--check');
  const catalog2 = JSON.parse(await fs.readFile(CATALOG2_PATH, 'utf8'));
  const catalog3 = JSON.parse(await fs.readFile(CATALOG3_PATH, 'utf8'));
  const registry = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
  const seeds = await loadSeeds();

  /** @type {Record<string, { path: string, checksum: string }>} */
  const manifest = {};
  const written = [];

  await fs.mkdir(WCAG_DIR, { recursive: true });

  for (const { version, profileId } of PROFILE_VERSIONS) {
    const criteria = resolveProfileCriteria(catalog2, profileId);
    const dir = path.join(WCAG_DIR, version, 'sc');
    await fs.mkdir(dir, { recursive: true });
    for (const c of criteria) {
      const rel = `${version}/sc/${c.id}-${slugify(c.title)}.md`;
      const abs = path.join(WCAG_DIR, rel);
      const body = buildScMarkdown(c, version, registry, seeds.get(c.id));
      const checksum = crypto.createHash('sha256').update(body).digest('hex');
      manifest[c.id] = { path: rel, checksum, kind: 'sc', wcagVersion: version };
      if (!checkOnly) await fs.writeFile(abs, body, 'utf8');
      written.push(rel);
    }
  }

  const wcag3All = resolveWcag3ProfileRequirements(catalog3, 'wcag30gold');
  const dir3 = path.join(WCAG_DIR, '3.0/outcomes');
  await fs.mkdir(dir3, { recursive: true });
  for (const r of wcag3All) {
    const rel = `3.0/outcomes/${r.id.toLowerCase()}-${slugify(r.title)}.md`;
    const abs = path.join(WCAG_DIR, rel);
    const body = buildWcag3Markdown(r);
    const checksum = crypto.createHash('sha256').update(body).digest('hex');
    manifest[r.id] = { path: rel, checksum, kind: 'wcag3-requirement' };
    if (!checkOnly) await fs.writeFile(abs, body, 'utf8');
    written.push(rel);
  }

  const readme = `# WCAG reference (in-repo)

Paraphrased guidance for Forge operators. **Not** verbatim W3C normative text.

| Version | Path | Source |
|---------|------|--------|
| 2.0 | [2.0/sc/](2.0/sc/) | [WCAG 2.0](https://www.w3.org/TR/WCAG20/) |
| 2.1 | [2.1/sc/](2.1/sc/) | [WCAG 2.1](https://www.w3.org/TR/WCAG21/) |
| 2.2 | [2.2/sc/](2.2/sc/) | [WCAG 2.2](https://www.w3.org/TR/WCAG22/) |
| 3.0 (draft) | [3.0/outcomes/](3.0/outcomes/) | [WCAG 3.0](https://www.w3.org/TR/wcag-3.0/) |

Regenerate: \`npm run sync-wcag-md\` from \`tools/website-a11y-auditor\`.

See also [wcag-3.0-profiles.md](../wcag-3.0-profiles.md).
`;

  const guidelinesDir = path.join(WCAG_DIR, '3.0/guidelines');
  const guidelinesBody = buildGuidelinesIndex(catalog3);

  if (!checkOnly) {
    await fs.mkdir(guidelinesDir, { recursive: true });
    await fs.writeFile(path.join(guidelinesDir, 'README.md'), guidelinesBody, 'utf8');
    await fs.writeFile(path.join(WCAG_DIR, 'README.md'), readme, 'utf8');
    await fs.writeFile(
      MANIFEST_PATH,
      `${JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), entries: manifest }, null, 2)}\n`,
      'utf8',
    );
  } else {
    const existing = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8').catch(() => '{"entries":{}}'));
    for (const [id, meta] of Object.entries(manifest)) {
      const prev = existing.entries?.[id];
      if (!prev || prev.checksum !== meta.checksum) {
        console.error(`sync-wcag-md --check: drift for ${id}`);
        process.exit(1);
      }
    }
    console.log(`sync-wcag-md --check: OK (${Object.keys(manifest).length} entries)`);
    return;
  }

  console.log(`sync-wcag-reference-markdown: wrote ${written.length} pages`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
