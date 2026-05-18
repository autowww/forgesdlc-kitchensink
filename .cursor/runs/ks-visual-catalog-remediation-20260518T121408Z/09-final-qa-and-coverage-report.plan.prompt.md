Read the focused remediation phase below and create a precise implementation plan. Do not edit files in this step. Save or summarize the plan under .cursor/plans/ks-visual-catalog-remediation/ when possible. Include exact files to inspect, files likely to change, validation commands, risks, and rollback notes.

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
