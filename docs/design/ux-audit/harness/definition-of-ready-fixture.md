# Definition of Ready — Fixture

## Purpose

A **fixture** is ready when a campaign contains defect HTML (and overlays if needed) that the auditor can serve locally.

## Upstream dependencies

- **Rule page** DoR met.
- **Detection check** DoR met (mode known).

## Ready checklist

- [ ] Campaign built under `workbench/ux-auditor/rule-defect-fixtures/<campaign-id>/` (or override via `FORGE_UX_RULESET_FIXTURE_ROOT`).
- [ ] `manifest.json` lists the rule with correct `mode`: `standalone`, `multi_page`, or `repo_overlay`.
- [ ] `website/` contains Before fail HTML (and baseline/extra routes for `multi_page`).
- [ ] `repo-overlays/<RULE_ID>/` present when mode is `repo_overlay`.
- [ ] Registry-heavy rules: overlay or seed includes minimal `visual-registry.generated.json` / diagram assets when required.

## Evidence

- `manifest.json` entry with `ruleId`, `mode`, and HTML paths.
- Static server can open the fail page URL used by the harness.

## Next gate

**Auditor** detection run on the fixture URL.
