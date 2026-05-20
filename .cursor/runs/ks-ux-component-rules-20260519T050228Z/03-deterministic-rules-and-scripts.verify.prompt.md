Verify this phase without editing files.

Start with exactly one line:
VERDICT: PASS
or
VERDICT: FAIL

Then provide concise evidence, missing work, and exact next actions.

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

--- EXECUTION LOG START ---
## Summary

Phase **03** is implemented with scoped changes across DOM metrics, UX checks, design-catalog validation, tests, and the plan report.

### Deterministic signals added

**`tools/website-ux-auditor/lib/dom-metrics.js`** now emits: `headingBodyWordRatio`, acronym counts (page + above-fold), `apiLikePathHits`, first/second **viewport** link counts, `heroMainWordCount`, `sectionMedianGapPx`, `maxParagraphMeasurePx`, sampled font/color cardinality, `ctaVerticalSpreadPx`, `technicalPrecedesMainExplanation` (+ tops), **`heroPrimaryVisual`** (size, alt/caption, decorative heuristic), on top of existing fields.

**Checks updated**

- `readability-structure.js` — heading/body balance, acronym/jargon proxies, viewport link walls, pre-H1 link leakage, line measure, font/color drift (home), second-viewport link density.
- `first-screen-density.js` — hero word budget, tight section spacing vs many sections, high card/tile count.
- `product-visual.js` — after a hero visual exists: decorative-only, undersized, weak alt/caption, visual far below H1.
- `technical-depth.js` — progressive disclosure inversion (pre/table before first substantial `p`), API-path density, table/pre stack (minor).
- `cta-trust-ecosystem.js` — clustered CTAs (spread heuristic).

**Design catalog**

- New `tools/design-catalog/lib/contract-specificity.mjs` — weak/generic **`## Expected look`**, **`## States`** coverage warnings for stateful types; optional **`--strict-contract-governance`** for missing Deterministic / AI(judgment) headings.
- **`check-visual-catalog.mjs`** — calls specificity analysis; **`contract_status: own`** paths must have a basename **including the hash** (drift guard).

### Tests & commands

- New `tools/website-ux-auditor/auditor-tests/deterministic-proxies.test.js` uses a **generic mechanism-led metrics fixture** (not a Fleet profile).
- **`cd tools/website-ux-auditor && npm test`** — pass (99 tests).
- **`node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase`** — pass, clean stderr after tightening state rules for `desktop-interface`.

### Plan / evidence doc

- **Report:** `.cursor/plans/ks-ux-component-rules/03-deterministic-rules-and-scripts.md` — includes the **“AI-only → deterministic”** mapping and verification commands.
- **`00-master-sequence.md`** — pointer to the phase 03 report.

`score-website-ux.mjs` / `analyze-website-ux.mjs` were not wired together; `lib/design-ux-score.js` unchanged.
--- EXECUTION LOG END ---
