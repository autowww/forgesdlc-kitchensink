# Ring Carousel (`Crg`)

**Hash:** `Crg` · **Slug:** `ring-carousel` · **Showcase:** `#sec-ring-carousel`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

CSS ring carousel

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Crg.json`](../oracles/Crg.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Crg"`.
- Motion respects `prefers-reduced-motion: reduce`.
