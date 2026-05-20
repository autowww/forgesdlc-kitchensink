Verify this phase without editing files.

Start with exactly one line:
VERDICT: PASS
or
VERDICT: FAIL

Then provide concise evidence, missing work, and exact next actions.

--- PHASE PROMPT START ---
# 06 — Remediation generator integration

Goal: make future site remediation plans cite component/layout/page hashes and design contracts.

Update remediation planning so findings can say:

```text
Affected visual hash: Ldg
Contract: docs/design/catalog/layouts/Ldg-layout-landing.md
Rule: DET.VISUAL.RHYTHM
AI principle: AI.PREMIUM.ENTERPRISE_FEEL
```

Likely files:

- `tools/website-ux-auditor/lib/defect-remediation-plans.js`
- `tools/website-ux-auditor/analyze-website-ux.mjs`
- `tools/website-ux-auditor/score-website-ux.mjs`
- `tools/website-ux-auditor/checks/visual-catalog-awareness.js`
- `tools/website-ux-auditor/lib/visual-catalog.js`

Rules:

- auditor and scorer stay separate;
- both may read generated visual registry JSON;
- plans should use deterministic findings first;
- AI-enabled review is run after deterministic Major+ findings are resolved or when explicitly requested.

Acceptance:
- generated remediation plans cite hashes/contracts where DOM evidence includes `data-ks-hash` or `hash`;
- tests pass.
--- PHASE PROMPT END ---

--- EXECUTION LOG START ---
## Summary

Remediation planning now ties defect clusters to **KS visual hashes** and **design contracts** using **`docs/design/catalog/visual-registry.generated.json`** (same rule as the rest of the auditor: no YAML).

### Behavior

1. **`buildRankedDefectClusters`** (`lib/defect-remediation-plans.js`)  
   - Optional **`repoRoot`**.  
   - Collects hashes from **findings’ `hash`** and from **`metrics.ksVisualHashReport`** on **affected URLs** (normalized trailing slashes).  
   - Adds **`ksVisualHashes`** and **`visualCatalogRefs`** (`{ hash, contract, name }`) per cluster.

2. **`analyze-website-ux.mjs`**  
   - Passes **`repoRoot: args.repo`**.  
   - **`buildDefectPlan`** includes **“KS visual catalog pointers”** with a fenced `text` block:  
     `Affected visual hash:` / `Contract:` (or an unresolved note if the JSON is missing or the hash is unknown).  
   - **Finding bullets** add **`Rule:`** and **`AI principle:`** when **`deterministicRule`**, **`candidateDeterministicRule`**, or **`principleId`** are set.

3. **`score-website-ux.mjs`** (via **`summarizeVisualCatalogCoverage`** + **`buildUxQualityScoreMarkdown`**)  
   - Adds **`knownHashContracts`** to the coverage rollup and a **“Known emitted hashes → design contracts”** table in **`ux-quality-score.md`**.  
   - Still **no import/call** of the analyzer.

4. **Example deterministic metadata**  
   - **`first-screen-density`**: cramped rhythm → **`deterministicRule: DET.VISUAL.RHYTHM`**.  
   - **`visual-catalog-awareness`**: unknown DOM hash → **`DET.CATALOG.HASH_REGISTRY_UNKNOWN`**.

### Helpers (`lib/visual-catalog.js`)

- **`contractPathFromRegistryEntry`**, **`resolveRegistryContractsForHashes`** (used by defect clusters).  
- **`knownHashContracts`** on **`summarizeVisualCatalogCoverage`** output.

### Tests & docs

- New test in **`auditor-tests/defect-remediation-plans.test.js`** ( **`Hbk`** → handbook contract).  
- **`npm test`** in `tools/website-ux-auditor`: **103 passed**.  
- Plan evidence: **`.cursor/plans/ks-ux-component-rules/06-remediation-generator-integration.md`** and a line in **`00-master-sequence.md`**.

**Note:** Contract resolution expects **`docs/design/catalog/visual-registry.generated.json`** under **`--repo`** (e.g. kitchensink root). Consumer sites that only hold the catalog inside a submodule may need **`--repo`** pointed at the submodule copy or that file mirrored at the repo root for full contract paths.
--- EXECUTION LOG END ---
