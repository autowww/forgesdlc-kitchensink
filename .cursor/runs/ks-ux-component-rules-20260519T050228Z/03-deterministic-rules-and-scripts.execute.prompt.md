Execute the phase below. You may edit files. Keep the change scoped. Run relevant checks at the end and update the matching .cursor/plans/ks-ux-component-rules/*.md evidence/report file.

--- PLAN SUMMARY START ---

--- PLAN SUMMARY END ---

--- PHASE PROMPT START ---
# 03 — Deterministic rules and scripts

Goal: move more recurring UX/design analysis into deterministic scripts.

Update or add deterministic checks for:

1. Context complexity
   - word count per page/section;
   - paragraphs over budget;
   - heading-to-body ratio;
   - unique concepts/acronyms/jargon density;
   - code/table/API endpoint density;
   - links per viewport and links before main story.

2. Visual rhythm and enterprise polish proxies
   - hero density;
   - CTA count/spacing;
   - section spacing;
   - card count/density;
   - text measure/line length;
   - visible theme/color/font proliferation where measurable.

3. Product visual quality proxies
   - visual exists;
   - visual is large enough;
   - visual is near hero/story section;
   - visual has meaningful alt/caption/neighboring heading terms;
   - visual is not only decorative background.

4. Progressive disclosure
   - code/API/schema/ADR/sprint/maintainer detail before product explanation;
   - docs/reference link wall before hero;
   - first-screen technical term overload.

5. Catalog and contract specificity
   - repeated generic expected-look text;
   - unresolved placeholder language;
   - contract/registry metadata drift;
   - missing deterministic and AI review sections;
   - missing state coverage.

Likely files:

- `tools/website-ux-auditor/lib/dom-metrics.js`
- `tools/website-ux-auditor/checks/context.js`
- `tools/website-ux-auditor/checks/product-visual.js`
- `tools/website-ux-auditor/checks/storyline-flow.js`
- `tools/website-ux-auditor/checks/technical-depth.js`
- `tools/website-ux-auditor/checks/cta-trust-ecosystem.js`
- `tools/website-ux-auditor/checks/readability-structure.js`
- `tools/website-ux-auditor/lib/design-ux-score.js`
- `tools/design-catalog/check-visual-catalog.mjs`

Add tests. Use a Fleet-like mechanism-led fixture only as a generic regression fixture; do not add a Fleet product profile.

Acceptance:
- `cd tools/website-ux-auditor && npm test` passes;
- design-catalog validation catches generic/weak contracts and metadata mismatch;
- report describes which previously AI-only checks are now deterministic.
--- PHASE PROMPT END ---
