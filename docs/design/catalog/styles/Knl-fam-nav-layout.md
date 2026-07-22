---
hash: Knl
name: Kitchen Sink nav-layout primitives
type: style-family
status: active
source_paths:
  - css/ks-nav-layout.css
  - js/ks-nav-layout.js
showcase_url: https://ks.forgesdlc.com/cases/showcase/navigation.html
screenshot_status: planned
---

# Knl — Kitchen Sink nav-layout primitives

## Purpose

Parent roll-up for governed navigation, layout-shell, overlay, and wayfinding CSS/JS used across KS consumers.

## Expected look

Wayfinding surfaces use KS nav tokens; overlays and sheets preserve focus management and reduced-motion paths.

## Deterministic checks

- `DET.NAV_LAYOUT.HASH_ROOT` on showcase pages emitting nav-layout hashes.
- Oracle suite under `docs/design/nav-layout/oracles/`.
