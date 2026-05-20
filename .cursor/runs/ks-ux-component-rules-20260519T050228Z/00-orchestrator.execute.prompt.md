Execute the phase below. You may edit files. Keep the change scoped. Run relevant checks at the end and update the matching .cursor/plans/ks-ux-component-rules/*.md evidence/report file.

--- PLAN SUMMARY START ---

--- PLAN SUMMARY END ---

--- PHASE PROMPT START ---
# 00 — Orchestrator

Create `.cursor/plans/ks-ux-component-rules/00-master-sequence.md`.

The plan must sequence the work in this pack and explicitly state:

- Fleet is only a regression example, not a profile.
- The source of truth is KS visual catalog + local/live showcase screenshots + emitted DOM hashes.
- Deterministic rules should cover most repeatable failures.
- AI-enabled rules should handle final judgment and propose new deterministic rules.

Before broad edits, inspect:

- `docs/design/catalog/visual-registry.yaml`
- `docs/design/catalog/**/*.md`
- `docs/design/catalog/screenshots/`
- `tools/design-catalog/*`
- `tools/website-ux-auditor/*`
- `components/`, `css/`, `js/`, `generator/pages/`, `react/`, `assets/svg/`

Write the plan tree listed in `INITIATING_PROMPT.md`.
--- PHASE PROMPT END ---
