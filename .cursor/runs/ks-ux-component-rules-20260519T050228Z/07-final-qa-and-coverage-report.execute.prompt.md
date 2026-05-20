Execute the phase below. You may edit files. Keep the change scoped. Run relevant checks at the end and update the matching .cursor/plans/ks-ux-component-rules/*.md evidence/report file.

--- PLAN SUMMARY START ---

--- PLAN SUMMARY END ---

--- PHASE PROMPT START ---
# 07 — Final QA and coverage report

Run and document:

```bash
python3 generator/build-showcase.py
cd tools/website-ux-auditor && npm test && cd ../..
cd tools/design-catalog && npm install && cd ../..
node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase
```

Write `.cursor/plans/ks-ux-component-rules/07-final-qa-and-coverage-report.md` with:

- status: PASS, PASS_WITH_LIMITATIONS, or FAIL;
- files changed;
- deterministic rules added/changed;
- AI-enabled principles added/changed;
- catalog contract coverage;
- generic contract text remaining, if any;
- screenshots/live showcase status;
- tests/checks run;
- known limitations;
- follow-up tasks.

The report must explicitly say that no Fleet-specific profile was created.
--- PHASE PROMPT END ---
