# KS UX component rules — phase 06 (remediation generator integration)

## Goal

Connect **defect remediation plans** and **sitewide scorer output** to the KS **visual hash catalog** so implementers see **hash → design contract** mappings whenever DOM evidence includes `hash` / `data-ks-hash`, and can thread optional **deterministic rule** (`DET.*`) and **AI principle** (`AI.*`) metadata from findings.

## What changed

### `tools/website-ux-auditor/lib/visual-catalog.js`

- **`contractPathFromRegistryEntry`**, **`resolveRegistryContractsForHashes`** — resolve `docs/design/catalog/visual-registry.generated.json` rows to contract paths (no YAML).
- **`summarizeVisualCatalogCoverage`** — adds **`knownHashContracts`** (`{ hash, contract }[]`) for scorer Markdown/JSON consumers.

### `tools/website-ux-auditor/lib/defect-remediation-plans.js`

- **`buildRankedDefectClusters`** accepts optional **`repoRoot`**.
- Each cluster collects **`ksVisualHashes`** from findings’ `hash` and from page **`metrics.ksVisualHashReport`** on affected URLs, then **`visualCatalogRefs`** via the generated registry.

### `tools/website-ux-auditor/analyze-website-ux.mjs`

- Passes **`repoRoot: args.repo`** into the defect planner.
- **`buildDefectPlan`** inserts **KS visual catalog pointers** (Markdown fenced `text` blocks listing `Affected visual hash` / `Contract`).
- Finding bullets include **`Rule:`** and **`AI principle:`** when `deterministicRule`, `candidateDeterministicRule`, or `principleId` are present.

### `tools/website-ux-auditor/lib/design-ux-score.js`

- Scorer Markdown adds **Known emitted hashes → design contracts** when `knownHashContracts` is non-empty (still no call into the analyzer).

### Checks (illustrative metadata)

- **`checks/first-screen-density.js`** — cramped rhythm finding sets **`deterministicRule: DET.VISUAL.RHYTHM`**.
- **`checks/visual-catalog-awareness.js`** — unknown hash finding sets **`deterministicRule: DET.CATALOG.HASH_REGISTRY_UNKNOWN`**.

### Tests

- **`auditor-tests/defect-remediation-plans.test.js`** — contract resolution for **`Hbk`** against the real kitchensink registry JSON.

## Tool boundary

- **`analyze-website-ux.mjs`** and **`score-website-ux.mjs`** remain separate entrypoints; shared logic lives under **`lib/`** only.

## Evidence — phase 06

**Completed:** 2026-05-19.

**Commands run:**

```bash
cd tools/website-ux-auditor && npm test
```

**Result:** all tests pass (`npm test` in `tools/website-ux-auditor`, 103 tests).
