---
hash: "Rpf"
name: "React primitives family"
type: "primitive-family"
status: "active"
source_paths:
  - react/TileDropdownControl.tsx
  - react/ForgeKeyValueGrid.tsx
  - react/ForgeStatusBanner.tsx
  - react/ForgeReviewPanel.tsx
  - react/ForgeDiagnosticPanel.tsx
  - react/ForgeWorkflowStageBar.tsx
  - react/ForgeEventTimeline.tsx
  - react/ForgeRunHeader.tsx
  - react/ForgeDecisionActionBar.tsx
  - react/WorkspaceLensControl.tsx
showcase_url: "https://ks.forgesdlc.com/showcase/forge-react-primitives.html"
screenshot_url: null
screenshot_status: "not-applicable"
---

# Rpf — React primitives family

## Identity

- **Hash:** Rpf (family roll-up); individual primitives use child hashes below.
- **Name:** React primitives family
- **Type:** primitive-family
- **Category:** react-primitive (children) / governance family (this row)
- **Source paths:** see frontmatter list (`react/*.tsx`)
- **Showcase URL / status:** `https://ks.forgesdlc.com/showcase/forge-react-primitives.html` — interactive museum page for primitives.
- **Screenshot URL / status:** Family-level PNG not applicable; capture per primitive or via showcase page when regression baselines are needed.

## Purpose

Govern shared **React** controls used in Forge studio-style surfaces so every root exposes consistent `data-ks-hash` semantics, token-driven styling from `Ksc` (`forge-react-primitives.css`), and behavior that matches trust-heavy operator expectations.

## Covered children

Each child hash uses **contract_status: family-covered** pointing to this file:

| Hash | Component | Role |
|------|-----------|------|
| Tdc | TileDropdownControl | Compact tile control with dropdown affordance |
| Fkg | ForgeKeyValueGrid | Dense label/value inspector grid |
| Fsb | ForgeStatusBanner | Inline status / alert strip |
| Fvw | ForgeReviewPanel | Review queue / checklist surface |
| Fdg | ForgeDiagnosticPanel | Diagnostics and evidence readout |
| Fwb | ForgeWorkflowStageBar | Linear pipeline / stage control |
| Fen | ForgeEventTimeline | Time-ordered events |
| Frh | ForgeRunHeader | Run metadata header |
| Fda | ForgeDecisionActionBar | Decision buttons with guardrails |
| Wlc | WorkspaceLensControl | Workspace lens selector |

## Expected look

Dark Forge studio chrome: readable sans-serif body, monospace accents where data literals appear, cyan/amber signals for state—not traffic-light carnival. Components align to a 4px baseline grid; shadows and borders stay subtle. Matches [forge-enterprise-ai-website-standard.md](../../../design/forge-enterprise-ai-website-standard.md).

## Anatomy

- Each primitive mounts at a single React root carrying **`data-ks-react-root`** (per registry `root_selector`) plus **`hash` / `data-ks-hash`** for the **child** hash (not `Rpf`).
- Internal structure uses semantic elements where possible (`button`, `header`, lists) with `aria-*` tied to visible labels.

## States

- **Default:** idle presentation with clear primary label or value.
- **Loading / pending:** skeleton or inline spinner region with `aria-busy` where entire control blocks input.
- **Error / warning:** `Fsb` and panels may surface severity; never rely on color alone—pair with iconography and text.
- **Disabled:** visibly distinct; explanatory text when disabling would otherwise confuse (“Connect workspace to enable”).
- **Reduced motion:** animated transitions (stage bar, timeline) honor `prefers-reduced-motion`.

## Variants

- Size/density variants stay within each component’s TypeScript props; do not invent alternate visual identities without a new hash.

## Responsive behavior

- Stacks below documented breakpoints; dropdowns flip alignment when clipped; grids gain horizontal scroll inside a labelled region rather than stretching the viewport.

## Accessibility contract

- All actionable controls have accessible names; expand/collapse and menus manage focus and `aria-expanded`.
- Keyboard: full traversal order, no traps except intentional modals (not used in these primitives without separate contract).
- Live regions: use sparingly for async diagnostic streams (`Fdg`) so screen readers are not spammed.

## Enterprise look and feel rules

- Copy assumes operator literacy—short labels, no influencer tone.
- Density is allowed (grids, timelines) but maintains alignment, zebra readability, and quiet separators.

## Content rules

- Props accept user-supplied strings; callers must avoid leaking secrets into banners. This contract does not validate data—only presentation expectations.
- Timestamps and IDs display in monospace lanes; long strings truncate with ellipsis + tooltip only when tooltip is keyboard reachable.

## Forbidden patterns

- Hard-coded brand colors bypassing CSS variables.
- Click handlers on non-focusable `div` without `role` and key handling.
- Child primitives sharing conflicting `data-ks-hash` literals inside one mount tree.

## Implementation notes

- Source: `react/*.tsx`; bundle via KS showcase React pipeline (`forge-react-primitives` page). Coordinate CSS with `css/forge-react-primitives.css`.
- Use `ksVisualAttrs` / `ksReactPrimitiveAttrs` from `react/ksVisualAttrs.ts` to emit attributes consistently.

## Screenshot acceptance

- When baselining, capture the showcase page at 1280px width with each primitive in its default and one stressed state (error or expanded).
- Pixel diff tolerances should ignore font smoothing; compare layout boxes and hash markers.

## Change policy

- **`Rpf`** remains the family anchor; evolve child contracts here when behavior applies to all children.
- Allocate a **new child hash** when a primitive’s DOM contract or accessibility model changes incompatibly.

## Changelog

- 2026-05-18 — Phase 04: full family contract; enumerated covered children; removed stubs.
