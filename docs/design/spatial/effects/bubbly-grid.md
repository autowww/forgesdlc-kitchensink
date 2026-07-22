# Bubbly Grid (`Bbl`)

**Hash:** `Bbl` · **Slug:** `bubbly-grid` · **Showcase:** `#sec-bubbly-grid`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Bubbly grid ambient

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Bbl.json`](../oracles/Bbl.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Bbl"`.
- Motion respects `prefers-reduced-motion: reduce`.
