Verify this remediation phase without editing files.

Start your response with exactly one line:
VERDICT: PASS
or
VERDICT: FAIL

Then provide evidence, missing work, and exact next actions.

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

--- EXECUTION LOG START ---
## Summary

Phase **04** is done: registry-backed contracts are no longer stubbed with `TBD` / “Auto-stub” text, family roll-ups use **`## Covered children`**, and there is a single **page-type design guide** that covers all twelve archetypes you listed (plus cross-links to layouts/chrome/families).

### Main additions

- **`docs/design/catalog/page-types/Ks-page-type-design-guidelines.md`** — Per archetype: intent, first screen, hierarchy, nav, density, enterprise trust, responsive behavior, accessibility, forbidden patterns (plus a cross-reference table to hashes/families).
- **54 unique contract files** under `docs/design/catalog/` were rewritten or aligned to the standard sections (Identity through Change policy / Changelog). **`Hdc`** was corrected so it describes **forge-autodoc** `assemble_handbook_page`, not a `generator/pages/...` museum page.
- **Family contracts** (`Kpr`, `Ksv`, `Ksj`, `Ksc`, **`Rpf`/FAM**, **`Kdt`**, **`Kra`**, **`Msm`**, **`Fad`**) now include **Identity**, **Covered children** (or equivalent explicit lists), **Enterprise look and feel rules**, **Implementation notes**, **Screenshot acceptance**, and **Change policy** where appropriate.
- **`docs/design/catalog/contract-template.md`** — Instructional template without stub bullets or fake `XYZ` demo hash in a way that would confuse scanners.
- **`docs/design/catalog/README.md`** — Links the new guidelines doc.

### Acceptance

```bash
node tools/design-catalog/check-visual-catalog.mjs \
  --repo . \
  --registry docs/design/catalog/visual-registry.yaml \
  --showcase showcase \
  --refresh-inventory \
  --strict-contract-placeholders
```

**Exit 0** — `check-visual-catalog OK (91 entries).`

### Evidence

- **`.cursor/plans/ks-visual-catalog-remediation/04-real-design-contracts.md`** — Commands, registry counts (`own` 54, `family-covered` 37, **54** distinct contract paths), and notes.

The one-off emitter script was **removed** after use so `tools/design-catalog/` does not keep throwaway tooling.
--- EXECUTION LOG END ---
