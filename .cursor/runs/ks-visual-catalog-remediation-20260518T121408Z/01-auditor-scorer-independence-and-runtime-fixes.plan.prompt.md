Read the focused remediation phase below and create a precise implementation plan. Do not edit files in this step. Save or summarize the plan under .cursor/plans/ks-visual-catalog-remediation/ when possible. Include exact files to inspect, files likely to change, validation commands, risks, and rollback notes.

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
