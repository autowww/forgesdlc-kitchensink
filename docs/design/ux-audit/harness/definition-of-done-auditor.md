# Definition of Done — Auditor

## Purpose

The auditor pass is done when `audit-data.json` supports the harness gate for the campaign intent (detect vs clean).

## Acceptance criteria

- [ ] `audit-data.json` exists under `UX_AUDIT_OUT_DIR/rules/<RULE_ID>/`.
- [ ] Detection campaign: ≥1 targeted finding on Before (`expect-rule-detection.sh` exit 0).
- [ ] Remediation verify: 0 findings for target `ruleId` with `checkId` `design-rule-runtime` (`expect-rule-clean.sh` exit 0).
- [ ] AI campaign: AI gate script passes per `invoke-ai-ruleset-harness.sh`.
- [ ] State row records `detection_ok`, `remediation_ok`, or classified failure (`detection_miss`, `remediation_fail`).

## Verification

```bash
cd tools/website-ux-auditor/auditor-tests
./expect-rule-detection.sh "$OUT/rules/DET.EXAMPLE/audit-data.json" DET.EXAMPLE
# or after remediation:
./expect-rule-clean.sh "$OUT/rules/DET.EXAMPLE/audit-data.json" DET.EXAMPLE
```

## Known exclusions

- Sitewide scorer output is optional when `UX_AUDIT_SKIP_SCORER=1`.
- Consumer repo audits are out of scope for ruleset harness DoD.
