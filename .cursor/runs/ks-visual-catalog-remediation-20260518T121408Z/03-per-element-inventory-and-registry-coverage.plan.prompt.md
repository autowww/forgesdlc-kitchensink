Read the focused remediation phase below and create a precise implementation plan. Do not edit files in this step. Save or summarize the plan under .cursor/plans/ks-visual-catalog-remediation/ when possible. Include exact files to inspect, files likely to change, validation commands, risks, and rollback notes.

--- PHASE PROMPT START ---
# 03 - Expand per-element inventory and registry coverage

## Purpose

Move from broad family-level catalog coverage to real per-element coverage wherever KS emits independent visuals.

## Source areas to scan

At minimum, scan:

```text
components/layouts.py
components/*.py
generator/pages/*.py
generator/layout_previews.py
react/*.tsx
css/*.css
js/*.js
assets/svg/*.svg
museum/studio/**
showcase-react-app/**
static/generated HTML if present
```

## Required behavior

- Build a source-derived inventory first. Do not trust existing registry rows blindly.
- Identify every emitted visual surface that can appear independently in HTML, React, showcase output, desktop/app UI, diagrams, theme/style galleries, interaction modules, or consumer pages.
- Allocate stable three-letter hashes for independent emitted visuals.
- Split broad rows such as `Kpr`, `Ksc`, `Ksj`, `Ksv`, and `Msm` into child entries when they cover distinct emitted visuals.
- Keep family rows only for true abstract families or non-rendered implementation groups.
- Each registry entry must include:
  - `hash`
  - `name`
  - `type`
  - `category`
  - `source_paths`
  - `emits_html` or equivalent
  - `contract_path`
  - `contract_status`
  - `showcase_url` or status/reason
  - `screenshot_url` or status/reason
  - `owner` or maintenance area if available
  - `deprecated` status if relevant

## Coverage policy

Not all inventory items require an own contract, but every visible emitted item must be addressable by hash or explicitly covered by a named family hash.

Family-covered is allowed only when:

- the item is not visible independently, or
- the visual differences are purely content-level, or
- the family contract explicitly names the child item and its constraints.

## Acceptance criteria

- Registry coverage materially increases beyond the initial phase-1 registry.
- No broad family row is the sole coverage for many independent emitted visuals without child rows or explicit rationale.
- `visual-registry-coverage.md` lists uncovered items, and the list is either empty or has justified deferrals.
- Every new hash is valid and globally unique.
- The registry includes page types, layouts, pages, sections, components, primitives, styles, diagrams, interactions, and desktop interfaces where present.
- `.cursor/plans/ks-visual-catalog-remediation/03-per-element-inventory-and-registry-coverage.md` records before/after counts.

## Do not

- Do not generate random hashes without checking uniqueness.
- Do not rename existing hashes unless the existing hash is invalid or duplicative.
- Do not delete old hashes without marking them deprecated and providing a migration note.
--- PHASE PROMPT END ---
