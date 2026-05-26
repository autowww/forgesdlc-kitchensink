# Definition of Done — Remediation script fix

## Purpose

Deterministic remediation fix is done when After HTML on the fixture yields zero targeted DET findings.

## Acceptance criteria

- [ ] `apply-harness-fixture-remediation.py --rule-id <ID> --fixture-dir <path>` completes successfully.
- [ ] `expect-rule-clean.sh` returns 0 for the rule’s `audit-data.json` (only `design-rule-runtime` + matching `ruleId` counted).
- [ ] Full DET verify campaign: `remediation_ok` in `state.jsonl` (closure bar: 50/50 implemented DET rules).
- [ ] No edits under consumer product repos (`forge-fleet-website`, etc.).

## Verification

```bash
cd tools/website-ux-auditor/auditor-tests
python3 apply-harness-fixture-remediation.py --rule-id DET.EXAMPLE --fixture-dir "$FIXTURE_ROOT/website"
# Then re-audit and:
./expect-rule-clean.sh "$OUT/audit-data.json" DET.EXAMPLE
```

Or batch:

```bash
./invoke-det-ruleset-remediation-verify.sh
```

## Known exclusions

- Leftover findings from **other** rule IDs may exist in the JSON; the gate filters by target `ruleId`.
- AI lane has no DET-style remediation-verify campaign; use detect E2E only until an AI fix lane is defined.
