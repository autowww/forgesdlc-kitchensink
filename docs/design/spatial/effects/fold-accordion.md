# Fold Accordion (`Fld`)

**Hash:** `Fld` · **Slug:** `fold-accordion` · **Showcase:** `#sec-fold-accordion`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Fold accordion

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Fld.json`](../oracles/Fld.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Fld"`.
- Motion respects `prefers-reduced-motion: reduce`.
