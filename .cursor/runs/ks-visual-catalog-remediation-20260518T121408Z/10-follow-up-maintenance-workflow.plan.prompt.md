Read the focused remediation phase below and create a precise implementation plan. Do not edit files in this step. Save or summarize the plan under .cursor/plans/ks-visual-catalog-remediation/ when possible. Include exact files to inspect, files likely to change, validation commands, risks, and rollback notes.

--- PHASE PROMPT START ---
# 10 - Follow-up maintenance workflow

Use this after the remediation is complete to keep the catalog healthy.

## Goal

Make future visual changes update implementation and design contracts together.

## Required additions

- Cursor rule that says visual changes must name affected hashes.
- PR checklist text for visual changes.
- Script or command for checking changed visual files against registry and contracts.
- Docs telling contributors how to allocate a new hash.
- Docs telling contributors when to keep, deprecate, or allocate a new hash.

## Acceptance criteria

- A contributor changing a component can find the contract by hash.
- A contributor adding a component can allocate a hash without collisions.
- CI or local validation detects changed visual sources without catalog updates.
- The maintenance workflow is linked from `docs/design/catalog/README.md`.
--- PHASE PROMPT END ---
