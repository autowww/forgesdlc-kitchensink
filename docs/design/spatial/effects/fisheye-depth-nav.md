# Fisheye Depth Nav (`Ifn`)

**Hash:** `Ifn` · **Slug:** `fisheye-depth-nav` · **Showcase:** `#sec-fisheye-depth-nav`

Emitter: `components/spatial_wave2.py` or `components/spatial.py` · CSS: `css/ks-spatial-wave2.css`

## Purpose

Fisheye depth nav

## Expected behavior

Governed spatial primitive with hash marker, reduced-motion fallback, and preserve-3d support gate.

## Oracle scenarios

See [`../oracles/Ifn.json`](../oracles/Ifn.json).

## Accessibility

- Root emits `hash` and `data-ks-hash="Ifn"`.
- Motion respects `prefers-reduced-motion: reduce`.
