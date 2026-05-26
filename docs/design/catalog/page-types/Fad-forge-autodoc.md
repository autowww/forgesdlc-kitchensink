---
hash: "Fad"
name: "Forge-autodoc handbook consumer"
type: "library-consumer"
status: "active"
source_paths:
  - forge-autodoc/forge_autodoc/page.py
  - forge-autodoc/forge_autodoc/simple_build.py
showcase_url: null
screenshot_url: null
screenshot_status: "not-applicable"
---

# Fad — Forge-autodoc handbook consumer

## Identity

- **Hash:** Fad
- **Name:** Forge-autodoc handbook consumer
- **Type:** library-consumer
- **Category:** library-consumer
- **Source paths:** `forge-autodoc/forge_autodoc/page.py`, `forge-autodoc/forge_autodoc/simple_build.py`
- **Showcase URL / status:** Not part of static `showcase/` HTML; consumers run their own `simple_build` or Python entrypoints.
- **Screenshot URL / status:** Not applicable at library row; verify hashes in generated consumer HTML instead.

## Purpose

Describe how **forge-autodoc**, as a library embedded in handbook consumers (blueprints-website, product handbooks), must assemble pages: stable `<main>` structure, KS hash markers compatible with `Hdc` (handbook chapter main), and integration points for nav injection scripts.

## Expected look

Rendered HTML mirrors handbook layout contracts (`Hbk`, `Chp`) when consumers apply KS layouts: readable column, doc sidebar where configured, Forge tokenized chrome from `docs-theme.css`.

## Anatomy

- Page assembly splits between Markdown ingestion, template wrappers, and optional `simple_build` orchestration—see `page.py` for `assemble_handbook_page` and related helpers.
- Output `<main>` must remain a single logical landmark per chapter view unless consumer explicitly composes split layouts.

## States

- **Build:** CLI success/failure with actionable logs when templates or paths invalid.
- **Runtime static:** no client JS required for base handbook read—progressive enhancement only when consumers add `Ksj` scripts.

## Variants

- Multi-tenant consumers may pass different asset roots; visual identity still derives from KS submodule version, not ad-hoc forks.

## Responsive behavior

- Inherits consumer’s responsive CSS; autodoc must not emit fixed widths that defeat Bootstrap grid wrappers.

## Accessibility contract

- Generated heading hierarchy reflects Markdown structure; tables include headers; images forward alt text from Markdown when provided.

## Enterprise look and feel rules

- Handbook tone stays instructional, calm, and precise—no retail promo components in default templates.

## Deterministic checks

- Autodoc pages emit handbook landmarks (`main`, nav, optional aside) and a single primary `h1` per chapter (`DET.LANDMARKS.REQUIRED`, `DET.SECTION.HEADING`).
- Generated HTML includes `lang`, viewport meta, and non-empty titles on publishable routes (`DET.PAGE.LANG`, `DET.PAGE.VIEWPORT`, `DET.PAGE.TITLE`).
- Hash markers on layout roots when autodoc wraps KS chrome (`DET.HASH.MARKERS`).

## Content rules

- Authors write Markdown; generators must not silently drop semantic elements (admonitions, code fences) without documenting the limitation.
- Links resolve relative to consumer site URL policy; broken link detection is consumer CI responsibility.

## Forbidden patterns

- Stripping `data-ks-hash` attributes when post-processing HTML.
- Injecting unscoped inline styles that override KS tokens without escalation review.

## Implementation notes

- Entry: `forge-autodoc/forge_autodoc/page.py`, `simple_build.py`; coordinate bumps with `Hdc` contract when `<main>` contract changes.
- Consumers must run `python3 generator/build-showcase.py` only applies to KS repo—consumer builds use their own scripts.

## Screenshot acceptance

- Validate via raw HTML sampling: at least one production handbook page includes both `hash="Hdc"` and `data-ks-hash="Hdc"` on chapter main when that contract applies (per workspace governance rule for public consumer sites).

## Change policy

- **`Fad`** tracks library behavior; patch-level HTML assembly tweaks ship here. Breaking consumer contracts require semver note in forge-autodoc changelog and coordinated submodule bump.

## Changelog

- 2026-05-18 — Phase 04: full contract for handbook consumer; linked to `Hdc` expectations.
