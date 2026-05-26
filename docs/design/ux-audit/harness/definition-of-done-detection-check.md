# Definition of Done — Detection check

## Purpose

The detection check is done when it reliably fires on the Before fixture and does not false-positive on minimal harness assets when scoped correctly.

## Acceptance criteria

- [ ] `expect-rule-detection.sh` passes on the rule’s **Before** fixture: ≥1 finding with `checkId` `design-rule-runtime` and matching `ruleId` (DET), or AI gate equivalent for AI lane.
- [ ] `invoke-det-ruleset-harness.sh` records `detection_ok` for the rule (or `detection_ok` in AI harness for AI rules).
- [ ] With `LOOP_REPO=fixture-website` and `harness-minimal-assets/`, unrelated DET rules do not dominate the gate (regression: scan full KS tree only when intended).

## Verification

```bash
cd tools/website-ux-auditor/auditor-tests
./invoke-det-ruleset-harness.sh --only-rule DET.EXAMPLE --force
# Expect status detection_ok in campaign state.jsonl
```

## Known exclusions

- AI checks may return judgment findings without a numeric “count” threshold; use `invoke-ai-ruleset-harness.sh` gates.
- Tuning the check after a false positive is still detection-check work, not remediation-script-fix.
