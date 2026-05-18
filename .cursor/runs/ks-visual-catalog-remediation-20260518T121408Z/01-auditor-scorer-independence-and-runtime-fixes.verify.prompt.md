Verify this remediation phase without editing files.

Start your response with exactly one line:
VERDICT: PASS
or
VERDICT: FAIL

Then provide evidence, missing work, and exact next actions.

--- PHASE PROMPT START ---
# 01 - Fix auditor/scorer independence and runtime defects

## Purpose

Fix the current implementation defects that make the Website UX Auditor and UX Scorer fragile after adding visual catalog awareness.

## Known defects to investigate

1. `tools/website-ux-auditor/lib/visual-catalog.js` imports from `tools/design-catalog/lib/parse-registry.mjs`, which imports the external `yaml` package. This makes `tools/website-ux-auditor/npm test` fail unless design-catalog dependencies are installed.
2. `tools/website-ux-auditor/checks/visual-catalog-awareness.js` appears to call `fs.existsSync(abs)` without importing `fs`.
3. Auditor/scorer catalog awareness should read generated JSON artifacts, not parse design-catalog YAML directly at runtime.
4. Auditor and scorer must remain separate CLIs and must not call each other.

## Required implementation

- Replace auditor/scorer runtime YAML dependency with a tiny JSON-only reader.
- Preferred source: `docs/design/catalog/visual-registry.generated.json`.
- Fallbacks may be allowed only if they do not require non-auditor package dependencies.
- Add defensive behavior when the registry JSON is missing: produce a warning/finding, not a crash.
- Fix missing imports/runtime errors in visual catalog awareness checks.
- Add unit tests that run from `tools/website-ux-auditor` without installing `tools/design-catalog` dependencies.
- Add a test proving the auditor/scorer can load visual catalog data from generated JSON only.

## Acceptance criteria

- From repo root, this works or has a documented equivalent:

```bash
cd tools/website-ux-auditor
npm test
```

- The test run does not fail due to missing `yaml`.
- Searching `tools/website-ux-auditor` shows no runtime import from `tools/design-catalog/lib/parse-registry.mjs`.
- `visual-catalog-awareness.js` has no missing `fs` import or equivalent runtime defect.
- `analyze-website-ux.mjs` and `score-website-ux.mjs` do not import or call each other.
- `.cursor/plans/ks-visual-catalog-remediation/01-auditor-scorer-independence-and-runtime-fixes.md` records what changed and validation output.

## Do not

- Do not remove visual-catalog awareness entirely.
- Do not add a hidden dependency on design-catalog package install.
- Do not make the auditor or scorer spawn the other CLI.
--- PHASE PROMPT END ---

--- EXECUTION LOG START ---
Here’s what was done for **phase 01**.

### Code

- **`lib/visual-catalog.js`** — Dropped the re-export from `tools/design-catalog/lib/parse-registry.mjs` (and the transitive `yaml` dependency). Catalog support is **JSON-only** via `loadGeneratedRegistry` / `generatedRegistryPath`, with **`entryByHash`** implemented locally (same behavior as before for array → `Map`).
- **`checks/visual-catalog-awareness.js`** — Added **`import fs from 'node:fs'`**. If there are DOM hashes but **`visual-registry.generated.json`** is missing or bad JSON, the check now returns a single **`minor`** finding (with the expected path in **evidence**) instead of returning nothing.

### Tests & fixture

- **`auditor-tests/fixtures/catalog-json-repo/docs/design/catalog/visual-registry.generated.json`** — Minimal generated registry.
- **`auditor-tests/visual-catalog-json.test.js`** — Confirms JSON loading/`entryByHash`, missing-registry finding (against `fixtures/minimal-repo`), and known vs unknown hash behavior **without** design-catalog installs.

### Acceptance

- `cd tools/website-ux-auditor && npm test` → **62 passed** (no `yaml` needed).
- Workspace search under `tools/website-ux-auditor`: **no** `parse-registry.mjs` / `design-catalog/lib/` imports.
- **`analyze-website-ux.mjs` / `score-website-ux.mjs`** — Still no cross-imports (unchanged).

### Evidence

- **`.cursor/plans/ks-visual-catalog-remediation/01-auditor-scorer-independence-and-runtime-fixes.md`** — Change list, independence notes, and test run summary.
--- EXECUTION LOG END ---
