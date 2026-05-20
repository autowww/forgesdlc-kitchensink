---
hash: "___"
name: "Allocated visual name"
type: "layout"
status: "proposed"
source_paths:
  - path/to/source.ext
showcase_url: null
screenshot_url: null
screenshot_status: "planned"
---

# ___ — Allocated visual name

> **Instruction:** Replace `___` with the three-letter hash from `allocate-visual-hash.mjs`. This file is **not** scanned by `check-visual-catalog.mjs`; copy the structure into a new path such as `docs/design/catalog/<area>/<HASH>-slug.md` and register the row in `visual-registry.yaml`.

## Identity

- **Hash:** (must match heading and frontmatter)
- **Name:** (human label)
- **Type:** (`layout`, `page`, `chrome-region`, …)
- **Category:** (registry category string)
- **Source paths:** (repo-relative)
- **Showcase URL / status:** (URL or explanation if none)
- **Screenshot URL / status:** (URL + `screenshot_status` rationale)

## Purpose

One paragraph: the user or maintainer job this surface supports.

## Expected look

Describe rhythm, density, typography roles, color discipline, and neighbor relationships—specific enough for a reviewer to tell whether an implementation matches intent. Link [forge-enterprise-ai-website-standard.md](../../design/forge-enterprise-ai-website-standard.md).

## Anatomy

Bulleted structure from outer root through major regions; mention landmark roles.

## States

Default, interactive, empty, loading, error, reduced-motion—only what applies.

## Variants

Authorized visual or density variants; when to select each.

## Responsive behavior

Breakpoints, collapse rules, scroll containers, tap target expectations.

## Accessibility contract

Landmarks, focus order, keyboard shortcuts, contrast, text equivalents for non-text cues.

## Enterprise look and feel rules

Trust, spacing, evidence-first tone—no invented proof points.

## Content rules

Copy limits, required labels, empty states, terminology constraints.

## Deterministic checks

Repeatable gates for this hash: emitted `hash` / `data-ks-hash`, structural selectors, landmarks, inventories, typography tokens—tie to thresholds or scripts where KS ships them.

## AI-enabled review cues

Judgment-only questions (premium feel, narrative clarity, ambiguity) that must stay separate from deterministic gates above.

## Forbidden patterns

Specific anti-patterns for this surface (not generic “bad UX”).

## Implementation notes

Concrete hooks: Python helpers, React props, attribute emitters, build steps.

## Screenshot acceptance

What a captured PNG (if any) must prove; acceptable DOM-only checks when `screenshot_status` is `not-applicable`.

## Change policy

When to keep the hash vs allocate a new one ( tie to governance doc ).

## Changelog

- YYYY-MM-DD — Created.
