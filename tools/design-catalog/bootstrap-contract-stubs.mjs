#!/usr/bin/env node
/** Create missing contract Markdown files for registry rows with contract_status: own */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const repo = path.resolve(import.meta.dirname, '../..');
const yamlPath = path.join(repo, 'docs/design/catalog/visual-registry.yaml');
const doc = YAML.parse(fs.readFileSync(yamlPath, 'utf8'));
const entries = doc.entries || [];

const stub = (e) => `---
hash: "${e.hash}"
name: "${e.name.replace(/"/g, '\\"')}"
type: "${e.type}"
status: "active"
source_paths: ${JSON.stringify(e.source_paths || [])}
showcase_url: "${e.showcase_url || ''}"
screenshot_url: "${e.screenshot_url || ''}"
screenshot_status: "${e.screenshot_status || 'planned'}"
---

# ${e.hash} — ${e.name}

## Purpose

See [visual-registry.yaml](../visual-registry.yaml) and [contract-template.md](../contract-template.md). Expand this stub with anatomy, states, and a11y expectations.

## Expected look

Calm Forge enterprise surface; follows [forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md).

## Anatomy

- TBD

## Content rules

- TBD

## States

- Default

## Variants

- TBD

## Responsive behavior

- TBD

## Accessibility contract

- TBD

## Enterprise look/feel rules

- TBD

## Forbidden patterns

- TBD

## Source paths

${(e.source_paths || []).map((p) => `- \`${p}\``).join('\n')}

## Dependencies

- TBD

## Showcase and screenshots

- ${e.showcase_url || 'n/a'}
- Screenshot: ${e.screenshot_url || 'planned'}

## Acceptance checklist

- [ ] Root emits \`hash="${e.hash}"\` and matching \`data-ks-hash\`.
- [ ] Registry row current.

## Change rules

Keep hash for compatible refinements; allocate new hash for breaking visual identity changes.

## Changelog

- Auto-stub generated — replace with authored contract.
`;

for (const e of entries) {
  if (e.contract_status !== 'own' || !e.contract) continue;
  const out = path.join(repo, e.contract);
  if (fs.existsSync(out)) continue;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, stub(e), 'utf8');
  console.log('wrote', e.contract);
}
