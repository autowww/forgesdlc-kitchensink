---
hash: Ksp
name: Kitchen Sink spatial primitives
type: style-family
status: active
source_paths:
  - css/ks-spatial.css
  - js/ks-pointer-depth.js
showcase_url: https://ks.forgesdlc.com/showcase/spatial-effects.html
screenshot_status: planned
---

# Ksp — Kitchen Sink spatial primitives

## Purpose

Parent roll-up for governed 3D/spatial CSS and pointer-depth JavaScript used across KS consumers.

## Expected look

Depth cues use `--ks-perspective` and tactile tokens; never skeuomorphic by default except `--tactile` variants.

## Deterministic checks

- `DET.SPATIAL.HASH_ROOT` on showcase pages emitting spatial hashes.
- Oracle suite under `docs/design/spatial/oracles/`.
