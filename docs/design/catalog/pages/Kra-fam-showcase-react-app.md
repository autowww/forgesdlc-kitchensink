---
hash: "Kra"
name: "Showcase React app sources"
type: "showcase-app-family"
status: "active"
source_paths:
  - showcase-react-app/src/main.tsx
showcase_url: null
screenshot_url: null
screenshot_status: "planned"
---

# Kra — Showcase React app sources

## Identity

- **Hash:** Kra
- **Name:** Showcase React app sources
- **Type:** showcase-app-family
- **Category:** showcase-app
- **Source paths:** `showcase-react-app/src/main.tsx` (Vite entry; siblings under `showcase-react-app/` participate in the bundle)
- **Showcase URL / status:** Built artifact served via KS showcase pipeline—not a separate static HTML path on its own; see forge-react-primitives page for mounted output.
- **Screenshot URL / status:** **Planned** — **forge-ks** to attach `screenshot_url` after CI stable capture of the bundled experience (registry currently documents intent only per `notes` policy).

## Purpose

Govern the **Vite + React** showcase app that exercises KS React primitives in a realistic shell. This row tracks the **source entrypoint** so inventory and auditors can relate TSX sources to emitted HTML without pretending a single DOM hash covers the whole bundle.

## Covered children

- Source bundle under `showcase-react-app/` (entry `src/main.tsx`); individual interactive hashes remain the **React primitive child rows** (`Tdc`, `Fkg`, …) documented in `FAM-react-primitives.md`.
- Build outputs (`showcase-react-app/dist/` or copied assets) are build artifacts—trace back to this family row when adding new demo routes.

## Expected look

Matches **Rpf** primitive family: studio-grade dark UI, readable data dens enough for demos, no consumer-product chrome impersonation.

## Anatomy

- React root mounts into a container provided by the static showcase page; routes or sections may showcase multiple primitives.

## States

- Dev server hot reload (local); production build inlined assets; error overlay only in dev—production must fail visibly but accessibly if bootstrap breaks.

## Variants

- Single demo app variant; major fork needs registry review.

## Responsive behavior

- Demo layout usable at laptop widths minimum; mobile not required for internal museum but should not crash layout.

## Accessibility contract

- Demo pages inherit primitive-level a11y; avoid disabling focus outlines for effect.

## Enterprise look and feel rules

- Treat as internal lab: factual labels, no fake enterprise logos or customer narratives.

## Content rules

- Demo data is obviously synthetic (“Sample workspace”, “Example run id”).
- Version notes in `package.json` should bump when primitive demos materially change.

## Forbidden patterns

- Embedding production endpoints or secrets in showcase env files committed to repo.
- Shipping the app without updating primitive contracts when props change behavior.

## Implementation notes

- Develop under `showcase-react-app/`: `npm install`, `npm run dev` per that package’s README; static showcase integrates build output via generator wiring.
- When `main.tsx` imports change, rerun inventory and confirm `visual-inventory.generated.json` still aligns.

## Screenshot acceptance

- **Planned:** capture wide screenshot including hash-marked primitive roots once `screenshot_url` is set on this row or on child showcase pages—whichever CI uses as source of truth.
- Acceptance otherwise: build succeeds, primitives render, no console errors in headless smoke (owner: **forge-ks** to wire automated smoke if missing).

## Change policy

- Update **`Kra`** when the showcase app’s architectural role changes (new entry path, different build target). Per-feature visual tweaks stay on primitive hashes.

## Changelog

- 2026-05-18 — Phase 04: authored contract; clarified covered sources vs child hashes; documented planned screenshot follow-up.
