# Simplest Dots (`Dot`)

**Hash:** `Dot` · **Slug:** `simplest-dots` · **Showcase:** `#sec-simplest-dots`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Simplest dots ambient

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Dot.json`](../oracles/Dot.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Dot"`.
- Motion respects `prefers-reduced-motion: reduce`.
