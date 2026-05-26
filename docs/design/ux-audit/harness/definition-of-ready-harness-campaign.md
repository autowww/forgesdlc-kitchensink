# Definition of Ready — Harness campaign

## Purpose

A **harness campaign** is ready when orchestration scripts, workbench paths, and per-rule artifacts can run at batch scale.

## Upstream dependencies

- All per-rule artifacts at DoR for rules in scope (ruleset → … → auditor).
- For remediation-verify: **remediation script fix** DoR per rule.
- For agent pilot: **remediation script** DoR per rule.

## Ready checklist

- [ ] Harness scripts committed in KS: `invoke-det-ruleset-harness.sh`, `invoke-det-ruleset-remediation-verify.sh`, `invoke-ai-ruleset-harness.sh`.
- [ ] Workbench root writable: `FORGE_UX_AUDIT_WORKBENCH_ROOT` or default `Code/workbench/ux-auditor/`.
- [ ] Fixture campaign built or `--rebuild-fixtures` acceptable runtime.
- [ ] AI lane: model/API quota documented for full 20-rule run.
- [ ] Quota gate for CLI `agent` documented before agent or large pagegen batches.

## Evidence

- `RULESET-HARNESS-CLOSURE.md` quota probe table updated.
- `finalize-ruleset-harness.sh` / `finalize-learn-101-campaign.sh` available for campaign summary.

## Next gate

Execute campaign; record `state.jsonl`; regenerate [E2E-COVERAGE-MATRIX.md](E2E-COVERAGE-MATRIX.md).
