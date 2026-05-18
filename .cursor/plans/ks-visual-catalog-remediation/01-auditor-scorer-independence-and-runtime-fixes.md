# Phase 01 — Auditor/scorer independence and runtime fixes

**Date:** 2026-05-18  
**Scope:** `tools/website-ux-auditor` visual catalog path only (no design-catalog package install required for tests).

## What changed

1. **`lib/visual-catalog.js`**
   - Removed re-export from `tools/design-catalog/lib/parse-registry.mjs` (that module depends on the `yaml` npm package).
   - Inlined **`entryByHash`** for JSON entry arrays.
   - **`loadGeneratedRegistry`** / **`generatedRegistryPath`** unchanged in behavior: single source **`docs/design/catalog/visual-registry.generated.json`** under `--repo`.

2. **`checks/visual-catalog-awareness.js`**
   - Added missing **`import fs from 'node:fs'`** (used for `fs.existsSync` on contract paths).
   - When **`ksVisualHashes`** is non-empty but the generated registry is missing or unreadable, returns one **`minor`** finding (message references `visual-registry.generated.json`) instead of silently returning no findings.

3. **Tests**
   - **`auditor-tests/visual-catalog-json.test.js`**: loads catalog from a tiny fixture repo tree (`auditor-tests/fixtures/catalog-json-repo/docs/design/catalog/visual-registry.generated.json`), asserts **`entryByHash`**, missing-registry finding, and known vs unknown hash behavior.
   - **`auditor-tests/fixtures/catalog-json-repo/.../visual-registry.generated.json`**: minimal generated JSON for those tests.

## Independence checks

- **`analyze-website-ux.mjs`** and **`score-website-ux.mjs`** do not import or invoke each other (existing layout preserved; this phase did not change that).
- Under **`tools/website-ux-auditor`**, there is **no** import of **`tools/design-catalog/lib/parse-registry.mjs`** (workspace search: no matches for `parse-registry.mjs` or `design-catalog/lib/`).

## Validation (acceptance)

Run from repo root:

```bash
cd tools/website-ux-auditor
npm test
```

**Result (2026-05-18):** `62` tests, **`pass 62`**, **`fail 0`**. No `yaml` / design-catalog dependency required for this test run.

## Notes

- Design-catalog tooling still **generates** `visual-registry.generated.json`; consumers of the auditor/scorer only need that file on disk when `--repo` is set and DOM markers are present.
