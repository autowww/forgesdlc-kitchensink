Execute the focused remediation phase below. You may edit files. Use the plan summary if present. Keep changes scoped to this phase. At the end, run the phase acceptance checks and write/update the matching .cursor/plans/ks-visual-catalog-remediation/*.md evidence file.

--- PLAN SUMMARY START ---

--- PLAN SUMMARY END ---

--- PHASE PROMPT START ---
# 04 - Replace stub contracts with clear design guidelines

## Purpose

Turn the visual catalog from an ID registry into a usable design system. Every catalog entry must point to clear expected-look design guidance.

## Required contract sections

Every own contract must include:

```text
# HASH - Name

## Identity
- Hash
- Name
- Type
- Category
- Source paths
- Showcase URL/status
- Screenshot URL/status

## Purpose

## Expected look

## Anatomy

## States

## Variants

## Responsive behavior

## Accessibility contract

## Enterprise look and feel rules

## Content rules

## Forbidden patterns

## Implementation notes

## Screenshot acceptance

## Change policy
```

Family contracts must also include:

```text
## Covered children
```

and explicitly list child hashes or child source names.

## Required page-level guidance

Add or improve broader design MD guidelines for page types that KS can emit, including:

- public product landing page
- product architecture landing page
- docs/handbook page
- reference/API page
- catalog/gallery page
- listing/resource hub
- dashboard/desktop console
- admin/operations page
- wizard/guided flow
- data report/analytics page
- presentation/storytelling page
- desktop studio/app workspace

For each page type, describe:

- user intent
- first-screen requirements
- visual hierarchy
- navigation model
- content density budget
- enterprise trust expectations
- responsive behavior
- accessibility expectations
- forbidden patterns

## Required component/style guidance

At minimum, author real guidance for:

- landing layout
- product/architecture layout
- docs/handbook layout
- gallery/catalog layout
- hero/intro sections
- navigation/chrome regions
- footer
- breadcrumbs/TOC
- cards and stat bands
- diagrams and flow visuals
- forms and input controls
- table/report surfaces
- theme packs and ambient backgrounds
- React primitives
- desktop/studio surfaces

## Placeholder ban

No catalog contract should contain unresolved placeholder text such as:

```text
TBD
TODO
Auto-stub generated
Stub for KS visual catalog
Expand this stub
placeholder
```

If a detail is genuinely unknown, write a real constraint and a specific follow-up owner/action.

## Acceptance criteria

- Contract placeholder scan returns zero unresolved placeholders.
- Each own contract includes all required sections or a documented exception.
- Family-covered entries point to a family contract that names or constrains them.
- Design guidance is specific enough for a Cursor agent to compare implementation against expected look.
- Page-level contracts include enterprise, spacious, AI-enabled, and desktop-interface guidance where relevant.
- `.cursor/plans/ks-visual-catalog-remediation/04-real-design-contracts.md` records updated contract counts.

## Do not

- Do not write generic marketing filler.
- Do not invent product claims or customer proof.
- Do not create contracts that only restate file names.
--- PHASE PROMPT END ---
