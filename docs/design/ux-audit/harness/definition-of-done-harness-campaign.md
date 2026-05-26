# Definition of Done — Harness campaign

## Purpose

A harness campaign is done when batch results are recorded, deduped, and summarized against closure bars.

## Acceptance criteria

- [ ] `state.jsonl` complete; dedupe by `ruleId` for reporting.
- [ ] DET detection: all implemented rules `detection_ok` (50/50 bar).
- [ ] DET remediation verify: all implemented rules `remediation_ok` (50/50 bar).
- [ ] AI harness: all AI rules `detection_ok` (20/20 bar).
- [ ] `RULESET-HARNESS-CLOSURE.md` updated with campaign id, date, pass counts.
- [ ] [E2E-COVERAGE-MATRIX.md](E2E-COVERAGE-MATRIX.md) regenerated from latest campaigns.
- [ ] `npm test` triage noted if baseline failures unchanged.

## Verification

```bash
cd tools/website-ux-auditor/auditor-tests
./invoke-det-ruleset-harness.sh
./invoke-det-ruleset-remediation-verify.sh
./invoke-ai-ruleset-harness.sh
node generate-harness-e2e-matrix.mjs
```

## Known exclusions

- Workbench campaign dirs remain gitignored; in-repo closure doc + matrix are the committed record.
- Agent pilot campaigns are optional; do not block detection/remediation-verify DoD.
