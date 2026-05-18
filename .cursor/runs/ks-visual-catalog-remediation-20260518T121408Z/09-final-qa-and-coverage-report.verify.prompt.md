Verify this remediation phase without editing files.

Start your response with exactly one line:
VERDICT: PASS
or
VERDICT: FAIL

Then provide evidence, missing work, and exact next actions.

--- PHASE PROMPT START ---
# 09 - Final QA and coverage report

## Purpose

Verify the remediation is complete and produce a current, non-stale final report.

## Required checks

Run the repo's appropriate equivalents of:

```bash
node tools/design-catalog/inventory-ks-visuals.mjs --repo .
node tools/design-catalog/check-visual-catalog.mjs --repo .
python3 generator/build-showcase.py
cd tools/website-ux-auditor && npm test
```

Also run any package/build tests that are reasonable for this repo.

## Required report

Write:

```text
.cursor/plans/ks-visual-catalog-remediation/09-final-qa-and-coverage-report.md
```

The report must include:

- commit/branch or working tree context
- files changed grouped by area
- inventory totals by category
- registry totals by category
- own contract count
- family-covered count with rationale
- placeholder contract scan result
- invalid/duplicate hash scan result
- emitted HTML marker coverage
- screenshot status counts
- auditor/scorer independence verification
- auditor test output
- catalog validation output
- showcase build output
- consumer-site propagation status
- live-site checks performed and results
- unresolved risks
- recommended follow-up tickets

## Required pass/fail summary

Start the final report with:

```text
Status: PASS | PASS_WITH_LIMITATIONS | FAIL
```

Use `PASS_WITH_LIMITATIONS` if consumer repos or hosted screenshots were not available but all local KS work is complete.

Use `FAIL` if any of these remain true:

- auditor tests fail because of catalog dependencies
- contract placeholders remain
- duplicate/invalid hashes remain
- generated registry and inventory are stale
- broad family rows still cover independent emitted visuals without rationale
- final report contains stale numbers

## Acceptance criteria

- Final report exists and is current.
- All generated counts agree across registry, inventory, and coverage report.
- The final report names exact commands used.
- The final report is honest about what was not deployable or not testable.
- There is a clean next-step list for any remaining work.

## Do not

- Do not write a success report by hand without running validation.
- Do not hide failing tests.
- Do not claim hosted/live deployment unless verified.
--- PHASE PROMPT END ---

--- EXECUTION LOG START ---
Phase 09 is done. Here is what ran and what was recorded.

## Status: **PASS_WITH_LIMITATIONS**

Local checks all succeeded; the limitation is **hosted KS showcase** still has **no** `data-ks-hash` markers on a full-page fetch of `https://ks.forgesdlc.com/cases/showcase/preview-handbook.html` (0 matches), and **consumer submodule bumps** were not executed in this pass.

### Commands run (from KS repo root)

| Step | Command | Result |
|------|---------|--------|
| Inventory | `node tools/design-catalog/inventory-ks-visuals.mjs --repo . --out docs/design/catalog/visual-inventory.generated.json` | OK — **363** items |
| Showcase | `python3 generator/build-showcase.py` | OK — 22 pages + previews |
| Catalog | `node …/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase` (+ `--verbose-contract-placeholders`) | OK — **91** entries |
| Marker scan | `node tools/design-catalog/check-consumer-hashes.mjs --repo . --dir showcase --strict` | OK — **172** paired `hash` / `data-ks-hash` attrs, **29** HTML files, **44** distinct ids |
| Autodoc tests | `python3 -m pytest forge-autodoc/tests -q` | **36 passed** |
| Auditor tests | `cd tools/website-ux-auditor && npm test` | **68 passed** |

**Note:** Inventory help text requires **`--out`**; `--repo .` alone exits with usage code 2 (documented in the report).

### Auditor / scorer independence

Neither `analyze-website-ux.mjs` nor `score-website-ux.mjs` spawns the other (no `child_process` usage for that).

### Evidence file

Full structured report (commands, counts, risks, follow-ups):  
**`.cursor/plans/ks-visual-catalog-remediation/09-final-qa-and-coverage-report.md`**

Aligned figures (from `visual-registry-coverage.md` + inventory JSON): **363** inventory items, **91** registry rows, **54** own contracts, **37** family-covered, screenshot split **48 / 41 / 2** (captured / not-applicable / blocked).
--- EXECUTION LOG END ---
