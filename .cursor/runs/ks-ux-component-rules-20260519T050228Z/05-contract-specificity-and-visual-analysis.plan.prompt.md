Read the phase prompt below and create a precise implementation plan. Do not edit files in this planning step. The work belongs under .cursor/plans/ks-ux-component-rules/. Include files to inspect/change, deterministic checks, AI-enabled rules, risks, and validation commands.

--- PHASE PROMPT START ---
# 05 — Contract specificity and visual analysis

Goal: make catalog contracts genuinely useful for each emitted visual element.

For each registry row and contract:

1. Use screenshot/DOM/source analysis to determine the visual role.
2. Replace generic expected-look text with specific guidance.
3. Add deterministic checks section.
4. Add AI-enabled review cues section.
5. Add state coverage appropriate to the element.
6. Add responsive behavior specific to the element.
7. Keep family-covered rows only when a family contract is specific and useful.

Prioritize:

- pages and layouts that consumers use directly;
- chrome regions;
- React primitives;
- Python component modules;
- visual styles/theme packs;
- diagram groups;
- desktop/app interfaces.

Do not manually over-edit every file if automation can generate draft-specific sections from registry/source/screenshot metadata. But do not leave obviously generic boilerplate.

Acceptance:
- `tools/design-catalog/check-visual-catalog.mjs` detects weak contracts;
- current contracts pass or report only justified warnings;
- `docs/design/catalog/visual-registry-coverage.md` or equivalent report is regenerated;
- final report lists remaining intentionally family-covered entries.
--- PHASE PROMPT END ---
