# Book Page Flip (`Bkf`)

**Hash:** `Bkf` · **Slug:** `book-page-flip` · **Showcase:** `#sec-book-page-flip`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Book page flip

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Bkf.json`](../oracles/Bkf.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Bkf"`.
- Motion respects `prefers-reduced-motion: reduce`.
