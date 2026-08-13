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
  - react/ForgeErrorSummary.tsx
  - react/ForgeAutosaveStatus.tsx
  - react/ForgeDraftRecovery.tsx
  - react/ForgeSavedViewManager.tsx
  - react/ForgeOperationProgress.tsx
  - react/ForgeFreshnessIndicator.tsx
  - react/ForgeObjectInspector.tsx
  - react/ForgeAccessReason.tsx
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
| Fes | ForgeErrorSummary | Multi-field form error summary |
| Fas | ForgeAutosaveStatus | Save/draft state indicator |
| Fdr | ForgeDraftRecovery | Draft recovery list |
| Fsm | ForgeSavedViewManager | Saved view picker |
| Fop | ForgeOperationProgress | Long-running job progress |
| Ffi | ForgeFreshnessIndicator | Data freshness + refresh |
| Foi | ForgeObjectInspector | Desktop side-panel inspector |
| Far | ForgeAccessReason | Permission/read-only explanation |

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

## Enterprise use (per child)

| Hash | Enterprise use | Related ENT.APP | Related DET |
|------|----------------|-----------------|-------------|
| Frh | Record/run header with status and top actions | ENT.APP.01 | `DET.STUDIO.H1`, `DET.APP.PRIMARY_CTA` |
| Fkg | Operational metadata beside records | ENT.APP.01, ENT.APP.08 | `DET.APP.PRIMARY_STATE` |
| Fwb | Business lifecycle stages (read-only progression) | ENT.APP.01, ENT.APP.03 | — |
| Fen | Audit trail and event history | ENT.APP.01, ENT.APP.08 | — |
| Fsb | Page-level operational state (stale, error, approval) | ENT.APP.03 | `DET.APP.DATA_REFRESH_STALENESS`, `DET.APP.EMPTY_LOADING_ERROR_SUCCESS` |
| Fda | Governed approve/reject/verify decisions | ENT.APP.04, ENT.APP.08, ENT.APP.AI | `DET.APP.PRIMARY_CTA`, `DET.APP.DISABLED_REASON` |
| Fvw | Pre-decision checklist / diff review | ENT.APP.04, ENT.APP.08 | `DET.FORM.LABEL_ERROR_SUMMARY` |
| Fdg | Technical diagnostic evidence | ENT.APP.03, ENT.APP.AI | — |
| Wlc | Role lens / workspace view selector | ENT.APP.06, ENT.APP.07 | `DET.APP.PERSISTENT_CHROME` |
| Tdc | Compact tile dropdown (secondary utility) | ENT.APP.07 | `DET.BUTTON.GROUP.MAX` |
| Fes | Multi-field submit error summary | ENT.APP.04 | `DET.FORM.LABEL_ERROR_SUMMARY` |
| Fas | Visible save/draft state | ENT.APP.02 | `planned: DET.APP.WORK_STATE_PERSISTENCE` |
| Fdr | Recover interrupted drafts | ENT.APP.02 | — |
| Fsm | Saved/shared workbench views | ENT.APP.05 | — |
| Fop | Long-running operation progress | ENT.APP.03 | `DET.APP.PRIMARY_STATE` |
| Ffi | Stale data signal + refresh | ENT.APP.03, ENT.APP.05 | `DET.APP.DATA_REFRESH_STALENESS` |
| Foi | Desktop object inspector panel | ENT.APP.08 | `AI.APP.WORKFLOW_CONTINUITY` |
| Far | Why read-only / denied | ENT.APP.06 | `DET.APP.DISABLED_REASON` |

YAML contracts: [`enterprise-app/README.md`](../../enterprise-app/README.md).

## Deterministic checks

- Each primitive documents expected `data-ks-type` / `data-ks-name` pairs and hash emission at the root (`DET.APP.PRIMITIVE_MARKERS`, `DET.HASH.MARKERS`).
- Tables and data grids ship header cells and non-color-only status cues (`DET.DATA.TABLE_HEADERS`, `DET.DATA.COLOR_ONLY`).
- Card and dialog surfaces use sanctioned `var(--forge-*)` / `var(--bs-*)` elevation tokens (`DET.SURFACE.ELEVATION_TOKEN`).

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
