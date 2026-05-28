# Standards packs

Per-profile **standards packs** are machine-readable JSON files that list every success criterion (WCAG 2.x) or requirement (WCAG 3.0 draft) in a compliance scope and which **axe**, **DET**, or **AI** rules cover each row.

**Not legal conformance.** Same disclaimer as [compliance-profiles.md](compliance-profiles.md).

## Runtime lanes vs pack tooling

Packs and the RTM encode **which lane** (axe, deterministic, AI) is expected to cover each criterion. That is **not** the same as runtime execution:

- **Pack / RTM** — design-time mapping (`rules.det`, `rules.ai`, `tooling: manual`).
- **Site crawl** — `analyze-website-a11y.mjs` and `score-compliance-a11y.mjs` (default) run **axe + det** only unless you pass `--audit-data` with findings that already include merged AI output.
- **Compliance report** — when scoring a site, each failing criterion includes `failingByLane` (axe / det / ai rule IDs) derived from findings, not a separate AI crawl.

See [compliance-profiles.md](compliance-profiles.md#runtime-lanes-vs-pack-tooling).

## Location

After `npm run blend-rules` in `tools/website-a11y-auditor/`:

| Pack file | Profile |
|-----------|---------|
| `wcag20a.pack.json` | WCAG 2.0 Level A |
| `wcag20aa.pack.json` | WCAG 2.0 Level AA |
| `wcag20aaa.pack.json` | WCAG 2.0 Level AAA |
| `wcag21a.pack.json` | WCAG 2.1 Level A |
| `wcag21aa.pack.json` | WCAG 2.1 Level AA |
| `wcag21aaa.pack.json` | WCAG 2.1 Level AAA |
| `wcag22a.pack.json` | WCAG 2.2 Level A |
| `wcag22aa.pack.json` | WCAG 2.2 Level AA |
| `wcag22aaa.pack.json` | WCAG 2.2 Level AAA |
| `wcag30bronze.pack.json` | WCAG 3.0 Bronze (draft) |
| `wcag30silver.pack.json` | WCAG 3.0 Silver (draft) |
| `wcag30gold.pack.json` | WCAG 3.0 Gold (draft) |

Sources: [`wcag-criteria-catalog.json`](wcag-criteria-catalog.json), [`wcag3-outcomes-catalog.json`](wcag3-outcomes-catalog.json).

## Regenerate

```bash
cd tools/website-a11y-auditor
npm run blend-rules
npm run sync-wcag-md
```

## Validate (CI)

```bash
node validate-standards-pack.mjs --pack wcag22a --strict
node validate-standards-pack.mjs --pack wcag22aaa --strict
node validate-standards-pack.mjs --pack wcag30bronze --strict
node validate-standards-pack.mjs --pack wcag30gold --strict
```

## Stub inventory

See [`a11y-tooling-stub-inventory.md`](a11y-tooling-stub-inventory.md) (`npm run inventory-a11y-stubs`).
