Verify this remediation phase without editing files.

Start your response with exactly one line:
VERDICT: PASS
or
VERDICT: FAIL

Then provide evidence, missing work, and exact next actions.

--- PHASE PROMPT START ---
# 07 - Connect auditor, scorer, and remediation plans to the catalog safely

## Purpose

Make UX audit, UX scoring, and generated Cursor remediation plans aware of visual hashes and design contracts without making the systems depend on each other.

## Architecture rules

```text
shared generated JSON / low-level helpers
        ^
        |
 +------+-------------------------------+
 |                                      |
analyze-website-ux.mjs          score-website-ux.mjs
(audit + remediation plans)      (scorecard + gates + trends)
```

- The auditor may read visual registry JSON.
- The scorer may read visual registry JSON.
- Neither may call the other.
- The remediation planner may cite hashes and contract paths when findings relate to known visual elements.
- The auditor/scorer must work when the catalog is absent, with a warning rather than a crash.

## Required behavior

Add or verify:

- DOM scan for `hash="XYZ"` and `data-ks-hash="XYZ"`.
- Detection of invalid, unknown, deprecated, and duplicate emitted hashes.
- Detection of emitted hashes with missing contract references.
- Findings that cite `docs/design/catalog/...` contract paths.
- Score dimension or quality gate for visual catalog coverage.
- Remediation plans that say: update implementation and matching design contract together.
- Tests for catalog awareness with generated JSON only.

## Required output examples

Audit finding should include fields like:

```json
{
  "id": "visual-catalog-unknown-hash",
  "severity": "warn",
  "hash": "AbC",
  "selector": "[data-ks-hash=\"AbC\"]",
  "message": "Rendered hash AbC is not in docs/design/catalog/visual-registry.generated.json"
}
```

Remediation plan text should include:

```text
Affected visual: AbC - enterprise-hero-band
Design contract: docs/design/catalog/components/AbC-enterprise-hero-band.md
Update both implementation and contract if the visual expectation changes.
```

## Acceptance criteria

- `tools/website-ux-auditor/npm test` passes standalone.
- Scorer can run on a local page with cataloged hashes and report coverage.
- Auditor generated plans cite hashes when page elements include known hashes.
- No import cycle or CLI cross-call exists between auditor and scorer.
- `.cursor/plans/ks-visual-catalog-remediation/07-auditor-scorer-remediation-catalog-awareness.md` records test evidence.

## Do not

- Do not parse YAML from the auditor/scorer runtime unless the package explicitly owns the dependency and tests install it.
- Do not make missing catalog data fatal for unrelated audits.
--- PHASE PROMPT END ---

--- EXECUTION LOG START ---
Here is what was implemented for **phase 07**, scoped to the website UX tooling and plans.

### Behavior

1. **`lib/dom-metrics.js`** — Builds `ksVisualHashReport` in the browser: valid 3-letter hashes, invalid attribute values, `hash` vs `data-ks-hash` mismatches, incomplete pairs (only one attribute), and `instanceCountByHash`. Keeps **`ksVisualHashes`** as `validUnique` for compatibility.

2. **`lib/visual-catalog.js`** — Shared helpers only on **generated JSON**: `registryDuplicateHashes`, `ksVisualHashReportFromHtmlBlob` (static HTML), `ksVisualHashReportFromMetrics` (DOM report or legacy `ksVisualHashes`), `summarizeVisualCatalogCoverage` (scorer rollup).

3. **`checks/visual-catalog-awareness.js`** — Emits stable **`id`**s (e.g. `visual-catalog-unknown-hash`), **`hash`** / **`selector`** where relevant, **`warn`** for unknown / duplicate / incomplete markers / bad registry rows, paths cite **`visual-registry.generated.json`**. Registry duplicate rows fire **once per crawl** via a shared `ctx` flag. Handles **missing contract** when `contract_status` is `own` or `family-covered` but `contract` is empty.

4. **`lib/severity.js`** — New **`warn`** between **major** and **minor** (`SCORE_WEIGHTS.warn = 14`). **`legacySeverityFrom`** updated so **major / warn / minor** stay in the **medium** band.

5. **`score-website-ux.mjs` + `lib/design-ux-score.js`** — Adds **`visualCatalogCoverage`** to **`ux-quality-score.json`** and a **KS visual catalog coverage** section in **`ux-quality-score.md`** (no call into the auditor).

6. **`analyze-website-ux.mjs`** — **`visualCatalogRemediationSection`** in Plan **07** lists **Affected visual**, **Design contract**, and **update both implementation and contract** for **known** hashes; **visual-catalog** included in findings. Static mode fills hash data via **`ksVisualHashReportFromHtmlBlob`**.

7. **Tests** — Extended **`auditor-tests/visual-catalog-json.test.js`**, added **`auditor-tests/fixtures/catalog-dup-repo/`**, tightened **severity** / **design-ux-score** tests.

### Evidence

- **`.cursor/plans/ks-visual-catalog-remediation/07-auditor-scorer-remediation-catalog-awareness.md`** — phase summary + **`npm test`** result (**68 tests, all passing**, 2026-05-18).

### Command

```bash
cd tools/website-ux-auditor && npm test
```
--- EXECUTION LOG END ---
