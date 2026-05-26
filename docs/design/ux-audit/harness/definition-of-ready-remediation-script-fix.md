# Definition of Ready — Remediation script fix

## Purpose

**Remediation script fix** is ready when deterministic After HTML can be applied to the fixture without a Cursor agent.

## Upstream dependencies

- **Fixture** DoR met.
- **Rule page** **After** block valid (not stub).

## Ready checklist

- [ ] `apply-harness-fixture-remediation.py` supports the rule’s fixture mode (`standalone`, `multi_page`, `repo_overlay`).
- [ ] For `multi_page`: all routes in the campaign receive After markup.
- [ ] For `repo_overlay`: `seed_harness_repo()` or overlay copy covers registry/contracts needs.
- [ ] `harness-minimal-assets/` available when verify uses `LOOP_REPO=fixture-website`.

## Evidence

- Dry-run or single-rule apply succeeds without traceback.
- Handbook After block diff is intentional for the rule.

## Next gate

Re-run auditor with `expect-rule-clean.sh` or full `invoke-det-ruleset-remediation-verify.sh` campaign.
