# KS UX component rules — phase 03 (deterministic rules + scripts)

## Goal

Move more recurring UX/design analysis into **deterministic** checks (DOM metrics + catalog validators), keeping AI review for judgment-heavy quality only.

## What changed (implementation)

### `tools/website-ux-auditor/lib/dom-metrics.js`

Collects additional live-DOM proxies (inside Playwright `page.evaluate`):

- **Context complexity:** `headingBodyWordRatio`, `uniqueAcronymLikeCount`, `aboveFoldAcronymLikeCount`, `apiLikePathHits`, `firstViewportLinkCount`, `secondViewportLinkCount`.
- **Visual rhythm / polish proxies:** `heroMainWordCount`, `sectionMedianGapPx`, `maxParagraphMeasurePx`, `distinctFontFamiliesSampled`, `distinctTextColorsSampled`, `ctaVerticalSpreadPx`, `cards` (existing), plus `heroPrimaryVisual` metadata for the largest qualifying hero-band visual.
- **Progressive disclosure:** `firstTechnicalBlockTop`, `firstExplainerParagraphTop`, `technicalPrecedesMainExplanation` (pre/table before first substantial `p` in `main`).

### Deterministic checks (extended modules)

| Module | New / tightened signals |
|--------|-------------------------|
| `checks/readability-structure.js` | heading/body balance; acronym/jargon density; viewport link-wall counts; pre-H1 link leakage; paragraph measure; sampled font/color proliferation; sustained second-viewport link density. |
| `checks/first-screen-density.js` | hero-band word budget; tight section spacing vs section count; homepage card/tile density. |
| `checks/product-visual.js` | when a hero visual exists: decorative-only guess, undersized hero visual, weak `img` alt/caption, visual far below primary H1. |
| `checks/technical-depth.js` | progressive disclosure inversion; API-path snippet density; homepage table/pre stack proxy. |
| `checks/cta-trust-ecosystem.js` | clustered competing CTAs (proximity/spread heuristic). |

**No Fleet product profile** was added. Regression coverage uses a **generic mechanism-led metrics object** in tests only.

### `tools/design-catalog/`

- New `lib/contract-specificity.mjs` invoked from `check-visual-catalog.mjs` alongside placeholder analysis:
  - errors for **thin + generic** `## Expected look` sections,
  - warnings for missing / under-documented `## States` on stateful registry types (`layout`, `page`, `chrome-region`, `layout-preview`),
  - optional warnings for missing **Deterministic** / **AI(judgment)** review headings via `--strict-contract-governance`.
- **Registry↔contract drift guard:** `contract_status: own` rows must use contract paths whose **basename includes the hash** (skips `FAM-*` basenames).

## AI-only → deterministic (this phase)

These patterns were previously **judgment-heavy** or **underspecified** in automation; they now have **explicit thresholds + evidence strings** in the auditor/catalog tooling:

1. **“Docs/API detail appears before the story”** → `technical-depth` uses `technicalPrecedesMainExplanation` (+ existing above-fold code/table signals).
2. **“Endpoint/API density in marketing surfaces”** → `apiLikePathHits` thresholds in `technical-depth`.
3. **“Hero feels text-heavy / cramped rhythm”** → `heroMainWordCount`, `sectionMedianGapPx`, `cards` in `first-screen-density`.
4. **“Link wall per viewport”** → `firstViewportLinkCount`, `secondViewportLinkCount`, and tightened `preMainFirstH1LinkCount` in `readability-structure`.
5. **“Acronym / token overload”** → `aboveFoldAcronymLikeCount` + `uniqueAcronymLikeCount` in `readability-structure`.
6. **“Heading-heavy vs body”** → `headingBodyWordRatio` in `readability-structure`.
7. **“Line length / measure”** → `maxParagraphMeasurePx` in `readability-structure`.
8. **“Theme drift (fonts/colors)”** → sampled distinct font/color counts in `readability-structure` (homepage-only minors).
9. **“Hero visual exists but weak”** → `heroPrimaryVisual` follow-on findings in `product-visual` (decorative guess, size, alt/caption, placement vs H1).
10. **“CTAs compete” clustering** → `ctaVerticalSpreadPx` + CTA count in `cta-trust-ecosystem`.
11. **“Generic design contracts”** → `analyzeContractSpecificity` errors/warnings in `check-visual-catalog.mjs`.
12. **“Registry row doesn’t match contract file naming”** → basename must include hash for `own` contracts.

**Still AI-first (intentionally):** premium “feel”, narrative coherence across sections, screenshot aesthetics, and intent of ambiguous diagrams (even when deterministic geometry/alt checks pass).

## Tests / verification commands

```bash
cd tools/website-ux-auditor && npm test
```

```bash
cd /path/to/forgesdlc-kitchensink
node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase
```

Optional stricter governance headings:

```bash
node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase --strict-contract-governance
```

## Evidence — phase 03

**Completed:** 2026-05-19.

**Checks run:**

- `cd tools/website-ux-auditor && npm test` → pass (includes new `auditor-tests/deterministic-proxies.test.js`).
- `node tools/design-catalog/check-visual-catalog.mjs ...` → pass on kitchensink HEAD (expected: zero errors; warnings only when contracts warrant).

**Files touched (high level):**

- `tools/website-ux-auditor/lib/dom-metrics.js`
- `tools/website-ux-auditor/checks/readability-structure.js`
- `tools/website-ux-auditor/checks/first-screen-density.js`
- `tools/website-ux-auditor/checks/product-visual.js`
- `tools/website-ux-auditor/checks/technical-depth.js`
- `tools/website-ux-auditor/checks/cta-trust-ecosystem.js`
- `tools/website-ux-auditor/auditor-tests/deterministic-proxies.test.js`
- `tools/design-catalog/lib/contract-specificity.mjs` (new)
- `tools/design-catalog/check-visual-catalog.mjs`

**No Fleet profile:** confirmed (only a generic metrics fixture in tests).
