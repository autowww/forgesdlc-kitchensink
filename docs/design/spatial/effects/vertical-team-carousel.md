# Vertical Team Carousel (`Vtc`)

**Hash:** `Vtc` · **Slug:** `vertical-team-carousel` · **Showcase:** `#sec-vertical-team-carousel`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Vertical team carousel

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Vtc.json`](../oracles/Vtc.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Vtc"`.
- Motion respects `prefers-reduced-motion: reduce`.
