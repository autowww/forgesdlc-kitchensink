# Shapes Lights Rig (`Lgt`)

**Hash:** `Lgt` · **Slug:** `shapes-lights-rig` · **Showcase:** `#sec-shapes-lights-rig`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Shapes and lights rig

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Lgt.json`](../oracles/Lgt.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Lgt"`.
- Motion respects `prefers-reduced-motion: reduce`.
