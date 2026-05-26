# Definition of Ready — Detection check

## Purpose

The **detection check** is ready when the auditor can run the rule module against a defect fixture with the correct scope (page vs repo vs multi-page).

## Upstream dependencies

- **Ruleset** DoR met.
- **Rule page** DoR met (Before HTML defines the defect).

## Ready checklist

- [ ] Registry `modulePath` points to an on-disk DET `*.check.js` or AI prompt module.
- [ ] Fixture **mode** is chosen and documented: `standalone`, `multi_page`, or `repo_overlay`.
- [ ] For `repo_overlay`: overlay paths and `seed_harness_repo()` needs are known (registry, contracts, PY.KS emitters).
- [ ] For `multi_page`: all routes listed (e.g. `index.html`, `settings.html`).

## Evidence

- File exists under `design-rules/deterministic/generated/` or `design-rules/ai/prompts/generated/`.
- Harness index or rule page notes the mode.

## Next gate

**Fixture** campaign build (`build_rule_defect_fixtures.py`) and **auditor** detection run.
