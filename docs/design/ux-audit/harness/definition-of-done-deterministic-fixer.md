# Definition of Done — Deterministic fixer

A **deterministic fixer** is done when a pilot rule can be repaired and verified without the Cursor agent on the harness path, and production loop tries fixers before `cursor-agent-run-ux-plan.sh`.

## Done when

| Criterion | Evidence |
|-----------|----------|
| Fixer applies without error | `deterministic-fixer-report.json` → `rules[RULE_ID].applied: true` |
| Post-fix verify passes (harness) | `expect-rule-clean.sh` → 0 findings for `ruleId` after audit |
| Campaign state records outcome | `state.jsonl` includes `fixerOk: Y` and `agentRequired: N` when clean |
| Agent not required for pilot harness rules | `agentAttempts: 0` on remediation-verify campaign for that rule |
| Production loop ordering | Audit → fixers → re-audit → quality gate; agent only if gate still fails |
| Plan todos trimmed for verified rules | `forge-ux-remediation.plan.md` todos marked `completed` for fixer-verified rule ids |

## Verify modes

| Mode | Use |
|------|-----|
| `expect_rule_clean` | Harness per-rule `audit-data.json` after loop audit |
| Post-fixer re-audit | Production `forge_ux_post_fixer_reaudit` then `audit-loop-completion.mjs` |

## Failure handling

- `applied: false` or `verifyOk: false` → `agentRequired: true`; remediation script (agent) runs on next loop iteration.
- `FORGE_UX_FIXERS_ONLY=1` → exit non-zero if any pilot rule still needs agent (CI/harness fixers-only mode).

## References

- Report schema: `OUT_DIR/deterministic-fixer-report.json`
- E2E matrix column: `fixer_ok` (see [E2E-COVERAGE-MATRIX.md](E2E-COVERAGE-MATRIX.md))
