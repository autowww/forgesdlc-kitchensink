# Morph Polyhedron (`Mph`)

**Hash:** `Mph` · **Slug:** `morph-polyhedron` · **Showcase:** `#sec-morph-polyhedron`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Morph polyhedron loader

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Mph.json`](../oracles/Mph.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Mph"`.
- Motion respects `prefers-reduced-motion: reduce`.
