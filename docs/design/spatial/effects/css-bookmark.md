# Css Bookmark (`Bkm`)

**Hash:** `Bkm` · **Slug:** `css-bookmark` · **Showcase:** `#sec-css-bookmark`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

CSS bookmark control

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Bkm.json`](../oracles/Bkm.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Bkm"`.
- Motion respects `prefers-reduced-motion: reduce`.
