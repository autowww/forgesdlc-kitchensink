# Definition of Done — Remediation script

## Purpose

The agent remediation loop is done when the harness records `remediation_ok` after agent edits without manual fixture repair.

**Fixer-first:** The Cursor agent runs only when the [deterministic fixer](definition-of-done-deterministic-fixer.md) lane fails (`deterministic-fixer-report.json` shows `verifyOk: false` or `agentRequired: true` for remaining major+ rule ids). Production loop: audit → fixers → re-audit → agent.

## Acceptance criteria

- [ ] Deterministic fixer attempted first when rule is in `pilot-registry.json` (`FORGE_UX_FIXERS=1`).
- [ ] `invoke-det-ruleset-harness.sh --enable-agents` ends with `remediation_ok` for the rule (after fixer attempt when applicable).
- [ ] `remediation-agent.log` under `UX_AUDIT_OUT_DIR` when logging is enabled.
- [ ] Post-run `expect-rule-clean.sh` passes (0 targeted findings).
- [ ] Failures classified as `remediation_fail` with finding count — remediate via **remediation script fix** or check tuning, not silent pass.

## Verification

```bash
export FORGE_UX_RULESET_FIXTURE_ROOT=workbench/ux-auditor/rule-defect-fixtures/ruleset-harness-<id>
export FORGE_UX_CURSOR_AGENT_MODEL=auto
cd tools/website-ux-auditor/auditor-tests
./invoke-det-ruleset-harness.sh --only-rule DET.EXAMPLE --enable-agents --force
```

## Known exclusions

- Default DET harness is **detection-only** (agents off); agent DoD is optional pilot lane.
- Pilot closure: 1/5 rules `remediation_ok` with agents — treat agent DoD as per-rule, not whole-ruleset, until prompts/fixtures improve.
- Prefer **remediation script fix** for regression gates; agent path is not in CI today (see [FIXTURE-SCRIPT-TEST-MAP.md](FIXTURE-SCRIPT-TEST-MAP.md)).
